# Social Compose

Turn recent social feedback, current public signals, and narrow Knowledge context
into an approval-gated content proposal. Draft and scheduling authority are
separate. This automation has no publishing authority.

## Contracts

- Load the provider-blind Knowledge Request in `knowledge-request.json` through
  `knowledge-system-interface/v1`. Use only the returned roles and claim-level
  visibility, evidence, provenance, registry revision, gaps, and snapshot token.
- Read operational context only through the source roles and capabilities declared
  in `automation.toml`. Do not inspect provider configuration or infer undeclared
  capabilities.
- Write only through `social-draft-queue`, and only with its declared
  `create-draft` and `schedule-draft` capabilities after approval.
- Never call a publish or publish-now action. Publishing is a separate explicit
  action outside this automation.

## Safety mode

When the materialization selects the `non-publishing` validation profile, perform
all available reads and produce the same proposal and dry-run action plan.
Do not call any sink capability. Validation cannot create, modify, schedule, or
publish social content. Label every proposed sink operation as `would-create` or
`would-schedule`.

## Run

1. Read publication history and account analytics since the previous successful
   run, adding a comparable trailing baseline when the sample is sparse. Classify
   findings as worked, did not work, or inconclusive. Do not infer causation from
   correlation or replace missing account evidence with generic benchmarks.
2. Read the queue timeline and recurring schedule. Derive the coverage window from
   the materialized recurrence and timezone, then remove occupied, elapsed, or
   ineligible slots. Never hardcode a post count or recurring schedule.
3. When available, reduce upcoming availability to private eligibility
   constraints. Never expose calendar details or turn them into content. Scan
   current public signals using direct evidence where possible. A signal may
   suggest an angle, but it cannot create a personal stance or verify a personal
   claim.
4. Execute the Knowledge Request once. A missing optional role degrades that branch.
   An unresolved required role blocks the dependent proposal without widening the
   request. Use only public-facing claim meaning in draft copy.
5. Choose one evidence-backed direction: hold, refine, test, or realign. Generate
   slot-matched candidates from selected work and public-safe proof, plus topical
   candidates grounded in a recorded point of view. Ask for the user's take when no
   recorded stance supports a topical angle.
6. Reconcile semantic audience continuity from `published-social-context` and live
   publication history. Do not copy post bodies, raw metrics, queue records, or
   source configuration into Knowledge.
7. Present the feedback review and candidate summary before any sink write. For
   each candidate include the angle, evidence, platform, proposed time, public
   safety, media requirement, and recommended action. Wait for explicit approval.
8. After approval, create only approved drafts. Schedule only approved,
   media-ready drafts in eligible open slots. Leave media-dependent drafts
   unscheduled until the user confirms the required attachment is ready.
9. If the user states a durable public stance, or live publication evidence creates
   a semantic audience-continuity delta, prepare a semantic capture request within
   the embedded mandate. The Knowledge System owns deduplication, exact write
   drafting, reread, and `/capture` approval. This automation never applies a
   Knowledge write.

## End state

Report the feedback decision, candidates, created draft identifiers, scheduled
times, pending-media items, blocked actions, Knowledge capture proposals, and any
missing evidence. An empty candidate set is valid. Never claim that content was
created, scheduled, published, or captured unless the corresponding authorized
action completed.
