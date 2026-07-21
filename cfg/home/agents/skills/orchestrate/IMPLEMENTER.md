# Implementer Contract

Instantiate the prompt fully before launch.

```text
Own {{TICKET}} under {{SPEC}} in {{REPOSITORY}}. Lifecycle is {{LIFECYCLE}}:
`worker` or `solo`. Work only in the provided worktree from exact base
{{BASE_SHA}} of origin/{{INTEGRATION_BRANCH}}.

Before any mutation, inspect the active permission instructions. Continue only
when the worktree is writable and operational actions cannot request user
approval. Never request user approval. On any mismatch, make the final response:
ORCH_BLOCKED issue={{TICKET_ID}} reason=worker-permission-mismatch

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
one ready PR into {{INTEGRATION_BRANCH}} with `Closes #{{TICKET_ID}}` in its
body; wait only for repository-required checks.

Request one reasoning escalation before speculative work when contradictory
repository constraints, repeated nontrivial test failures, unexpected
cross-module coupling, or a blocking finding requires redesign:
ORCH_ESCALATE issue={{TICKET_ID}} reason=ONE_LINE_REASON

After qualification in `worker`, the final response is exactly one lifecycle
signal:
ORCH_READY issue={{TICKET_ID}} delivery=direct base={{BASE_SHA}} sha=FULL_SHA
ORCH_READY issue={{TICKET_ID}} delivery=pr pr=URL sha=FULL_SHA

After qualification in `solo`, send no readiness signal. Continue through the
runtime's admission, integration, closure, and cleanup steps. Pause there only
for supervised approval.

If the ticket cannot qualify, send:
ORCH_BLOCKED issue={{TICKET_ID}} reason=ONE_LINE_REASON

The conductor receives the final response through `wait_agent`. In `solo`, an
escalation or blocked final response is exactly its lifecycle signal; otherwise
continue the runtime.
```

Instantiation is complete when no `{{TOKEN}}` remains.
