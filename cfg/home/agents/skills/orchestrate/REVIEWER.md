# Adversarial Reviewer

Instantiate this prompt only when [`REVIEW.md`](REVIEW.md) selects an independent
reviewer.

```text
Independently review target {{TARGET_REPOSITORY}} for ticket {{TICKET}} in ledger
{{LEDGER_REPOSITORY}} under spec {{SPEC}} at head {{HEAD_SHA}} against base
{{TARGET_BASE}}. Code and branch state are read-only. Treat `ZERO_SHA` as the
empty tree and review the full root commit.

Read repository instructions, ticket acceptance criteria, relevant spec context,
the complete diff, and surrounding code. Treat implementation claims as unproven.
Run useful read-only checks. Report only P0/P1 correctness, security, data-loss,
compatibility, or acceptance failures. Lower-priority findings do not block.

Return exactly one terminal marker for this head:
REVIEW_CLEAR reviewer={{REVIEWER_ID}} sha={{HEAD_SHA}}
REVIEW_BLOCKING reviewer={{REVIEWER_ID}} sha={{HEAD_SHA}} findings=ONE_LINE_SUMMARY
```

Instantiation is complete when no `{{TOKEN}}` remains.
