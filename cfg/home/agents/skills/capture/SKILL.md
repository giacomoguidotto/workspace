---
name: capture
description: Capture completed conversations or agent sessions into the Knowledge Bank. Use when the user invokes /capture or asks to save session knowledge to the KB.
---

# Capture

## Invariant

Every run produces an HTML approval draft before any KB write. There is no
inline-chat approval shortcut, even for tiny updates. Human approval authorizes
an exact write; it is not evidence that the write is semantically correct.

The Knowledge Bank is the source of truth. Apply its live provider through the
available connector without hardcoding provider-specific fields or operations.
The semantic-authoring contract in `kb-infra` is normative; this workflow applies
its Type, Ownership, Maturity, Kind, Revision Evidence, reconciliation, and
Semantic Quality Gate rules end to end.

## Runtime Semantic Reference

Apply these materialized rules without assuming the `kb-infra` checkout is
available at run time:

1. Keep one canonical owner per meaning; link or reconcile instead of copying.
2. Prefer the shortest wording that preserves meaning, scope, qualifiers, time,
   uncertainty, rationale, and evidence.
3. Make semantics explicit enough for an agent to parse and natural enough for a
   person to browse.
4. Keep Type, Ownership, Maturity, and Kind independent. Type is provider- or
   domain-defined. Ownership is `Canonical`, `Adapter`, or the blocking migration
   state `Unresolved`. Maturity is `Raw`, `Developing`, or `Stable`.

Use version 1 of this Kind registry. The ID is stable; the display heading may use
the preferred heading or a registered alias.

| ID | Kind | Required semantic force |
| --- | --- | --- |
| `state` | State | A verified current condition. Use an explicit subject and current-condition verb; retain `observed_at` and show `as of` when volatility changes interpretation. |
| `direction` | Direction | An aim or exploration, not a settled choice. Use language such as `aims to`, `is intended to`, or `is exploring`. |
| `decision` | Decision | A selected option or commitment. State the choice before rationale and alternatives. |
| `rule` | Rule | A scoped norm. `must` has no exception, `should` is the default with justified exceptions, and `may` grants permission. |
| `preference` | Preference | What a named subject favors or avoids, including strength when material. |
| `procedure` | Procedure | Ordered actions with an observable outcome. Use imperative steps. |
| `event` | Event | Something that happened. Use past tense and an absolute date when known. |
| `evidence` | Evidence | Material supporting or qualifying a claim, with provenance. |
| `open-item` | Open item | An unresolved question or outcome requiring follow-up. Phrase it directly. |
| `schema` | Schema | A reusable shape, field contract, or controlled vocabulary. |
| `example` | Example | A concrete illustration that does not itself define the rule. |
| `citation` | Citation | An external source reference with enough identity to retrieve it. |

Keep one canonical subject per page, one dominant Kind per section, and one primary
claim, instruction, or question per knowledge unit. Put a one-sentence description
first, current or actionable content before supporting history and evidence, and
Open items and Citations last. Claim-to-qualifier, rationale, and evidence adjacency
overrides that order. Do not create universal page profiles, empty sections, or
decorative structure.

Choose the least complex presentation that preserves semantic relationships:
short prose for one assertion or tightly coupled explanation; parallel bullets for
two or more unordered peers; numbers for ordered or ranked items; labelled entries
for term-definition pairs; and tables only for repeated comparable records. Keep
examples separate from their governing rule and number external Citations when
inline correspondence would otherwise be unclear.

Use one canonical term per concept, with aliases stored at its owner for retrieval.
Expand uncommon abbreviations and flag uncertain equivalence instead of silently
merging concepts. Never use relative time without an absolute anchor. Distinguish
`observed_at`, `event_at`, optional `valid_from` or `valid_until`, and apply-time
`captured_at`; never substitute one for another.

## Loop

### 1. Map The Live KB

Read the live KB through its provider connector before choosing a target.

When a compiled Drift Audit manifest and findings are available, use them only as
read-only discovery evidence. Verify their schema and Kind-registry version, use
stable identities and findings to seed owner and relation searches, and surface
partial access or concurrent drift. An audit baseline never replaces the required
live reads: re-read every affected target, competing owner, revision, and relation
needed by the proposed mutation.

- Search broad parent areas, likely databases, sibling pages, repo/project
  aliases, relevant conventions, and possible competing owners.
- Search exact names, URLs, repository slugs, stable page IDs, and likely titles.
- Fetch each likely owner, the complete affected sections, linked owners, inbound
  relations needed for deletion safety, and nearby examples before proposing
  fields or body shape.
- Discover how the provider represents Type, Ownership, Maturity, Kind, stable
  page identity, revisions, relations, and deletion recovery. Do not invent a
  field when the live schema uses another representation.
- Prefer live KB structure over repo assumptions or stale local artifacts.

If a complete affected section, a possible competing owner, or required relation
cannot be read, record the gap as `Not checked`. When that gap could hide an
ownership, contradiction, omission, unsupported-assertion, or deletion risk, it
blocks the write.

Completion criterion: the proposed owner, placement, property schema, affected
content, linked owners, and Revision Evidence mechanism are grounded in live KB
reads. Otherwise the run may produce an unverified draft, but it cannot offer or
apply the write.

### 2. Turn Intake Into Semantic Candidates

Treat every incoming assertion as `Raw` before editorial processing. Build a
source-assertion ledger and keep it in the approval artifact, not in the final KB
prose unless provenance changes how the knowledge should be interpreted.

For every assertion:

1. Preserve the subject, meaning, scope, qualifiers, uncertainty, temporal
   meaning, rationale, and supporting evidence.
2. Classify it with a stable Kind ID from the versioned registry. Use explicit
   Kind metadata or a registered provider mapping; never infer Kind from an
   arbitrary heading.
3. Identify the candidate canonical owner and any Adapter that should link to it.
4. Mark the proposed disposition as preserve, merge, replace, append, delete,
   reject, or omit, with a reason.
5. Propose the post-approval Maturity and record the evidence for that decision:
   - `Stable` only when the assertion is reconciled, sufficiently supported, and
     safe to reuse after approval;
   - `Developing` when it is reconciled and useful but explicitly unsettled or
     expected to change;
   - retained `Raw` only when the draft names its owner, provenance, retention
     reason, and next review or distillation action.

Exclude transcript framing, temporary command noise, and unsupported claims.
Keep durable progress, decisions, rationale, open items, blockers, follow-ups,
links, and preferences only when they pass reconciliation. If a convention applies
beyond the immediate project, treat the higher-level meaning as a separate
candidate with its own owner instead of copying it into both places.

Completion criterion: every source assertion maps to a proposed disposition,
Kind, Maturity, owner, provenance, and evidence, including rejected or omitted
assertions.

### 3. Reconcile Canonical Meaning

Reconcile the Active Canonical View instead of appending a session summary.

- Compare each candidate with the complete affected section and linked owners.
- Establish one canonical owner per meaning. An Adapter links to that owner and
  never silently becomes a second owner. `Unresolved` Ownership blocks the write.
- Preserve, merge, replace, or delete every affected meaning deliberately.
- Rewrite the smallest coherent section that expresses the resulting meaning.
- Append only a genuine chronological Event or a new peer in an existing set.
- Remove superseded wording in the same proposed write.
- Keep one dominant Kind per section and the least complex presentation that
  preserves the relationships among assertions.
- Preserve Revision Evidence for every mutation: source, actor, the provider field
  or deterministic operation that will assign `captured_at` when the accepted
  mutation is applied, affected owner, prior and proposed revision identity, exact diff, and any
  `supersedes`, `revises`, or `invalidates` relation. A changed State also retains
  its distinct `observed_at`.
- Before deleting a block or page, account for unique durable content, inbound
  links, replacement owners, and the recovery path.

Completion criterion: the proposal is the smallest non-duplicative change that
preserves current meaning and recoverable history; append-only accretion is used
only when its semantics require it.

### 4. Run The Semantic Quality Gate

Run the gate before presenting anything as approvable. Separate deterministic
checks from semantic judgments. Every result must be `Pass`, `Flag`,
`Not checked`, or `Not applicable` and name both the checked scope and concrete
evidence; a bare status is invalid.

At minimum, report:

- Ownership: owner checked, competing owners considered, and Adapter links named.
- Coverage: every source assertion mapped to preserved, changed, omitted, or
  rejected content.
- Preservation: qualifiers, uncertainty, time, rationale, and unique durable
  content accounted for.
- Faithfulness: every proposed claim traced to its source without unsupported
  strengthening.
- Duplication and contradiction: affected sections and linked owners compared.
- Kind and semantic force: stable Kind ID and Kind-specific constraints checked.
- Time and provenance: temporal anchors and complete Revision Evidence present.
- Deletion safety: unique content, inbound links, replacement owner, and recovery
  path checked for each deletion.

Any unresolved Ownership, contradiction, material omission, unsupported assertion
retained or introduced in the proposed after-state, or unsafe deletion is a
blocking risk. A blocking `Flag` or
`Not checked` result stops the write: the draft must identify the missing decision
or evidence and must not ask for approval to apply it. Other flags remain visible
for informed approval; approval never converts a failed check into a pass.

Create one provider-neutral Capture transition JSON record for every proposed
mutation. From the installed Capture skill directory, run the bundled validator:

```sh
python3 scripts/validate-capture-transition.py <record.json>
```

When a compiled audit baseline informed discovery, bind it to the validation run:

```sh
python3 scripts/validate-capture-transition.py <record.json> \
  --audit-manifest <manifest.json> \
  --audit-findings <findings.json>
```

The audit inputs must be the matching output pair from one read-only compilation.
The validator verifies their content hash, schema and Kind-registry versions,
target coverage, full-access recheck, and concurrent-drift state. Treat an exit status of `2`, a
`Block` disposition, a missing runtime contract, or an unavailable validator as a
blocking deterministic failure. A `Flag` disposition remains visible for semantic
review but does not itself grant write authority. Include each complete JSON report
in the Approval Draft; never rewrite a validator result by hand.

Completion criterion: each proposed mutation has evidence-bearing results for all
required checks, its executable report is present, and blocking and non-blocking
findings are distinguished.

### 5. Draft Exact Writes

Create a provider-like HTML approval draft using [HTML-DRAFT.md](HTML-DRAFT.md).
The draft is an approval artifact, not a second knowledge record.

Use two layers with one approval meaning:

1. The **review layer** is the primary interface. It states what changes, where,
   and with what semantic effect in ordinary language; renders changed fields as
   provider-like tables; shows the complete final page or section; and makes every
   deletion explicit. A reviewer can enumerate every mutation without reading
   serialized provider state or decoding provider IDs.
2. The **exact evidence layer** retains complete provider inputs, before/after
   states, stable IDs, transition JSON, and validator reports in collapsed
   technical-evidence toggles. It proves the review layer without becoming the
   interface the human must diff.

The review layer and exact evidence layer must describe the same complete change
set. A mutation, property, relation, content change, or deletion that appears in
only one layer invalidates the draft.

Before opening the draft, validate its review structure from the installed Capture
skill directory:

```sh
python3 scripts/validate-approval-draft.py <draft.html>
```

Revise the HTML until the validator returns `Pass`. Treat a missing validator, exit
status `2`, or `Block` disposition as a blocking deterministic failure. Then write
the draft to the OS temp directory, open it for the user, and report the absolute
path in chat.

If any semantic or deterministic blocker remains, label the draft blocked and ask
only the question needed to resolve it. Otherwise ask exactly: "Should I apply
these exact KB writes now?"

Completion criterion: the approval-draft validator passes, and the user can list
every proposed mutation and evaluate its semantic effect from the visible review
layer without opening technical evidence or relying on hidden conversation context.

### 6. Ask For Fresh Approval

Only an unambiguous affirmative answer to "Should I apply these exact KB writes
now?" or an equally explicit instruction to apply the latest named draft authorizes
writing. "Looks good", clarifying answers, placement discussion, or approval of an
earlier draft do not.

If the conversation changes any target, content, property, relation, action,
deletion, order, semantic decision, Revision Evidence, or quality-gate result,
regenerate the HTML file and ask again. A blocked draft cannot be approved for
application.

Completion criterion: approval is explicit, fresh, and applies to the latest
unblocked exact draft.

### 7. Apply Exactly And Read Back

Immediately before writing, re-read every target's current revision and the
relations needed for deletion safety. If anything differs from the approved
before-state, stop, reconcile again, regenerate the draft, and obtain fresh
approval.

Apply only the approved actions, in the approved order, through the bound provider
connector. Use the exact properties, relations, content, and deletions shown in the
draft, and retain the approved Revision Evidence. Do not substitute a nearby
provider operation; if an exact action is unavailable, stop and report it.

After applying, read back every affected item and revision from the KB. Compare the
result with the approved after-state: stable identity, parent, properties,
relations, full content, deletion outcome, and Revision Evidence. Report exact
matches, mismatches, and partial failures. Never silently repair a mismatch;
another mutation requires a new exact draft and fresh approval.

Completion criterion: every approved mutation either matches its read-back exactly
or is reported with the precise mismatch or provider blocker. No unapproved
corrective write occurs.

## Placement Rules

- Keep parent pages short.
- Put dense backlog, references, reflections, lessons, quotes, evidence, and long
  decision context in child pages under the relevant parent.
- Prefer the smallest coherent set of writes over broad context dumps.
- Choose one canonical owner for each meaning; other pages link to that owner.
- Never invent a page or database when an existing owner can be strengthened.

## Safety Rules

The Invariant above is the single authorization gate: nothing is written, edited,
appended, related, moved, renamed, archived, or deleted in the KB before explicit
approval of the latest unblocked exact draft.

- Never invent facts, provider fields, relations, revision support, or evidence.
- Treat KB writes as hard to version and potentially destructive.
- Keep provider-specific bindings and personal values out of the committed skill.
- If live KB access is unavailable, produce only a blocked, unverified draft.
- Do not use a live KB write to develop, test, or validate this workflow.
