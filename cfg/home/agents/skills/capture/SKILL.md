---
name: capture
description: Capture completed conversations or agent sessions into the Knowledge Bank. Use when the user invokes /capture or asks to save session knowledge to the KB.
---

# Capture

## Invariant

Every run produces an HTML approval draft before any KB write. There is no
inline-chat approval shortcut, even for tiny updates.

## Loop

### 1. Map Live KB

Read the live KB through its provider connector before choosing a target.

- Search broad parent areas, likely databases, sibling pages, repo/project
  aliases, and relevant conventions.
- Search exact names, URLs, repository slugs, and likely page titles.
- Fetch the likely target and nearby examples before proposing fields or body
  shape.
- Prefer live KB structure over repo assumptions or stale local artifacts.

Completion criterion: the proposed target, placement, property schema, and
nearby page pattern are grounded in live KB reads, or the draft states that live
verification was unavailable.

### 2. Distill Durable Knowledge

Extract only what belongs in the Knowledge Bank.

- Keep progress, decisions, rationale, open tasks, blockers, follow-ups, repo
  links, issue/PR links, commits, and durable user preferences.
- Exclude transcript framing, agent provenance, temporary command noise, and
  facts not meant to survive the session.
- If a convention applies beyond the immediate project, draft the higher-level
  update separately from the project-specific update.
- Keep final KB prose source-free unless provenance is itself useful knowledge.

Completion criterion: every proposed KB body reads as durable knowledge, not as a
session log.

### 3. Draft Exact Writes

Create a provider-like HTML approval draft using [HTML-DRAFT.md](HTML-DRAFT.md).

The draft must include:

- workspace read: searches, pages, databases, and examples inspected
- proposed results: page previews for each create or update
- body preview: exact source-free final body, with inline diffs for updates
- skipped writes: considered targets or conventions not selected
- questions: only blockers that prevent a correct write

Write the draft to the OS temp directory, open it for the user, and report the
absolute path in chat.

Completion criterion: the user can approve or reject the exact KB writes from the
HTML file without needing hidden context from the conversation.

### 4. Ask For Fresh Approval

Ask: "Should I apply these exact KB writes now?"

Only explicit approval after the latest draft permits writing. "Looks good",
clarifying answers, or placement discussion are not approval. If the conversation
changes the draft, regenerate the HTML file and ask again.

Completion criterion: approval is explicit, fresh, and applies to the latest
exact draft.

### 5. Apply And Verify

Apply only the approved writes.

- Use the live schema and exact properties from the approved draft.
- Preserve child pages, databases, and unrelated content unless the draft
  explicitly says otherwise.
- Read back every updated KB item.
- Report what changed and what remains unresolved.

Completion criterion: every approved write has been read back from the KB, or any
failed write is reported with the exact blocker.

## Placement Rules

- Keep parent pages short.
- Put dense backlog, references, reflections, lessons, quotes, evidence, and long
  decision context in child pages under the relevant parent.
- Prefer the smallest coherent set of writes over broad context dumps.
- Choose one canonical owner for each fact, chapter, or lesson; other pages link
  to that owner.
- Never invent a page or database when an existing owner can be strengthened.

## Safety Rules

The Invariant above is the single gate: nothing is written, edited, appended,
related, moved, renamed, archived, or deleted in the KB before explicit approval
of the latest exact draft.

- The KB is the source of truth.
- Never invent facts to fit a field.
- Treat KB writes as hard to version and potentially destructive.
- If KB access is unavailable, produce only a draft and label it unverified.
