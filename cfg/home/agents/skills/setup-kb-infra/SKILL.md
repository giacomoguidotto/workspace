---
name: setup-kb-infra
description: Materialize and reconcile Knowledge Bank Infrastructure on this machine. Connect the KB provider, collect bindings, install the lookup and capture skills, and bootstrap the automations — on first run and on every later run. Use when the user runs /setup-kb-infra, says bootstrap/install/wire up kb-infra, or asks to update, sync, reconcile, or health-check the setup.
---

# Setup

## Purpose

Setup materializes the spec into a working setup on this machine and keeps it in
sync over time. It is a **reconcile**, not a one-shot installer: it reads the
desired state from the spec (the source of record), reads the actual materialized
state, and closes the gap. The first run reconciles from nothing; every later run
reconciles from whatever already exists. It writes only gitignored `local/`
bindings and the user's own harness config; it never commits a personal value.

This mirrors the plan/apply model behind ADR 0001's Terraform analogy: compute the
drift, show it, then apply only the delta.

## Branches

- `all` (default): full reconcile — plan, then apply across every element.
- `check`: read-only health check — report drift and stop; change nothing.
- scoped: reconcile one element — `provider`, `bindings`, `skills`, or a named
  automation.

Run the full reconcile unless the user scopes it. Later steps assume earlier
bindings exist; if a scoped run needs a missing binding, collect it first. Every
step is idempotent: touch only what is missing, changed, or newly added, and leave
correct state alone.

## Workflow

### 1. Plan: diff desired against actual

Compare the spec (desired) with the materialized state (actual) and produce a drift
report before changing anything:

- Version: read the current spec version from the git tags (`git describe --tags`);
  `vX.Y.Z` tags are the source of truth. Compare it against the `version` recorded
  in `local/installed.yml` to see how far the installed setup has fallen behind.
- Desired: the endpoint, sink, and source vocabulary in
  [_preamble.md](../../docs/automations/_preamble.md), the endpoints, sinks, and
  sources each **enabled** automation declares, the skills under `skills/`, the
  automations under `docs/automations/`, and one cadence per enabled automation.
- Actual: `local/bindings.yml` (a key present with a blank or placeholder value is
  **not** a binding), `local/installed.yml`, the snapshotted prompts under
  `local/automations/`, and the installed skill copies.
- Drive the endpoint, sink, and source checks from the **desired** set — the
  endpoints, sinks, and sources each enabled automation declares — not from whatever
  keys happen to be in `bindings.yml`. For each declared endpoint, probe that it
  resolves to a concrete KB owner; a present key is not proof of a binding.
- Drift to surface, by category:
  - the spec version has advanced past the installed version;
  - an endpoint an enabled automation declares does not resolve to a concrete KB
    owner: its `bindings.yml` entry is absent, blank, or still a placeholder (for
    example a `TODO`/`FIXME` hint), or its hint points at a page that no longer
    resolves live. Verify by resolution, not by key presence;
  - a sink an enabled automation targets is unbound, disabled-yet-needed, or
    unreachable;
  - a source an enabled automation declares is unbound or unreachable; a best-effort
    source (for example a `<social-profile-source>` platform) may be intentionally
    blank, which is a skip, not a gap;
  - bindings whose endpoint or sink is no longer in the spec (retired);
  - skills whose source differs from the installed copy (stale install) or is not
    installed;
  - automations new to the spec, or whose fresh compose differs from the snapshot in
    `local/automations/`, or removed from the spec;
  - cadences missing for an enabled automation.

In `check` mode, report this plan and stop.

Completion criterion: the user sees a categorized drift report and nothing has
changed yet.

### 2. Connect the KB Provider

Confirm which provider backs this instance. Validate the connector by reading one
real page. Record the provider and a start hint in `local/bindings.yml` if it is not
already present and valid.

Completion criterion: a live read from the provider succeeded, or the exact
connector blocker is reported.

### 3. Reconcile the Endpoint Bindings

Read the endpoint vocabulary from
[_preamble.md](../../docs/automations/_preamble.md). Resolve every endpoint the plan
flagged as unbound, ambiguous, or stale — including endpoints whose `bindings.yml`
key exists but is blank, a placeholder, or does not resolve to a real page.

A binding value is a resolution hint — a KB location — or blank; never write status
prose (for example `UNBOUND: ...`) into it, and never treat "resolve by meaning" as a
resolution for an endpoint that currently resolves to no owner.

Blank is acceptable only when the endpoint genuinely resolves to a real owner by
meaning. When it does not — a missing, ambiguous, or brand-new endpoint (for example
a persona or published-context surface the user must create) — that is a hard gap,
not an auto-resolvable one. Grill the user one question at a time, like `grill-me`,
to close it: point it at an existing page, or decide together to create a new page
and record where it lives. Do not move on by self-marking it unbound.

Only the user may leave a needed endpoint unresolved, as an explicit deferral; record
that as their decision, not as a binding hint. If the run cannot grill because it is
non-interactive, stop and report the unresolved endpoints as a blocker rather than
fabricating a resolution. Leave already-valid bindings untouched. Propose removing
bindings for retired endpoints; do not delete a personal value without confirmation.

Completion criterion: every endpoint an enabled automation needs resolves to a KB
owner, or the user has explicitly deferred it; no needed endpoint is left as a
self-authored "unbound" note, and retired bindings are resolved.

### 4. Reconcile the Sink and Source Bindings

Read the sink and source vocabulary from the preamble. For each sink an enabled
automation targets, confirm its link and local clone path, collecting only what the
plan flagged as missing, disabled-yet-needed, or unreachable. For each source an
enabled automation declares, collect its binding the same way — a `<transcript-source>`
is a list of local locations; a `<social-profile-source>` is one public profile URL per
platform (currently X and LinkedIn). A best-effort source platform may be left blank as
an explicit skip, not a gap. Record them in `local/bindings.yml`.

Completion criterion: every sink an enabled automation needs has a binding or is
marked disabled, and every declared source is bound or explicitly left blank.

### 5. Reconcile the Installed Skills

Copy `lookup`, `capture`, and `setup-kb-infra` into the harness skill directory,
re-copying only those whose source differs from the installed copy. Prefer
`~/.agents/skills/<name>/` and `~/.claude/skills/<name>/`, which together cover
current harnesses. Use materialized copies, not symlinks or hard links.

Confirm the `capture` approval-draft styling on first run: the shipped default is a
dark, Notion-style palette. Ask the user whether it works or whether they want it
restyled, and record the choice in `local/bindings.yml`; do not re-ask once it is
recorded.

Completion criterion: each skill's installed copy matches its source, and the
draft-style choice is recorded.

### 6. Reconcile the Automations

For each enabled automation, compose a lean, **self-contained** paste-ready prompt —
it is the running agent's entire world, since the run executes in the sink checkout
with the spec not present (see
[ADR 0005](../../docs/adr/0005-materialized-automation-is-self-contained.md)).
**Compose into a new artifact; never edit the source automation file or the preamble
under `docs/` — those are read-only, reference surfaces by role, and must stay free of
resolved bindings or any personal value.** The composed prompt is the only place
resolved bindings appear; write it only to `local/automations/<name>.md` and/or the
harness, and start it with a generated-file banner that names its source
(`docs/automations/<name>.md`) and marks it do-not-edit.

Compose these parts in order, and **only** these — never the full endpoint/sink
catalog, the provider block, the cadence, or blank overrides:

1. The banner, then `# <Name>` and a one-line intro. When the automation's primary
   sink resolves to a repo clone, name that clone as the working directory and state
   the spec is not checked out there; when the sink is a tool or the KB (no clone),
   state only that the spec is not checked out and everything needed is in the prompt.
2. `## Operating rules` — the preamble's Operating Rules, verbatim.
3. `## Context surfaces` — one line per endpoint the automation **declares**, joining
   its role description from the preamble vocabulary with its resolved hint from
   `local/bindings.yml`. Omit the section when the automation declares no endpoints.
4. `## Sink` / `## Sources` — one resolved line per declared sink and source: the role
   description plus the clone path and repo, or the tool handle. Omit when none.
5. Any convention the automation declares (for example Knowledge Harvest's follow-up
   marker policy) inlined as its own section, resolved from
   `docs/knowledge-bank-conventions.md` — never left as a path for the run to open.
6. The automation body from the source's `## Prompt` block, appended verbatim.

Confirm the cadence binding. Detect the harness: if it can create a scheduled
automation from an agent, create or update it; otherwise output the paste-ready
prompt and name where it goes. Recreate only automations the plan flagged as new,
changed, or cadence-drifted, and offer to retire automations removed from the spec.
After applying, snapshot each installed automation's composed prompt to
`local/automations/<name>.md` and update `local/installed.yml` with the current spec
version, timestamp, and per-automation cadence and hash, so the next run can compute
drift.

Completion criterion: every enabled automation is created, updated, or handed over
as a paste-ready prompt with its target and cadence, and `local/installed.yml` plus
the `local/automations/` snapshots are current.

### 7. Report

Report the plan applied: what changed, every binding recorded or removed, every
skill re-copied, every automation created, updated, retired, or handed over, and
anything still unbound or drifted.

Completion criterion: the user can see the full state of the setup, what the
reconcile changed, and the exact next manual action, if any.

## State

- The spec version lives in the git `vX.Y.Z` tags, not in a committed file; read it
  with `git describe --tags`. `scripts/bump-version.sh` advances it from conventional
  commits.
- Record the installed state in gitignored `local/installed.yml` (spec version,
  timestamp, and per-automation cadence and content hash) with the composed prompts
  snapshotted under `local/automations/`, per the preamble State Model. Use it only
  to compute drift; never store copied KB facts, answered grill questions, or
  anything beyond the version, cursors, and installed prompts themselves.
- Deleting the record must not make the next run less correct — only slower, by
  forcing a full re-materialize.

## Rules

- Write bindings only to gitignored `local/`. Never commit a personal value.
- Never write a personal value into a committed spec file.
- The spec source is read-only. Setup reads `docs/` and `skills/` to compose prompts
  and never edits them; resolved bindings and other personal values live only in the
  materialized prompt (`local/automations/` and the harness), never in the source.
- Be idempotent: a re-run with no spec change and healthy state makes no changes and
  grills nothing.
- Do not re-grill bindings that are already recorded and still resolve.
- A present binding key is not proof of a binding: treat a blank, placeholder, or
  non-resolving value as unbound, and drive the check from the endpoints and sinks
  the enabled automations declare.
- A binding value is a resolution hint or blank — never status prose. Never
  self-mark a needed endpoint unbound: resolving it by grilling, or an explicit user
  deferral, are the only outcomes.
- `check` mode is read-only: it plans and reports, and writes nothing.
- Retire, don't orphan: when an endpoint, sink, or automation leaves the spec,
  propose removing its materialized counterpart, but delete a personal value only
  with confirmation.
- Use [bindings.example.yml](../../local/bindings.example.yml) as the shape for
  `local/bindings.yml`, and
  [installed.example.yml](../../local/installed.example.yml) as the shape for
  `local/installed.yml`.
- The follow-up marker policy ships as a repo default; offer to override it into a
  binding, do not assume.
- Treat `local/bindings.yml` as replaceable: re-running setup rebuilds it from the
  live KB and the user's answers.
