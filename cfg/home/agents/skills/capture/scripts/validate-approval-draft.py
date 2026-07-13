#!/usr/bin/env python3
"""Validate that a Capture HTML draft is reviewable before it is opened."""

from __future__ import annotations

import argparse
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}


def classes(attributes: dict[str, str | None]) -> set[str]:
    return set((attributes.get("class") or "").split())


class DraftParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[dict[str, Any]] = []
        self.mutations: list[dict[str, Any]] = []
        self.current: dict[str, Any] | None = None
        self.body_contract: str | None = None
        self.draft_id: str | None = None
        self.proposed_results = False
        self.raw_outside_evidence = 0
        self.outline_links: list[dict[str, str]] = []

    def handle_starttag(
        self,
        tag: str,
        raw_attributes: list[tuple[str, str | None]],
    ) -> None:
        attributes = dict(raw_attributes)
        tag_classes = classes(attributes)
        frame: dict[str, Any] = {
            "tag": tag,
            "classes": tag_classes,
            "region": None,
            "technical": False,
            "change_table": False,
            "thead": False,
            "outside_pre": False,
            "text": [],
        }

        if tag == "a" and "data-mutation-link" in attributes:
            frame["outline_link"] = {
                "href": attributes.get("href") or "",
                "text": [],
            }

        if tag == "body":
            self.body_contract = attributes.get("data-capture-draft-version")
            self.draft_id = attributes.get("data-draft-id")
        if tag == "section" and attributes.get("id") == "proposed-results":
            self.proposed_results = True
        raw_provider_state = "data-raw-provider-state" in attributes
        if raw_provider_state and not self._inside("technical"):
            self.raw_outside_evidence += 1
        if tag == "pre" and not self._inside("technical"):
            frame["outside_pre"] = True
        if tag == "details" and "technical-evidence" in tag_classes:
            frame["technical"] = True

        if tag == "article" and "mutation" in tag_classes:
            if self.current is not None:
                raise ValueError("nested mutation articles are unsupported")
            self.current = {
                "id": attributes.get("data-mutation-id") or "",
                "summary": [],
                "provider_preview": [],
                "unchanged_scope": [],
                "visible_text": [],
                "exact_before_text": [],
                "exact_after_text": [],
                "change_rows": 0,
                "technical_evidence": 0,
                "technical_open": False,
                "exact_before": 0,
                "exact_after": 0,
                "raw_provider_state": 0,
            }
            frame["mutation_root"] = True

        if self.current is not None:
            if "change-summary" in tag_classes:
                frame["region"] = "summary"
            elif "provider-preview" in tag_classes:
                frame["region"] = "provider_preview"
            elif "unchanged-scope" in tag_classes:
                frame["region"] = "unchanged_scope"

            if tag == "table" and "change-table" in tag_classes:
                frame["change_table"] = True
            if tag == "thead":
                frame["thead"] = True
            if tag == "tr" and self._inside("change_table") and not self._inside("thead"):
                self.current["change_rows"] += 1

            if tag == "details" and "technical-evidence" in tag_classes:
                self.current["technical_evidence"] += 1
                if "open" in attributes:
                    self.current["technical_open"] = True

            if "data-exact-before" in attributes and self._inside("technical"):
                self.current["exact_before"] += 1
                frame["region"] = "exact_before_text"
            if "data-exact-after" in attributes and self._inside("technical"):
                self.current["exact_after"] += 1
                frame["region"] = "exact_after_text"
            if raw_provider_state:
                self.current["raw_provider_state"] += 1

        if tag not in VOID_TAGS:
            self.stack.append(frame)

    def handle_endtag(self, tag: str) -> None:
        match = next(
            (index for index in range(len(self.stack) - 1, -1, -1) if self.stack[index]["tag"] == tag),
            None,
        )
        if match is None:
            return
        frame = self.stack[match]
        if frame.get("outline_link"):
            link = frame["outline_link"]
            self.outline_links.append(
                {
                    "href": link["href"],
                    "text": " ".join(link["text"]).strip(),
                }
            )
        del self.stack[match:]
        if frame.get("outside_pre"):
            serialized = " ".join(frame["text"]).strip()
            if serialized.startswith(("{", "[")):
                try:
                    json.loads(serialized)
                except json.JSONDecodeError:
                    pass
                else:
                    self.raw_outside_evidence += 1
        if frame.get("mutation_root"):
            assert self.current is not None
            self.mutations.append(self.current)
            self.current = None

    def handle_startendtag(
        self,
        tag: str,
        attributes: list[tuple[str, str | None]],
    ) -> None:
        self.handle_starttag(tag, attributes)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        for frame in self.stack:
            if frame.get("outside_pre"):
                frame["text"].append(data)
            if frame.get("outline_link") and data.strip():
                frame["outline_link"]["text"].append(data.strip())
        if self.current is None or not data.strip():
            return
        if not self._inside("technical"):
            self.current["visible_text"].append(data.strip())
        for region in (
            "summary",
            "provider_preview",
            "unchanged_scope",
            "exact_before_text",
            "exact_after_text",
        ):
            if self._inside_region(region):
                self.current[region].append(data.strip())

    def _inside(self, key: str) -> bool:
        return any(frame.get(key) for frame in self.stack)

    def _inside_region(self, region: str) -> bool:
        return any(frame.get("region") == region for frame in self.stack)


def result(check: str, passed: bool, evidence: str) -> dict[str, Any]:
    return {
        "check": check,
        "status": "Pass" if passed else "Flag",
        "evidence": evidence,
        "blocking": not passed,
    }


def complete_human_text(parts: list[str]) -> bool:
    text = " ".join(parts).strip()
    placeholders = ("{{", "}}", "...", "[placeholder]", "todo", "tbd")
    return bool(text) and not any(token in text.lower() for token in placeholders)


def validate(path: Path) -> tuple[int, dict[str, Any]]:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as error:
        report = {
            "disposition": "Block",
            "path": str(path),
            "mutation_count": 0,
            "results": [result("artifact-read", False, str(error))],
            "write_allowed": False,
        }
        return 2, report

    parser = DraftParser()
    try:
        parser.feed(text)
        parser.close()
    except (ValueError, AssertionError) as error:
        report = {
            "disposition": "Block",
            "path": str(path),
            "mutation_count": len(parser.mutations),
            "results": [result("html-structure", False, str(error))],
            "write_allowed": False,
        }
        return 2, report

    checks = [
        result(
            "draft-contract",
            parser.body_contract == "1" and bool(parser.draft_id),
            f"body version={parser.body_contract!r}; draft_id={parser.draft_id!r}",
        ),
        result(
            "proposed-results",
            parser.proposed_results and bool(parser.mutations),
            f"proposed-results={parser.proposed_results}; mutations={len(parser.mutations)}",
        ),
        result(
            "raw-evidence-placement",
            parser.raw_outside_evidence == 0,
            f"raw provider-state blocks outside closed technical evidence={parser.raw_outside_evidence}",
        ),
    ]

    ids = [mutation["id"] for mutation in parser.mutations]
    checks.append(
        result(
            "mutation-identities",
            bool(ids) and all(ids) and len(ids) == len(set(ids)),
            f"mutation ids={ids}",
        )
    )
    outline_targets = [
        link["href"][1:] if link["href"].startswith("#") else ""
        for link in parser.outline_links
    ]
    checks.append(
        result(
            "mutation-outline",
            outline_targets == ids
            and all(link["text"] for link in parser.outline_links),
            f"outline targets={outline_targets}; mutation ids={ids}; "
            f"labels={[link['text'] for link in parser.outline_links]}",
        )
    )

    for mutation in parser.mutations:
        mutation_id = mutation["id"] or "<missing>"
        reviewable = (
            complete_human_text(mutation["summary"])
            and mutation["change_rows"] > 0
            and complete_human_text(mutation["provider_preview"])
            and complete_human_text(mutation["unchanged_scope"])
            and complete_human_text(mutation["visible_text"])
        )
        checks.append(
            result(
                f"review-layer:{mutation_id}",
                reviewable,
                "summary={} change_rows={} provider_preview={} unchanged_scope={}".format(
                    bool(mutation["summary"]),
                    mutation["change_rows"],
                    bool(mutation["provider_preview"]),
                    bool(mutation["unchanged_scope"]),
                ),
            )
        )
        exact = (
            mutation["technical_evidence"] == 1
            and not mutation["technical_open"]
            and mutation["exact_before"] == 1
            and mutation["exact_after"] == 1
            and bool(" ".join(mutation["exact_before_text"]).strip())
            and bool(" ".join(mutation["exact_after_text"]).strip())
            and mutation["raw_provider_state"] > 0
        )
        checks.append(
            result(
                f"exact-evidence:{mutation_id}",
                exact,
                "technical_evidence={} open={} exact_before={} exact_after={} raw_blocks={}".format(
                    mutation["technical_evidence"],
                    mutation["technical_open"],
                    mutation["exact_before"],
                    mutation["exact_after"],
                    mutation["raw_provider_state"],
                ),
            )
        )

    blocked = any(check["blocking"] for check in checks)
    report = {
        "disposition": "Block" if blocked else "Pass",
        "path": str(path),
        "draft_id": parser.draft_id,
        "mutation_count": len(parser.mutations),
        "results": checks,
        "write_allowed": False,
        "note": "Reviewability validation does not grant human approval or write authority.",
    }
    return (2 if blocked else 0), report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("draft", type=Path)
    arguments = parser.parse_args()
    code, report = validate(arguments.draft)
    json.dump(report, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
