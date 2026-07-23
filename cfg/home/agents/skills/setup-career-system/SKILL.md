---
name: setup-career-system
description: Check or reconcile a standalone Career System checkout through its canonical versioned gateway.
argument-hint: "[check | reconcile] [--root /absolute/path] [--capability career-system.<name>/v<major>]"
user_invocable: true
user-invocable: true
license: MIT
---

# Setup Career System

Use this module for `/setup-career-system`. It operates on one Career System
checkout and has no dependency on another repository.

## Modes

- `check` is read-only. It reports source, user-layer, and requested capability
  readiness without changing the checkout.
- `reconcile` is the default. It copies only missing user customization templates,
  then performs a fresh check. It never fabricates a CV, profile, or portal policy.

Both modes report `import_ready` separately from `operational_ready`. Import
readiness means the native profile gateway can safely accept a snapshot;
operational readiness additionally requires the Career user layer.

Run the bundled script from this skill directory:

```bash
node scripts/setup-career-system.mjs reconcile --root /absolute/path/to/career-system
```

Use one or more `--capability` arguments to scope readiness. Capability names must
be versioned. When none is supplied, the script checks the gateway's discovery and
readiness capabilities plus native profile check and reconcile.

Treat `blocked` as an actionable setup result, not a crash. Ask the user for only
the missing user-layer inputs reported by the result. A second identical reconcile
must report no changes.
