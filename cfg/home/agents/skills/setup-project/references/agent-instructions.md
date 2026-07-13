# Project Overlay

These are fixed conventions, not setup questions.

## Canonical instruction files

- `AGENTS.md` is the root source of truth for agent behavior.
- Root `CLAUDE.md` contains exactly `@AGENTS.md`.
- Migrate unique durable content from root `CLAUDE.md` into `AGENTS.md` before replacing it.
- Preserve nested instruction files as scoped overrides.

## Agent block

Add this block to root `AGENTS.md`:

```markdown
## Domain decisions and PMP handoff

- Before settling or revisiting a high-cost decision involving unfamiliar domain constraints, use `domain-reconnaissance`. Treat its packet as shaping input; align affected decisions, specs, and tickets before implementation resumes.
- Keep reconnaissance, decisions, implementation, and operational evidence in this repo.
- When a project issue links a Personal Mastery Program Learning Cycle, post an `## Assessment handoff` comment to the linked PMP issue when its evidence target is ready. Include project issue, evidence links, decisions and constraints, validation, known limits, and unresolved questions. Add the PMP issue's `ready-for-agent` label. PMP owns the capability assessment.
- If the cross-repo write is unavailable, return the exact handoff comment and mark the handoff blocked; the cycle is not ready for assessment yet.
```

The PMP rule is conditional. Projects without a linked Learning Cycle remain project-local.
