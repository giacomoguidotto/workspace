---
name: grill-knowledge
description: Interview the user about life events, decisions, or personal context until the facts are clear, then draft a Notion write plan without writing until approved. Use when the user says /grill-knowledge, wants to capture something from life, wants to be grilled before saving knowledge, or discusses personal context that may belong in Notion.
---

# Grill Knowledge

## Quick Start

Interview Giacomo one question at a time, clarify the story or decision, then draft the exact Notion update. Use Notion only for reading context until Giacomo explicitly approves the latest exact draft.

## Workflow

1. Establish the topic:
   - What happened?
   - Why does it matter?
   - Is it a task, project, decision, application, relationship, preference, profile fact, or reflection?

2. Inspect Notion only for context:
   - Search relevant existing Notion pages/databases when available.
   - Use Notion to avoid duplicates and understand where the update might belong.
   - Do not rely on committed docs or old snapshots.

3. Grill one question at a time:
   - Ask the most important unresolved question.
   - Provide your recommended answer or framing when helpful.
   - Stop asking when the remaining uncertainty would not change the Notion draft.
   - Do not write, update, or create Notion pages during the interview.

4. Produce the final draft:
   - Target Notion database/page.
   - New page vs update existing page.
   - Field/value mapping, using the live Notion fields.
   - Page body draft that follows the structure, section names, length, and density already established in the target Notion page and nearby siblings.
   - Links or relations to add.
   - What is intentionally not being captured.
   - Open questions, if any.

5. Ask for confirmation:
   - Ask whether Giacomo wants to hand the latest exact proposal to `/capture`.
   - If the proposal changes, ask again before the handoff.
   - This confirmation authorizes only the handoff, never a provider write.

6. Hand off when confirmed:
   - Pass the exact proposal to `/capture`.
   - `/capture` performs its live reread, HTML approval gate, mutation, and read-back.
   - Never write to Notion or another provider directly from this skill.

## Question Style

- Keep it tight: one question at a time.
- Preserve Giacomo's wording when it carries meaning.
- Challenge vague terms when they affect where the knowledge goes.
- Ask before turning subjective models into advice or stronger claims.

## Draft Format

```md
## Proposed Notion Capture

Topic: <short label>
Target: <database/page>
Action: <create/update>

Fields:
- <field>: <value>

Body:
<draft content>

Not capturing:
- <item and reason>

Confirmation:
Should I hand this exact proposal to /capture now?
```

## Rules

- Notion is the source of truth.
- No Notion writes while grilling.
- NEVER write, edit, append, relate, archive, move, rename, or delete anything in Notion from this skill.
- Treat the handoff confirmation as permission to invoke `/capture`, not as approval of a provider write. Only `/capture` may ask for and act on the exact HTML approval gate.
- If Giacomo replies after a proposal with any correction, new fact, target change, or question, update it and ask for handoff confirmation again.
- Do not hallucinate missing facts.
- Follow the structure, length, heading style, and density already established in the target Notion page and nearby sibling pages. When live examples are shorter than your draft, trim to match them.
- If Notion access is unavailable, produce only a draft and say it was not verified against live Notion.
