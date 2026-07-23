---
name: setup-mastery-system
description: Check or reconcile the independently usable Mastery System repository and its GitHub issue-tracker prerequisites.
---

# Setup Mastery System

Run from the Mastery System checkout. Use `check` for a read-only health result and
`reconcile` to apply safe issue-tracker deltas before a fresh check. Omitted mode
means `reconcile`.

```sh
node resources/setup.mjs [check|reconcile] --root "$PWD"
```

Reconciliation may enable GitHub Issues and create or correct the five declared
triage labels. It never changes tracked repository files, Git history,
Capabilities, Cycle Proposals, or Learning Cycles.
