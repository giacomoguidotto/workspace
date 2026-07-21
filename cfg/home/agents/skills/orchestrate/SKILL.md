---
name: orchestrate
description: Conduct an existing GitHub spec through an accepted ticket graph, implementation, integration, and cleanup.
disable-model-invocation: true
argument-hint: "spec #1234 [owner/repo:final:integration]"
---

# Orchestrate

Act as a **conductor**. The spec and implementation tickets already exist. This
task proves their graph, opens one launch gate, publishes the accepted graph,
then starts exactly one lifecycle actor.

Accept `spec <issue-ref>` plus an optional
`owner/repo:final-branch:integration-branch`. `#1234` uses the current GitHub
repository; a full issue URL resolves its repository. A named profile is a
recommendation and never skips the launch gate.

## Profile

The launch profile has two orthogonal axes:

- `review=lean`: required validation plus local CodeRabbit light review.
- `review=deep`: required validation plus full local CodeRabbit and one
  independent adversarial reviewer.
- `supervision=supervised`: integration pauses for SHA-bound user approval.
- `supervision=unsupervised`: a ready SHA integrates automatically.

Repository-required checks are always additive. Delivery is automatic: an
exclusive writable lane may integrate without a PR; parallel work or repository
policy uses PRs. Worker execution permission is not a supervision axis: every
profile requires writable actor worktrees and non-interactive execution.

Keep preflight read-only. The accepted launch gate authorizes publication of the
managed graph section, lifecycle actors, assignments, branches, PRs, comments,
admitted integration, issue closure, and exact cleanup.

## 1. Establish the score

1. Read the target repository instructions and resolve its local checkout.
2. Fetch the full spec body and comments. Resolve the assignee from an explicit
   invocation override or the authenticated GitHub viewer.
3. Build the complete implementation-ticket inventory from derivation links,
   comments, every issue whose `Parent` names the spec, and native sub-issues.
   Fetch native sub-issues independently; neither source alone is the inventory.
   Fetch every expected ticket's body, comments, state, and linked PRs. Precursors
   and decision issues do not enter the implementation manifest.
4. Require every expected implementation ticket to be a native sub-issue. List
   every missing relationship and stop before rendering when any is absent.
5. Classify a ticket as `HITL` when its labels, metadata, or body explicitly say
   `HITL`, `HILT`, or human-in-the-loop; otherwise classify it as `AFK`.
6. Resolve `Blocked by` edges from native relationships, then ticket text.
   Record repository-qualified external blockers separately.
7. Resolve branches from invocation, spec text, an unambiguous repository
   convention, then the default branch for both final and integration.
8. Resolve the repository's complete validation command and whether branch
   rules, repository instructions, or PR-only checks require PR delivery.
9. Prove the current trusted runtime can create writable isolated worktrees and
   perform required git and GitHub operations without operational approval.
   A runtime that would prompt during implementation is not launchable.
10. Find existing conductors and live work for this spec. Record their profile,
   target branch, ticket, PR, head, and state without resuming them. A legacy
   conductor without a profile is `deep + supervised`.

Completion criterion: at least one implementation ticket exists; each has a
title, state, mode, native parent, and resolved blockers; the repository,
assignee, branches, validation command, PR requirements, and every live actor
are known.

## 2. Prove the frontier

Build the manifest from live GitHub state:

```json
{"spec":"1234","tickets":[{"id":"10","parent":"1234","nativeSubIssue":true,"title":"...","state":"open","mode":"hitl","blockedBy":["other/repo#7"]}],"externalBlockers":[{"id":"other/repo#7","state":"closed"}]}
```

Resolve `scripts/validate-graph.mjs` beside this file and run it with `node`,
passing the manifest on stdin. A nonzero exit stops preflight. Repair discovery
from authoritative state; if it remains invalid, report the diagnostic and end.

Run `scripts/render-graph.mjs` with the same manifest. Keep its Mermaid stdout,
`launchable` AFK frontier, and `hitlFrontier` pauses. Mark the current frontier
`direct-eligible` only when it contains one AFK ticket, no other live writer
targets integration, direct pushes are allowed, and complete validation runs
before integration. Uncertain or PR-only validation makes it `pr-required`.

Completion criterion: validation proves a complete acyclic graph and the
renderer emits one node per ticket and external blocker; current delivery
eligibility has evidence.

## 3. Open the launch gate

Show the Mermaid graph and say arrows point from blocker to unlocked ticket.
List every open HITL ticket, or `HITL pauses: none`. Show current delivery
eligibility and any existing conductor beside the graph.

Ask exactly: "Which orchestration profile should I launch? Choosing one accepts
this graph and its listed HITL pauses."

1. `lean + supervised`
2. `lean + unsupervised`
3. `deep + supervised`
4. `deep + unsupervised`

If a live conductor differs, state that selection authorizes replacement only
after exact cleanup proves no unmerged work will be lost. Create nothing and
write nothing before the answer.

Completion criterion: the user selected one profile and accepted the graph and
HITL pauses in the same answer.

## 4. Publish the accepted graph

Refresh the spec, tickets, blockers, branches, and repository rules. Rebuild,
validate, and render the manifest. Structural or delivery-evidence drift returns
to the launch gate with the new graph; it does not publish stale acceptance.

Immediately before mutation, refetch the spec and require its body and
`updatedAt` to match the refreshed source. Any mismatch returns to the launch
gate. GitHub issue updates do not support conditional `PATCH`, so keep the
verified read and write adjacent.

Resolve `scripts/upsert-graph.mjs` beside this file. Pass that latest issue body,
Mermaid output, selected profile, and HITL pause strings as JSON on stdin. Update
the spec body with its stdout, then refetch and verify the exact managed section
and unchanged outside bytes. Preserve every byte outside these markers:

```text
<!-- orchestrate:graph:start -->
<!-- orchestrate:graph:end -->
```

Completion criterion: the live spec contains exactly one verified managed
section matching the revalidated graph, profile, and HITL pauses.

## 5. Launch

If a matching conductor Codex task exists, send it the refreshed accepted
manifest and current contract paths, then resume it. If it differs, prove safe
replacement and clean it exactly; unsafe replacement is a blocker.

Read [`RUNTIME.md`](RUNTIME.md) and [`IMPLEMENTER.md`](IMPLEMENTER.md) fully.
Inject their absolute paths plus [`REVIEW.md`](REVIEW.md) and
[`REVIEWER.md`](REVIEWER.md), the accepted manifest, assignee, branches,
validation command, HITL pauses, profile, and delivery evidence.

The new-task runtime must resolve to `sandbox_mode=danger-full-access` and
`approval_policy=never`; network access must be enabled. A mismatch is a launch
blocker, never a reason to ask the user for an operational approval.

Use `create_thread`, never a fork or subagent, to launch one separate fresh Codex
task in the target project's local environment. Prefer `model=gpt-5.6-luna`
with `thinking=low`; fall back to the fastest available low-effort model. Give it
the fully instantiated runtime with the First objective first. Set its title to
`#<spec-id> · Orchestrator`. The fresh task receives only the accepted graph and
runtime inputs, not this preflight transcript.

Wait for its first checkpoint with `wait_threads`. Verify every AFK frontier
ticket has a separate fresh implementer Codex task or blocker, every HITL
frontier ticket is paused without an actor, and the conductor entered mandatory
wait. This topology is unchanged for one ticket: the conductor still creates
one implementer task, while the exclusive lane may use direct delivery.

Completion criterion: exactly one conductor task owns the accepted graph; no
unfinished run is idle outside a supervised gate, HITL pause, or blocker.

Return the conductor's final signal for completion, approval, HITL pause,
structural drift, or a concrete blocker. After `ORCH_COMPLETE`, verify every
implementer is terminal, archive the conductor task, and verify no matching
actor remains live.
