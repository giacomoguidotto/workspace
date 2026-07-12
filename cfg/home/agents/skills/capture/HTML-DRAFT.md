# HTML Approval Draft

The approval draft is a single HTML file in the OS temp directory that mimics the
bound KB provider's own page view. It is an approval artifact, not a repo artifact.
The shipped styling is a dark, Notion-style palette; apply the `draft-style`
binding instead when it is set. Styling never changes the provider-agnostic
semantic or approval contract.

Resolve the temp directory from `$TMPDIR`, falling back to `/tmp` on Unix or `%TEMP%` on Windows. Write to:

```text
<tmpdir>/kb-knowledge-draft-<timestamp>.html
```

Open the file for the user and report the absolute path in chat.

## Design Goal

Make the draft feel like a deep preview of the final result inside the bound KB
provider, not a generic report. Exact before and after content, semantic decisions,
deletions, Revision Evidence, and quality-gate evidence are part of the approval
surface rather than hidden implementation detail.

- Use a Notion-dark palette, Notion-like spacing, page typography, property rows, toggles, callouts, and database/table previews.
- Render each proposed write as a provider-like KB page preview.
- For new pages, show a "New page preview" that resembles the page that would exist after approval.
- For page updates, show complete exact before and after views plus an inline diff
  in the same KB page shell.
- Put proposed results first. Keep source mapping and workspace-read evidence
  available but visually secondary. Keep blockers and deletion risk prominent.

## Scaffold

Use inline CSS. Do not depend on Tailwind, remote fonts, scripts, or external assets.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Knowledge Bank approval draft - {{topic}}</title>
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
      .pill.blocked { background: var(--red-bg); color: #ffb2ac; }
      .pill.flag { background: var(--yellow-bg); color: #f2c96d; }
      .kb-page {
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
      .blocked-question {
        border-color: var(--red);
        background: var(--red-bg);
      }
      @media (max-width: 820px) {
        .app { display: block; }
        .sidebar { display: none; }
        main { padding: 30px 22px 56px; }
        .kb-page { padding: 26px 22px 32px; }
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
          <div class="property-row"><strong>Status</strong><span><span class="pill {{status_class}}">{{approval_status}}</span></span></div>
          <div class="property-row"><strong>Drafted</strong><span>{{date}}</span></div>
          <div class="property-row"><strong>Draft identity</strong><span>{{draft_id}}</span></div>
          <div class="property-row"><strong>Contract</strong><span>{{contract_version}}</span></div>
          <div class="property-row"><strong>Requires</strong><span>Fresh explicit approval</span></div>
        </div>

        <section id="proposed-results">...</section>
        <section id="semantic-decisions">...</section>
        <section id="revision-evidence">...</section>
        <details id="source-assertions"><summary>Source assertion coverage</summary>...</details>
        <details id="quality-gate" open><summary>Semantic Quality Gate</summary>...</details>
        <section id="blockers">...</section>
        <details id="read-back-plan"><summary>Read-back verification plan</summary>...</details>
        <details id="workspace-read"><summary>Workspace read</summary>...</details>
        <details id="skipped"><summary>Skipped or deferred writes</summary>...</details>
        <section id="questions" class="approval-question">...</section>
      </main>
    </div>
  </body>
</html>
```

Set `approval_status` to `Ready for approval - not written to KB` only when the
quality gate has no blocking result. Otherwise use `Blocked - not approvable` and
the `blocked` pill class. Use `draft_id` to make later approval refer to this exact
artifact; do not reuse it after any content or gate result changes.

## Required Sections

### Proposed Results

Put proposed results first in exact application order. Use one provider-like KB page
preview per mutation. The sequence and preview together define what approval
authorizes.

Each preview must include:

- target database or page name plus stable ID or URL;
- action: create, update, append, relate, move, rename, archive, or delete;
- parent and exact block or section placement;
- exact current and proposed property values from the live schema;
- exact current and proposed relations, including canonical-owner links;
- full final page or block body, without placeholders or ellipses;
- each deleted property, relation, block, section, or page;
- expected resulting revision identity when the provider can predict it; otherwise
  the exact revision field that read-back must discover and verify.

No-op candidates belong under Skipped, not in the mutation sequence. Do not use
generic cards as the main preview. Cards are acceptable only inside the page shell
when a database or table is the provider's natural final representation.

### New Page Preview

For creates, render a "New page preview" as the page that will exist after approval.
State `Exact before: target absent`, with the search scope and evidence that the
stable target does not already exist.

Use this shape:

```html
<article class="kb-page new-page">
  <div class="preview-label"><span class="pill create">Create</span> New page preview</div>
  <div class="breadcrumb">{{parent_path}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{new_page_title}}</h1>
  <div class="property-table">...</div>
  <div class="block">{{exact final KB body}}</div>
</article>
```

The body should resemble the final provider page: headings, short paragraphs,
lists, callouts, tables, and child-page or database mentions where relevant. Keep
approval provenance out of the final prose unless it changes interpretation, but
still show it in the draft's Revision Evidence.

### Deleted Page Or Block Preview

For a deletion, show the complete exact page, section, block, property, or relation
before deletion and its exact after-state: absent, invalidated, or replaced at the
approved location. Include migrated unique content, rewritten inbound links, the
recoverable revision identity, and the deletion-safety result. Do not use
`archive`, `delete`, and `invalidate` interchangeably; show the actual provider
operation and visible result.

For relation-only, property-only, move, or rename operations, use the same exact
before/after structure even when the body is unchanged.

### Updated Page Preview

For updates, render an "Updated page preview" with complete exact before and after
content. Add an inline diff for review, but never make the reviewer reconstruct an
after-state by applying the diff mentally.

Use this shape:

```html
<article class="kb-page updated-page">
  <div class="preview-label"><span class="pill update">Update</span> Updated page preview with diff</div>
  <div class="breadcrumb">{{page_path}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{existing_page_title}}</h1>
  <table class="property-diff">
    <thead><tr><th>Property</th><th>Current</th><th>Proposed</th></tr></thead>
    <tbody>...</tbody>
  </table>
  <h2>Exact before</h2>
  <div class="block">{{complete exact affected section before}}</div>
  <h2>Exact after</h2>
  <div class="block">{{complete exact affected section after}}</div>
  <details open>
    <summary>Inline diff</summary>
    <div class="block diff-context">{{literal unchanged context}}</div>
    <div class="block diff-del">{{literal removed or replaced text}}</div>
    <div class="block diff-add">{{literal added or replacement text}}</div>
  </details>
</article>
```

Show the complete affected section before and after. Surround it with only enough
unchanged page context to make placement unambiguous. If the approved action
deletes anything, repeat it in a deletion ledger with its stable identity or exact
location, destination for any migrated content, inbound-link treatment, recovery
path, and quality-gate result.

### Semantic Decisions

For every affected knowledge unit, show:

- source-assertion identity;
- page Type and Ownership, including canonical owner or Adapter link;
- stable Kind ID and displayed heading or registered provider mapping;
- current Maturity, proposed post-approval Maturity, and decision evidence;
- disposition: preserve, merge, replace, append, delete, reject, or omit;
- retention reason and next action for retained Raw knowledge.

Do not collapse Type, Ownership, Maturity, and Kind into one field. Do not present
new intake as already Stable before approval; label it as the proposed
post-approval state.

### Revision Evidence

For every mutation, show the source, actor, `captured_at`, affected owner, prior
revision identity, proposed or expected revision identity, and exact diff. Include
`observed_at` for every changed State and any `event_at`, `valid_from`, or
`valid_until` that changes interpretation. Name each `supersedes`, `revises`, or
`invalidates` relation and the provider location that will retain the evidence.

The temporary HTML file is not durable provenance by itself. If the provider has
no verified way to retain and link the required Revision Evidence after approval,
show that as a blocker.

### Source Assertion Coverage

Map every durable intake assertion to its exact proposed result. The ledger must
also show transcript material, unsupported assertions, duplicates, and other
candidates that were rejected or omitted, with a reason. This is how the reviewer
checks coverage and material omission; it does not enter final KB prose by
default.

### Semantic Quality Gate

Show this section visibly or in an open toggle. Separate deterministic checks from
semantic judgments. Include one row for each required check: Ownership, Coverage,
Preservation, Faithfulness, Duplication and contradiction, Kind and semantic
force, Time and provenance, and Deletion safety.

Each row must include:

- category: deterministic or semantic judgment;
- status: `Pass`, `Flag`, `Not checked`, or `Not applicable`;
- exact checked scope;
- concrete evidence;
- blocking: yes or no, with reason.

A bare status is invalid. Approval is not evidence. Unresolved Ownership,
contradiction, material omission, unsupported assertion, or unsafe deletion must
be blocking whether its status is `Flag` or `Not checked`.

### Blockers

If any blocking risk exists, put it in a prominent section and set the page status
to `Blocked - not approvable`. Name the missing decision, read, relation, or
evidence that would resolve it. The Questions section asks only for that input and
must not include the apply question.

If no blocking risk exists, state `No blocking risks found in the checked scope`.
Do not imply that unchecked external state was proven safe.

### Read-Back Verification Plan

For each proposed mutation, list the exact stable identity, parent, properties,
relations, full content, deletion outcome, and Revision Evidence fields that will
be fetched and compared after application. If a provider operation cannot be read
back, mark it as a blocker before approval rather than promising unverified
success.

### Workspace Read

Keep evidence behind a toggle or visually secondary section:

- broad searches and exact searches
- databases, pages, complete affected sections, and revision identities fetched
- linked owners and inbound or outbound relations inspected
- nearby examples used to infer conventions
- inaccessible, partial, or stale reads
- owner and placement conclusion

This is approval evidence only. Do not copy it into the final KB body.

### Skipped

List no-ops and candidate writes that were considered and skipped, with the reason
and source-assertion identities they cover. Keep this behind a toggle unless it
contains a blocker.

### Questions

Ask only for blockers that prevent a correct write. If any exists, do not ask for
application. If there are no blockers, ask exactly: "Should I apply these exact KB
writes now?"

Approval must be fresh and explicit after the latest identified draft. If the user
asks a follow-up or changes any target, content, property, relation, deletion,
semantic decision, quality-gate result, or operation order, regenerate the draft
and ask again before writing to the KB.
