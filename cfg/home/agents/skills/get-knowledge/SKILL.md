---
name: get-knowledge
description: Refreshes an agent's working knowledge from Giacomo's canonical Notion workspace by manually running the Sync workflow and internalizing relevant Notion facts it was missing. Use when Giacomo says /get-knowledge, get knowledge, sync knowledge, refresh from Notion, internalize Notion, or asks an agent to learn what Notion knows before continuing.
---

# Get Knowledge

## Quick Start

When invoked, treat Notion as the source of truth. Search and read live Notion with the available connector, compare it to the current conversation, loaded memory, and Lore artifacts, then produce a tight "Internalized" summary before continuing.

Normal Codex tasks should use the global narrow Notion retrieval rule from `/Users/giacomo/.codex/AGENTS.md`: search only the likely relevant area, read only the pages or rows needed for the task, and keep Notion content out of durable memory. Use this skill when Giacomo explicitly asks to refresh, sync, or internalize Notion knowledge before continuing, or when the ordinary lookup path is not enough.

Do not write to Notion, durable memory, repo docs, or generated artifacts unless Giacomo explicitly asks for that write.

## Manual Sync

1. Establish scope:
   - If Giacomo names an area, task, project, person, or decision, sync that area first.
   - If he says "everything", map the main Notion areas broadly, then narrow to pages that are new, recently changed, linked to the current task, or likely absent from the agent's current context.
   - State any connector limits that prevent full coverage.

2. Read live Notion:
   - Use the Notion connector, not old snapshots, when available.
   - Search canonical task, project, knowledge, profile, and portfolio pages plus relevant child pages.
   - Prefer recently edited pages and pages connected to the current objective.
   - Read nearby siblings when needed to understand structure and avoid duplicates.

3. Compare against current knowledge:
   - Identify new or changed facts, preferences, decisions, task state, project state, links, blockers, and vocabulary.
   - Treat repo docs, `dist/` artifacts, and agent memory as stale when they conflict with live Notion.
   - Do not invent missing facts; mark incomplete or ambiguous state as a Clarification Request.

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
- <prior memory/artifact that disagrees with Notion, if any>

Needs clarification:
- <actionable unknown, if any>

Next action:
- <what you will do with the refreshed knowledge>
```

## Artifact Mode

Use only if Giacomo asks for a full Sync patch or the current runtime requires persistent output:

- Create reviewable snapshot, diff, or context-pack artifacts under `dist/` using existing repo conventions.
- If no convention exists, use `dist/tmp/` for scratch output and say it is provisional.
- Keep artifacts export-safe and scoped; never copy broad Notion pages wholesale.
- Validate patches with `git diff --check`.
- Open a PR only when requested or when the workflow explicitly requires a persistent Sync run.

## Rules

- Notion is canonical; Lore and memory only route agents back to it.
- This skill pulls knowledge from Notion into the current agent context. Use `dump-knowledge` or `grill-knowledge` for Notion writes.
- Do not update Codex memory, ChatGPT memory, repo docs, or Notion unless Giacomo explicitly asks for that write.
- Codex memory may store routing policy and durable preferences, not copied Notion facts.
- When Notion access is unavailable, say so and fall back to validated Lore context packs or `dist/` artifacts only as stale local context.
- Keep Notion task parent pages thin; if dense context is discovered on a parent, flag it as future cleanup instead of moving it without approval.
- Respect export safety: summarize only what the current task needs and avoid public/private leakage.
