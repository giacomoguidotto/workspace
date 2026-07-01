---
name: setup
description: Materialize Knowledge Bank Infrastructure on this machine. Connect the KB provider, collect bindings, install the lookup and capture skills, and bootstrap the automations. Use when the user runs /setup, says bootstrap this infra, or asks to install or wire up kb-infra.
---

# Setup

## Purpose

Setup materializes the spec into a working setup on this machine. It binds every
personal value, installs the skills, and stands up the automations. It writes
only gitignored `local/` bindings and the user's own harness config; it never
commits a personal value.

## Branches

- `all` (default): materialize every element, in order.
- scoped: materialize one element — `provider`, `bindings`, `skills`, or a named
  automation.

Run the full sequence unless the user scopes it. Later steps assume earlier
bindings exist; if a scoped run needs a missing binding, collect it first.

## Workflow

### 1. Connect the KB Provider

Confirm which provider backs this instance. Validate the connector by reading one
real page. Record the provider and a start hint in `local/bindings.yml`.

Completion criterion: a live read from the provider succeeded, or the exact
connector blocker is reported.

### 2. Bind the Endpoints

Read the endpoint vocabulary from
[_preamble.md](../../docs/automations/_preamble.md). Explore the KB to locate a
canonical owner for each endpoint the enabled automations read. Where an owner is
ambiguous or missing, grill the user one question at a time, like `grill-me`,
rather than guessing. Record each binding as a hint in `local/bindings.yml`;
`lookup` resolves the rest live.

Completion criterion: every endpoint an enabled automation needs is bound to a KB
location or explicitly marked unbound with a reason.

### 3. Bind the Sinks

Read the sink vocabulary from the preamble. For each sink an enabled automation
targets, collect its link and local clone path. Record them in
`local/bindings.yml`.

Completion criterion: every sink an enabled automation needs has a binding, or is
marked disabled.

### 4. Install the Skills

Copy `lookup`, `capture`, and `setup` into the harness skill directory. Prefer
`~/.agents/skills/<name>/` and `~/.claude/skills/<name>/`, which together cover
current harnesses. Use materialized copies, not symlinks or hard links. Re-run
this step after any skill edit.

Completion criterion: each skill resolves from at least one active harness skill
path.

### 5. Bootstrap the Automations

For each enabled automation, compose the paste-ready prompt from three parts: the
preamble, the automation body, and the resolved bindings. Confirm the cadence
binding. Detect the harness: if it can create a scheduled automation from an
agent, create it; otherwise output the paste-ready prompt and name where it goes.

Completion criterion: every enabled automation is either created in the harness or
handed over as a paste-ready prompt with its target and cadence.

### 6. Report

Report what was materialized, every binding recorded, every automation created or
handed over, and anything left unbound.

Completion criterion: the user can see the full state of the setup and the exact
next manual action, if any.

## Rules

- Write bindings only to gitignored `local/`. Never commit a personal value.
- Never write a personal value into a committed spec file.
- Use [bindings.example.yml](../../local/bindings.example.yml) as the shape for
  `local/bindings.yml`.
- The follow-up marker policy ships as a repo default; offer to override it into a
  binding, do not assume.
- Treat `local/bindings.yml` as replaceable: re-running setup rebuilds it from the
  live KB and the user's answers.
