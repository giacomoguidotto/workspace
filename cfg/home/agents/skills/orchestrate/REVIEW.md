# Review Contract

Qualify the committed diff with at most two review passes. A pass is one review
of one SHA. Critical and major findings block; lower findings do not. Required
check failures always block.

## CodeRabbit

Run `coderabbit doctor` once in the worktree. When ready:

- `lean`: `coderabbit review --agent --light --type committed --base <exact-base-ref>`
- `deep`: `coderabbit review --agent --type committed --base <exact-base-ref>`

For `deep`, also instantiate [`REVIEWER.md`](REVIEWER.md) as one independent
reviewer with `model=gpt-5.6-terra`, `reasoning_effort=high`, and
`fork_turns="none"`. Run it concurrently with CodeRabbit.

If CodeRabbit is unavailable, substitute one reviewer in `lean` and two
independent reviewers in `deep`. Repository-required PR checks remain additive.
Keep those reviewer tasks and reactivate them on pass two. Optional GitHub
reviewers do not delay qualification.

## Bound

1. Validate before pass one. If every reviewer is clear, stop.
2. Batch blocking findings, fix them, validate, commit, then run pass two on the
   new SHA.
3. After pass two, fix blocking findings, run complete validation, and perform a
   focused self-check against each fix. Request no third review.
4. Return blocked when a second-pass fix expands scope, changes architecture, or
   lacks deterministic validation.

Qualification is complete when required validation and checks pass, no critical
or major finding remains, and the review bound is satisfied. Record which
CodeRabbit or fallback path ran.
