# HTML Approval Draft

Create one self-contained HTML file in the OS temp directory:

```text
<tmpdir>/kb-knowledge-draft-<timestamp>.html
```

Open it and report its absolute path. It is a temporary review surface, not a KB
record or repository artifact.

## Design

Make the draft resemble the bound provider, but keep it simple. Use inline CSS, no
scripts, remote assets, or framework. Apply the configured `draft-style` when one
exists; otherwise use a readable dark palette.

The visible page must answer:

1. What will change?
2. Where will it change?
3. What will exist after approval?

Put technical IDs and raw provider payloads in collapsed details. Never make the
user compare serialized objects to understand a write.

## Required Content

Start with the draft ID, status, and number of writes. Render primary KB mutations
first in exact application order. Put Revision Evidence row writes last in a compact,
lower-prominence section; this is also their apply order. For each primary write
show:

- action, target name, and location;
- a one-sentence outcome;
- every changed property or relation as current → proposed;
- the complete final new page or affected section;
- a literal diff for changed prose;
- every deletion, including its replacement and recovery path;
- unchanged scope when it prevents ambiguity;
- source, uncertainty, and limits that affect the decision;
- the exact fields and content that read-back will verify.

Group identical changes for readability only when every target and application
position remains explicit. List no-ops and rejected candidates briefly under
`Skipped`.

For grouped Revision Evidence rows, retain the exact affected target, diff,
prior/result revision source, rollback, and read-back fields without repeating
shared ledger boilerplate.

End with `Risks and gaps`. Unresolved ownership, contradiction, unsupported content,
material omission, or unsafe deletion makes the draft `Blocked`. A blocked draft
asks only for the missing decision or evidence. An unblocked draft ends with:

> Should I apply these exact KB writes now?

## Minimal Scaffold

Adapt this shape rather than reproducing it mechanically:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KB approval draft — {{topic}}</title>
  <style>
    :root { color-scheme: dark; --bg:#191919; --card:#242424; --text:#f1f1ef; --muted:#aaa; --line:#444; }
    body { margin:0 auto; max-width:900px; padding:40px 24px; background:var(--bg); color:var(--text); font:15px/1.55 system-ui,sans-serif; }
    article, .notice { margin:20px 0; padding:20px; border:1px solid var(--line); border-radius:8px; background:var(--card); }
    table { width:100%; border-collapse:collapse; } th,td { padding:8px; border:1px solid var(--line); text-align:left; vertical-align:top; }
    .muted, summary { color:var(--muted); } del { color:#ffaaa5; } ins { color:#9bd3a8; text-decoration:none; }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; }
  </style>
</head>
<body>
  <header>
    <h1>{{topic}}</h1>
    <p>{{status}} · Draft {{draft_id}} · {{write_count}} writes</p>
  </header>

  <main>
    <article>
      <p class="muted">1 · {{action}} · {{target_location}}</p>
      <h2>{{target_name}}</h2>
      <p>{{outcome}}</p>
      <table><!-- changed fields: field, current, proposed --></table>
      <section><!-- complete final provider-visible result --></section>
      <section><!-- literal prose diff when applicable --></section>
      <details><summary>Technical details</summary><pre>{{ids_and_exact_payload}}</pre></details>
    </article>

    <section id="risks"><h2>Risks and gaps</h2>{{risks_or_none}}</section>
    <section id="readback"><h2>Read-back</h2>{{verification_plan}}</section>
    <section class="notice"><strong>{{question_or_blocker}}</strong></section>
  </main>
</body>
</html>
```

Exactness means the visible proposal covers every write; it does not require a
second machine-readable representation of the same proposal.
