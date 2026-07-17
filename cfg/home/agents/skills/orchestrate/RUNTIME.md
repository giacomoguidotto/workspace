# Conductor Runtime

Instantiate this contract before creating the conductor thread.

## Inputs

- Project path: `{{PROJECT_PATH}}`
- Project id: `{{PROJECT_ID}}`
- Repository: `{{REPOSITORY}}`
- Spec issue: `{{SPEC_ISSUE}}`
- Final branch: `{{FINAL_BRANCH}}`
- Integration branch: `{{INTEGRATION_BRANCH}}`
- Validated manifest: `{{TICKET_MANIFEST}}`
- Graph validator: `{{GRAPH_VALIDATOR_PATH}}`
- Actor prompts: `{{PROMPTS_PATH}}`
- Implement skill: `{{IMPLEMENT_SKILL_PATH}}`

## Mission

Conduct the validated ticket graph from live GitHub state. GitHub is the ledger;
Codex tasks are actors. Keep only a compact mapping of ticket, task, PR, branch,
head SHA, approvals, and state in this thread.

The ticket state machine is:

`LOCKED -> IMPLEMENTING -> PR_OPEN -> REVIEWING <-> FIXING -> AGENT_APPROVED -> USER_APPROVED -> MERGED -> CLOSED -> CLEANED`

## Start

1. Read repository instructions and run their mandatory session checks.
2. Reread the spec, tickets, comments, branch tips, and linked PRs.
3. Rebuild the manifest and run the graph validator. Reconcile drift before
   launching work.
4. Read `{{PROMPTS_PATH}}` fully.
5. Launch every frontier ticket, then monitor all active ticket tasks with
   bounded task waits.

Startup is complete when every live frontier ticket has exactly one implementer
or one explicit blocker.

## Launch a ticket

Create one project worktree from the latest `{{INTEGRATION_BRANCH}}`. Name the
task `#<id> Implement · <short title>` and pin it. Instantiate the implementer
prompt from `{{PROMPTS_PATH}}` with the ticket, spec, topology, project, and
absolute implement-skill path.

The implementer owns its worktree, feature branch, PR, reviewer agents, fix
loop, approval request, and merge verification. The conductor owns dependency
unlocking, the single merge lease, and cleanup.

Feature branches use Conventional Commit types: `feat/`, `fix/`, `refactor/`,
`test/`, `docs/`, or `chore/`. New behavior defaults to `feat/`; defect repair
defaults to `fix/`. Ticket PRs target `{{INTEGRATION_BRANCH}}` and open ready for
review after commit and push.

Launch is complete when the task id, host id, worktree, and exact branch are
recorded and the implementer has acknowledged the ticket.

## Review and approval

Each implementer spawns exactly two general adversarial reviewer subagents after
the PR opens. They receive the same prompt with different reviewer ids and
`fork_turns="none"`. They review independently; overlapping findings remain
valid evidence.

The actor prompts define the exact reviewer and user markers. Every changed head
invalidates both reviewer approvals. Once both markers match the head, required
CI is green, and actionable threads are resolved, grant the ticket the single
merge lease. The implementer synchronizes with the integration branch; if the
head changes, the full reviewer gate repeats. The user's marker authorizes only
its named SHA. Release the lease after merge succeeds or the ticket leaves the
approval slot.

## Merge, close, and clean

Before merge, verify the two reviewer markers, the user marker, the current head,
required checks, unresolved threads, and integration-branch freshness. Use a
merge method allowed by the repository. If repository policy requires a manual
GitHub action, present the exact ready PR and wait.

After merge into the integration branch:

1. Verify the PR merge commit contains the ticket head.
2. Close the ticket as completed when GitHub did not close it automatically.
3. Require the actor prompt's ticket-closed signal from the implementer and
   verify it against GitHub.
4. Resolve the exact heartbeat, task, worktree path, local branch, and remote
   branch with read-only checks.
5. Delete the heartbeat, archive and unpin the task, remove the exact worktree,
   then delete the exact merged local and remote feature branches.
6. Verify the final and integration branches still exist and were not cleanup
   targets.
7. Refresh GitHub states, run the graph validator, and launch the new frontier.

Cleanup is complete only when the worktree and both feature refs are absent and
the protected branches remain.

## Polling

Use a task heartbeat for PR polling when available; otherwise use bounded task
waits and explicit continuations. Poll head SHA, CI, comments, review threads,
approval markers, merge state, and ticket state. Remove ticket heartbeats after
closure. Communicate meaningful transitions and approval requests, not unchanged
polls.

## Final integration

When every child ticket is closed and cleaned, run the repository's aggregate
validation on the integration branch.

If final and integration are the same branch, verify the spec acceptance
criteria and close the spec. If they differ, open or refresh one ready PR from
integration into final, reference the spec, and run the same two-reviewer,
SHA-bound user approval, CI, and merge gates. Preserve the integration branch
unless the user explicitly declared it disposable.

Close the spec only after its acceptance criteria are verified on the final
branch. Finish with a table of ticket PRs, merge SHAs, cleanup results, final PR,
and spec state.
