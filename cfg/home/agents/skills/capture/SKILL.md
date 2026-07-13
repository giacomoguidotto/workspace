---
name: capture
description: Capture durable conversation or session knowledge into the Knowledge Bank. Use when the user invokes /capture or asks to save knowledge to the KB.
---

# Capture

## Invariant

Open an HTML approval draft before every KB write. Apply only the exact writes the
user explicitly approves from the latest draft.

The KB is canonical. Use its live provider connector and schema; keep personal and
provider-specific bindings out of this skill.

## Authoring Rules

Apply three rules to every draft:

1. Keep one canonical owner per meaning; reconcile or link instead of copying.
2. Use the shortest wording that preserves meaning, scope, qualifiers, time, and
   evidence.
3. Make content explicit enough for agents to parse and natural enough for people
   to browse.

Keep these axes independent:

- **Type**: what the page represents; provider- or domain-defined.
- **Ownership**: `Canonical`, `Adapter`, or migration-only `Unresolved`.
- **Maturity**: `Raw`, `Developing`, or `Stable`. New intake starts `Raw`; retained
  knowledge should normally become `Stable`.
- **Kind**: the section's meaning: `State`, `Direction`, `Decision`, `Rule`,
  `Preference`, `Procedure`, `Event`, `Evidence`, `Open item`, `Schema`, `Example`,
  or `Citation`.

Keep one subject per page, one dominant Kind per section, and no empty or decorative
sections. State the current or actionable meaning before history. Keep qualifiers,
rationale, and evidence beside the claim they affect.

Treat structured-table rows as records when their schema and fields carry the full
meaning. Preserve their cell-like shape: do not add page semantic metadata to Notes
or a blank body, and do not treat a repeated title as duplicate meaning when the
table and hierarchy already disambiguate it. Apply page semantics only when a row's
body owns independent durable knowledge.

## Loop

### 1. Read The Live KB

Search for the subject, aliases, likely owners, adapters, and nearby examples. Fetch
the target's complete affected section and live schema. Follow only relations needed
to establish ownership, avoid contradiction, or make a deletion safe.

Treat local audits and previous drafts as discovery hints, never as substitutes for
live reads. If the target, a plausible competing owner, or required relation cannot
be read, state the gap. Block the write when the gap could hide duplication,
contradiction, unsupported content, material loss, or unsafe deletion.

Completion: the owner, placement, schema, affected content, and relevant relations
are grounded in current KB reads.

### 2. Distill And Reconcile

Extract durable knowledge only. Discard transcript framing, command noise, and
unsupported claims.

For each retained meaning:

- preserve its subject, scope, qualifiers, uncertainty, time, rationale, and useful
  evidence;
- choose its owner, Maturity, and Kind;
- compare it with current content and linked owners;
- preserve, merge, replace, append, or remove it deliberately;
- rewrite the smallest coherent section that expresses the result.

Append only genuine chronological Events or new peers in an existing set. When
removing content, account for unique meaning, inbound links, its replacement, and
the provider's recovery path. Retain revision evidence through provider history or
the bound evidence surface.

Completion: the proposal is the smallest non-duplicative change that preserves
meaning and recoverable history.

### 3. Draft Exact Writes

Create the HTML artifact described in [HTML-DRAFT.md](HTML-DRAFT.md). Render primary
KB mutations first in application order. Put bound Revision Evidence row writes in
a compact final section; they remain mandatory and execute after all primary
mutations. For each primary write show:

- action, human-readable target, and placement;
- exact current and proposed properties or relations;
- complete final affected section or new page body;
- literal removed content and deletion consequences;
- reason, source, and any uncertainty or unverified scope;
- what will be read back after application.

Keep raw provider IDs and request payloads collapsed unless the user needs them to
decide. Treat the HTML draft as the complete approval record.

If a blocker remains, label the draft blocked and ask only for the missing decision
or evidence. Otherwise open the file, report its absolute path, and ask exactly:
"Should I apply these exact KB writes now?"

Completion: the user can understand and approve every write from the visible draft
without decoding provider state or relying on hidden conversation context.

### 4. Get Fresh Approval

Accept only an explicit instruction to apply the latest named draft. Clarification,
placement discussion, or approval of an older draft is not write authority. If any
write changes, regenerate the draft and ask again.

### 5. Re-read, Apply, And Verify

Immediately before writing, re-read every target and relation that determined the
approved before-state. Drift invalidates approval.

Apply the approved primary operations in order through the provider connector, then
append the approved Revision Evidence rows. Make no opportunistic or corrective
write. Read back every affected item and compare its identity, parent, properties,
relations, content, deletion result, and revision evidence with the approved result.

Report exact matches, failures, and partial results. A repair requires another draft
and fresh approval.

## Safety

- Never invent facts, fields, relations, revisions, or evidence.
- Preserve child pages, databases, and unrelated content unless the draft explicitly
  removes them.
- Prefer strengthening an existing owner over creating a page.
- If live KB access is unavailable, produce only a blocked, unverified draft.
