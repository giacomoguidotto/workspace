---
name: setup-knowledge-system
description: Check or reconcile the standalone Knowledge System. Use when the user invokes /setup-knowledge-system, or asks to install, update, health-check, or reconcile Knowledge System bindings, public skills, the shared interface package, or KB Reconcile.
---

# Setup Knowledge System

## Command

Run `/setup-knowledge-system check` for a fresh read-only health check or
`/setup-knowledge-system reconcile` to apply safe deltas and finish with the same
fresh check. Omitted mode means `reconcile`. Reject every other mode.

Knowledge System is independently usable. Do not inspect, clone, install, or
reconcile Agentic OS, Mastery System, Career Ops, a Distribution Bundle, or any
cross-system automation.

## Result

Report one overall state and a state for each branch:

- `converged`: observed live state already matches the bundled definition;
- `drifted`: check found a safe delta that reconcile can apply;
- `blocked`: user input, access, or an unavailable dependency prevents only this
  branch from converging;
- `failed`: malformed data, an unsafe invariant, an unexpected error, or a claimed
  write that remains drifted after the final check.

Continue across independent branches. Never treat an earlier setup run, receipt,
version record, or prompt snapshot as evidence of current health.

## Bundled Sources

Resolve all resource paths relative to this `SKILL.md`; an installed setup skill
must not require a repository checkout or fetch a hidden latest release.

- The canonical interface package is
  `resources/knowledge-system-interface/v1/`.
- The canonical KB Reconcile definition is
  `resources/automations/kb-reconcile/definition.md`.
- The installed interface target is
  `<harness-skill-root>/knowledge-system-interface/v1/`. It is a non-skill package
  with a provider-blind validation executable and must not contain `SKILL.md` or
  become user-invocable.
- The canonical public skill names are `lookup`, `capture`, and
  `setup-knowledge-system`. They are distributed from `skills/public/` by their
  owning Knowledge System release.
- `get-knowledge` and `grill-knowledge` are internal, repo-native helpers. They are
  committed under `skills/internal/`, excluded from normal public distribution,
  and installed only through an explicit repo-native action.

`/lookup` and `/capture` resolve the shared interface package relative to their
harness skill root. A missing package, an unsupported interface major, an invalid
registry, or a role absent from the registry blocks only the capability that needs
it.

## Check

Check is strictly read-only. Read live state, compute all comparisons in memory or
a disposable temporary directory, report the result, and make zero writes.

### 1. Bindings and provider

Find the installation's existing `local/bindings.yml`. Preserve the file byte for
byte throughout setup unless the user explicitly supplies a missing value for a
safe additive update.

- Validate its shape against `local/bindings.example.yml` when a source checkout is
  available. Unknown valid keys and values are preserved.
- A nonblank provider name and connector are required. Validate the connector with
  one narrow live read.
- Validate only the endpoint roles required by Knowledge System capabilities: the
  active Endpoint Registry and KB Reconcile. A key is not proof of a binding;
  resolve it live by meaning or by its recorded hint.
- Blank is valid only when the role resolves unambiguously by meaning. A placeholder,
  inaccessible owner, or ambiguous owner is `blocked`, never fabricated state.
- Changing an existing provider is outside ordinary reconciliation and requires the
  dedicated approval-gated provider migration.

Never rebuild the whole bindings file, delete a value because the current release
does not understand it, or copy provider coordinates into committed files.

### 2. Public and internal skills

Inspect the live harness skill root, not an installed receipt.

- Verify `lookup`, `capture`, and `setup-knowledge-system` are present and are from
  the same explicit Knowledge System installation action.
- Verify the installed `lookup` and `capture` contracts resolve
  `knowledge-system-interface/v1` from the shared harness skill root.
- Report missing or stale public skills as drift that requires an explicit install
  or upgrade of the owning release. Do not silently fetch or upgrade a release.
- Do not install internal skills during ordinary public setup. When setup runs from
  the owning repository and the user explicitly requests the internal install,
  compare and copy only `skills/internal/get-knowledge` and
  `skills/internal/grill-knowledge`.

### 3. Knowledge System interface

Validate the bundled v1 package before comparing it:

- every JSON file parses;
- every schema validates its bundled example;
- every request and capture role exists and is active in the Endpoint Registry;
- the registry revision is nonblank;
- the Snapshot Token validation operation executes its self-check;
- the Knowledge Project Snapshot producer executes its self-check;
- the package contains no `SKILL.md`.

Compare the complete bundled and installed trees by relative path, file type, and
content. Extra installed files are drift because the installed package must be an
exact non-skill materialization. Do not use timestamps as evidence.

Use `scripts/reconcile-interface.sh check <harness-skill-root>` for this exact tree
comparison when filesystem access is available. Report
`snapshot-token-validation` as a distinct capability: `ready` only when the
installed executable passes a fresh self-check, otherwise `blocked` with the
observed reason. Package drift and capability readiness remain separate facts.
Report `knowledge-project-snapshot` the same way from a fresh installed
`produce-project-snapshot.py --self-check`. This read-only capability has no KB
capture or write authority.

### 4. KB Reconcile

Inspect the live harness automation by stable identity.

- Only KB Reconcile belongs to this setup. Never materialize Social Compose,
  Portfolio Refresh, Job Scout, Job Pursue, or any other cross-system automation.
- Compare its live definition, cadence, execution metadata, and Knowledge-only
  bindings against the bundled definition and current local bindings.
- Validate its harness-owned runtime history separately. Preserve its automation
  identity, schedule history, run history, and existing `last_completed_at` exactly.
  A nonblank completion timestamp must be valid ISO 8601.
- Missing live automation state or an inaccessible state handle is a blocker. Never
  infer `last_completed_at` from a thread, invocation, receipt, or prompt content.

The live harness definition is the materialization. Do not create
`local/installed.yml`, a run ledger, a setup receipt, a composed prompt snapshot,
or any file under `local/automations/`.

## Reconcile

First run the complete check. Apply only branches reported `drifted`; leave
`converged`, `blocked`, and unrelated live state untouched.

### Bindings

Ask one question at a time only for a required missing or ambiguous value. Apply an
approved value as the smallest possible edit while preserving every existing valid
value and unknown key. Never normalize, reorder, or rewrite the entire file. If no
binding delta was approved, do not write it.

### Interface

Materialize the bundled interface to a temporary sibling directory, validate the
candidate again, then replace the installed v1 tree only when its content differs.
Use an atomic rename when the harness filesystem supports it. Do not touch sibling
skills or other interface majors. If the trees are identical, perform no copy,
rename, metadata update, or timestamp write.

Use `scripts/reconcile-interface.sh reconcile <harness-skill-root>` when filesystem
access is available; it implements the candidate validation and zero-write no-op.

### KB Reconcile

Create or update the existing KB Reconcile automation in place from the bundled
definition plus its currently resolved Knowledge-only bindings. Preserve the stable
automation identity, cadence unless a new cadence was explicitly accepted, complete
run history, runtime-state handle, and `last_completed_at`. Change only definition
or execution metadata that the fresh check proved drifted.

When the harness cannot mutate automations directly, return the exact candidate and
target as a handoff. A handoff is `blocked`, not a successful write.

### Final check

Run the complete read-only check again from live state. A branch changed by this run
must now be `converged`; otherwise report `failed`. Report the exact writes made.

An identical second reconcile must report every healthy branch `converged` and make
zero writes. It must not touch bindings, skills, the interface package, the live
automation, or runtime history, and it must not emit a receipt or composed prompt
snapshot.

## Safety Rules

- `/capture` remains the only approval gate for KB writes. Setup never writes KB
  knowledge.
- Use narrow live lookup and never preload or mirror the Knowledge Bank.
- Preserve valid `local/bindings.yml` values and all harness-owned runtime history.
- Never use a cached setup result as health evidence.
- Never switch, pull, reset, clean, stash, or otherwise mutate a repository checkout.
- Never silently upgrade installed skills.
- Never create a permanent `/setup-kb-infra` alias or compatibility wrapper.
