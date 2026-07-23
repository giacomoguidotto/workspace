---
name: post
description: Draft or revise ready-to-copy social posts without scheduling or publishing them. Use when the user invokes /post or asks for a standalone social post, caption, professional-network post, or platform-adapted post from an idea, source, or existing draft.
---

# Post

Create useful social copy in the conversation. This skill is an authoring surface,
not a publishing action.

## Workflow

1. Identify the idea, audience, platform, desired outcome, and tone from the
   request. If the brief is already usable, draft immediately. Ask a question only
   when a missing choice would materially change the post.
2. Use facts and source material supplied by the user first. Do not invent claims,
   results, quotations, dates, or personal experience.
3. When personal or project context would materially improve accuracy, optionally
   invoke an available read-only `/lookup` capability with the narrowest request
   needed for this post. Request only relevant facts or voice guidance, never broad
   background.
4. Draft for the named platform. If none is named, produce a concise,
   professional-network post that can be adapted elsewhere.
5. Edit toward one clear idea: open with a specific hook, support it with concrete
   detail, keep paragraphs easy to scan, and add a call to action only when it feels
   natural.
6. Return the ready-to-copy post first. Add assumptions, alternatives, or editing
   notes only when they help the user make a real choice.

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
  post, publish content, or call a social publishing tool.
- A request that combines authoring and publishing does not expand this skill's
  authority. Produce the copy, then state that scheduling or publishing requires a
  separate explicit publishing action.
- Never imply that returned copy has been saved, scheduled, queued, or published.
