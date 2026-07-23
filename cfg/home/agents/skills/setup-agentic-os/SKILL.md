---
name: setup-agentic-os
description: Check or reconcile the fixed Agentic Constellation through the three System-owned setup interfaces.
argument-hint: "[check | reconcile]"
user_invocable: true
user-invocable: true
license: MIT
---

# Setup Agentic OS

Use this module for `/setup-agentic-os [check|reconcile]`. Omitted mode means
`reconcile`; reject every other argument. The command composes the fixed Knowledge
System, Mastery System, and Career System Implementations. It does not make those
Systems depend on Agentic OS.

## Installation input

Read `local/installation.yml` from the Agentic OS checkout. It is gitignored and
contains exactly these three irreducibly local absolute roots:

```yaml
repositories:
  knowledge-system: /absolute/root
  mastery-system: /absolute/root
  career-ops: /absolute/root
```

Reject extra keys, missing roots, relative roots, aliases, feature flags, provider
bindings, branches, remotes, implementation choices, or installed-state fields.
Never write personal paths into this skill or another committed file. Repository
identities, required branches, setup interfaces, ownership, and capability facts
are fixed in [`resources/system-contracts.json`](resources/system-contracts.json).

When the registry is missing or a required root needs clarification, ask for one
root at a time. A supplied answer authorizes only the smallest roots-only registry
edit. Do not infer a path from remembered or unrelated machine state.

## Result model

Report `agentic-os.setup.result/v1`, with an overall state and independent branch
details. Use:

- `converged`: live state matches the committed definition;
- `drifted`: check found a safe delta reconcile can apply;
- `blocked`: access, human input, an unavailable dependency, or unsafe Git state
  prevents only the dependent branch;
- `failed`: a malformed contract, unexpected crash, safety violation, or claimed
  delta that remains drifted after the final check.

Combined precedence is `failed`, `blocked`, `drifted`, then `converged`. Preserve
successful branch convergence when another branch blocks. Store no run ledger,
plan, receipt, prompt snapshot, cache, or resumption token.

## Repository phase

Run the bundled repository observer, resolving `scripts/` relative to this
`SKILL.md`:

```bash
python3 scripts/setup-agentic-os.py check --registry local/installation.yml
python3 scripts/setup-agentic-os.py reconcile --registry local/installation.yml
```

`check` is strictly read-only. It derives state from the registry, live
filesystem, Git worktree, and remote branch without fetching or writing refs.
`reconcile` may clone a missing registered repository from its committed identity
onto its required branch, but must leave every existing checkout untouched. It
always finishes with a fresh read-only observation.

Never switch, pull, rebase, reset, stash, clean, repoint a remote, delete a
repository, discard changes, or guess through a wrong identity, dirty checkout,
wrong branch, missing required branch, stale branch, divergence, or unreachable
remote. Those conditions are blockers. Development belongs in separate worktrees.

## System phase

For every repository branch whose fresh generic Git result is `converged`, invoke
its installed System-owned setup interface with the same mode and its registered
absolute root:

1. `/setup-knowledge-system [check|reconcile]`
2. `/setup-mastery-system [check|reconcile]`
3. `/setup-career-system [check|reconcile]`

Attempt all three independently. Never reproduce their domain checks, edit their
files, or call their internal implementations. Treat a malformed System result as
`failed`; preserve its own `converged`, `drifted`, `blocked`, and `failed` branch
details otherwise. In reconcile mode, require each System interface to perform its
own fresh final check.

After an attempted System delta, run `/setup-<system> check` again even if the
native result claims convergence. A claimed write that remains drifted is
`failed`. A blocked System prevents only Agentic OS resources that declare that
System as a dependency.

## Agentic OS resources

The canonical automation sources and migration map are bundled under
`resources/automations/` and
[`resources/automation-migration.json`](resources/automation-migration.json).
They contain Agentic OS-owned coordination behavior only.

On `check`, compare each live automation through the harness by stable identity.
Compare canonical definition files and execution metadata separately from
installation-local schedule, timezone, working directory, project, enabled
status, provider bindings, runtime handle, run history, and `last_completed_at`.
Unobservable live state is `blocked`, not inferred from prompt text or a receipt.

On `reconcile`, update an existing automation in place only when its declared
System dependencies are freshly converged. Preserve its stable identity and all
installation-local fields byte for byte. Materialize a missing automation only
through the harness's native interface. When no safe harness mutation interface is
available, return an exact candidate handoff as `blocked`, never report a write.
Do not recreate an existing automation merely because in-place update is
unavailable.

Use `scripts/reconcile-automation-sources.py` only for a harness adapter's isolated
canonical-source lane. The destination must not contain installation-local or
runtime metadata. The tool copies only declared source files, preserves unrelated
files, writes atomically, and makes an identical second reconcile a zero-write
no-op. It is not a substitute for the harness operation that preserves live
identity and history.

Dependencies are scoped:

- PR/CI Repair Sweep has no System dependency.
- Social Compose and Portfolio Refresh require Knowledge System.
- Job Scout and Job Pursue require Knowledge System and Career System.

Mastery System health remains independent and is required by capabilities that
consume it, including `agentic-os.upskill`, but does not block unrelated
automation materialization.

## Final check

After every attempted delta, run the complete repository observer in `check` mode,
fresh System-owned checks, and fresh live automation comparisons. Report exact
writes and blockers by branch. A second identical reconcile must perform zero
writes to repositories, System materializations, automation definitions, runtime
metadata, or operational records.

Setup never submits applications, sends messages, publishes content, mutates the
Knowledge Bank, or invokes an integration capability merely to prove readiness.
