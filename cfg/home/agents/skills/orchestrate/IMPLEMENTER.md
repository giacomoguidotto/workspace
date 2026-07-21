# Implementer Contract

Instantiate the prompt fully before launch.

```text
Own {{TICKET}} under {{SPEC}} in {{REPOSITORY}}. Work only in this Codex-managed
worktree from exact base {{BASE_SHA}} of origin/{{INTEGRATION_BRANCH}}.

Before any mutation, inspect the active permission instructions. Continue only
when sandbox_mode=danger-full-access, approval_policy=never, network access is
enabled, and the integration HEAD equals {{BASE_SHA}}. Never request user
approval. On a permission mismatch, signal:
ORCH_BLOCKED issue={{TICKET_ID}} reason=worker-permission-mismatch
On a base mismatch, signal:
ORCH_BLOCKED issue={{TICKET_ID}} reason=worker-base-mismatch

Read applicable repository instructions, the ticket, relevant spec context, and
current integration state. Implement only its acceptance criteria and run
{{VALIDATION_COMMAND}}. Assignment and other ledger bookkeeping belong to the
conductor and never block qualification.

Commit a Conventional Commit on <type>/{{TICKET_ID}}-<short-slug>. Include
`Closes #{{TICKET_ID}}` in the commit message.

Read {{REVIEW_PATH}} fully and execute review={{REVIEW}} against the committed
diff. Use {{REVIEWER_PATH}} only when that contract calls for a reviewer.

Delivery is {{DELIVERY}}. After local review qualifies, keep `direct` local:
create no PR and push no ref. For `pr`, push the feature branch and open or reuse
one ready PR into {{INTEGRATION_BRANCH}} with `Closes #{{TICKET_ID}}` in its body;
wait only for repository-required checks.

Request one reasoning escalation before speculative work when contradictory
repository constraints, repeated nontrivial test failures, unexpected
cross-module coupling, or a blocking finding requires redesign:
ORCH_ESCALATE issue={{TICKET_ID}} reason=ONE_LINE_REASON

After qualification, emit exactly one lifecycle signal:
ORCH_READY issue={{TICKET_ID}} delivery=direct base={{BASE_SHA}} sha=FULL_SHA
ORCH_READY issue={{TICKET_ID}} delivery=pr pr=URL sha=FULL_SHA

If the ticket cannot qualify, emit:
ORCH_BLOCKED issue={{TICKET_ID}} reason=ONE_LINE_REASON

Send the signal to the source conductor task {{SOURCE_CONDUCTOR_THREAD_ID}} on
host {{SOURCE_CONDUCTOR_HOST_ID}} with `send_message_to_thread`. On a transient
delivery error, retry delivery twice. Regardless of notification delivery, make
the final response exactly the same lifecycle signal so the conductor can
receive it authoritatively through `wait_threads`.
```

Instantiation is complete when no `{{TOKEN}}` remains.
