#!/usr/bin/env python3
"""Reconcile bundled automation source files into an isolated source lane."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path
from pathlib import PurePosixPath
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
RESOURCE_DIR = SCRIPT_DIR.parent / "resources"
MIGRATION_PATH = RESOURCE_DIR / "automation-migration.json"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_migration() -> list[dict[str, Any]]:
    document = json.loads(MIGRATION_PATH.read_text(encoding="utf-8"))
    if document.get("schema") != "agentic-os.automation-migration/v1":
        raise ValueError("unsupported automation migration schema")
    automations = document.get("automations")
    if not isinstance(automations, list) or not automations:
        raise ValueError("automation migration map is empty")
    names = [item.get("name") for item in automations]
    identities = [item.get("stable_identity") for item in automations]
    if len(set(names)) != len(names) or len(set(identities)) != len(identities):
        raise ValueError("automation migration names and identities must be unique")
    for automation in automations:
        validate_automation(automation)
    return automations


def validate_automation(automation: dict[str, Any]) -> None:
    name = automation.get("name")
    source = automation.get("source")
    if not isinstance(name, str) or not re.fullmatch(
        r"[a-z0-9]+(?:-[a-z0-9]+)*", name
    ):
        raise ValueError(f"invalid automation name: {name}")
    if source != f"automations/{name}":
        raise ValueError(f"invalid automation source: {source}")
    source_path = PurePosixPath(source)
    if source_path.is_absolute() or ".." in source_path.parts:
        raise ValueError(f"unsafe automation source: {source}")


def source_files(source: Path) -> list[Path]:
    files = sorted(path for path in source.rglob("*") if path.is_file())
    if not files:
        raise ValueError(f"automation source is empty: {source}")
    if any(path.is_symlink() for path in source.rglob("*")):
        raise ValueError(f"automation source contains a symlink: {source}")
    return files


def require_safe_directory(path: Path, label: str) -> None:
    if path.is_symlink():
        raise ValueError(f"{label} must not be a symlink: {path}")
    if path.exists() and not path.is_dir():
        raise ValueError(f"{label} must be a directory: {path}")


def require_safe_managed_parent(target_root: Path, path: Path) -> None:
    relative = path.relative_to(target_root)
    current = target_root
    for part in relative.parts:
        current = current / part
        if current.exists() or current.is_symlink():
            require_safe_directory(current, "managed source directory")


def compare(automations: list[dict[str, Any]], target_root: Path) -> list[dict[str, Any]]:
    require_safe_directory(target_root, "target root")
    branches = []
    for automation in automations:
        validate_automation(automation)
        source = RESOURCE_DIR / automation["source"]
        target = target_root / automation["name"]
        require_safe_directory(target, "automation source target")
        drift = []
        for path in source_files(source):
            relative = path.relative_to(source)
            installed = target / relative
            require_safe_managed_parent(target_root, installed.parent)
            if (
                not installed.is_file()
                or installed.is_symlink()
                or digest(path) != digest(installed)
            ):
                drift.append(str(relative))
        branches.append(
            {
                "name": automation["name"],
                "stable_identity": automation["stable_identity"],
                "status": "drifted" if drift else "converged",
                "drift": drift,
            }
        )
    return branches


def reconcile(automations: list[dict[str, Any]], target_root: Path) -> list[str]:
    writes: list[str] = []
    require_safe_directory(target_root, "target root")
    target_root.mkdir(parents=False, exist_ok=True)
    for automation in automations:
        validate_automation(automation)
        source = RESOURCE_DIR / automation["source"]
        target = target_root / automation["name"]
        require_safe_directory(target, "automation source target")
        target.mkdir(exist_ok=True)
        for path in source_files(source):
            relative = path.relative_to(source)
            installed = target / relative
            require_safe_managed_parent(target_root, installed.parent)
            if installed.exists() and (not installed.is_file() or installed.is_symlink()):
                raise ValueError(f"unsafe managed target: {installed}")
            if installed.is_file() and digest(path) == digest(installed):
                continue
            installed.parent.mkdir(parents=True, exist_ok=True)
            descriptor, temporary_name = tempfile.mkstemp(
                prefix=f".{installed.name}.", dir=installed.parent
            )
            os.close(descriptor)
            temporary = Path(temporary_name)
            try:
                shutil.copyfile(path, temporary)
                os.chmod(temporary, path.stat().st_mode & 0o777)
                temporary.replace(installed)
            finally:
                temporary.unlink(missing_ok=True)
            writes.append(str(installed))
    return writes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", nargs="?", default="reconcile", choices=("check", "reconcile"))
    parser.add_argument("--target-root", required=True, type=Path)
    arguments = parser.parse_args()
    if not arguments.target_root.is_absolute() or arguments.target_root == Path("/"):
        parser.error("--target-root must be a safe absolute path")

    try:
        automations = load_migration()
        before = compare(automations, arguments.target_root)
        writes = (
            reconcile(automations, arguments.target_root)
            if arguments.mode == "reconcile"
            else []
        )
        after = compare(automations, arguments.target_root)
        status = (
            "converged"
            if all(branch["status"] == "converged" for branch in after)
            else "drifted"
        )
        print(
            json.dumps(
                {
                    "schema": "agentic-os.automation-source-reconcile.result/v1",
                    "mode": arguments.mode,
                    "status": status,
                    "writes": writes,
                    "before": before,
                    "branches": after,
                },
                indent=2,
            )
        )
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(
            json.dumps(
                {
                    "schema": "agentic-os.automation-source-reconcile.result/v1",
                    "mode": arguments.mode,
                    "status": "failed",
                    "writes": [],
                    "reason": str(error),
                    "branches": [],
                },
                indent=2,
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
