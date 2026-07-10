# Personal operational automations

This directory is the declarative source for personal scheduled automations that
operate the development environment but are not governed by the Knowledge Bank.

Each automation owns a small source directory:

- `automation.toml` records stable desired configuration.
- `prompt.md` is the exact prompt materialized into the runtime.

Runtime-owned project IDs, timestamps, run history, and automation memory remain
under `~/.codex/automations/` and are not committed. When an agent materializes a
source, it resolves stable hints such as the project label and `~`-relative working
directory, updates the existing automation ID in place, and reads the saved runtime
TOML back to verify it.

## Ownership seam

An automation belongs here when it is personal operational policy—repository
maintenance, development-environment upkeep, or similar machine-wide work—and does
not consume a KB endpoint, write through KB capture, or maintain a KB mirror or
derived sink. Do not give it fake KB bindings merely to fit it into `kb-infra`.

If several non-KB automations emerge and start repeating the same materialization
protocol, extract that shared behaviour into an automation infrastructure module.
Until then, keep each source explicit and avoid building a general automation
operating system around one instance.
