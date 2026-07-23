#!/usr/bin/env python3
"""Validate an opaque Snapshot Token against provider-neutral live observations."""

import hmac
import json
import sys


INTERFACE = "knowledge-system-interface/v1"
UNRESOLVED_REASONS = {
    "owner_unknown",
    "evidence_insufficient",
    "stale",
    "access_blocked",
    "revision_uncertain",
}


def emit(document):
    print(json.dumps(document, sort_keys=True, separators=(",", ":")))


def malformed(reason):
    return {"interface": INTERFACE, "status": "malformed", "reason": reason}


def valid_text(value):
    return isinstance(value, str) and bool(value)


def valid_token(value):
    if not (
        isinstance(value, str)
        and len(value) >= 16
        and not any(ord(character) < 32 for character in value)
    ):
        return False
    try:
        value.encode("utf-8")
    except UnicodeEncodeError:
        return False
    return True


def tokens_equal(left, right):
    return hmac.compare_digest(left.encode("utf-8"), right.encode("utf-8"))


def validate_request(request):
    if not isinstance(request, dict):
        return "request_not_object"
    if set(request) != {"interface", "caller", "capability", "snapshot_token"}:
        return "request_shape_invalid"
    if not valid_text(request["caller"]) or not valid_text(request["capability"]):
        return "request_identity_invalid"
    if not valid_token(request["snapshot_token"]):
        return "snapshot_token_invalid"
    return None


def validate_observation(observation):
    if not isinstance(observation, dict):
        return "observation_not_object"
    state = observation.get("state")
    if state == "resolved":
        if set(observation) != {"state", "snapshot_token"}:
            return "observation_shape_invalid"
        if not valid_token(observation["snapshot_token"]):
            return "observation_token_invalid"
        return None
    if state == "unresolved":
        if set(observation) != {"state", "reason"}:
            return "observation_shape_invalid"
        if observation["reason"] not in UNRESOLVED_REASONS:
            return "observation_reason_invalid"
        return None
    return "observation_state_invalid"


def validate(operation):
    if not isinstance(operation, dict) or set(operation) != {"request", "observations"}:
        return malformed("operation_shape_invalid")

    request = operation["request"]
    if (
        isinstance(request, dict)
        and isinstance(request.get("interface"), str)
        and request["interface"] != INTERFACE
    ):
        return {
            "interface": INTERFACE,
            "status": "unsupported",
            "requested_interface": request["interface"],
        }

    request_error = validate_request(request)
    if request_error:
        return malformed(request_error)

    observations = operation["observations"]
    if not isinstance(observations, list) or not 1 <= len(observations) <= 2:
        return malformed("observations_count_invalid")
    for observation in observations:
        observation_error = validate_observation(observation)
        if observation_error:
            return malformed(observation_error)

    identity = {
        "interface": INTERFACE,
        "caller": request["caller"],
        "capability": request["capability"],
    }
    unresolved = next(
        (item for item in observations if item["state"] == "unresolved"),
        None,
    )
    if unresolved:
        return {**identity, "status": "unresolved", "reason": unresolved["reason"]}

    current_tokens = [item["snapshot_token"] for item in observations]
    if len(current_tokens) == 2 and not tokens_equal(current_tokens[0], current_tokens[1]):
        return {**identity, "status": "unresolved", "reason": "persistent_drift"}

    status = (
        "unchanged"
        if tokens_equal(request["snapshot_token"], current_tokens[-1])
        else "changed"
    )
    return {**identity, "status": status}


def self_check():
    token = "opaque-self-check-token"
    operation = {
        "request": {
            "interface": INTERFACE,
            "caller": "setup-knowledge-system",
            "capability": "snapshot-token-validation",
            "snapshot_token": token,
        },
        "observations": [{"state": "resolved", "snapshot_token": token}],
    }
    return validate(operation)["status"] == "unchanged"


def main():
    if sys.argv[1:] == ["--self-check"]:
        if self_check():
            emit(
                {
                    "interface": INTERFACE,
                    "status": "ready",
                    "capability": "snapshot-token-validation",
                }
            )
            return 0
        return 70
    if sys.argv[1:]:
        print("usage: validate-snapshot-token.py [--self-check]", file=sys.stderr)
        return 64

    try:
        operation = json.load(sys.stdin)
    except (json.JSONDecodeError, UnicodeDecodeError):
        emit(malformed("invalid_json"))
        return 0

    emit(validate(operation))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
