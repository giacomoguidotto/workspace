# Reviewed Implementer

Create each reviewed implementer with `model=gpt-5.6-sol` and
`thinking=high`. Resolve `REVIEWER.md` beside this file and substitute its
absolute path. Instantiate the prompt fully before launch.

```text
Own {{TICKET}} under {{SPEC}} in {{REPOSITORY}}. Work only in the provided
worktree, based on origin/{{INTEGRATION_BRANCH}}.

Read the applicable repository instructions, spec, ticket, ticket comments, and
current integration branch. Implement only the ticket. Use the repository's
standard development loop and required validation.

Assign {{TICKET}} to {{ASSIGNEE}} before editing. Keep that assignment through
completion.

Commit and push a Conventional Commit branch named
<type>/{{TICKET_ID}}-<short-slug>. Open or reuse exactly one ready PR into
{{INTEGRATION_BRANCH}}. Put the exact closing keyword `Closes #{{TICKET_ID}}` in
the PR body and assign the PR to {{ASSIGNEE}}.

Read {{REVIEWER_PROMPT_PATH}} fully. Spawn exactly two independent reviewers
with `fork_turns="none"`, `model="gpt-5.6-terra"`, and
`reasoning_effort="low"`. Keep their ids and reactivate the same reviewers after
each pushed fix.

Own the PR until this bounded gate settles. Wait for required CI, automatic
reviewers including CodeRabbit, and both independent reviewers. Apply this Codex
GitHub review budget:

1. Count an automatic or manual terminal result for the exact SHA as one pass.
   A findings review, clean comment, or clean reaction is terminal.
2. Complete at most two Codex passes per PR: the initial pass and one final pass
   after batched fixes. Never request a third pass.
3. Keep at most one request in flight. Never request the same SHA again after a
   terminal result. Retry once only when a manual request has no acknowledgement
   after 30 minutes; never retry an acknowledged or in-progress request. After
   30 minutes without a terminal result, treat an acknowledged optional review
   as unavailable; block only if GitHub marks it as a required check.
4. After pass one, batch and fix blocking findings, resolve their threads, push,
   validate, and request pass two only for the changed SHA.
5. After pass two, fix blocking findings, resolve their threads, push, validate,
   and stop. No fresh Codex review is required after second-pass fixes.

A blocking finding is ticket-scoped and is P0/P1, a correctness, security, or
data-integrity P2, or proves an acceptance-criterion or test regression. Treat
other P2s, P3s, and adjacent suggestions as nonblocking; reply and resolve them
with a concise rationale. Do not manually retrigger a green automated reviewer
when zero actionable thread remains. A green required check with zero actionable
thread is settled even if a bot narrative mentions a quota or skipped scan.

Batch valid independent-reviewer findings with the same fix cycles. Before
signaling readiness, refresh the PR after every bounded gate settles.

Signal readiness only when this exact head passes repository validation and
required CI, every required check is settled, zero actionable thread remains,
the bounded Codex review budget is satisfied or explicitly unavailable, and both
reviewer approval markers name this head. GitHub must show the PR linked to
{{TICKET}} as closing work, and both the ticket and PR must be assigned to
{{ASSIGNEE}}:
ORCH_READY issue={{TICKET_ID}} pr=URL sha=FULL_SHA

If work cannot reach that state, return:
ORCH_BLOCKED issue={{TICKET_ID}} reason=ONE_LINE_REASON

Before the final response, send the exact signal line to the delegation
envelope's `source_thread_id` with `send_message_to_thread`. Delivery is complete
only when the tool reports success. Retry twice; after three failed attempts,
replace the signal with
`ORCH_BLOCKED issue={{TICKET_ID}} reason=signal-delivery-failed`. Use terse
commentary. Make the final response exactly the delivered or replacement signal
line, then end. The conductor's mandatory wait reconciles task completion if
push delivery is unavailable. Merge and cleanup belong to the conductor.
```

Instantiation is complete when no `{{TOKEN}}` remains.
