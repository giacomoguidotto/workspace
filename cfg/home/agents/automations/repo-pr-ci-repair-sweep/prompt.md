# Repo PR CI Repair Sweep

You are running Giacomo's daily CI repair and merge-conflict sweep.

Workspace:
- Run from `/Users/giacomo/dev`.
- Use `/Users/giacomo/.codex` only as a read-only source for Codex skills and plugin resources when those paths are accessible.
- Put temporary PR checkouts under `/Users/giacomo/dev/.codex-automations/project-pr-ci-repair-sweep/checkouts`.
- Treat existing repositories under `/Users/giacomo/dev` as read-only context unless a PR branch is explicitly checked out in the automation checkout directory.

Sweep definition:
- Repo owners are the authenticated GitHub user plus every org returned by `gh api user/orgs`.
- Repo PRs are open pull requests in repositories owned by those repo owners.
- Inbox PRs are Repo PRs assigned to `@me`, requesting review from `@me`, reporting failing checks, or reporting merge conflicts / non-mergeability.
- A processable PR is an Inbox PR that is clearly internal: the base repository owner is a repo owner, and the PR has internal proof from author association, bot identity, same-repo branch, or a head repository owner that is also a repo owner.
- A CI candidate is a processable PR with failing GitHub Actions checks.
- A merge-conflict candidate is a processable PR whose metadata indicates conflicts or non-mergeability, including `mergeStateStatus` values such as `DIRTY`, `BLOCKED`, or `UNKNOWN` when the check rollup is otherwise not failing and GitHub reports the branch cannot merge cleanly.
- The sweep is complete only when every discovered Inbox PR is classified as already green, pending, fixed, rebased, rerun, skipped, or blocked with a concrete reason.

Startup:
- Run `gh auth status` and discover the login with `gh api user --jq .login`.
- Discover org owners with `gh api user/orgs --paginate --jq '.[].login'`.
- Read `/Users/giacomo/.codex/AGENTS.md` if present.
- For GitHub Actions inspection, read the GitHub CI-fix skill if present at `/Users/giacomo/.codex/plugins/cache/openai-curated-remote/github/0.1.5/skills/gh-fix-ci/SKILL.md`; prefer its bundled `scripts/inspect_pr_checks.py` after a repo is checked out.

Discovery:
- For the authenticated user and each org owner, search open PRs with these owner-scoped queries and deduplicate by URL:
  - `gh search prs --owner <owner> --state open --review-requested @me --json url,repository,title,author,updatedAt -L 200`
  - `gh search prs --owner <owner> --state open --assignee @me --json url,repository,title,author,updatedAt -L 200`
  - `gh search prs --owner <owner> --state open --checks failure --json url,repository,title,author,updatedAt -L 200`
- If owner-scoped search cannot directly search for merge conflicts, rely on the full PR detail fetch for every discovered Inbox PR and classify conflicted PRs from merge metadata.
- If an owner search may be truncated, mark that owner blocked and continue with the complete results you have.
- For each PR URL, fetch details with `gh pr view <url> --json url,number,title,state,isDraft,author,authorAssociation,baseRefName,baseRefOid,headRefName,headRefOid,headRepository,headRepositoryOwner,isCrossRepository,maintainerCanModify,mergeStateStatus,statusCheckRollup,updatedAt`.
- If the installed `gh pr view` does not expose `authorAssociation`, fetch it from `gh api repos/<owner>/<repo>/pulls/<number>` as `author_association`.

Internal proof:
- Process a PR only when the base repository owner is the authenticated user or one of their orgs.
- Treat a PR as internal when at least one proof is present: `authorAssociation` is `OWNER`, `MEMBER`, or `COLLABORATOR`; the head repository owner is a repo owner; the branch is in the base repository; or the author is a trusted automation account such as Renovate, Dependabot, or GitHub Actions and the branch is in a repo-owner repository.
- Treat first-time, contributor, unknown, fork-only, or external-owner PRs as outside or ambiguous. Skip them with the evidence found.
- Process draft PRs only when CI is failing or the branch has merge conflicts on an automation/dependency update branch; otherwise report them as pending author work.

CI classification:
- Inspect `statusCheckRollup` and then run `gh pr checks <url> --json name,state,bucket,link,startedAt,completedAt,workflow` for actionable detail.
- Green PRs need no CI action. Pending-only PRs are reported as pending unless they also have merge conflicts.
- External check providers are report-only unless the same failure is reproduced in GitHub Actions logs.
- For each failing GitHub Actions check, inspect the run and logs with `gh run view` or the GitHub Actions jobs API. Capture the failing command and the smallest useful log excerpt.
- If the failure is transient infrastructure, rerun failed jobs once when permitted, then classify the PR as rerun.

Merge conflict classification:
- Always check `mergeStateStatus` / `mergeable` metadata for each processable PR, even when CI is green.
- If a PR appears blocked only because required checks or reviews are missing, report it as pending, not conflicted.
- If a PR is conflicted or GitHub reports it cannot merge cleanly, make it a merge-conflict candidate.
- Do not modify files directly to resolve conflicts. The only allowed conflict fix is rebasing the PR branch onto the current base branch.
- If the rebase applies cleanly, validate minimally, push the rebased head branch, and classify the PR as rebased.
- If the rebase stops with conflicts, abort the rebase immediately, make no manual conflict-resolution edits, do not push, and classify the PR as blocked with the conflicted files and rebase command output.
- If resolving the conflict would require merge commits, manual conflict edits, broad product judgment, force-push against a human-authored branch, or unavailable push rights, classify the PR as blocked.

Repair:
- Use a fresh isolated checkout under `/Users/giacomo/dev/.codex-automations/project-pr-ci-repair-sweep/checkouts`. Never edit an existing user checkout.
- Fetch the PR head branch and verify the local HEAD matches the inspected `headRefOid` before editing or rebasing.
- Read the repository's AGENTS.md and relevant setup, package-manager, and test docs before changing files.
- Fix only the observed CI cause: dependency lockfiles, generated metadata, package-manager dedupe/resolutions, small compatibility changes, or test fixtures when the dependency/runtime behavior changed clearly.
- For merge-conflict candidates, do not use the CI-fix edit path; use only `git fetch origin <base>` followed by `git rebase origin/<base>` or the repository's equivalent remote/base ref.
- For human-authored internal PRs, keep the change surgical and directly tied to the failing check. If product judgment or broad refactoring is needed, classify the PR as blocked with the proposed human decision.

Validation and push:
- Run the smallest repo-native command that reproduces or validates each fixed failure. Prefer the same command that failed in CI when practical.
- For clean rebases, run the smallest practical sanity check for the repo; if no fast validation is available, run `git status --short` and report validation as rebase-only.
- Commit only when the diff is small, relevant, and validation passed. Use `Fix CI for PR <number>` as the commit message shape.
- Do not create a commit for a pure rebase; push the rebased PR branch only after confirming the branch history changed as expected and the working tree is clean.
- Push only to the PR head branch that was inspected. Use a normal push when possible; if Git requires a force push after rebase, use `git push --force-with-lease` only for automation/dependency-update branches owned by a repo owner or trusted bot. Otherwise block.
- Leave merge, approve, close, repository settings, branch protection, and release operations untouched.
- After a push, rebase, or rerun, re-check PR checks and merge metadata and record the current state.

Report:
- Start with counts: owners searched, PRs discovered, processable PRs, CI candidates, merge-conflict candidates, fixed, rebased, rerun, skipped, and blocked.
- For each fixed, rebased, rerun, skipped, or blocked PR, include the PR URL, repository, failing checks or merge-conflict signal, root cause or skip reason, validation command, commit SHA when pushed, and current check/merge state.
- State explicitly when GitHub auth scopes, search truncation, push access, missing secrets, external providers, rebase conflicts, or force-push restrictions prevented a fix.
- Do not claim the sweep is complete unless every discovered Inbox PR has one of the completion classifications above.
