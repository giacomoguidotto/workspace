# HTML Approval Draft

The approval draft is a single dark-themed HTML file in the OS temp directory. It is an approval artifact, not a repo artifact.

Resolve the temp directory from `$TMPDIR`, falling back to `/tmp` on Unix or `%TEMP%` on Windows. Write to:

```text
<tmpdir>/notion-knowledge-draft-<timestamp>.html
```

Open the file for Giacomo and report the absolute path in chat.

## Scaffold

Use inline CSS. Do not depend on Tailwind, remote fonts, scripts, or external assets.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Notion knowledge draft - {{topic}}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b0f14;
        --panel: #111821;
        --panel-2: #151f2b;
        --text: #e6edf3;
        --muted: #8b949e;
        --line: #263241;
        --accent: #7dd3fc;
        --danger: #fca5a5;
        --ok: #86efac;
        --warn: #fde68a;
      }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 40px 24px 64px;
      }
      header, section, .card, .preview {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 10px;
      }
      header {
        padding: 28px;
        margin-bottom: 18px;
      }
      section {
        padding: 22px;
        margin-top: 18px;
      }
      h1, h2, h3, p {
        margin-top: 0;
      }
      h1 {
        font-size: 28px;
        line-height: 1.2;
      }
      h2 {
        font-size: 18px;
      }
      h3 {
        font-size: 15px;
      }
      .eyebrow {
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .muted {
        color: var(--muted);
      }
      .grid {
        display: grid;
        gap: 14px;
      }
      .card, .preview {
        background: var(--panel-2);
        padding: 16px;
      }
      code, pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      code {
        color: var(--accent);
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .status {
        display: inline-block;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 3px 9px;
        color: var(--muted);
        font-size: 12px;
      }
      .ok { color: var(--ok); }
      .warn { color: var(--warn); }
      .danger { color: var(--danger); }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Draft for approval</p>
        <h1>{{topic}}</h1>
        <p class="muted">{{date}} - not written to Notion yet</p>
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

### Workspace Read

Show the evidence used for placement:

- broad searches and exact searches
- databases and pages fetched
- nearby examples used to infer conventions
- placement conclusion

This is approval evidence only. Do not copy it into the final Notion body.

### Proposed Writes

Use one card per write:

- target: database/page name and ID or URL
- action: create, update, append, relate, move, rename, archive, or no-op
- properties: exact property/value mapping from the live schema
- relations: parent, linked projects, tasks, repo pages, or related owners
- why here: one sentence explaining placement

If the session suggests both a project-specific write and a higher-level convention write, show separate cards.

### Body Preview

Show the exact final Notion body in a bordered preview.

The body preview must be source-free:

- no "Session Update" sections
- no transcript/provenance framing
- no mention of which agent discovered the fact
- no local-only evidence unless it is useful knowledge, such as commit hashes or repo links
- section names, length, and density should match the target page and nearby siblings

If Giacomo has manually trimmed this kind of page before, prefer the shorter pattern.

### Skipped

List candidate writes that were considered and skipped, with the reason.

### Questions

Ask only for blockers that prevent a correct write. If there are no blockers, ask for approval to apply the exact draft.

Approval must be fresh and explicit after the latest draft. If Giacomo asks a follow-up, corrects placement, or points to a different convention after approval, regenerate the draft and ask again before writing to Notion.
