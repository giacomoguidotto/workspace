# Implementer Contract

Instantiate the prompt fully before launch.

```text
Own {{TICKET}} under {{SPEC}} in ledger repository {{LEDGER_REPOSITORY}}.
Implement only in target repository {{TARGET_REPOSITORY}} on
{{TARGET_BRANCH}} from {{TARGET_BASE}}. The ledger and implementation target
may differ; never write target code into the ledger checkout.

Before any mutation, inspect the active permission instructions. Continue only
when sandbox_mode=danger-full-access, approval_policy=never, and network access
is enabled. For a normal target base, require target HEAD={{TARGET_BASE}}. For
{{TARGET_BASE}}=`ZERO_SHA`, clone the target into the empty task directory,
require that the target repository is still empty with no refs, and create one
root commit. Compute the target repository's empty-tree object with
`reviewBase=$(git hash-object -t tree /dev/null)` and use that exact
target-derived `reviewBase` for the committed-diff review so the root commit is
included. Never use the literal `ZERO_SHA` sentinel or a ledger repository SHA
as the review base. Never request user approval. On a permission mismatch,
signal:
ORCH_BLOCKED issue={{TICKET_ID}} reason=worker-permission-mismatch
On a target or base mismatch, signal:
ORCH_BLOCKED issue={{TICKET_ID}} reason=worker-target-mismatch

Read target-repository instructions, the ledger ticket, relevant spec context,
and current target state. Implement only its acceptance criteria and run the
target-specific command {{TARGET_VALIDATION_COMMAND}}. Assignment and other
ledger bookkeeping belong to the conductor and never block qualification.

Commit a Conventional Commit on <type>/{{TICKET_ID}}-<short-slug>. Include
`Closes {{LEDGER_REPOSITORY}}#{{TICKET_ID}}` in the commit message.

Read {{REVIEW_PATH}} fully and execute review={{REVIEW}} against the committed
target diff. Use {{REVIEWER_PATH}} only when that contract calls for a reviewer.

Delivery is {{DELIVERY}}. After local review qualifies, keep `direct` local:
create no PR and push no ref. For `pr`, push the feature branch and open or reuse
one ready PR into {{TARGET_BRANCH}} with
`Closes {{LEDGER_REPOSITORY}}#{{TICKET_ID}}` in its body; wait only for
target-repository-required checks. `ZERO_SHA` always uses direct bootstrap.

Request one reasoning escalation before speculative work when contradictory
repository constraints, repeated nontrivial test failures, unexpected
cross-module coupling, or a blocking finding requires redesign:
ORCH_ESCALATE issue={{TICKET_ID}} reason=ONE_LINE_REASON

After qualification, emit exactly one lifecycle signal:
ORCH_READY issue={{TICKET_ID}} delivery=direct base={{TARGET_BASE}} sha=FULL_SHA
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
