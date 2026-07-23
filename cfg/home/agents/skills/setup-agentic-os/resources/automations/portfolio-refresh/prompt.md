# Portfolio Refresh

Compare the current portfolio with narrow public-safe Knowledge context and prepare
an approval-gated surface proposal.

This automation has no Knowledge capture authority. It never merges, deploys,
publishes, or mutates Knowledge.

## Contracts

- Load the provider-blind Knowledge Request in `knowledge-request.json` through
  `knowledge-system-interface/v1`. Use only returned roles and claim-level
  visibility, evidence, provenance, registry revision, gaps, and snapshot token.
- Read the portfolio only through the `portfolio-source` capabilities declared in
  `automation.toml`. Follow its repository instructions and canonical content
  entry points.
- Write only through the `portfolio` sink, and only with its declared capabilities
  after approval. Never infer an undeclared repository or deployment operation.
- The empty capture mandate is absolute. Unsupported claims are gaps, not capture
  candidates, and stale Knowledge claims belong to Knowledge-owned reconciliation.

## Safety mode

When the materialization selects the `proposal-only` validation profile, perform
all available reads and produce the same surface summary and dry-run action plan.
Do not call any sink capability. Validation cannot create a branch, edit files,
open a pull request, merge, deploy, publish, or mutate Knowledge. Label proposed
sink operations as `would-create-branch`, `would-edit`, `would-validate`, or
`would-open-draft-pr`.

## Run

1. Read the portfolio repository instructions and inspect its current canonical
   content, documentation, tests, and relevant public surfaces.
2. Execute the Knowledge Request once. A missing optional role degrades only that
   branch. An unresolved required role blocks the proposal without widening the
   request.
3. Compare current portfolio content with public-safe claim meaning. Factual
   claims, social proof, metrics, employment facts, project status, and project
   capabilities require supporting evidence and provenance. Treat unsupported
   claims as gaps.
4. Apply `portfolio-change-rules` as private structural guidance. Never expose its
   private rationale or invent a portfolio model outside the returned rules and
   repository contract.
5. Return a compact surface summary before any sink write: current state checked,
   evidence checked, proposed candidates, affected surfaces or files, what changes
   and stays stable, public-safety notes, validation plan, and any announcement
   candidates for Social Compose.
6. Wait for explicit approval, rejection, or edits to the candidate set. An empty
   candidate set is valid and ends the run with the evidence checked.
7. After approval, use only the approved sink capabilities. Create a working
   branch, keep edits scoped to approved candidates, update canonical content and
   its required mirrors or tests together, and run repository-native validation.
8. Open a draft pull request only when that action was explicitly approved.
   Otherwise report the branch or patch. Never merge, deploy, publish, or mutate
   Knowledge.
9. Hand announcement candidates to Social Compose. Do not create social drafts in
   this workflow.

## End state

Report the surface decision, approved changes, branch name, draft pull request link
if created, validation status, gaps, blocked actions, and announcement candidates.
Never claim that a branch, edit, pull request, merge, deployment, publication, or
Knowledge mutation occurred unless the corresponding authorized action completed.
