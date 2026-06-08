---
name: dump-knowledge
description: Prepare and apply Notion knowledge updates from completed agent sessions by mapping live Notion structure, extracting durable source-free facts, and drafting exact target writes for user approval. Use when the user says /dump-knowledge, /update-knowledge, asks to dump/save session knowledge to Notion, or finishes an agent session.
---

# Dump Knowledge

## Quick Start

After an agent session, inspect Notion live, extract durable knowledge from the session, show Giacomo exactly what would be written where in an HTML approval draft, and wait for explicit approval before writing.

## Workflow

1. Inspect current context:
   - Current repo, branch, changed files, commits, command outputs, and conversation decisions.
   - Any user-provided notes or final summary.
   - The reusable pattern behind the session, if any, not only the immediate repo/page name.

2. Map Notion live before choosing a target:
   - Use the available Notion connector/tooling.
   - Start broad: search for likely parent areas, databases, siblings, and conventions before narrowing to an exact page name.
   - Then search exact entity terms, repo names, URLs, aliases, and likely existing page titles.
   - Read the live database/page schemas and a few nearby examples before proposing fields or body shape.
   - Do not rely on committed docs or old snapshots.

3. Decide placement:
   - Prefer the live Notion structure over repo assumptions.
   - Consider whether the knowledge belongs in an existing parent page, a new child page, an existing entity page, or more than one coordinated update.
   - If the session reveals a convention that applies across projects, propose a higher-level update as well as any project-specific page.
   - Keep Notion task parent pages short. Put dense backlog, reference notes, reflections, lessons, quotes, project evidence, and long decision context in child pages under the relevant parent.

4. Extract only durable knowledge:
   - Progress made.
   - Decisions and rationale.
   - Open tasks, blockers, and follow-ups.
   - Links to repos, branches, commits, PRs, issues, or artifacts.
   - User preferences or personal context only when explicitly stated.
   - Keep provenance for the approval draft only. The final Notion body should read as knowledge, not as a transcript or session log.

5. Produce an HTML approval draft:
   - Target Notion database/page.
   - New page vs update existing page.
   - Property/value mapping, using the live Notion fields.
   - Page body draft written as the final Notion content, with no "Session Update" or source-process headings.
   - Body structure and section names that follow the current live Notion page examples, especially any pattern Giacomo has already trimmed or standardized.
   - Parent page vs child page placement.
   - Relations or links to add.
   - Higher-level updates or skipped parent updates, if applicable.
   - Items intentionally skipped.
   - Ambiguities/questions.
   - Write the draft as a self-contained HTML file in the OS temp directory. See [HTML-DRAFT.md](HTML-DRAFT.md).

6. Ask for confirmation:
   - Do not write anything to Notion until Giacomo explicitly approves the latest draft.
   - Approval must come after all discussion, corrections, and follow-up changes. If the chat continues after a draft, treat prior approval as stale and ask again.
   - Use a direct approval question such as "Should I apply these exact Notion writes now?"
   - If the mapping is ambiguous, ask before writing.

7. Write and verify:
   - Apply only the approved changes.
   - Read back the updated Notion item.
   - Report what changed and what remains unresolved.

## Draft Format

Write a temp HTML file, open it for Giacomo, and include its absolute path in chat.

The HTML draft must show:

- Workspace read: what was searched/read and what structure was inferred.
- Proposed writes: each Notion target, action, fields, relations, and exact body.
- Final body preview: only the source-free content that would land in Notion.
- Skipped or deferred writes: especially parent pages or convention pages considered but not selected.
- Questions: only blockers that must be answered before writing.

Do not paste a long markdown draft in chat. The chat response should be a short pointer to the HTML file plus the approval question.

## Rules

- Notion is the source of truth.
- Never invent facts to fit a Notion field.
- Never write, edit, append, relate, archive, move, rename, or delete anything in Notion before explicit approval of the latest exact draft.
- Treat Notion writes as highly destructive and hard to version. "Looks good", clarifying answers, or pointing out where something belongs are not approval unless Giacomo explicitly says to apply/write/create/update the exact draft.
- Prefer the smallest coherent set of writes over broad context dumps.
- Do not anchor on the current repo/page name too early; search for structure and patterns first.
- Final Notion content must not mention that it came from an agent session unless that provenance is itself the knowledge being stored.
- Follow the structure, length, heading style, and density already established in the target Notion page and nearby sibling pages. When live examples are shorter than your draft, trim to match them.
- Keep Notion task parent pages short. Put dense backlog, reference notes, reflections, lessons, quotes, project evidence, and long decision context in child pages under the relevant parent.
- If Notion access is unavailable, produce only a draft and say it was not verified against live Notion.
