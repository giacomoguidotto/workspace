---
name: setup-project
description: Set up a project with the shared engineering workflow and agent-instruction conventions.
disable-model-invocation: true
---

# Setup Project

Compose the replaceable Matt Pocock setup with Giacomo's durable project overlay. Treat the upstream skill as a read-only dependency.

## 1. Run the upstream setup

Read [`../setup-matt-pocock-skills/SKILL.md`](../setup-matt-pocock-skills/SKILL.md) completely, then follow it end to end. Preserve its interview, confirmation, tracker, label, and domain-doc behavior. When it pauses for user input, pause this skill too.

Completion criterion: the upstream skill has reached its Done step and its configured files exist.

## 2. Apply the project overlay

Read [`references/agent-instructions.md`](references/agent-instructions.md) completely and apply every rule.

Consolidate durable root instructions into `AGENTS.md`, preserve unique user guidance, and keep nested instruction files as scoped overrides. Replace root `CLAUDE.md` with the compatibility import only. Add or update the decision-safety and conditional PMP handoff block exactly once.

The overlay is fixed by convention, so apply it after the upstream confirmation without opening a second design interview.

Completion criterion: `AGENTS.md` contains every durable root instruction once, root `CLAUDE.md` contains exactly `@AGENTS.md`, and the overlay block matches the reference.

## 3. Validate the result

Verify the configured `docs/agents/` files still exist, inspect the final diff, and run `git diff --check` when Git is available. Run the repository's canonical validation command when one is documented.

Report the upstream configuration and overlay changes separately so future drift is attributable to the correct layer.

Completion criterion: instruction ownership is unambiguous, every configured file passes available validation, and no unrelated file changed.
