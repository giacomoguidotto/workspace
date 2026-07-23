# Repository Setup Procedure

This bundled procedure configures the repository surfaces used by engineering skills. It is part of `setup-project`, not a separately invocable skill.

## Explore

Inspect Git remotes and configuration, root instruction files, `CONTEXT.md` or `CONTEXT-MAP.md`, root and context-local ADR directories, `docs/agents/`, local issue-tracker signals, installed triage capabilities, and monorepo signals. Infer neither a tracker nor a multi-context layout when local evidence settles the choice.

## Interview

Take these sections in order, one answer at a time, and lead with the recommended answer:

1. **Issue tracker.** Recommend GitHub for a GitHub remote, GitLab for a GitLab remote, and otherwise offer local Markdown or a user-described tracker.
2. **Triage labels.** Only when a triage capability is installed, recommend the five roles `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`; collect overrides only when the repository already uses different labels.
3. **Domain docs.** Default to one root `CONTEXT.md` and `docs/adr/`. Offer a root `CONTEXT-MAP.md` with context-local documents only when genuine monorepo evidence exists.

## Confirm and write

Before writing, show the exact `## Agent skills` block and every proposed `docs/agents/` file. Update an existing block in place. Prefer an existing `CLAUDE.md`, then an existing `AGENTS.md`; if neither exists, ask which to create. Never create the other root instruction file merely for compatibility unless the live convention requires it.

Write only the applicable seed documents from this module:

- [`issue-tracker-github.md`](issue-tracker-github.md)
- [`issue-tracker-gitlab.md`](issue-tracker-gitlab.md)
- [`issue-tracker-local.md`](issue-tracker-local.md)
- [`triage-labels.md`](triage-labels.md), only when triage is installed
- [`domain.md`](domain.md)

For another issue tracker, write its instructions from the user's confirmed description. Preserve surrounding user-authored guidance and update existing generated sections instead of duplicating them.
