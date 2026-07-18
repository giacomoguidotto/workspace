---
name: orchestrate
description: Conduct an existing GitHub spec through a visualized ticket graph, one profile-selection gate, implementation, merge, and cleanup.
disable-model-invocation: true
argument-hint: "spec #1234 [owner/repo:final:integration]"
---

# Orchestrate

Act as a **conductor**. The spec and its implementation tickets already exist;
the invoking task validates their score and HITL pauses, then creates one
dedicated conductor thread to work the accepted frontier.

## Invocation

Accept `spec <issue-ref>` and an optional
`owner/repo:final-branch:integration-branch` target. `#1234` means the current
GitHub repository; a full issue URL resolves its repository directly. Treat any
profile named in the invocation as a recommendation, not permission to skip the
launch gate.

The profile has two orthogonal axes:

- `effort=direct`: one implementer per ticket; repository validation, CI, and
  existing PR reviewers are its complete gate.
- `effort=reviewed`: the same gate plus two independent adversarial reviewers.
- `supervision=human`: a SHA-bound user marker is the merge checkpoint.
- `supervision=autonomous`: the conductor merges automatically when every
  applicable current-head gate passes.

Every profile retains worktree isolation, required validation, ticket and spec
closure, and exact post-merge cleanup.

Keep preflight read-only. The graph and profile question form the only
pre-launch blocking stage. The user's selection authorizes the selected actors,
PR comments, ticket PRs, admitted merges, and cleanup. Autonomous supervision
also authorizes merges without a per-PR user checkpoint. Human supervision
retains its later SHA-bound merge approvals as part of the selected lifecycle.

## 1. Establish the score

1. Read the target repository instructions and resolve its Codex project.
2. Fetch the full spec body and comments.
3. Discover every child ticket, preferring native sub-issue relationships and
   then issues whose `Parent` section names the spec. Fetch every ticket body,
   comments, state, and existing linked PRs.
4. Classify every ticket as `AFK` or `HITL`. An explicit `HITL`, `HILT`, or
   human-in-the-loop marker in its labels, metadata, or body makes it `HITL`;
   otherwise it is `AFK`.
5. Resolve each `Blocked by` edge, preferring native tracker relationships and
   then the ticket section. Record external blockers separately.
6. Resolve branch topology in this order: explicit invocation target, explicit
   spec text, unambiguous repository integration convention, repository default
   branch for both final and integration.
7. Search Codex tasks and GitHub for an existing conductor or live work for the
   same spec. Record its profile and live state without resuming it. Treat a
   legacy conductor with no recorded profile as `reviewed + human`.

Completion criterion: the spec has at least one child ticket; every discovered
ticket belongs to the spec, has a title, state, AFK/HITL mode, and resolved
blockers; the exact repository and branches are known; every live actor that
could be resumed or replaced is recorded.

## 2. Prove the frontier

Build this manifest from live GitHub state. Give blockers outside the spec a
repository-qualified id and their live state:

```json
{"spec":"1234","tickets":[{"id":"10","parent":"1234","title":"...","state":"open","mode":"hitl","blockedBy":["other/repo#7"]}],"externalBlockers":[{"id":"other/repo#7","state":"closed"}]}
```

Resolve `scripts/validate-graph.mjs` beside this `SKILL.md` and run it with
`node`, passing the manifest on stdin. A nonzero exit stops preflight. Repair
discovery from authoritative state; if the graph remains invalid, report the
diagnostic and end the run without opening another question.

Run `scripts/render-graph.mjs` with `node`, passing the same manifest on stdin.
Keep its Mermaid stdout, `launchable` AFK frontier, and `hitlFrontier` pause
points.

Completion criterion: the validator proves unique tickets, known blockers, an
acyclic graph, explicit ticket modes, and the complete frontier; the renderer
produces one node per ticket and external blocker, visibly marks HITL tickets,
and draws arrows from blocker to dependent.

## 3. Open the launch gate

Show the renderer output in a `mermaid` code fence. State that arrows point from
each blocker to the ticket it unlocks. List every open HITL ticket and state:
the conductor dispatches only AFK frontier tickets; when a HITL ticket reaches
the frontier, it pauses there; every dependent remains blocked until GitHub
shows that HITL ticket closed. Show `HITL pauses: none` when the list is empty.
If a conductor exists, show its profile and live state beside the diagram.

Then ask exactly one blocking question: "Which orchestration profile should I
launch? Choosing one accepts this graph and its listed HITL pauses." Offer these
four answers:

1. `direct + human`: one implementer, then SHA-bound user approval.
2. `direct + autonomous`: one implementer, then automatic merge.
3. `reviewed + human`: one implementer, two adversarial reviewers, then
   SHA-bound user approval.
4. `reviewed + autonomous`: one implementer, two adversarial reviewers, then
   automatic merge.

If a live conductor has a different profile, say in the same question that
choosing another profile authorizes its replacement after verified exact
cleanup. Create no conductor, actor, worktree, branch, PR, comment, or heartbeat
before the answer.

Completion criterion: the user has seen the validated graph and HITL pauses and
selected exactly one supported profile, thereby accepting all three.

## 4. Start or resume the conductor

If the live conductor matches the selection, navigate to it and report that it
was resumed. If it differs, prove that replacement cleanup discards no unmerged
work, perform the exact cleanup, and create the selected conductor. An unsafe
replacement is a surfaced blocker, not a second question.

For a new conductor, read [`RUNTIME.md`](RUNTIME.md) fully. Select exactly one
actor contract: [`DIRECT.md`](DIRECT.md) for direct effort or
[`PROMPTS.md`](PROMPTS.md) for reviewed effort. Create a local project thread
with `model=gpt-5.6-terra` and `thinking=high`. Put the runtime's First objective
before all launch context, then inject the selected actor contract path, accepted
manifest, HITL pauses, and profile. Name it
`<repo> Spec #<id> · Orchestrator`, pin it, wait for its first progress
checkpoint, and confirm that it launched only the AFK frontier and surfaced the
HITL frontier.

The runtime and selected actor contract are the single sources of truth. Inject
their absolute paths. Direct conductors load only `DIRECT.md` as their actor
contract.

After the launch gate, human interaction is limited to the accepted HITL pauses
and, under human supervision, SHA-bound merge approvals.

Completion criterion: exactly one pinned conductor is active; every initial AFK
frontier ticket has one implementer or a surfaced blocker; every initial HITL
frontier ticket is a surfaced pause with no implementer.

Return the conductor task link with `::created-thread` when newly created.
