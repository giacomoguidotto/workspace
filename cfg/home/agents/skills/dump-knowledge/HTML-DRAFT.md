# HTML Draft Format

Render the proposed Notion update as a single self-contained HTML file in the OS temp directory. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/notion-knowledge-draft-<timestamp>.html`. Open it for Giacomo and report the absolute path.

The file is an approval artifact, not a repo artifact. Do not write it into the working tree.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Notion knowledge draft - {{topic}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-stone-50 text-slate-950">
    <main class="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Draft for approval</p>
        <h1 class="text-3xl font-semibold">{{topic}}</h1>
        <p class="text-sm text-slate-600">{{date}} - Not written to Notion yet</p>
      </header>

      <section id="workspace-read">...</section>
      <section id="proposed-writes">...</section>
      <section id="body-preview">...</section>
      <section id="skipped">...</section>
      <section id="questions">...</section>
    </main>
  </body>
</html>
```

## Required Sections

### Workspace read

Show the Notion structure you inspected:

- Broad searches and exact searches.
- Databases/pages read.
- Nearby examples used to infer conventions.
- Placement conclusion.

Keep this as evidence for approval. Do not copy it into the final Notion body.

### Proposed writes

Use one card per write:

- Target: database/page name and ID or URL.
- Action: create, update, append, relate, or no-op.
- Fields: exact property/value mapping from the live schema.
- Relations: parent, linked projects, tasks, or repo pages.
- Why here: one sentence explaining the placement.

If there is both a project-specific update and a higher-level convention update, show both cards.

### Body preview

Show the exact final Notion body in a bordered preview. This body should be source-free:

- No "Session Update" sections.
- No transcript/provenance framing.
- No mention of which agent discovered the fact.
- No local-only evidence unless it is useful knowledge, such as commit hashes or repo links.
- Match the section names, length, and density already established in the target page and nearby sibling pages.
- If Giacomo has manually trimmed this kind of page before, prefer the shorter pattern.

### Skipped

List candidate writes that were considered and skipped, with the reason.

### Questions

Ask only for blockers that prevent a correct write. If the draft is ready, ask for approval to apply it.

Approval must be fresh and explicit after the latest draft. If Giacomo asks a follow-up, corrects placement, or points to a different convention after approval, regenerate the draft and ask again before writing to Notion.

## Style

Keep it readable and operational:

- Calm Notion-like layout, not a marketing page.
- Short headings and compact cards.
- Monospace for IDs, URLs, commits, branches, and file paths.
- Muted evidence, prominent proposed writes.
- No diagrams unless they clarify parent/child placement.
