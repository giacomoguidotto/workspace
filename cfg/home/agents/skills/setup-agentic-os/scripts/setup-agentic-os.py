#!/usr/bin/env python3
"""Observe or safely clone the fixed Agentic Constellation repositories."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).resolve().parent
CONTRACT_PATH = SCRIPT_DIR.parent / "resources" / "system-contracts.json"
EXPECTED_REGISTRY_KEYS = ("knowledge-system", "mastery-system", "career-ops")
STATUS_PRECEDENCE = ("failed", "blocked", "drifted", "converged")


class RegistryError(ValueError):
    pass


class ContractError(ValueError):
    pass


def run(
    arguments: list[str],
    *,
    cwd: Path | None = None,
    check: bool = False,
) -> subprocess.CompletedProcess[str]:
    environment = os.environ.copy()
    environment["GIT_TERMINAL_PROMPT"] = "0"
    try:
        return subprocess.run(
            arguments,
            cwd=cwd,
            check=check,
            env=environment,
            text=True,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60,
        )
    except subprocess.TimeoutExpired as error:
        return subprocess.CompletedProcess(
            arguments,
            124,
            error.stdout or "",
            error.stderr or "command timed out",
        )
    except OSError as error:
        return subprocess.CompletedProcess(arguments, 126, "", str(error))


def parse_scalar(raw_value: str, line_number: int) -> str:
    value = raw_value.strip()
    if not value:
        raise RegistryError(f"line {line_number}: repository root is blank")
    if value.startswith('"'):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as error:
            raise RegistryError(
                f"line {line_number}: invalid double-quoted root"
            ) from error
        if not isinstance(parsed, str):
            raise RegistryError(f"line {line_number}: root must be a string")
        return parsed
    if value.startswith("'"):
        if len(value) < 2 or not value.endswith("'"):
            raise RegistryError(f"line {line_number}: invalid single-quoted root")
        return value[1:-1].replace("''", "'")
    if " #" in value:
        value = value.split(" #", 1)[0].rstrip()
    if any(character in value for character in "{}[]"):
        raise RegistryError(f"line {line_number}: root must be a plain path")
    return value


def parse_registry(path: Path) -> dict[str, Path]:
    if not path.is_file():
        raise FileNotFoundError(path)

    repositories: dict[str, Path] = {}
    saw_header = False
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        if "\t" in raw_line:
            raise RegistryError(f"line {line_number}: tabs are not allowed")
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if not saw_header:
            if raw_line != "repositories:":
                raise RegistryError(
                    f"line {line_number}: only the repositories mapping is allowed"
                )
            saw_header = True
            continue
        match = re.fullmatch(r"  ([a-z0-9-]+):\s*(.+)", raw_line)
        if not match:
            raise RegistryError(
                f"line {line_number}: invalid roots-only registry entry"
            )
        key, raw_value = match.groups()
        if key in repositories:
            raise RegistryError(f"line {line_number}: duplicate repository key {key}")
        if key not in EXPECTED_REGISTRY_KEYS:
            raise RegistryError(f"line {line_number}: unexpected repository key {key}")
        root = Path(parse_scalar(raw_value, line_number))
        if not root.is_absolute():
            raise RegistryError(f"line {line_number}: root must be absolute")
        normalized = Path(os.path.normpath(root))
        if normalized == Path("/"):
            raise RegistryError(f"line {line_number}: filesystem root is unsafe")
        repositories[key] = normalized

    if not saw_header:
        raise RegistryError("repositories mapping is missing")
    missing = [key for key in EXPECTED_REGISTRY_KEYS if key not in repositories]
    if missing:
        raise RegistryError(f"missing repository keys: {', '.join(missing)}")
    if len({str(root) for root in repositories.values()}) != len(repositories):
        raise RegistryError("repository roots must be distinct")
    return repositories


def load_contracts(path: Path = CONTRACT_PATH) -> list[dict[str, Any]]:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ContractError(f"cannot load system contracts: {error}") from error
    if document.get("schema") != "agentic-os.system-contracts/v1":
        raise ContractError("unsupported system contract schema")
    systems = document.get("systems")
    if not isinstance(systems, list):
        raise ContractError("system contracts must contain a systems array")
    if [system.get("registry_key") for system in systems] != list(
        EXPECTED_REGISTRY_KEYS
    ):
        raise ContractError("system contracts do not match the fixed registry")
    for system in systems:
        required = {
            "system",
            "implementation",
            "repository",
            "required_branch",
            "setup_interface",
            "owner",
            "required_paths",
            "capabilities",
        }
        if not required.issubset(system):
            raise ContractError(
                f"incomplete system contract: {system.get('registry_key', 'unknown')}"
            )
        setup = system["setup_interface"]
        if (
            setup.get("modes") != ["check", "reconcile"]
            or setup.get("default_mode") != "reconcile"
        ):
            raise ContractError(
                f"invalid setup interface: {system['registry_key']}"
            )
    return systems


def repository_identity(remote: str) -> str | None:
    value = remote.strip().rstrip("/")
    match = re.search(r"(?:^|[:/])([^/:]+)/([^/]+?)(?:\.git)?$", value)
    if not match:
        return None
    return f"{match.group(1)}/{match.group(2)}"


def repository_host(remote: str) -> tuple[str | None, bool]:
    value = remote.strip()
    if "://" in value:
        parsed = urlparse(value)
        return parsed.hostname, parsed.scheme == "ssh"
    match = re.match(r"^(?:[^@/:]+@)?([^/:]+):[^/].+$", value)
    if match:
        return match.group(1), True
    return None, False


def trusted_github_host(remote: str) -> bool:
    host, uses_ssh = repository_host(remote)
    if host == "github.com":
        return True
    if not host or not uses_ssh:
        return False
    resolved = run(["ssh", "-G", host])
    if resolved.returncode != 0:
        return False
    hostname = next(
        (
            line.split(None, 1)[1].strip().lower()
            for line in resolved.stdout.splitlines()
            if line.lower().startswith("hostname ")
        ),
        None,
    )
    return hostname == "github.com"


def branch_state(root: Path, remote_head: str, local_head: str) -> str:
    if remote_head == local_head:
        return "current"
    known_remote = run(["git", "cat-file", "-e", f"{remote_head}^{{commit}}"], cwd=root)
    if known_remote.returncode != 0:
        return "stale-or-divergent"
    local_before_remote = run(
        ["git", "merge-base", "--is-ancestor", local_head, remote_head], cwd=root
    )
    if local_before_remote.returncode == 0:
        return "stale"
    remote_before_local = run(
        ["git", "merge-base", "--is-ancestor", remote_head, local_head], cwd=root
    )
    if remote_before_local.returncode == 0:
        return "ahead"
    return "divergent"


def result(
    contract: dict[str, Any],
    root: Path,
    status: str,
    reason: str,
    *,
    checks: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    return {
        "key": contract["registry_key"],
        "system": contract["system"],
        "implementation": contract["implementation"],
        "root": str(root),
        "status": status,
        "reason": reason,
        "checks": checks or [],
        "setup_interface": contract["setup_interface"]["command"],
    }


def observe_repository(contract: dict[str, Any], root: Path) -> dict[str, Any]:
    if not root.exists():
        return result(contract, root, "drifted", "repository-missing")
    if not root.is_dir():
        return result(contract, root, "blocked", "root-is-not-directory")

    top_level = run(["git", "rev-parse", "--show-toplevel"], cwd=root)
    if top_level.returncode != 0:
        return result(contract, root, "blocked", "root-is-not-git-repository")
    try:
        actual_top = Path(top_level.stdout.strip()).resolve(strict=True)
        actual_root = root.resolve(strict=True)
    except OSError:
        return result(contract, root, "blocked", "root-cannot-be-resolved")
    if actual_top != actual_root:
        return result(contract, root, "blocked", "root-is-not-worktree-top")

    checks: list[dict[str, str]] = []
    origin = run(["git", "config", "--get", "remote.origin.url"], cwd=root)
    if origin.returncode != 0:
        return result(contract, root, "blocked", "origin-missing")
    effective_origin = run(["git", "remote", "get-url", "origin"], cwd=root)
    if effective_origin.returncode != 0:
        return result(contract, root, "blocked", "origin-transport-unavailable")
    actual_identity = repository_identity(origin.stdout)
    effective_identity = repository_identity(effective_origin.stdout)
    trusted_host = trusted_github_host(origin.stdout) and trusted_github_host(
        effective_origin.stdout
    )
    checks.append(
        {
            "id": "repository-identity",
            "status": (
                "converged"
                if actual_identity == contract["repository"]
                and effective_identity == contract["repository"]
                and trusted_host
                else "blocked"
            ),
        }
    )
    if (
        actual_identity != contract["repository"]
        or effective_identity != contract["repository"]
        or not trusted_host
    ):
        return result(
            contract,
            root,
            "blocked",
            "wrong-repository-identity",
            checks=checks,
        )

    worktree = run(["git", "status", "--porcelain=v1", "--untracked-files=all"], cwd=root)
    if worktree.returncode != 0:
        return result(contract, root, "blocked", "worktree-status-unavailable")
    if worktree.stdout:
        checks.append({"id": "worktree-clean", "status": "blocked"})
        return result(contract, root, "blocked", "dirty-worktree", checks=checks)
    checks.append({"id": "worktree-clean", "status": "converged"})

    branch = run(["git", "symbolic-ref", "--quiet", "--short", "HEAD"], cwd=root)
    if branch.returncode != 0:
        return result(contract, root, "blocked", "detached-head", checks=checks)
    if branch.stdout.strip() != contract["required_branch"]:
        checks.append({"id": "required-branch", "status": "blocked"})
        return result(contract, root, "blocked", "wrong-branch", checks=checks)
    checks.append({"id": "required-branch", "status": "converged"})

    local_head_result = run(["git", "rev-parse", "HEAD"], cwd=root)
    if local_head_result.returncode != 0:
        return result(contract, root, "blocked", "local-head-unavailable", checks=checks)
    remote_ref = f"refs/heads/{contract['required_branch']}"
    remote = run(
        ["git", "ls-remote", "--refs", "--exit-code", "origin", remote_ref],
        cwd=root,
    )
    if remote.returncode != 0:
        return result(contract, root, "blocked", "required-remote-branch-unreachable", checks=checks)
    fields = remote.stdout.strip().split()
    if len(fields) != 2 or fields[1] != remote_ref:
        return result(contract, root, "failed", "malformed-remote-branch-result", checks=checks)
    branch_relationship = branch_state(
        root, fields[0], local_head_result.stdout.strip()
    )
    if branch_relationship != "current":
        checks.append({"id": "branch-current", "status": "blocked"})
        return result(
            contract,
            root,
            "blocked",
            f"branch-{branch_relationship}",
            checks=checks,
        )
    checks.append({"id": "branch-current", "status": "converged"})

    missing_paths = [
        relative
        for relative in contract["required_paths"]
        if not (root / relative).exists()
    ]
    if missing_paths:
        checks.append({"id": "setup-interface", "status": "failed"})
        return result(
            contract,
            root,
            "failed",
            f"setup-interface-missing:{','.join(missing_paths)}",
            checks=checks,
        )
    checks.append({"id": "setup-interface", "status": "converged"})
    return result(contract, root, "converged", "none", checks=checks)


def clone_missing(contract: dict[str, Any], root: Path) -> tuple[bool, str]:
    parent = root.parent
    if not parent.is_dir():
        return False, "registered-root-parent-missing"
    if root.exists():
        return False, "registered-root-became-present"
    clone_url = f"https://github.com/{contract['repository']}.git"
    candidate: Path | None = None
    try:
        candidate = Path(tempfile.mkdtemp(prefix=f".{root.name}-clone-", dir=parent))
        candidate.rmdir()
        cloned = run(
            [
                "git",
                "clone",
                "--branch",
                contract["required_branch"],
                "--single-branch",
                "--",
                clone_url,
                str(candidate),
            ]
        )
        if cloned.returncode != 0:
            return False, "clone-failed"
        if root.exists():
            return False, "registered-root-became-present"
        candidate.rename(root)
        candidate = None
        return True, "repository-cloned"
    except OSError:
        return False, "clone-filesystem-error"
    finally:
        if candidate is not None:
            shutil.rmtree(candidate, ignore_errors=True)


def combined_status(branches: list[dict[str, Any]]) -> str:
    return next(
        (
            status
            for status in STATUS_PRECEDENCE
            if any(branch["status"] == status for branch in branches)
        ),
        "converged",
    )


def execute(mode: str, registry_path: Path) -> dict[str, Any]:
    try:
        contracts = load_contracts()
    except ContractError as error:
        return {
            "schema": "agentic-os.setup.result/v1",
            "mode": mode,
            "status": "failed",
            "writes": [],
            "branches": [],
            "reason": str(error),
        }
    try:
        repositories = parse_registry(registry_path)
    except FileNotFoundError:
        return {
            "schema": "agentic-os.setup.result/v1",
            "mode": mode,
            "status": "blocked",
            "writes": [],
            "branches": [],
            "reason": "installation-registry-missing",
        }
    except (OSError, RegistryError) as error:
        return {
            "schema": "agentic-os.setup.result/v1",
            "mode": mode,
            "status": "failed",
            "writes": [],
            "branches": [],
            "reason": f"installation-registry-invalid:{error}",
        }

    writes: list[dict[str, str]] = []
    first_observation = [
        observe_repository(contract, repositories[contract["registry_key"]])
        for contract in contracts
    ]
    attempted: dict[str, tuple[bool, str]] = {}
    if mode == "reconcile":
        by_key = {branch["key"]: branch for branch in first_observation}
        for contract in contracts:
            branch = by_key[contract["registry_key"]]
            if branch["status"] != "drifted" or branch["reason"] != "repository-missing":
                continue
            root = repositories[contract["registry_key"]]
            changed, reason = clone_missing(contract, root)
            attempted[contract["registry_key"]] = (changed, reason)
            if changed:
                writes.append({"branch": contract["registry_key"], "action": reason})

    final_branches = [
        observe_repository(contract, repositories[contract["registry_key"]])
        for contract in contracts
    ]
    for branch in final_branches:
        attempt = attempted.get(branch["key"])
        if not attempt or branch["status"] != "drifted":
            continue
        changed, reason = attempt
        branch["status"] = "failed" if changed else "blocked"
        branch["reason"] = "post-reconcile-drift" if changed else reason
    return {
        "schema": "agentic-os.setup.result/v1",
        "mode": mode,
        "status": combined_status(final_branches),
        "writes": writes,
        "branches": final_branches,
        "reason": "none",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", nargs="?", default="reconcile", choices=("check", "reconcile"))
    parser.add_argument(
        "--registry",
        type=Path,
        default=Path.cwd() / "local" / "installation.yml",
    )
    arguments = parser.parse_args()
    document = execute(arguments.mode, arguments.registry)
    print(json.dumps(document, indent=2))
    return 0 if document["status"] in {"converged", "drifted", "blocked"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
