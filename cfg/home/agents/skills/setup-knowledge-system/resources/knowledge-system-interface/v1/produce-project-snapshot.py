#!/usr/bin/env python3
"""Produce a provider-blind Knowledge Project Snapshot from canonical observations."""

import json
import sys
from datetime import datetime


INTERFACE = "knowledge-system-interface/v1"
SNAPSHOT = "knowledge.project.snapshot/v1"
UNRESOLVED_REASONS = {
    "owner_unknown",
    "identity_ambiguous",
    "evidence_insufficient",
    "stale",
    "access_blocked",
    "revision_uncertain",
    "persistent_drift",
    "prerequisite_unresolved",
}


def emit(document):
    print(json.dumps(document, sort_keys=True, separators=(",", ":")))


def text(value, minimum=1):
    return isinstance(value, str) and len(value) >= minimum and not any(
        ord(character) < 32 for character in value
    )


def timestamp(value):
    if not text(value):
        return False
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return True


def evidence_list(value, allow_empty=False):
    if not isinstance(value, list) or (not allow_empty and not value):
        return False
    for evidence in value:
        if not isinstance(evidence, dict) or set(evidence) != {
            "source_ref",
            "supports",
            "observed_at",
        }:
            return False
        if not text(evidence["source_ref"]) or not text(evidence["supports"]):
            return False
        if not timestamp(evidence["observed_at"]):
            return False
    return True


def state_result(value, value_field=None):
    if not isinstance(value, dict):
        return False
    state = value.get("state")
    if state == "value":
        expected = {"state", "evidence"}
        if value_field:
            expected.add(value_field)
        return set(value) == expected and evidence_list(value["evidence"])
    if state == "absent":
        return set(value) == {"state", "evidence"} and evidence_list(value["evidence"])
    if state == "unresolved":
        return (
            set(value) == {"state", "reason", "attempted_evidence"}
            and value["reason"] in UNRESOLVED_REASONS
            and evidence_list(value["attempted_evidence"], allow_empty=True)
        )
    return False


def mapping_valid(mapping, project_key):
    required = {
        "mapping_key",
        "status",
        "requisite",
        "capability",
        "project_key",
        "rationale",
        "evidence",
    }
    optional = {"prerequisite_mapping_keys"}
    if not isinstance(mapping, dict) or not required <= set(mapping) <= required | optional:
        return False
    if not text(mapping["mapping_key"]) or mapping["status"] not in {"enabled", "disabled"}:
        return False
    if mapping["project_key"] != project_key or not text(mapping["rationale"]):
        return False
    for relation in ("requisite", "capability"):
        if (
            not isinstance(mapping[relation], dict)
            or set(mapping[relation]) != {"key", "label"}
            or not text(mapping[relation]["key"])
            or not text(mapping[relation]["label"])
        ):
            return False
    prerequisites = mapping.get("prerequisite_mapping_keys", [])
    return (
        evidence_list(mapping["evidence"])
        and isinstance(prerequisites, list)
        and len(prerequisites) == len(set(prerequisites))
        and all(text(item) for item in prerequisites)
    )


def project_valid(project):
    if not isinstance(project, dict):
        return False
    state = project.get("state")
    if state == "absent":
        return (
            set(project) == {"state", "requested_reference", "evidence"}
            and text(project["requested_reference"])
            and evidence_list(project["evidence"])
        )
    if state == "unresolved":
        return (
            set(project) == {
                "state",
                "requested_reference",
                "reason",
                "attempted_evidence",
            }
            and text(project["requested_reference"])
            and project["reason"] in UNRESOLVED_REASONS
            and evidence_list(project["attempted_evidence"], allow_empty=True)
        )
    expected = {
        "state",
        "project_key",
        "name",
        "references",
        "mastery_enabled",
        "upskill_mappings",
        "evidence",
    }
    if state != "value" or set(project) != expected:
        return False
    if not text(project["project_key"]) or not text(project["name"]):
        return False
    references = project["references"]
    if (
        not isinstance(references, list)
        or not references
        or len(references) != len(set(references))
        or not all(text(item) for item in references)
    ):
        return False
    mastery = project["mastery_enabled"]
    if not state_result(mastery, "value"):
        return False
    if mastery["state"] == "value" and not isinstance(mastery["value"], bool):
        return False
    mappings = project["upskill_mappings"]
    if not isinstance(mappings, dict):
        return False
    if mappings.get("state") == "value":
        if set(mappings) != {"state", "items"} or not isinstance(mappings["items"], list) or not mappings["items"]:
            return False
        if not all(mapping_valid(item, project["project_key"]) for item in mappings["items"]):
            return False
    elif not state_result(mappings):
        return False
    return evidence_list(project["evidence"])


def unresolved_projects(request, reason):
    return [
        {
            "state": "unresolved",
            "requested_reference": reference,
            "reason": reason,
            "attempted_evidence": [],
        }
        for reference in request["project_references"]
    ]


def validate_request(request):
    expected = {
        "interface",
        "snapshot",
        "caller",
        "capability",
        "objective",
        "project_references",
    }
    return (
        isinstance(request, dict)
        and set(request) == expected
        and request["interface"] == INTERFACE
        and request["snapshot"] == SNAPSHOT
        and all(text(request[field]) for field in ("caller", "capability", "objective"))
        and isinstance(request["project_references"], list)
        and bool(request["project_references"])
        and len(request["project_references"]) == len(set(request["project_references"]))
        and all(text(item) for item in request["project_references"])
    )


def validate_observation(observation):
    if not isinstance(observation, dict):
        return False
    common = (
        timestamp(observation.get("observed_at"))
        and text(observation.get("revision_token"), 16)
    )
    if observation.get("state") == "unresolved":
        return (
            common
            and set(observation) == {"state", "observed_at", "revision_token", "reason"}
            and observation["reason"] in UNRESOLVED_REASONS - {
                "identity_ambiguous",
                "persistent_drift",
                "prerequisite_unresolved",
            }
        )
    return (
        observation.get("state") == "resolved"
        and common
        and set(observation) == {"state", "observed_at", "revision_token", "projects"}
        and isinstance(observation["projects"], list)
        and bool(observation["projects"])
        and all(project_valid(project) for project in observation["projects"])
    )


def snapshot_from(operation):
    if not isinstance(operation, dict) or set(operation) != {
        "request",
        "registry_revision",
        "observations",
    }:
        raise ValueError("operation_shape_invalid")
    request = operation["request"]
    if not validate_request(request):
        raise ValueError("request_invalid")
    if not text(operation["registry_revision"]):
        raise ValueError("registry_revision_invalid")
    observations = operation["observations"]
    if (
        not isinstance(observations, list)
        or not 1 <= len(observations) <= 2
        or not all(validate_observation(item) for item in observations)
    ):
        raise ValueError("observations_invalid")

    latest = observations[-1]
    reason = None
    if any(item["state"] == "unresolved" for item in observations):
        reason = next(
            item["reason"] for item in observations if item["state"] == "unresolved"
        )
    elif len(observations) == 2 and observations[0]["revision_token"] != observations[1]["revision_token"]:
        reason = "persistent_drift"

    projects = unresolved_projects(request, reason) if reason else latest["projects"]
    if not reason:
        value_projects = [project for project in projects if project["state"] == "value"]
        project_keys = [project["project_key"] for project in value_projects]
        mapping_keys = [
            mapping["mapping_key"]
            for project in value_projects
            if project["upskill_mappings"]["state"] == "value"
            for mapping in project["upskill_mappings"]["items"]
        ]
        reference_owners = {}
        for project in value_projects:
            for reference in project["references"]:
                reference_owners.setdefault(reference, []).append(project["project_key"])
        if len(project_keys) != len(set(project_keys)) or len(mapping_keys) != len(set(mapping_keys)):
            reason = "identity_ambiguous"
        elif any(len(owners) != 1 for owners in reference_owners.values()):
            reason = "identity_ambiguous"
        if reason:
            projects = unresolved_projects(request, reason)

    represented = set()
    for project in projects:
        if project["state"] == "value":
            represented.update(project["references"])
        else:
            represented.add(project["requested_reference"])
    for reference in request["project_references"]:
        if reference not in represented:
            projects.append(
                {
                    "state": "unresolved",
                    "requested_reference": reference,
                    "reason": "owner_unknown",
                    "attempted_evidence": [],
                }
            )

    gaps = []
    mapping_keys = {
        mapping["mapping_key"]
        for project in projects
        if project["state"] == "value"
        and project["upskill_mappings"]["state"] == "value"
        for mapping in project["upskill_mappings"]["items"]
    }
    for project in projects:
        if project["state"] != "value":
            gaps.append(
                {
                    "reference": project["requested_reference"],
                    "reason": project.get("reason", "owner_unknown"),
                    "blocks_capability": True,
                }
            )
            continue
        mastery = project["mastery_enabled"]
        if mastery["state"] != "value":
            gaps.append(
                {
                    "reference": project["project_key"],
                    "reason": mastery.get("reason", "owner_unknown"),
                    "blocks_capability": True,
                }
            )
        mappings = project["upskill_mappings"]
        if mappings["state"] == "unresolved":
            gaps.append(
                {
                    "reference": project["project_key"],
                    "reason": mappings["reason"],
                    "blocks_capability": True,
                }
            )
        if mappings["state"] == "value":
            for mapping in mappings["items"]:
                missing = set(mapping.get("prerequisite_mapping_keys", [])) - mapping_keys
                if missing:
                    gaps.append(
                        {
                            "reference": mapping["mapping_key"],
                            "reason": "prerequisite_unresolved",
                            "blocks_capability": True,
                        }
                    )

    blocking = list(dict.fromkeys(gap["reference"] for gap in gaps if gap["blocks_capability"]))
    return {
        "interface": INTERFACE,
        "snapshot": SNAPSHOT,
        "registry_revision": operation["registry_revision"],
        "caller": request["caller"],
        "capability": request["capability"],
        "observed_at": latest["observed_at"],
        "revision_token": latest["revision_token"],
        "capability_status": {
            "state": "blocked" if blocking else "ready",
            "blocking_references": blocking,
        },
        "projects": projects,
        "gaps": gaps,
    }


def self_check():
    evidence = [
        {
            "source_ref": "knowledge-owner:self-check",
            "supports": "Canonical owner establishes this value.",
            "observed_at": "2026-07-23T00:00:00Z",
        }
    ]
    operation = {
        "request": {
            "interface": INTERFACE,
            "snapshot": SNAPSHOT,
            "caller": "setup-knowledge-system",
            "capability": "project-snapshot-production",
            "objective": "Self-check the installed producer.",
            "project_references": ["knowledge-project:self-check"],
        },
        "registry_revision": "self-check",
        "observations": [
            {
                "state": "resolved",
                "observed_at": "2026-07-23T00:00:00Z",
                "revision_token": "opaque-self-check-revision",
                "projects": [
                    {
                        "state": "value",
                        "project_key": "self-check",
                        "name": "Self Check",
                        "references": ["knowledge-project:self-check"],
                        "mastery_enabled": {
                            "state": "value",
                            "value": False,
                            "evidence": evidence,
                        },
                        "upskill_mappings": {"state": "absent", "evidence": evidence},
                        "evidence": evidence,
                    }
                ],
            }
        ],
    }
    return snapshot_from(operation)["capability_status"]["state"] == "ready"


def main():
    if sys.argv[1:] == ["--self-check"]:
        if self_check():
            emit(
                {
                    "interface": INTERFACE,
                    "snapshot": SNAPSHOT,
                    "capability": "project-snapshot-production",
                    "status": "ready",
                }
            )
            return 0
        return 70
    if sys.argv[1:]:
        print("usage: produce-project-snapshot.py [--self-check]", file=sys.stderr)
        return 64
    try:
        operation = json.load(sys.stdin)
        snapshot = snapshot_from(operation)
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as error:
        emit({"interface": INTERFACE, "snapshot": SNAPSHOT, "status": "malformed", "reason": str(error)})
        return 0
    emit(snapshot)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
