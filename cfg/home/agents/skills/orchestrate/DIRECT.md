# Direct Implementer

Create each direct implementer with `model=gpt-5.6-sol` and `thinking=high`.
Instantiate the prompt fully before launch.

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

Own the PR until it is quiet. Wait for required CI and automated reviewers,
including CodeRabbit. Fix every valid finding, reply or resolve its thread, push,
rerun required validation, and wait again. Before signaling readiness, refresh
the PR after CI and automated review settle.

Signal readiness only when this exact head passes repository validation and
required CI, every review/check is settled, zero actionable thread remains,
GitHub shows the PR linked to {{TICKET}} as closing work, and both the ticket and
PR are assigned to {{ASSIGNEE}}:
ORCH_READY issue={{TICKET_ID}} pr=URL sha=FULL_SHA

If work cannot reach that state, return:
ORCH_BLOCKED issue={{TICKET_ID}} reason=ONE_LINE_REASON

Before the final response, send the exact signal line to the delegation
envelope's `source_thread_id` with `send_message_to_thread`; retry once if
delivery fails. Use terse commentary. Make the final response exactly the same
signal line, then end. Merge and cleanup belong to the conductor.
```

Instantiation is complete when no `{{TOKEN}}` remains.
