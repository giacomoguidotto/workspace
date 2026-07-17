---
name: orchestrate
description: Conduct an existing GitHub spec through its dependency-aware ticket implementation, review, merge, and cleanup lifecycle.
disable-model-invocation: true
argument-hint: "spec #1234 [owner/repo:final:integration]"
---

# Orchestrate

Act as a **conductor**. The spec and its implementation tickets already exist;
this skill validates their score, creates one dedicated conductor thread, and
lets that thread work the frontier until the spec lands.

## Invocation

Accept `spec <issue-ref>` plus an optional
`owner/repo:final-branch:integration-branch` target. `#1234` means the current
GitHub repository; a full issue URL resolves its repository directly.

This invocation authorizes creation of the conductor thread, ticket worktrees,
implementer threads, reviewer subagents, PR comments, ticket PRs, approved
merges, and exact post-merge cleanup. The SHA-bound user approval remains the
merge checkpoint. Start immediately when preflight resolves every input.

## 1. Establish the score

1. Read the target repository instructions and resolve its Codex project.
2. Fetch the full spec body and comments.
3. Discover every child ticket, preferring native sub-issue relationships and
   then issues whose `Parent` section names the spec. Fetch every ticket body,
   comments, state, and existing linked PRs.
4. Resolve each `Blocked by` edge, preferring native tracker relationships and
   then the ticket section. Record external blockers separately.
5. Resolve branch topology in this order: explicit invocation target, explicit
   spec text, unambiguous repository integration convention, repository default
   branch for both final and integration. Ask one focused question if the choice
   would otherwise change where PRs merge.
6. Search Codex tasks and GitHub for an existing conductor or live work for the
   same spec. Resume the existing conductor instead of duplicating it.

Completion criterion: every child ticket and blocker has been read, the exact
repository, final branch, and integration branch are known, and no live actor
would be duplicated.

## 2. Prove the frontier

Build this manifest from live GitHub state. Give blockers outside the spec a
repository-qualified id and their live state:

```json
{"spec":"1234","tickets":[{"id":"10","title":"...","state":"open","blockedBy":["other/repo#7"]}],"externalBlockers":[{"id":"other/repo#7","state":"closed"}]}
```

Resolve `scripts/validate-graph.mjs` beside this `SKILL.md` and pass the manifest
to it on stdin. A nonzero exit is a hard stop: repair discovery or ask about the
ambiguous edge. Keep the validator's reported frontier as the initial launch
set.

Completion criterion: the validator proves unique tickets, known blockers, an
acyclic graph, and the complete current frontier.

## 3. Start or resume the conductor

If a matching conductor exists, navigate to it and report that it was resumed.
Otherwise read [`RUNTIME.md`](RUNTIME.md) and [`PROMPTS.md`](PROMPTS.md) fully,
instantiate every template token from the proven manifest, and create a local
project thread. Name it `<repo> Spec #<id> · Orchestrator`, pin it, wait for its
first progress checkpoint, and confirm that it launched only the frontier.

The runtime files are the single source of truth for actor prompts, approval
markers, merge admission, polling, ticket closure, final integration, and
cleanup. Inject their absolute paths so the conductor can reread them before
each actor launch.

Completion criterion: exactly one pinned conductor is active and every initial
frontier ticket has either one implementer thread or a surfaced blocker.

Return the conductor task link with `::created-thread` when newly created.
