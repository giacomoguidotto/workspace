# HTML Approval Draft

Create one self-contained HTML file in the OS temp directory:

```text
<tmpdir>/kb-knowledge-draft-<timestamp>.html
```

Open it and report its absolute path. It is a temporary review surface, not a KB
record or repository artifact.

## Visual Contract

Use a dark editorial change ledger. Keep the stylesheet, tokens, component classes,
and DOM order stable across drafts; vary only the content and number of operations.
Use inline CSS, local fonts, and semantic HTML. Use no scripts, remote assets, emoji,
decorative icons, inline `style` attributes, or target-specific CSS selectors.

The page has five regions:

1. `masthead`: topic, status, draft ID, and write count;
2. optional `invalidation`: the rejected draft ID and why this replacement exists;
3. `summary`: outcome, scope, risk, and application sequence;
4. `operations`: primary writes in exact DOM and application order;
5. `closing`: skipped candidates, compact Revision Evidence, risks, read-back, and
   the approval question.

Use these components consistently:

- `.badge` for status or action; add only `ready`, `blocked`, `update`, `create`, or
  `delete` as a modifier;
- `.invalidation` with `.invalidation-meta` for the approval-history notice shown
  only when this draft replaces an explicitly rejected draft;
- `.operation` with `.op-index`, `.op-meta`, and `.op-body` for every primary write;
- `.change-table` inside `.table-wrap` for property or relation changes;
- `.result` for the complete provider-visible result;
- `.diff` with `.before` and `.after` for literal prose changes;
- `.ledger` for grouped Revision Evidence rows;
- `details.technical` for IDs and raw provider payloads.

Do not reorder operations with CSS. Do not invent another card, color, badge, or diff
grammar. Keep sentences short and labels literal. The visible page must answer:

1. What will change?
2. Where will it change?
3. What will exist after approval?

## Canonical Style

Copy this stylesheet unchanged. It deliberately uses restrained local typography,
one warm accent, and responsive layouts so drafts remain recognizable and readable.

```css
:root {
  color-scheme: dark;
  --canvas:#141413; --surface:#1c1c1a; --raised:#232320; --ink:#f2efe7;
  --muted:#aaa69c; --faint:#77736b; --line:#3b3933; --accent:#ff6846;
  --good:#9bc997; --warn:#e5bd72; --bad:#e78b7d;
  --display:"Iowan Old Style","Palatino Linotype",Palatino,serif;
  --body:"Avenir Next",Avenir,"Gill Sans",sans-serif;
  --mono:"SFMono-Regular",Consolas,"Liberation Mono",monospace;
}
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:radial-gradient(circle at 76% -10%,#2c241f 0,transparent 34rem),var(--canvas); color:var(--ink); font:15px/1.6 var(--body); }
a { color:inherit; text-decoration-color:var(--faint); text-underline-offset:3px; }
.shell { width:min(1180px,calc(100% - 40px)); margin:auto; padding:58px 0 80px; }
.masthead { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:32px; align-items:end; padding-bottom:28px; border-bottom:1px solid var(--line); }
.kicker,.eyebrow { margin:0 0 8px; color:var(--muted); font:600 11px/1.4 var(--mono); letter-spacing:.1em; text-transform:uppercase; }
h1,h2,h3,p { margin-top:0; } h1 { max-width:820px; margin-bottom:0; font:500 clamp(40px,7vw,78px)/.98 var(--display); letter-spacing:-.035em; }
h2 { margin-bottom:8px; font:500 30px/1.1 var(--display); } h3 { margin:24px 0 8px; font-size:12px; letter-spacing:.08em; text-transform:uppercase; }
.folio { min-width:190px; text-align:right; color:var(--muted); font:12px/1.7 var(--mono); }
.badge { display:inline-flex; width:max-content; padding:4px 8px 3px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font:700 10px/1.2 var(--mono); letter-spacing:.07em; text-transform:uppercase; }
.badge.ready,.badge.create { color:var(--good); border-color:color-mix(in srgb,var(--good) 45%,var(--line)); }
.badge.blocked,.badge.delete { color:var(--bad); border-color:color-mix(in srgb,var(--bad) 45%,var(--line)); }
.badge.update { color:var(--warn); border-color:color-mix(in srgb,var(--warn) 45%,var(--line)); }
.invalidation { display:grid; grid-template-columns:190px minmax(0,1fr); gap:32px; padding:22px 0 24px; border-bottom:1px solid var(--line); box-shadow:inset 3px 0 0 var(--warn); }
.invalidation-meta { padding-left:20px; color:var(--muted); font:12px/1.7 var(--mono); }
.invalidation>div { min-width:0; }
.invalidation h2 { margin-bottom:6px; color:var(--warn); font-size:24px; }
.invalidation p { max-width:780px; margin-bottom:0; overflow-wrap:anywhere; }
.summary { display:grid; grid-template-columns:2fr repeat(3,1fr); border-bottom:1px solid var(--line); }
.summary-item { min-height:116px; padding:24px 24px 22px 0; }
.summary-item + .summary-item { padding-left:24px; border-left:1px solid var(--line); }
.summary strong { display:block; margin-bottom:7px; font:500 19px/1.25 var(--display); }
.summary p,.muted { color:var(--muted); }
.review-grid { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:64px; align-items:start; margin-top:56px; }
.review-index { position:sticky; top:24px; padding-left:18px; border-left:1px solid var(--line); color:var(--muted); font-size:13px; }
.review-index ol { margin:14px 0 0; padding:0; list-style:none; counter-reset:item; }
.review-index li { counter-increment:item; margin:9px 0; } .review-index li::before { content:counter(item,decimal-leading-zero) " "; color:var(--accent); font:11px var(--mono); }
.operation { display:grid; grid-template-columns:72px minmax(0,1fr); gap:20px; padding:0 0 56px; }
.operation + .operation { padding-top:52px; border-top:1px solid var(--line); }
.op-index { color:var(--accent); font:500 36px/1 var(--display); }
.op-meta { display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center; margin-bottom:14px; color:var(--muted); font:12px/1.4 var(--mono); }
.lead { max-width:720px; color:#d7d3ca; font-size:16px; }
.table-wrap { max-width:100%; overflow-x:auto; margin:18px 0 24px; border:1px solid var(--line); }
table { width:100%; border-collapse:collapse; font-size:13px; } th,td { padding:10px 12px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
tr:last-child td { border-bottom:0; } th { color:var(--muted); background:var(--raised); font:600 10px/1.3 var(--mono); letter-spacing:.07em; text-transform:uppercase; }
.change-table td:nth-child(2) { color:var(--bad); } .change-table td:nth-child(3) { color:var(--good); }
.result,.diff>div { margin:10px 0; padding:16px 18px; border-left:2px solid var(--line); background:var(--surface); white-space:pre-wrap; overflow-wrap:anywhere; }
.diff { display:grid; grid-template-columns:1fr 1fr; gap:10px; } .diff .before { border-color:var(--bad); color:#e9b0a7; } .diff .after { border-color:var(--good); color:#b8d9b5; }
code,pre { font-family:var(--mono); } code { color:#ded8cb; } pre { margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }
.note { margin:18px 0; padding:13px 15px; border:1px solid var(--line); background:var(--surface); color:var(--muted); }
details.technical { margin-top:18px; padding:12px 0; border-top:1px solid var(--line); color:var(--muted); } summary { cursor:pointer; font-weight:600; } details pre { margin-top:12px; }
.closing { margin-top:12px; padding-top:48px; border-top:1px solid var(--line); }
.closing-section { padding:28px 0; border-bottom:1px solid var(--line); }
.ledger { color:var(--muted); } .ledger td:first-child { color:var(--ink); }
.approval { margin-top:42px; padding:28px; border:1px solid var(--accent); background:linear-gradient(135deg,rgba(255,104,70,.11),transparent 56%); }
.approval strong { display:block; font:500 27px/1.2 var(--display); }
ul { padding-left:20px; } li + li { margin-top:6px; }
@media (max-width:820px) { .masthead{grid-template-columns:1fr}.folio{text-align:left}.invalidation{grid-template-columns:minmax(0,1fr);gap:12px;padding:18px 0 20px}.invalidation-meta,.invalidation>div:last-child{padding-left:20px;padding-right:12px}.invalidation h2{font-size:clamp(20px,7vw,24px)}.summary{grid-template-columns:1fr 1fr}.summary-item:nth-child(3){border-left:0}.review-grid{grid-template-columns:1fr}.review-index{position:static;order:-1}.operation{grid-template-columns:44px minmax(0,1fr);gap:12px}.diff{grid-template-columns:1fr} }
@media (max-width:520px) { .shell{width:min(100% - 28px,1180px);padding-top:34px}.summary{grid-template-columns:1fr}.summary-item+.summary-item{padding-left:0;border-left:0;border-top:1px solid var(--line)}.operation{grid-template-columns:1fr}.op-index{font-size:24px} }
@media (prefers-reduced-motion:reduce) { html{scroll-behavior:auto} }
```

Keep this structural nesting. Repeat `.operation` and `.summary-item` as needed;
omit empty optional sections rather than leaving placeholders.

```html
<body><div class="shell">
  <header class="masthead">
    <div><p class="kicker">Knowledge Bank · approval draft</p><h1>{{topic}}</h1></div>
    <div class="folio"><span class="badge ready">{{status}}</span><br>{{draft_id}}<br>{{write_count}} writes</div>
  </header>
  <!-- Include only when this draft replaces an explicitly rejected draft. -->
  <section class="invalidation" aria-labelledby="previous-draft-invalidated">
    <div class="invalidation-meta"><p class="eyebrow">Superseded approval</p>{{previous_draft_id}}</div>
    <div><h2 id="previous-draft-invalidated">Previous Draft Invalidated</h2><p>{{why_this_replacement_exists}}</p></div>
  </section>
  <section class="summary" aria-label="Draft summary">
    <div class="summary-item"><p class="eyebrow">Outcome</p>{{outcome}}</div>
    <!-- Primary, Evidence, and Risk summary items -->
  </section>
  <div class="review-grid">
    <main class="operations">
      <article class="operation" id="op-1">
        <div class="op-index">01</div>
        <div class="op-body">
          <div class="op-meta"><span class="badge update">{{action}}</span>{{location}}</div>
          <h2>{{target}}</h2><p class="lead">{{outcome}}</p>
          <!-- change table, final result, diff, note, technical details -->
        </div>
      </article>
      <section class="closing">
        <!-- Skipped, Revision Evidence, Risks, Read-back, Approval -->
      </section>
    </main>
    <aside class="review-index" aria-label="Application sequence">{{ordered_index}}</aside>
  </div>
</div></body>
```

## Required Content

Start with the draft ID, status, and total write count. The summary states the final
outcome, primary-write count, evidence-write count, and risk level. The sticky index
lists every primary operation in application order.

When, and only when, the current draft replaces an explicitly rejected draft, put a
`Previous Draft Invalidated` section directly between the masthead and summary. Name
the rejected draft ID and explain briefly why the replacement exists: state the
factual rejection reason and the material response in the new draft. If the user did
not give a reason, state that the prior draft was rejected and name only the material
change. Do not reproduce the rejected proposal, invent a reason, or imply that it can
still be approved. This approval-history section does not count as a write and does
not appear in the application sequence or Revision Evidence.

For each primary write show:

- action, target name, and location;
- a one-sentence outcome;
- every changed property or relation as current → proposed;
- the complete final new page or affected section;
- a literal diff for changed prose;
- every deletion, including its replacement and recovery path;
- unchanged scope when it prevents ambiguity;
- source, uncertainty, and limits that affect the decision;
- the exact fields and content that read-back will verify.

Group identical changes only when every target and application position remains
explicit. List no-ops and rejected candidates briefly under `Skipped`. Put Revision
Evidence last in a compact `.ledger` table, retaining each affected target, diff,
prior/result revision source, rollback, and read-back fields.

End with `Risks and gaps`. Unresolved ownership, contradiction, unsupported content,
material omission, or unsafe deletion makes the draft `Blocked`. A blocked draft asks
only for the missing decision or evidence. An unblocked draft ends with:

> Should I apply these exact KB writes now?

Exactness means the visible proposal covers every write; it does not require a
second machine-readable representation of the same proposal.
