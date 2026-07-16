---
name: setup-project
description: Reconcile a repository with Giacomo's live Knowledge Bank project conventions.
disable-model-invocation: true
---

# Setup Project

Reconcile the current repository with the conventions that are canonical in the
live KB. Add missing applicable conventions, update stale implementations, preserve
valid project-local extensions, and leave the repository idempotently aligned.

The KB is the source of truth. Do not cache its conventions in this skill or copy
the master convention page into project documentation.

## 1. Read the live conventions

Read [`../lookup/SKILL.md`](../lookup/SKILL.md) completely and use its `context`
branch to resolve the canonical shared project-convention owner. Treat `build` as a
search hint, not proof of the current owner or content.

Fetch the complete shared-conventions section, the current project's KB owner when
one exists, and only the relations needed to identify project-local rules or
explicit exceptions. Read Blueprint only when the live convention names it as the
reference implementation.

Stop before editing when the live KB is unavailable, the canonical owner is
ambiguous, or a relevant project-local rule cannot be verified. Report the scope as
`unverified`; never fall back to a bundled convention snapshot.

Completion criterion: every entry in the complete fetched shared-conventions
section, plus every applicable project-owned rule or exception, has current evidence
and a clear owner.

## 2. Explore the repository

Read
[`../setup-matt-pocock-skills/SKILL.md`](../setup-matt-pocock-skills/SKILL.md)
completely. Preserve its tracker, label, domain-doc, template, and interview
behavior, but include its proposed writes in this skill's unified confirmation.

When the live convention selects a canonical root instruction file, that selection
overrides the upstream skill's root-file choice. Apply the upstream templates and
content rules in the live convention's selected file, and materialize any
compatibility file exactly as the live convention requires.

Inspect the repository before proposing changes:

- root and nested instruction files;
- existing `docs/agents/`, domain docs, ADRs, README, trust files, CI,
  dependency automation, release configuration, and canonical validation command;
- Git remotes, repository class signals, package and runtime metadata, and current
  working-tree changes;
- live GitHub settings when the applicable convention governs remote settings and
  the repository is on GitHub.

Classify the repository using the live convention. Prefer the linked project owner's
explicit class or local rules over inference. Ask only when a material ambiguity
would change the reconciliation.

Preserve unrelated work and unique project guidance. A project-local rule may extend
the shared convention. Treat a contradiction as stale only when it is not an
explicit, current exception.

Completion criterion: every listed repository surface is inspected or recorded as
absent or unavailable, the repository class has fetched evidence or an explicit
inference, existing work is accounted for, and the root instruction targets are
resolved from the live convention.

## 3. Complete the setup interview

Run the upstream setup questions in their documented order. Add this question as a
separate setup choice:

> Do you want to link this project to the Personal Mastery Program as an optional Project Lab? Recommended: no, unless you want a PMP Learning Cycle to use this project.

On `yes`, make the live KB's conditional PMP block applicable. On `no`, do not add
PMP instructions or require a Learning Cycle link. If PMP instructions already
exist, mark them as stale and propose their removal; do not remove them before the
unified confirmation.

Ask this question on every setup or reconciliation run so the user can opt in or
out deliberately. The question and recommendation belong only to this skill; never
write them into the KB convention or the project.

Completion criterion: every applicable upstream setup choice and an explicit PMP
`yes` or `no` are recorded for the drift plan.

## 4. Build one drift plan and confirm it

Compare the repository with every applicable live convention. Classify each item as:

- `aligned`: no change;
- `missing`: add the materialized convention;
- `stale`: update or remove the conflicting implementation;
- `local exception`: preserve the explicit project-owned divergence;
- `not applicable`: explain briefly;
- `blocked`: name the missing evidence, authority, or capability.

Show the repository class, upstream setup choices, PMP choice, drift map, exact local
files, and any remote settings that would change. Distinguish upstream setup writes
from KB-convention reconciliation. Extend the upstream draft into this single
confirmation instead of opening a second confirmation.

Do not treat a technology default as permission for an unplanned architecture
migration. Put high-cost technology or architecture contradictions behind an
explicit decision and `domain-reconnaissance` when its trigger applies.

Make no local or remote write before the user confirms the unified plan.

Completion criterion: every entry in the fetched shared-conventions section and
every applicable project-owned rule has exactly one drift classification, every
proposed write is shown, and the user has confirmed that exact plan.

## 5. Reconcile the project

Immediately before writing, re-fetch the canonical convention section and any
project-local exception that determined the plan. Drift invalidates confirmation;
refresh the plan and confirm again.

After confirmation:

1. Apply the upstream setup writes using its templates and content rules, with root
   instruction destinations selected by the current live convention.
2. Add every missing applicable materialized convention.
3. Update every confirmed stale implementation to the live convention.
4. Preserve aligned content, scoped instruction files, local exceptions, and unique
   user guidance.
5. If PMP was accepted, copy the exact current conditional block from the live KB
   into root `AGENTS.md` once. If declined, leave it absent or perform only the
   confirmed removal.
6. Apply confirmed remote-setting changes only when authenticated access exists.
   Return exact commands and mark them blocked when the write is unavailable.

Implement conventions through the repository's real structure. Do not add a local
document that restates the master KB page.

Completion criterion: every confirmed local or remote change is applied or marked
`blocked` with an exact follow-up, and the working tree contains no unconfirmed
delta from this run.

## 6. Validate and report

Recompute the drift map against a fresh read of the live convention. Verify the
configured `docs/agents/` files, instruction ownership, remote settings that changed,
and every applicable convention in scope.

Inspect the final diff, run `git diff --check` when Git is available, and run the
repository's canonical validation command when documented. Report:

- upstream setup changes;
- KB-convention changes;
- preserved local exceptions;
- aligned and not-applicable items;
- blocked items and exact follow-up;
- validation results.

Completion criterion: all applicable items are aligned or an explicit local
exception, blocked items are visible, no unrelated content changed, and re-running
the skill would produce no unconfirmed delta.
