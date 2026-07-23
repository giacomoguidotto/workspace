---
name: lookup
description: Look up scoped live Knowledge Bank context without writing. Use when a task needs KB context or asks to clarify missing, stale, or ambiguous knowledge.
---

# Lookup

Lookup is live, narrow, and read-only. The caller supplies the objective; the KB
supplies the knowledge.

## Interface Modes

Interactive calls accept an ad hoc objective and return the concise Markdown shape
below. Automation calls use the shared package at
`<harness-skill-root>/knowledge-system-interface/v1/` and return a Knowledge
Context Snapshot matching its `snapshot.schema.json`.

For an automation request:

1. Resolve the shared package relative to this skill's harness root. A missing or
   incompatible package blocks only the dependent capability; never fetch another
   version implicitly.
2. Reject fields outside `request.schema.json` and roles absent or inactive in the
   installed Endpoint Registry.
3. Resolve roles by registry meaning. Never accept or expose provider names, page
   locations, traversal instructions, cached facts, or project inventories.
4. Follow only the registry's owner and evidence traversal. Return `value` only from
   a current canonical owner, `absent` only when that owner establishes no
   applicable value, and `unresolved` for uncertainty. A search miss is never
   absence.
5. Attach evidence and provenance to every claim or established absence and cover
   the exact source revisions with an opaque Snapshot Token.

If covered state drifts, discard the partial result and rebuild once. Persistent
drift makes only affected roles `unresolved` and blocks only the dependent
capability.

## 1. Set Scope

Identify the caller's objective, named context surfaces, and branch:

- `context`: return knowledge needed for the task.
- `clarification`: ask the user to resolve relevant gaps.

Resolve named surfaces to live KB locations. Treat bindings as hints, not copied
knowledge or proof that a page still exists.

## 2. Read The KB

Search from the objective outward. Fetch plausible canonical owners, relevant
sections, and only the relations needed to interpret them or avoid duplication.
Use external evidence only when the caller asks for it or the surface requires it.

Do not broaden into an audit. Mark inaccessible or unsupported claims `unverified`.
Skip final-form content unless the user explicitly reopens it.

Completion: every retained fact has fetched evidence or an explicit limitation, and
every source is relevant to the caller.

## 3. Return Context

For an interactive `context` branch, return only what changes the caller's next
step:

```md
Sources:
- <KB page or external source>

Context:
- <usable fact>

Gaps:
- <blocking missing, stale, or uncertain fact; omit when empty>

Use:
- <effect on the caller's work>
```

Ask no question unless clarification was allowed and a gap blocks the task.

## 4. Clarify Gaps

For the `clarification` branch, collect the relevant gaps first, then ask one
question at a time. Prioritize blockers, due follow-ups, evidenced mismatches, then
other uncertainties. Stop after 10 questions unless the user asks to continue.

Classify each answer as an update candidate, follow-up marker, final-form marker,
discarded, or unresolved. Return the results to the caller; Lookup never chooses or
runs the write workflow.

## Rules

- Never write to the KB.
- Never duplicate KB knowledge into repo files or local state.
- Never invent exact dates from relative phrases.
- Read enough to answer, not enough to preload the workspace.
- Local state may cache search hints only; deleting it must affect speed, not
  correctness.
