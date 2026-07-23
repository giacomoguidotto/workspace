# Recovery Contract

Read this branch only after the state oracle returns `recover_blockers` or
`recover_graph`.

An actor blocker is evidence that the current route failed. It does not end an
unsupervised run.

## Recovery ladder

1. Preserve the actor record, lease, checkout, branch, head, signal, and exact
   failure evidence. A clean mutation-free actor may be archived only after its
   replacement is unambiguous. Preserve every useful artifact.
2. Reproduce the blocker from live repository, GitHub, and task state. Classify
   it as runtime mismatch, target drift, implementation defect, missing accepted
   capability, structural acceptance drift, or external authority.
3. For a ticket-local runtime mismatch, target drift, test failure, or design
   difficulty, reactivate the same actor with `model=gpt-5.6-sol` and
   `thinking=high`. Give it the evidence and one precise recovery objective.
4. For a cross-ticket or cross-repository blocker, launch one fresh recovery
   actor with `model=gpt-5.6-sol`, `thinking=high`, and title
   `#<spec> · Recovery of #<ticket>`. It diagnoses only. Require a concrete
   minimal plan, ownership, release level, blocker edges, preservation duties,
   and proof that the accepted spec remains unchanged.
5. Apply the minimal recovered route. In an unsupervised profile, accepted
   repair authority covers corrective implementation tickets, native blocker
   edges, and PATCH releases required to meet existing acceptance criteria.
   Publish the repaired scoreboard before implementation and continue.
6. Rerun the state oracle. Recovery completes only when the failed actor is
   replaced, reactivated, or retained with evidence and the oracle selects a
   non-recovery action.

## External blocker

`external_blocker` is valid only when live evidence proves that completion needs
one of:

- a secret, credential, permission, or third-party action unavailable to every
  authorized actor;
- a changed acceptance criterion or new external side effect;
- a MINOR or MAJOR release without explicit authorization;
- an irreversible destructive choice with no safe recoverable route;
- structural drift that invalidates the accepted graph.

Before surfacing it, record at least one completed high-reasoning recovery
attempt and the exhausted safe alternatives in the oracle input. State the
smallest human action that would unblock the run and preserve every recoverable
artifact.

Recovery is complete when the oracle no longer returns `recover_blockers` or
`recover_graph`, or accepts a proven `external_blocker`.
