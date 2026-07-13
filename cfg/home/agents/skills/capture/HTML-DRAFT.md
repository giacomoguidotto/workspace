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

## Contents

- [Design Goal](#design-goal)
- [Reviewability Contract](#reviewability-contract)
- [Scaffold](#scaffold)
- [Required Sections](#required-sections)
  - [Proposed Results](#proposed-results)
  - [Semantic Decisions](#semantic-decisions)
  - [Revision Evidence](#revision-evidence)
  - [Semantic Quality Gate](#semantic-quality-gate)
  - [Reviewability Validation](#reviewability-validation)
  - [Blockers](#blockers)
  - [Read-Back Verification Plan](#read-back-verification-plan)
  - [Workspace Read](#workspace-read)
  - [Skipped](#skipped)
  - [Questions](#questions)

## Design Goal

Make the draft a human review interface for an exact provider change. The visible
surface should feel like the bound KB provider and answer three questions without
requiring technical inspection: **what changes, where, and what will exist after
approval?**

Use two co-located layers:

- The **review layer** is primary. It uses ordinary language, provider-like property
  tables, rendered page content, and literal inline diffs. It shows every changed
  field, relation, block, and deletion while summarizing unchanged context.
- The **exact evidence layer** is secondary. It retains complete serialized
  before/after states, stable provider IDs, exact tool inputs, transition JSON, and
  validator reports inside collapsed `technical-evidence` toggles.

The layers must be losslessly equivalent: every approved change appears in both,
and every exact-evidence mutation appears in the review layer. Exactness belongs in
the artifact; raw serialization does not become the interface.

Use a Notion-dark palette, Notion-like spacing, page typography, property rows,
toggles, callouts, and database/table previews. Put proposed results first. Keep
source mapping, complete raw state, and workspace-read evidence visually secondary.
Keep blockers and deletion risk prominent.

## Reviewability Contract

The draft passes reviewability only when a reviewer can keep every technical-
evidence toggle closed and still enumerate the complete write set.

The left sidebar is the ordered mutation outline. Generate one labelled anchor per
mutation, grouped by operation stage or kind, and point it at that mutation card's
HTML `id`. Outline targets must match the mutation sequence exactly: every card
appears once, in application order, with no extra target.

For every mutation:

1. Start with a one-sentence plain-language outcome under `What changes`.
2. Show the human name and provider location first. Put the stable ID on a muted
   secondary line that remains copyable.
3. Render every added, removed, renamed, or changed property or relation as one row
   in a `change-table`. Use the columns `Field`, `Action`, `Current`, `Proposed`,
   and `Meaning` unless the provider has a clearer native equivalent.
4. Render the complete final page or affected section in `provider-preview`. For
   content updates, also show a literal human-readable diff with enough unchanged
   context to locate it.
5. State unchanged scope compactly: name the preserved body, relation values,
   views, or properties, and give an exact count or complete readable list where
   that helps the decision.
6. Put complete serialized provider inputs and states exclusively inside a closed
   `details.technical-evidence` element. Label its before and after containers with
   `data-exact-before` and `data-exact-after`. Mark serialized blocks with
   `data-raw-provider-state`.

For repeated identical mutations, show one shared change set plus a target matrix.
Each mutation still gets its own stable identity, application position, and exact
evidence. Any target-specific difference gets its own visible row instead of being
folded into the shared summary.

The human-readable review layer is complete, not approximate. Summaries may replace
unchanged raw state; they may not replace a changed value, option, default,
relation target, deletion, or final content block.

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
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
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
      .outline-group { margin-top: 16px; }
      .outline-label {
        color: var(--faint);
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.06em;
        padding: 0 8px 5px;
        text-transform: uppercase;
      }
      .outline-card {
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        gap: 6px;
        color: var(--muted);
        text-decoration: none;
        border-radius: 6px;
        padding: 6px 8px;
      }
      .outline-card:hover { background: var(--surface); color: var(--text); }
      .outline-index { color: var(--faint); font-variant-numeric: tabular-nums; }
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
        scroll-margin-top: 24px;
        background: var(--page-bg);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 34px 42px 42px;
        margin: 18px 0 26px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.20);
      }
      .kb-page:target {
        border-color: var(--blue);
        box-shadow: 0 0 0 2px var(--blue-bg), 0 24px 80px rgba(0, 0, 0, 0.20);
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
      .property-diff td:nth-child(3) {
        color: #ffb2ac;
        text-decoration: line-through;
      }
      .property-diff td:nth-child(4) {
        color: #93d5a6;
      }
      .change-summary {
        border-left: 3px solid var(--blue);
        background: var(--blue-bg);
        border-radius: 6px;
        padding: 14px 16px;
        margin: 18px 0;
      }
      .change-summary h2 {
        margin: 0 0 6px;
        font-size: 18px;
      }
      .target-id {
        color: var(--faint);
        font-size: 12px;
        overflow-wrap: anywhere;
      }
      .change-table .action-add { color: #93d5a6; }
      .change-table .action-change { color: #f2c96d; }
      .change-table .action-remove { color: #ffb2ac; }
      .provider-preview {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--surface);
        padding: 18px 20px;
        margin: 18px 0;
      }
      .unchanged-scope {
        color: var(--muted);
        font-size: 13px;
        margin: 12px 0;
      }
      details.technical-evidence {
        margin-top: 20px;
        color: var(--muted);
      }
      details.technical-evidence pre {
        max-height: 460px;
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #171717;
        padding: 12px;
        font-size: 12px;
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
  <body data-capture-draft-version="1" data-draft-id="{{draft_id}}">
    <div class="app">
      <aside class="sidebar">
        <div class="sidebar-title">Knowledge draft</div>
        <div class="sidebar-item">Approval needed</div>
        <div class="sidebar-item">{{write_count}} proposed writes</div>
        <nav class="mutation-outline" aria-label="Proposed write outline">
          <div class="outline-group">
            <div class="outline-label">{{operation_group}}</div>
            <a class="outline-card" data-mutation-link href="#{{mutation_id}}">
              <span class="outline-index">{{operation_index}}</span>
              <span>{{human_target_name}}</span>
            </a>
          </div>
        </nav>
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

        <section id="proposed-results">
          <section class="batch-overview">...</section>
          <article id="{{mutation_id}}" class="kb-page mutation" data-mutation-id="{{mutation_id}}" data-mutation-kind="{{mutation_kind}}">
            <div class="preview-label"><span class="pill update">Update</span> {{human_target_name}}</div>
            <div class="target-id">{{stable_target_id}}</div>
            <section class="change-summary">
              <h2>What changes</h2>
              <p>{{one_sentence_outcome}}</p>
            </section>
            <table class="change-table">...</table>
            <section class="provider-preview">{{complete_human_readable_after_state}}</section>
            <p class="unchanged-scope">{{exact_preserved_scope_summary}}</p>
            <details class="technical-evidence">
              <summary>Exact provider evidence</summary>
              <section data-exact-before>...</section>
              <section data-exact-after>...</section>
              <pre data-raw-provider-state>...</pre>
            </details>
          </article>
        </section>
        <section id="semantic-decisions">...</section>
        <section id="revision-evidence">...</section>
        <details id="source-assertions"><summary>Source assertion coverage</summary>...</details>
        <details id="quality-gate" open><summary>Semantic Quality Gate</summary>...</details>
        <details id="executable-validation" open><summary>Executable transition validation</summary>...</details>
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
quality gate has no blocking result and every proposed mutation has a complete
bundled-validator report with no `Block` disposition. Otherwise use `Blocked - not
approvable` and the `blocked` pill class. Use `draft_id` to make later approval
refer to this exact artifact; do not reuse it after any content or gate result
changes.

Before opening the file, run `scripts/validate-approval-draft.py` from the installed
Capture skill. Open only a `Pass` result. The validator checks structural
reviewability; it does not prove semantic correctness or grant approval.

## Required Sections

### Proposed Results

Put proposed results first. Start with a batch overview that names the outcome,
operation count, shared change sets, and affected human-readable targets. Then show
the mutations in exact application order. Use one provider-like KB preview per
mutation; identical repeated changes may point to one visible shared change set.
The sequence, visible change rows, and exact evidence together define what approval
authorizes. Build the sidebar outline from this same ordered sequence according to
the Reviewability Contract.

Each preview must include:

- a plain-language `What changes` outcome;
- target database or page name first, with stable ID or URL as secondary copyable
  detail;
- action and exact application position;
- one `change-table` row for every changed property, option, default, relation,
  block, move, rename, archive, or deletion;
- exact current and proposed values in readable provider terms, including
  canonical-owner links and relation targets by name;
- a `provider-preview` containing the complete final page, block, or affected
  section without placeholders or ellipses;
- an `unchanged-scope` statement accounting for preserved content and schema;
- expected resulting revision identity when predictable, or the exact revision
  field read-back will discover;
- a closed `technical-evidence` toggle with complete exact provider input,
  before/after state, stable IDs, transition JSON, validator report, and rollback.

For database schema mutations, the visible change table has one row per field and
uses readable types, allowed values, defaults, relation targets, and semantic
meaning. Show existing unchanged fields as an exact count plus readable name list;
the complete serialized schema belongs in technical evidence.

No-op candidates belong under Skipped, not in the mutation sequence. Use the bound
provider's natural representation as the main preview. Generic cards and serialized
objects belong only in secondary evidence when they are not the provider's visible
interface.

### New Page Preview

For creates, render a "New page preview" as the page that will exist after approval.
State `Exact before: target absent`, with the search scope and evidence that the
stable target does not already exist.

Use this shape:

```html
<article id="{{mutation_id}}" class="kb-page mutation new-page" data-mutation-id="{{mutation_id}}" data-mutation-kind="create">
  <div class="preview-label"><span class="pill create">Create</span> New page preview</div>
  <div class="breadcrumb">{{parent_path}}</div>
  <div class="target-id">{{expected_stable_identity_or_readback_field}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{new_page_title}}</h1>
  <section class="change-summary">
    <h2>What changes</h2>
    <p>{{plain_language_create_outcome}}</p>
  </section>
  <table class="change-table">{{one row per created property or relation}}</table>
  <section class="provider-preview">
    <div class="property-table">{{exact readable final properties}}</div>
    <div class="block">{{exact final KB body}}</div>
  </section>
  <p class="unchanged-scope">Target absent; no existing content changes.</p>
  <details class="technical-evidence">
    <summary>Exact provider evidence</summary>
    <section data-exact-before>Target absent: {{search scope and evidence}}</section>
    <section data-exact-after>{{complete exact provider after-state}}</section>
    <pre data-raw-provider-state>{{exact tool input and transition evidence}}</pre>
  </details>
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

For updates, render an "Updated page preview" whose primary surface is the complete
readable change set and final provider-visible state. Add a literal inline diff for
content changes, while keeping the full proposed page or affected section visible
so the reviewer never reconstructs the after-state mentally.

Use this shape:

```html
<article id="{{mutation_id}}" class="kb-page mutation updated-page" data-mutation-id="{{mutation_id}}" data-mutation-kind="update">
  <div class="preview-label"><span class="pill update">Update</span> Updated page preview with diff</div>
  <div class="breadcrumb">{{page_path}}</div>
  <div class="target-id">{{stable_page_or_data_source_id}}</div>
  <div class="page-icon">{{icon_or_initial}}</div>
  <h1>{{existing_page_title}}</h1>
  <section class="change-summary">
    <h2>What changes</h2>
    <p>{{plain_language_outcome}}</p>
  </section>
  <table class="change-table property-diff">
    <thead><tr><th>Field</th><th>Action</th><th>Current</th><th>Proposed</th><th>Meaning</th></tr></thead>
    <tbody>...</tbody>
  </table>
  <section class="provider-preview">
    <h2>Result after approval</h2>
    <div class="block">{{complete exact human-readable affected section after}}</div>
  </section>
  <section class="inline-diff">
    <h2>Content diff</h2>
    <div class="block diff-context">{{literal unchanged context}}</div>
    <div class="block diff-del">{{literal removed or replaced text}}</div>
    <div class="block diff-add">{{literal added or replacement text}}</div>
  </section>
  <p class="unchanged-scope">{{exact readable preserved scope}}</p>
  <details class="technical-evidence">
    <summary>Exact provider evidence</summary>
    <section data-exact-before>{{complete exact provider before-state}}</section>
    <section data-exact-after>{{complete exact provider after-state}}</section>
    <pre data-raw-provider-state>{{exact tool input, transition JSON, validator report, rollback}}</pre>
  </details>
</article>
```

For body changes, show the complete final affected section and the literal changed
lines with enough readable context to make placement unambiguous. For property-only
or schema-only updates, use the field-level change table as the primary diff and
state the preserved body explicitly. The exact evidence layer retains the complete
provider before/after state for audit and read-back.

If the approved action deletes anything, repeat it in a deletion ledger with its
stable identity or exact location, destination for migrated content, inbound-link
treatment, recovery path, and quality-gate result.

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

For every mutation, show a readable evidence row with the source name, actor,
provider field or deterministic operation that will assign `captured_at`, affected
owner name, prior revision, proposed or expected revision, semantic relation, and a
plain-language change description. Retain the literal exact diff in that mutation's
collapsed technical evidence. Include
`observed_at` for every changed State and any `event_at`, `valid_from`, or
`valid_until` that changes interpretation. Name each `supersedes`, `revises`, or
`invalidates` relation and the provider location that will retain the evidence.
Do not fabricate a pre-approval `captured_at` value or reuse the draft timestamp.
Read-back must report and verify the resulting value assigned at apply time.

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
contradiction, material omission, an unsupported assertion retained or introduced
in the proposed after-state, or unsafe deletion must be blocking whether its status
is `Flag` or `Not checked`. An unsupported candidate that is explicitly rejected or
omitted may pass Coverage and Faithfulness when the ledger proves it cannot enter
the approved result.

### Reviewability Validation

Run `python3 scripts/validate-approval-draft.py <draft.html>` before opening the
artifact. A passing draft has one mutation article per proposed operation; every
article has a non-empty `change-summary`, at least one readable `change-table` row,
a non-empty `provider-preview`, an unchanged-scope statement, and a closed
`technical-evidence` toggle containing exact before/after evidence. Serialized raw
provider state appears only inside that toggle. Its labelled outline targets every
mutation exactly once and in application order.

Treat `Block` as an artifact defect: regenerate the draft and rerun validation.
This structural result remains distinct from the Semantic Quality Gate and never
authorizes a write.

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
