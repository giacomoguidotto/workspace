# HTML Approval Draft

The approval draft is a single HTML file in the OS temp directory that mimics the KB provider's own page view. It is an approval artifact, not a repo artifact. The shipped styling targets Notion by default; adapt the palette to another provider when the binding names one.

Resolve the temp directory from `$TMPDIR`, falling back to `/tmp` on Unix or `%TEMP%` on Windows. Write to:

```text
<tmpdir>/kb-knowledge-draft-<timestamp>.html
```

Open the file for the user and report the absolute path in chat.

## Design Goal

Make the draft feel like a deep preview of the final result inside the KB provider, not a generic report.

- Use a Notion-dark palette, Notion-like spacing, page typography, property rows, toggles, callouts, and database/table previews.
- Render each proposed write as a Notion page preview.
- For new pages, show a "New page preview" that resembles the page that would exist after approval.
- For page updates, show an "Updated page preview" in the same Notion page shell, with inline block diffs and property diffs.
- Keep evidence and skipped writes available, but visually secondary to the proposed final pages.

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
        --app-bg: #191919;
        --page-bg: #202020;
        --surface: #262626;
        --surface-2: #2f2f2f;
        --text: #f1f1ef;
        --muted: #9b9a97;
        --faint: #6f6e69;
        --line: rgba(255, 255, 255, 0.10);
        --line-strong: rgba(255, 255, 255, 0.18);
        --brown: #937264;
        --blue: #5b8def;
        --green: #4f9768;
        --red: #d44c47;
        --yellow-bg: rgba(255, 212, 0, 0.10);
        --green-bg: rgba(79, 151, 104, 0.16);
        --red-bg: rgba(212, 76, 71, 0.16);
        --blue-bg: rgba(91, 141, 239, 0.16);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--app-bg);
        color: var(--text);
        font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .app {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        min-height: 100vh;
      }
      .sidebar {
        border-right: 1px solid var(--line);
        background: #171717;
        padding: 18px 14px;
        color: var(--muted);
      }
      .sidebar-title {
        color: var(--text);
        font-weight: 600;
        margin-bottom: 14px;
      }
      .sidebar-item {
        border-radius: 6px;
        padding: 6px 8px;
      }
      main {
        max-width: 980px;
        width: 100%;
        margin: 0 auto;
        padding: 42px 40px 72px;
      }
      .breadcrumb {
        color: var(--faint);
        font-size: 13px;
        margin-bottom: 34px;
      }
      .page-icon {
        width: 78px;
        height: 78px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: var(--surface);
        color: var(--muted);
        font-size: 32px;
        margin-bottom: 14px;
      }
      h1, h2, h3, p {
        margin-top: 0;
      }
      h1 {
        font-size: 40px;
        line-height: 1.15;
        font-weight: 700;
        letter-spacing: 0;
        margin-bottom: 22px;
      }
      h2 {
        font-size: 22px;
        line-height: 1.25;
        margin: 34px 0 12px;
      }
      h3 {
        font-size: 16px;
        line-height: 1.3;
        margin: 22px 0 8px;
      }
      .muted { color: var(--muted); }
      .property-table {
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        margin: 18px 0 26px;
        padding: 8px 0;
      }
      .property-row {
        display: grid;
        grid-template-columns: 170px minmax(0, 1fr);
        gap: 18px;
        min-height: 34px;
        align-items: start;
        color: var(--muted);
      }
      .property-row strong {
        color: var(--faint);
        font-weight: 500;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 2px 8px;
        background: var(--surface-2);
        color: var(--text);
        font-size: 12px;
        margin-right: 4px;
      }
      .pill.create { background: var(--blue-bg); color: #9cc2ff; }
      .pill.update { background: var(--yellow-bg); color: #f2c96d; }
      .pill.ok { background: var(--green-bg); color: #93d5a6; }
      .notion-page {
        background: var(--page-bg);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 34px 42px 42px;
        margin: 18px 0 26px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.20);
      }
      .preview-label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 650;
        letter-spacing: 0;
        margin-bottom: 14px;
      }
      .block {
        margin: 8px 0;
      }
      .block h2, .block h3 {
        margin-top: 26px;
      }
      .callout {
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        gap: 10px;
        border-radius: 6px;
        background: var(--surface);
        padding: 12px 14px;
        margin: 14px 0;
      }
      .toggle {
        border-top: 1px solid var(--line);
        padding-top: 12px;
        margin-top: 18px;
      }
      details {
        border-top: 1px solid var(--line);
        padding: 12px 0;
      }
      summary {
        cursor: pointer;
        color: var(--muted);
        font-weight: 600;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        font-size: 14px;
      }
      th, td {
        border: 1px solid var(--line);
        padding: 8px 10px;
        vertical-align: top;
      }
      th {
        color: var(--muted);
        font-weight: 600;
        text-align: left;
        background: var(--surface);
      }
      code {
        border-radius: 4px;
        background: var(--surface);
        color: #d4d4d4;
        padding: 1px 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.92em;
      }
      pre {
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
      .diff-line {
        border-left: 3px solid transparent;
        padding: 3px 8px;
        margin: 2px 0;
      }
      .diff-add {
        background: var(--green-bg);
        border-left-color: var(--green);
      }
      .diff-del {
        background: var(--red-bg);
        border-left-color: var(--red);
        color: #ffb2ac;
        text-decoration: line-through;
      }
      .diff-context {
        color: var(--muted);
      }
      .property-diff td:nth-child(2) {
        color: #ffb2ac;
        text-decoration: line-through;
      }
      .property-diff td:nth-child(3) {
        color: #93d5a6;
      }
      .approval-question {
        border: 1px solid var(--line-strong);
        border-radius: 8px;
        background: var(--surface);
        padding: 16px;
        margin-top: 28px;
      }
      @media (max-width: 820px) {
        .app { display: block; }
        .sidebar { display: none; }
        main { padding: 30px 22px 56px; }
        .notion-page { padding: 26px 22px 32px; }
        h1 { font-size: 32px; }
        .property-row { grid-template-columns: 1fr; gap: 2px; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <aside class="sidebar">
        <div class="sidebar-title">Knowledge draft</div>
        <div class="sidebar-item">Approval needed</div>
        <div class="sidebar-item">{{write_count}} proposed writes</div>
      </aside>
      <main>
        <div class="breadcrumb">Knowledge Bank / Drafts / {{topic}}</div>
        <div class="page-icon">N</div>
        <h1>{{topic}}</h1>
        <div class="property-table">
          <div class="property-row"><strong>Status</strong><span><span class="pill update">Not written to Notion</span></span></div>
          <div class="property-row"><strong>Drafted</strong><span>{{date}}</span></div>
          <div class="property-row"><strong>Requires</strong><span>Fresh explicit approval</span></div>
        </div>

        <section id="proposed-results">...</section>
        <details id="workspace-read"><summary>Workspace read</summary>...</details>
        <details id="skipped"><summary>Skipped or deferred writes</summary>...</details>
        <section id="questions" class="approval-question">...</section>
      </main>
    </div>
  </body>
</html>
```

## Required Sections

### Proposed Results

Put proposed results first. Use one Notion page preview per write.

Each preview must include:

- target: database/page name and ID or URL
- action: create, update, append, relate, move, rename, archive, or no-op
- parent/placement: where the page or block will live
- properties: exact property/value mapping from the live schema
- relations: parent, linked projects, tasks, repo pages, or related owners
- final page body or final block body

Do not use generic cards as the main preview. Cards can be used only inside the Notion-like page shell when a database/table preview is the natural final shape.

### New Page Preview

For creates, render a "New page preview" as the page that will exist after approval.

Use this shape:

```html
<article class="notion-page new-page">
  <div class="preview-label"><span class="pill create">Create</span> New page preview</div>
  <div class="breadcrumb">{{parent_path}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{new_page_title}}</h1>
  <div class="property-table">...</div>
  <div class="block">{{exact final Notion body}}</div>
</article>
```

The body must be source-free and should resemble the final Notion page: headings, short paragraphs, bullet blocks, callouts, tables, and child-page/database mentions where relevant.

### Updated Page Preview

For updates, render an "Updated page preview" as the current page with the proposed changes inside it.

Use this shape:

```html
<article class="notion-page updated-page">
  <div class="preview-label"><span class="pill update">Update</span> Updated page preview with diff</div>
  <div class="breadcrumb">{{page_path}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{existing_page_title}}</h1>
  <table class="property-diff">
    <thead><tr><th>Property</th><th>Current</th><th>Proposed</th></tr></thead>
    <tbody>...</tbody>
  </table>
  <div class="block diff-context">Unchanged surrounding context...</div>
  <div class="block diff-del">Removed or replaced text...</div>
  <div class="block diff-add">Added or replacement text...</div>
  <div class="block diff-context">Unchanged surrounding context...</div>
</article>
```

Show enough unchanged context to make placement obvious, but keep it compact. If the update is an append, show the existing ending as context and the appended block as `diff-add`. If the update replaces a section, show the old section as `diff-del` and the final section as `diff-add`.

### Workspace Read

Keep evidence behind a toggle or visually secondary section:

- broad searches and exact searches
- databases and pages fetched
- nearby examples used to infer conventions
- placement conclusion

This is approval evidence only. Do not copy it into the final Notion body.

### Skipped

List candidate writes that were considered and skipped, with the reason. Keep this behind a toggle unless it contains a blocker.

### Questions

Ask only for blockers that prevent a correct write. If there are no blockers, ask: "Should I apply these exact KB writes now?"

Approval must be fresh and explicit after the latest draft. If the user asks a follow-up, corrects placement, or points to a different convention after approval, regenerate the draft and ask again before writing to the KB.
