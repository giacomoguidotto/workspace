#!/usr/bin/env python3
"""Validate a provider-neutral Capture transition and emit its quality gate."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "contracts" / "capture-transition-v1.json"
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def result(
    check: str,
    category: str,
    status: str,
    scope: str,
    evidence: list[str],
    issues: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "check": check,
        "category": category,
        "status": status,
        "scope": scope,
        "evidence": evidence,
        "issues": issues or [],
    }


def is_date(value: Any) -> bool:
    if not isinstance(value, str) or not ISO_DATE.fullmatch(value):
        return False
    try:
        date.fromisoformat(value)
    except ValueError:
        return False
    return True


def is_datetime(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return "T" in value and parsed.tzinfo is not None


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def validate_audit_baseline(
    record: dict[str, Any],
    contract: dict[str, Any],
    manifest: dict[str, Any] | None,
    findings: dict[str, Any] | None,
) -> dict[str, Any]:
    target_record = record.get("target", {})
    owner_id = target_record.get("owner_id") if isinstance(target_record, dict) else None
    if manifest is None and findings is None:
        return result(
            "audit-baseline",
            "deterministic",
            "Not applicable",
            f"target {owner_id or '<missing>'}",
            ["No read-only audit baseline was supplied; Capture must rely on fresh live reads."],
        )

    errors: list[str] = []
    if manifest is None or findings is None:
        errors.append("Both the audit manifest and classified findings are required together.")
        manifest = manifest or {}
        findings = findings or {}
    if manifest.get("schema_version") != 1:
        errors.append("The audit manifest must use schema version 1.")
    if findings.get("schema_version") != 1:
        errors.append("The audit findings must use schema version 1.")
    audit_contract = manifest.get("contract", {})
    if audit_contract.get("kind_registry_version") != contract["kind_registry_version"]:
        errors.append("The audit and Capture Kind registry versions do not match.")

    manifest_hash = hashlib.sha256(stable_json(manifest).encode()).hexdigest()
    if findings.get("manifest_sha256") != manifest_hash:
        errors.append("The classified findings do not match the supplied audit manifest.")

    records = {
        item.get("id"): item
        for item in manifest.get("records", [])
        if isinstance(item, dict) and item.get("id")
    }
    target = records.get(owner_id)
    if target is None:
        errors.append(f"Target {owner_id!r} is absent from the audit coverage manifest.")
    else:
        if target.get("access") != "full":
            errors.append(f"Target {owner_id!r} did not have full access during the audit recheck.")
        if target.get("drift") != "unchanged":
            errors.append(
                f"Target {owner_id!r} had concurrent audit drift: {target.get('drift')!r}."
            )
        if not target.get("recheck_sha256"):
            errors.append(f"Target {owner_id!r} has no reproducible recheck fingerprint.")

    return result(
        "audit-baseline",
        "deterministic",
        "Flag" if errors else "Pass",
        f"read-only audit evidence for target {owner_id or '<missing>'}",
        errors
        or [
            f"Manifest {manifest_hash} covers an unchanged, fully readable target {owner_id!r}.",
            "The baseline is discovery evidence only; fresh live reads remain required before approval and apply.",
        ],
        ["invalid-audit-evidence"] if errors else [],
    )


def validate(
    record: dict[str, Any],
    contract: dict[str, Any],
    audit_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []

    required = [
        "capture_record_version",
        "id",
        "operation",
        "target",
        "maturity",
        "kind",
        "assertions",
        "sources",
        "references",
        "revision",
    ]
    missing = [field for field in required if field not in record]
    version_ok = record.get("capture_record_version") == contract["capture_record_version"]
    if missing or not version_ok:
        evidence = []
        if missing:
            evidence.append("Missing fields: " + ", ".join(missing) + ".")
        if not version_ok:
            evidence.append(
                f"capture_record_version must be {contract['capture_record_version']}."
            )
        results.append(
            result(
                "record-contract",
                "deterministic",
                "Flag",
                "capture transition record",
                evidence,
                ["invalid-record"],
            )
        )
    else:
        results.append(
            result(
                "record-contract",
                "deterministic",
                "Pass",
                "capture transition record",
                [f"All required version {contract['capture_record_version']} fields are present."],
            )
        )

    results.append(
        audit_result
        or validate_audit_baseline(record, contract, manifest=None, findings=None)
    )

    operation = record.get("operation")
    operation_ok = operation in contract["operations"]
    results.append(
        result(
            "operation",
            "deterministic",
            "Pass" if operation_ok else "Flag",
            "operation",
            [
                f"Operation '{operation}' is registered."
                if operation_ok
                else f"Operation '{operation}' is not registered."
            ],
            [] if operation_ok else ["invalid-operation"],
        )
    )

    assertions = record.get("assertions", [])
    kind = record.get("kind")
    kind_errors: list[str] = []
    if kind not in contract["kinds"]:
        kind_errors.append(
            f"Kind '{kind}' is absent from Kind registry version {contract['kind_registry_version']}."
        )
    if not isinstance(assertions, list):
        kind_errors.append("assertions must be a list")
    else:
        if operation != "delete" and not assertions:
            kind_errors.append("a non-deletion transition requires at least one assertion")
        required_assertion_fields = contract["assertion_required_fields"].get(kind, [])
        for index, assertion in enumerate(assertions):
            if not isinstance(assertion, dict):
                kind_errors.append(f"assertions[{index}] must be an object")
                continue
            for field in ("id", "text"):
                if not isinstance(assertion.get(field), str) or not assertion[field].strip():
                    kind_errors.append(f"assertions[{index}].{field} must be a non-empty string")
            source_refs = assertion.get("source_refs")
            if not isinstance(source_refs, list) or not source_refs or not all(
                isinstance(source_ref, str) and source_ref for source_ref in source_refs
            ):
                kind_errors.append(
                    f"assertions[{index}].source_refs must be a non-empty list of source IDs"
                )
            missing_kind_fields = [
                field for field in required_assertion_fields if not assertion.get(field)
            ]
            if missing_kind_fields:
                kind_errors.append(
                    f"assertions[{index}] is missing Kind fields: "
                    + ", ".join(missing_kind_fields)
                )
            if kind == "rule" and assertion.get("normative_force") not in contract["normative_forces"]:
                kind_errors.append(
                    f"assertions[{index}].normative_force must be must, should, or may"
                )
    kind_ok = not kind_errors
    results.append(
        result(
            "kind-structure",
            "deterministic",
            "Pass" if kind_ok else "Flag",
            "kind",
            [f"Kind '{kind}' and its structural semantic-force fields are valid in registry version {contract['kind_registry_version']}."]
            if kind_ok
            else kind_errors,
            [] if kind_ok else ["invalid-kind"],
        )
    )

    maturity = record.get("maturity", {})
    maturity_from = maturity.get("from") if isinstance(maturity, dict) else None
    maturity_to = maturity.get("to") if isinstance(maturity, dict) else None
    maturity_ok = maturity_from in contract["maturity"] and maturity_to in contract["maturity"]
    results.append(
        result(
            "maturity-transition",
            "deterministic",
            "Pass" if maturity_ok else "Flag",
            "maturity.from and maturity.to",
            [
                f"Maturity transition {maturity_from} -> {maturity_to} is valid for operation {operation}."
                if maturity_ok
                else f"Maturity transition {maturity_from} -> {maturity_to} contains an unregistered value."
            ],
            [] if maturity_ok else ["invalid-maturity"],
        )
    )

    target = record.get("target", {})
    ownership = target.get("ownership") if isinstance(target, dict) else None
    owner_id = target.get("owner_id") if isinstance(target, dict) else None
    page_type = target.get("type") if isinstance(target, dict) else None
    type_ok = isinstance(page_type, str) and bool(page_type.strip())
    results.append(
        result(
            "type-structure",
            "deterministic",
            "Pass" if type_ok else "Flag",
            "target.type",
            [
                f"Target declares provider-defined Type '{page_type}'."
                if type_ok
                else "The target must declare a non-empty provider-defined Type independently of Ownership."
            ],
            [] if type_ok else ["invalid-type"],
        )
    )
    ownership_ok = ownership in contract["ownership"] and bool(owner_id)
    if ownership == "Unresolved":
        ownership_ok = False
    results.append(
        result(
            "ownership-structure",
            "deterministic",
            "Pass" if ownership_ok else "Flag",
            "target.owner_id and target.ownership",
            [
                f"Target '{owner_id}' has registered Ownership '{ownership}'."
                if ownership_ok
                else "The target must name an owner with resolved Canonical or Adapter Ownership."
            ],
            [] if ownership_ok else ["unresolved-ownership"],
        )
    )

    revision = record.get("revision", {})
    bad_time: list[str] = []
    if not isinstance(revision, dict) or not is_datetime(revision.get("captured_at")):
        bad_time.append("revision.captured_at must be an absolute ISO date-time")
    if kind == "state":
        for index, assertion in enumerate(assertions if isinstance(assertions, list) else []):
            if not isinstance(assertion, dict) or not is_date(assertion.get("observed_at")):
                bad_time.append(f"assertions[{index}].observed_at must be an absolute ISO date")
    if kind == "event":
        for index, assertion in enumerate(assertions if isinstance(assertions, list) else []):
            if not isinstance(assertion, dict) or not is_date(assertion.get("event_at")):
                bad_time.append(f"assertions[{index}].event_at must be an absolute ISO date")
    for field in ("valid_from", "valid_until"):
        if field in record and not is_date(record[field]):
            bad_time.append(f"{field} must be an absolute ISO date")
    if is_date(record.get("valid_from")) and is_date(record.get("valid_until")):
        if record["valid_from"] > record["valid_until"]:
            bad_time.append("valid_from must not be after valid_until")
    sources = record.get("sources", [])
    source_records_ok = (
        isinstance(sources, list)
        and bool(sources)
        and all(
            isinstance(source, dict) and source.get("id") and source.get("locator")
            for source in sources
        )
    )
    if not source_records_ok:
        bad_time.append("at least one source with id and locator is required")
    if isinstance(assertions, list):
        for index, assertion in enumerate(assertions):
            if isinstance(assertion, dict) and not assertion.get("source_refs"):
                bad_time.append(f"assertions[{index}].source_refs must retain source provenance")
    revision_fields = (
        "id",
        "prior_revision",
        "actor",
        "captured_at",
        "diff",
        "relation",
    )
    missing_revision = [field for field in revision_fields if not revision.get(field)] if isinstance(revision, dict) else list(revision_fields)
    if missing_revision:
        bad_time.append("revision is missing: " + ", ".join(missing_revision))
    if isinstance(revision, dict):
        diff = revision.get("diff")
        diff_lines = diff.splitlines() if isinstance(diff, str) else []
        if not any(line.startswith("-") for line in diff_lines) or not any(
            line.startswith("+") for line in diff_lines
        ):
            bad_time.append("revision.diff must contain explicit before (-) and after (+) lines")
        if revision.get("relation") not in contract["revision_relations"]:
            bad_time.append("revision.relation must be supersedes, revises, or invalidates")
        if operation == "delete" and revision.get("relation") != "invalidates":
            bad_time.append("a deletion revision must use the invalidates relation")
    results.append(
        result(
            "time-and-provenance",
            "deterministic",
            "Flag" if bad_time else "Pass",
            "temporal fields and Revision Evidence",
            bad_time or ["Required absolute times and Revision Evidence fields are present."],
            ["invalid-time-or-provenance"] if bad_time else [],
        )
    )

    references = record.get("references", [])
    broken: list[str] = []
    if isinstance(references, list):
        for reference in references:
            if not isinstance(reference, dict):
                broken.append("<malformed reference>")
            elif not reference.get("resolves"):
                broken.append(str(reference.get("id", "<missing id>")))
    else:
        broken.append("references must be a list")
    reference_ids = {
        reference.get("id")
        for reference in references
        if isinstance(reference, dict) and reference.get("resolves")
    } if isinstance(references, list) else set()
    if owner_id and owner_id not in reference_ids:
        broken.append(str(owner_id))
    prior_revision = revision.get("prior_revision") if isinstance(revision, dict) else None
    if prior_revision and prior_revision not in reference_ids:
        broken.append(str(prior_revision))
    source_ids = {
        source.get("id")
        for source in record.get("sources", [])
        if isinstance(source, dict) and source.get("id") and source.get("locator")
    } if isinstance(record.get("sources", []), list) else set()
    for assertion in assertions if isinstance(assertions, list) else []:
        if not isinstance(assertion, dict):
            continue
        source_refs = assertion.get("source_refs", [])
        if not isinstance(source_refs, list):
            broken.append(f"{assertion.get('id', '<missing assertion id>')}.source_refs")
            continue
        for source_ref in source_refs:
            if source_ref not in source_ids:
                broken.append(str(source_ref))
    results.append(
        result(
            "reference-resolution",
            "deterministic",
            "Flag" if broken else "Pass",
            "target, relation, and source references",
            ["Broken or missing references: " + ", ".join(sorted(set(broken))) + "."]
            if broken
            else ["All declared target, relation, and source references resolve."],
            ["broken-reference"] if broken else [],
        )
    )

    if ownership == "Adapter":
        canonical_refs = target.get("canonical_owner_refs", [])
        missing_adapter_refs = [ref for ref in canonical_refs if ref not in reference_ids]
        assertion_owner_refs = [
            assertion.get("canonical_owner_ref")
            for assertion in assertions
            if isinstance(assertion, dict)
        ] if isinstance(assertions, list) else []
        adapter_ok = (
            bool(canonical_refs)
            and not missing_adapter_refs
            and isinstance(assertions, list)
            and all(
                owner_ref in canonical_refs and owner_ref in reference_ids
                for owner_ref in assertion_owner_refs
            )
            and len(assertion_owner_refs) == len(assertions)
        )
        results.append(
            result(
                "adapter-links",
                "deterministic",
                "Pass" if adapter_ok else "Flag",
                "target.canonical_owner_refs",
                [
                    "Every adapted assertion declares a resolving canonical owner link."
                    if adapter_ok
                    else "Adapter Ownership requires at least one resolving canonical owner reference."
                ],
                [] if adapter_ok else ["invalid-adapter"],
            )
        )
    else:
        results.append(
            result(
                "adapter-links",
                "deterministic",
                "Not applicable",
                "target.ownership",
                ["The target is not an Adapter."],
            )
        )

    if maturity_to == "Raw":
        retention = record.get("retained_raw", {})
        retention_fields = ("owner", "provenance_ref", "reason", "next_action")
        missing_retention = [field for field in retention_fields if not retention.get(field)] if isinstance(retention, dict) else list(retention_fields)
        provenance_ref = retention.get("provenance_ref") if isinstance(retention, dict) else None
        if provenance_ref and provenance_ref not in source_ids:
            missing_retention.append("resolving provenance_ref")
        results.append(
            result(
                "retained-raw-context",
                "deterministic",
                "Flag" if missing_retention else "Pass",
                "retained_raw",
                ["Retained Raw is missing: " + ", ".join(missing_retention) + "."]
                if missing_retention
                else ["Retained Raw names its owner, provenance, reason, and next action."],
                ["invalid-retained-raw"] if missing_retention else [],
            )
        )
    else:
        results.append(
            result(
                "retained-raw-context",
                "deterministic",
                "Not applicable",
                "maturity.to",
                ["The transition does not retain Raw content."],
            )
        )

    if operation == "delete":
        deletion = record.get("deletion", {})
        deletion_fields = ("content_inventory", "inbound_links", "recovery_ref")
        missing_deletion = [field for field in deletion_fields if not deletion.get(field)] if isinstance(deletion, dict) else list(deletion_fields)
        recovery_ref = deletion.get("recovery_ref") if isinstance(deletion, dict) else None
        if recovery_ref and recovery_ref not in reference_ids:
            missing_deletion.append("resolving recovery_ref")
        results.append(
            result(
                "deletion-structure",
                "deterministic",
                "Flag" if missing_deletion else "Pass",
                "deletion assessment",
                ["Deletion assessment is missing: " + ", ".join(missing_deletion) + "."]
                if missing_deletion
                else ["Deletion declares content, inbound-link, and recovery-path evidence."],
                ["invalid-deletion-record"] if missing_deletion else [],
            )
        )
    else:
        results.append(
            result(
                "deletion-structure",
                "deterministic",
                "Not applicable",
                "operation",
                ["The transition does not delete a page."],
            )
        )

    supplied_judgments = record.get("semantic_judgments", [])
    judgment_contract_errors: list[str] = []
    if not isinstance(supplied_judgments, list):
        judgment_contract_errors.append("semantic_judgments must be a list")
        supplied_judgments = []
    judgment_names = [
        judgment.get("check")
        for judgment in supplied_judgments
        if isinstance(judgment, dict) and judgment.get("check")
    ]
    unknown_judgments = sorted(set(judgment_names) - set(contract["semantic_checks"]))
    duplicate_judgments = sorted(
        name for name in set(judgment_names) if judgment_names.count(name) > 1
    )
    if unknown_judgments:
        judgment_contract_errors.append(
            "Unknown semantic checks: " + ", ".join(unknown_judgments)
        )
    if duplicate_judgments:
        judgment_contract_errors.append(
            "Duplicate semantic checks: " + ", ".join(duplicate_judgments)
        )
    malformed_judgments = sum(
        1
        for judgment in supplied_judgments
        if not isinstance(judgment, dict) or not judgment.get("check")
    )
    if malformed_judgments:
        judgment_contract_errors.append(
            f"Malformed semantic judgments: {malformed_judgments}"
        )
    if judgment_contract_errors:
        results.append(
            result(
                "semantic-judgment-contract",
                "deterministic",
                "Flag",
                "semantic_judgments",
                judgment_contract_errors,
                ["invalid-semantic-judgment"],
            )
        )
    by_check = {
        judgment.get("check"): judgment
        for judgment in supplied_judgments
        if isinstance(judgment, dict) and judgment.get("check")
    } if isinstance(supplied_judgments, list) else {}
    statuses = set(contract["result_statuses"])
    for check, allowed_issues in contract["semantic_checks"].items():
        judgment = by_check.get(check)
        if judgment is None:
            results.append(
                result(
                    check,
                    "semantic",
                    "Not checked",
                    check,
                    ["No semantic judgment was supplied; executable validation cannot infer one."],
                )
            )
            continue
        status = judgment.get("status")
        scope = judgment.get("scope")
        evidence = judgment.get("evidence")
        issues = judgment.get("issues", [])
        valid = (
            status in statuses
            and isinstance(scope, str)
            and bool(scope.strip())
            and isinstance(evidence, list)
            and bool(evidence)
            and all(isinstance(item, str) and item.strip() for item in evidence)
            and isinstance(issues, list)
            and all(issue in allowed_issues for issue in issues)
            and ((status == "Flag") == bool(issues))
        )
        if valid:
            results.append(result(check, "semantic", status, scope, evidence, issues))
        else:
            results.append(
                result(
                    "semantic-judgment-contract",
                    "deterministic",
                    "Flag",
                    check,
                    ["The supplied judgment has an invalid status, scope, evidence, or issue code."],
                    ["invalid-semantic-judgment"],
                )
            )
            results.append(
                result(
                    check,
                    "semantic",
                    "Not checked",
                    check,
                    ["The malformed supplied judgment was not treated as a semantic conclusion."],
                )
            )

    deterministic_flags = any(
        item["category"] == "deterministic" and item["status"] == "Flag"
        for item in results
    )
    issue_codes = {issue for item in results for issue in item["issues"]}
    blocking = deterministic_flags or bool(issue_codes & set(contract["blocking_issues"]))
    needs_review = any(
        item["status"] in {"Flag", "Not checked"} for item in results
    )
    disposition = "Block" if blocking else "Flag" if needs_review else "Pass"

    return {
        "record_id": record.get("id", "<missing>"),
        "capture_record_version": record.get("capture_record_version"),
        "kind_registry_version": contract["kind_registry_version"],
        "disposition": disposition,
        "write_allowed": False,
        "results": results,
        "human_approval": {
            "required": True,
            "status": "Not checked",
            "scope": "the latest complete Approval Draft",
            "evidence": [
                "Executable validation cannot grant human approval or use approval as correctness evidence."
            ],
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate one provider-neutral Capture transition JSON record."
    )
    parser.add_argument("record", type=Path)
    parser.add_argument("--audit-manifest", type=Path)
    parser.add_argument("--audit-findings", type=Path)
    args = parser.parse_args()

    try:
        contract = json.loads(CONTRACT_PATH.read_text())
        record = json.loads(args.record.read_text())
        if not isinstance(record, dict):
            raise ValueError("the record root must be an object")
        if bool(args.audit_manifest) != bool(args.audit_findings):
            raise ValueError("--audit-manifest and --audit-findings must be supplied together")
        manifest = json.loads(args.audit_manifest.read_text()) if args.audit_manifest else None
        findings = json.loads(args.audit_findings.read_text()) if args.audit_findings else None
        if manifest is not None and not isinstance(manifest, dict):
            raise ValueError("the audit manifest root must be an object")
        if findings is not None and not isinstance(findings, dict):
            raise ValueError("the audit findings root must be an object")
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(json.dumps({"error": str(error)}, indent=2))
        return 2

    audit_result = validate_audit_baseline(record, contract, manifest, findings)
    report = validate(record, contract, audit_result)
    print(json.dumps(report, indent=2))
    return 2 if report["disposition"] == "Block" else 0


if __name__ == "__main__":
    raise SystemExit(main())
