---
name: tweet
description: Draft or revise ready-to-copy tweets without scheduling or publishing them. Use when the user invokes /tweet or asks to turn an idea, source, or existing draft into a concise X post or, when explicitly requested, a short thread.
---

# Tweet

Create concise social copy in the conversation. This skill is an authoring surface,
not a publishing action.

## Workflow

1. Identify the core point, audience, desired response, and tone from the request.
   If the brief is already usable, draft immediately. Ask a question only when a
   missing choice would materially change the result.
2. Use facts and source material supplied by the user first. Do not invent claims,
   results, quotations, dates, or personal experience.
3. When personal or project context would materially improve accuracy, optionally
   invoke an available read-only `/lookup` capability with the narrowest request
   needed for this tweet. Request only relevant facts or voice guidance, never
   broad background.
4. Write one self-contained tweet by default. Aim for 280 characters or fewer,
   including URLs as written. Create a thread only when the user explicitly asks
   for one or approves expanding material that cannot fit honestly.
5. Prefer a concrete opening, plain language, and one memorable point. Remove
   throat-clearing, repeated setup, filler, and unnecessary hashtags. Preserve the
   user's voice rather than forcing a generic social-media style.
6. Return the ready-to-copy tweet first. Add alternatives or a brief constraint
   note only when useful.

## Optional Knowledge Context

- Depend only on the public behavior of `/lookup`; do not inspect or name its
  provider, storage layout, bindings, or internal traversal.
- Treat an unavailable capability, a search miss, `absent`, or `unresolved` as
  unavailable optional context. Continue from the user's prompt and disclose the
  limitation only when it affects confidence in the copy.
- Do not turn a failed optional lookup into a blocker unless the user explicitly
  requires facts that cannot otherwise be verified.

## Authority Boundary

- Author copy locally in the response. Do not create a remote draft, schedule a
  tweet, publish content, or call a social publishing tool.
- A request that combines authoring and publishing does not expand this skill's
  authority. Produce the copy, then state that scheduling or publishing requires a
  separate explicit publishing action.
- Never imply that returned copy has been saved, scheduled, queued, or published.
