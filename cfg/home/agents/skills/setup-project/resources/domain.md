# Domain Docs

Before exploring code, read a root `CONTEXT.md`, or the relevant documents linked by a root `CONTEXT-MAP.md`, plus ADRs that govern the area. Missing domain documents are not themselves a setup failure; create or change them only when the confirmed convention requires it.

Use the glossary's terms in issues, plans, hypotheses, and tests. Surface conflicts with an accepted ADR explicitly instead of silently overriding it.

The normal single-context layout is a root `CONTEXT.md` plus `docs/adr/`. A genuine multi-context repository may use a root `CONTEXT-MAP.md`, system-wide ADRs under `docs/adr/`, and context-local `CONTEXT.md` and ADR directories.
