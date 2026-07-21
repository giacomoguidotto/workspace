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

1. Treat the issue repository as the ledger repository. Read its instructions
   and resolve its local checkout and Codex project.
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
7. For each ticket, distinguish its ledger repository from its implementation
   target. Resolve an explicitly named target repository from ticket metadata,
   body, or accepted spec evidence; otherwise use the ledger repository. Record
   its target branch, whether it has any refs, local checkout and Codex project
   when available, and target-specific validation command. Never infer that a
   native sub-issue implements in its ledger repository.
8. Resolve final and integration branches per implementation target from ticket
   evidence, invocation, an unambiguous target convention, then its default
   branch. Resolve whether target rules or PR-only checks require PR delivery.
9. Prove the current trusted runtime can create writable isolated worktrees and
   perform required git and GitHub operations without operational approval.
   A runtime that would prompt during implementation is not launchable.
10. Find existing conductors and live work for this spec. Record their profile,
   target branch, ticket, PR, head, and state without resuming them. A legacy
   conductor without a profile is `deep + supervised`.

Completion criterion: at least one implementation ticket exists; each has a
title, state, mode, native parent, resolved blockers, and implementation target;
the ledger repository, assignee, target branches, validation commands, PR
requirements, and every live actor are known.

## 2. Prove the frontier

Build the manifest from live GitHub state:

```json
{"spec":"1234","ledgerRepository":"owner/ledger","tickets":[{"id":"10","parent":"1234","nativeSubIssue":true,"title":"...","state":"open","mode":"hitl","blockedBy":["other/repo#7"],"targetRepository":"owner/code"}],"externalBlockers":[{"id":"other/repo#7","state":"closed"}]}
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

Refresh the spec, tickets, blockers, implementation targets, branches, and
repository rules. Rebuild, validate, and render the manifest. Structural or
delivery-evidence drift returns to the launch gate with the new graph; it does
not publish stale acceptance.

Acquire the exclusive per-spec mutation lease before the final refresh and hold
it through verification, publication, and post-write reconciliation. Immediately
before mutation, rebuild and hash the complete graph-input snapshot: spec body
and comments, ticket bodies and states, blockers, implementation targets, target
bindings, branches, rules, and PR state. Require it to match the accepted refresh.
Then refetch the spec and require its body and `updatedAt` to match too. Any
mismatch releases the lease and returns to the launch gate. GitHub issue updates
do not support conditional `PATCH`, so no other spec writer may enter between
these verified reads and the write.

Resolve `scripts/upsert-graph.mjs` beside this file. Pass that latest issue body,
Mermaid output, selected profile, and HITL pause strings as JSON on stdin. Update
the spec body with its stdout, then refetch and verify the exact managed section
and unchanged outside bytes. Also rebuild the complete graph-input snapshot after
the write and reconcile it to the published graph. On any mismatch or failed
reconciliation, release the lease and return to the launch gate. Release the
lease only after successful reconciliation. Preserve every byte outside these
markers:

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
[`REVIEWER.md`](REVIEWER.md), the accepted manifest, assignee, target bindings,
branches, validation commands, HITL pauses, profile, and delivery evidence.

The new-task runtime must resolve to `sandbox_mode=danger-full-access` and
`approval_policy=never`; network access must be enabled. A mismatch is a launch
blocker, never a reason to ask the user for an operational approval.

Use `create_thread`, never a fork or subagent, to launch one separate fresh Codex
task in the target project's local environment. Prefer `model=gpt-5.6-luna`
with `thinking=low`; fall back to the fastest available low-effort model. Give it
the fully instantiated runtime with the First objective first. Set its title to
`#<spec-id> · Orchestrator`. The fresh task receives only the accepted graph and
runtime inputs, not this preflight transcript.

After `create_thread` returns, set the title and verify only that the conductor
task exists with the accepted startup payload. Do not wait for a topology
checkpoint or lifecycle signal. Emit exactly:

`ORCH_LAUNCHED spec=ID conductor=THREAD_ID host=HOST_ID`

This is a terminal handoff. The launcher must exit immediately and must not
watch implementers, relay `ORCH_*` signals, repair conductor failures, integrate
work, or own post-launch cleanup. The separate conductor is the only lifecycle
owner, including for a one-ticket graph.

Completion criterion: one conductor task accepted ownership and the launcher
terminated with its exact task and host identifiers.
