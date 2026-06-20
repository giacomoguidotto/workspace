---
name: get-knowledge
description: Refreshes an agent's working context from Giacomo's canonical Notion workspace through narrow live lookup. Use when Giacomo says /get-knowledge, get knowledge, refresh from Notion, internalize Notion, or asks an agent to learn what Notion knows before continuing.
---

# Get Knowledge

## Quick Start

When invoked, treat Notion as the source of truth. Search and read live Notion with the available connector, then produce a tight "Internalized" summary before continuing.

Normal Codex tasks should already perform narrow Notion lookup when personal, task, project, finance, profile, portfolio, or Knowledge Bank context clearly matters. Use this skill when Giacomo explicitly asks to refresh or internalize Notion knowledge before continuing, or when the ordinary lookup path is not enough.

Do not write to Notion, durable memory, repo docs, or generated artifacts unless Giacomo explicitly asks for that write.

## Live Lookup

1. Establish scope:
   - If Giacomo names an area, task, project, person, or decision, search that area first.
   - If he says "everything", map the main Notion areas broadly, then narrow to pages connected to the current task.
   - State any connector limits that prevent reliable coverage.

2. Read live Notion:
   - Use the Notion connector when available.
   - Search canonical task, project, knowledge, profile, and portfolio pages plus relevant child pages.
   - Prefer recently edited pages and pages connected to the current objective.
   - Read nearby siblings when needed to understand structure and avoid duplicates.

3. Compare against current working context:
   - Identify new or changed facts, preferences, decisions, task state, project state, links, blockers, and vocabulary.
   - Treat repo docs and agent memory as routing surfaces when they conflict with live Notion.
   - Do not invent missing facts; mark incomplete or ambiguous state as needing clarification.

4. Internalize for the current session:
   - State the important new or changed facts in compact bullets.
   - Update your working assumptions for the rest of the task.
   - Cite or name the Notion targets read when the tool permits links, page IDs, or titles.

5. Handle ambiguity:
   - Ask Giacomo one concise question when missing or ambiguous state changes the next action.
   - If ambiguity is not blocking, list it under "Needs clarification" and continue.

## Output

Use this shape unless the user asks for something else:

```md
Sources read:
- <Notion page/database/search term>

Internalized:
- <new or changed fact now in working context>

Conflicts:
- <prior memory or repo guidance that disagrees with Notion, if any>

Needs clarification:
- <actionable unknown, if any>

Next action:
- <what you will do with the refreshed knowledge>
```

## Rules

- Notion is canonical; Knowledge Bank Infrastructure and memory route agents back to it.
- This skill pulls knowledge from Notion into the current agent context. Use `remember` or `grill-knowledge` for Notion writes.
- Do not update Codex memory, repo docs, or Notion unless Giacomo explicitly asks for that write.
- Codex memory may store routing policy and durable preferences, not copied Notion facts.
- When Notion access is unavailable, say so and continue only with clearly marked stale local context.
- Keep Notion task parent pages thin; if dense context is discovered on a parent, flag it as future cleanup instead of moving it without approval.
