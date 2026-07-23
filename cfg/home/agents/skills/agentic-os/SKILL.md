---
name: agentic-os
description: Coordinate versioned cross-System capabilities. Use when the user invokes /agentic-os scout, /agentic-os pursue, or /agentic-os upskill.
argument-hint: "scout --target <positive integer> | pursue [<opportunity-ref>...] | upskill <knowledge-project-ref>..."
---

# Agentic OS

Coordinate only the requested cross-System capability. The public surface
currently supports:

```text
/agentic-os scout --target <positive integer>
/agentic-os pursue
/agentic-os pursue <opportunity-ref>...
/agentic-os upskill <knowledge-project-ref>...
```

For `scout`, reject missing, repeated, non-integer, or non-positive targets. For
`pursue`, accept no arguments for automatic selection or one or more non-empty
opaque opportunity references. Reject flags, duplicate references, and every
other argument shape. For `upskill`, require one or more non-empty opaque
Knowledge project references and reject flags or duplicates. Repository roots,
System bindings, profile data, throughput targets, and native configuration are
derived from installed Systems, never accepted as public caller inputs.

## Scout contract

Scout builds one fresh, ephemeral Career profile for this invocation, reconciles
only its native delta, and invokes Career discovery and evaluation through the
canonical gateway. Load the bundled Knowledge Request from
[`resources/scout-knowledge-request.json`](resources/scout-knowledge-request.json)
and return a document matching
[`resources/scout-result.schema.json`](resources/scout-result.schema.json).

Agentic OS coordinates the calls. It does not read Knowledge provider bindings,
inspect Career implementation scripts, edit Career files, or reproduce either
System's domain rules.

### 1. Establish fresh readiness

Resolve the installed `setup-knowledge-system` and `lookup` capabilities and the
configured Career System root. Do not fetch or silently upgrade either System.

Run a fresh read-only `/setup-knowledge-system check` for `agentic-os.scout`.
Require the installed Knowledge interface, lookup, Snapshot Token validation, and
every required role in the bundled request to be ready. Record only the structured
status, capability evidence, and observation time, never personal values or
provider details.

From the Career root, invoke only:

```text
node main.mjs career-system.check/v1 --input -
```

Supply the versioned capabilities `career.profile.check/v1`,
`career.profile.reconcile/v1`, and `career.opportunity.discover/v1`. Record the
structured readiness evidence and observation time. A missing root, malformed
result, unsafe repository state, unavailable required capability, or blocked
readiness returns a capability-scoped `blocked` result. Do not guess a fallback or
invoke an internal Career script.

### 2. Build fresh profile input

Pass the bundled request unchanged to the installed automation-mode `/lookup`.
Require a valid `knowledge-system-interface/v1` snapshot whose caller and
capability are `agentic-os` and `agentic-os.scout`.

Map its current role results into a complete `career.profile.snapshot/v1` with
exactly these sections:

- `identity`
- `application_defaults`
- `opportunity_preferences`
- `positioning_and_proof`
- `communication_strategy`

Preserve every field's `value`, `absent`, or `unresolved` state, visibility,
restrictions, evidence, and provenance. Preserve uncertainty and weighted
preferences. Only explicit hard rejects become gates. Never infer a value from a
search miss, strip a qualifier, broaden the lookup, or manufacture a field.

Keep the Knowledge snapshot and Career profile only in memory or in a
permission-restricted temporary file. Remove any temporary file before returning,
including on errors. Never write a profile, snapshot, token, cache, receipt,
ledger, or resumption record in Agentic OS.

### 3. Validate drift and reconcile the native delta

Immediately before a dependent write, ask the installed Knowledge interface to
validate the opaque Snapshot Token. Never parse, compare, log, or derive meaning
from the token.

If the covered Knowledge state changed, discard the complete Knowledge and Career
snapshots. Repeat fresh Knowledge readiness, fresh Career readiness, lookup,
mapping, and token validation once. If it changes again, return `blocked` with a
scoped `persistent_drift` action. Do not combine revisions or ask a broader query.

When the token is unchanged, pass the complete Career profile through stdin to:

```text
node main.mjs career.profile.check/v1 --input -
node main.mjs career.profile.reconcile/v1 --input -
```

Use the same opaque source revision in `snapshot.revision` and
`expected_revision`. Treat `check` as read-only. Let the Career gateway own field
mapping, managed projection isolation, validation, and writes. An unresolved field
may block only its dependent capability; independent safe deltas may remain
reconciled. Never roll back a native delta or touch applications, reports,
attempts, outcomes, follow-ups, offers, observations, queues, or generated
artifacts.

After reconciliation, run a new Career `career-system.check/v1` for
`career.opportunity.discover/v1`. This post-reconcile result, not the earlier
check, authorizes scouting.

### 4. Invoke native scouting

Invoke only the canonical gateway:

```text
node main.mjs career.opportunity.discover/v1 --input -
```

Pass a versioned request containing the requested target and native continuation
references returned by the Career gateway, if any. Do not pass Knowledge provider
details, raw private profile values, or Agentic OS state.

The Career capability owns discovery, evaluation, replacement attempts, locking,
native verification, and artifact writes. Continue until exactly the requested
number of evaluations succeed or the native capability returns a terminal result.
Never invoke scan scripts, batch runners, modes, tracker writers, or other Career
internals directly.

Preserve every successful native evaluation and artifact when later work blocks or
fails. Do not delete, reset, rewrite, or roll back partial Career work. Resume only
through continuation references returned by the Career capability, never through
an Agentic OS cache.

### 5. Return the scoped result

Return `agentic-os.scout.result/v1` with capability `agentic-os.scout`. Include
fresh Knowledge and Career readiness evidence, requested and successful counts,
replacements, failures, native report and tracker references, verification,
profile reconciliation, proposed captures, and blocked actions. Reference native
artifacts instead of copying them and redact private profile values.

Use terminal statuses exactly:

- `completed`: exactly the requested evaluations succeeded and native verification
  passed;
- `blocked`: a recoverable prerequisite, required field, readiness, busy state, or
  persistent drift prevented safe progress;
- `incomplete`: native recovery paths ended after preserving partial work;
- `failed`: a schema, protocol, safety, or post-check invariant was violated.

Return one result even when the run stops before native scouting. Unresolved data
and blockers remain scoped to `agentic-os.scout`; unrelated System capabilities
remain usable. Never claim completion from counts alone without native
verification.

## Pursue contract

Pursue selects safe existing Career work, produces native plans and draft packs,
and reviews externally owned waits. Load the bundled Knowledge Request from
[`resources/pursue-knowledge-request.json`](resources/pursue-knowledge-request.json)
and return a document matching
[`resources/pursue-result.schema.json`](resources/pursue-result.schema.json).

Agentic OS coordinates only versioned contracts. Every read or update of Career
state goes through the canonical gateway. Never inspect Career trackers, reports,
pipelines, modes, templates, action files, or implementation scripts directly.

### 1. Establish fresh readiness

Resolve the installed `setup-knowledge-system` and `lookup` capabilities and the
configured Career System root. Do not fetch or silently upgrade either System.

Run a fresh read-only `/setup-knowledge-system check` for
`agentic-os.pursue`. Require the installed Knowledge interface, lookup, Snapshot
Token validation, and every required role in the bundled request to be ready.
Optional roles may be absent or unresolved without blocking the run. Record only
structured readiness evidence and observation time, never personal values or
provider details.

From the Career root, invoke only:

```text
node main.mjs career-system.check/v1 --input -
```

Require fresh readiness for `career.profile.check/v1`,
`career.profile.reconcile/v1`, `career.opportunity.select-related/v1`,
`career.opportunity.advance/v1`, and
`career.opportunity.review-waiting/v1`. A missing root, malformed result, unsafe
repository state, unavailable required capability, or blocked readiness returns a
capability-scoped `blocked` result. Do not guess a fallback or invoke a Career
internal.

If Career reports active Scout, batch, pipeline, or other conflicting work,
return `blocked` with its native busy evidence. Never infer idleness from files or
processes.

### 2. Build fresh inputs and validate drift

Pass the bundled request unchanged to the installed automation-mode `/lookup`.
Require a valid `knowledge-system-interface/v1` snapshot whose caller and
capability are `agentic-os` and `agentic-os.pursue`.

Map the current profile roles into the complete ephemeral
`career.profile.snapshot/v1` used by the Career profile capabilities. Preserve
field state, visibility, restrictions, evidence, provenance, uncertainty, and
weighted preferences. Resolve the current application-throughput target from
`job-search-strategy`; when it is genuinely absent, request the Career-owned
conservative small-batch default. Never invent a target.

Treat `communication-strategy` as optional personalization. When it is absent,
unresolved, or unavailable, pass an explicit generic-defaults selection to the
Career capabilities and continue. Never substitute remembered guidance, copy
personalization into Agentic OS, or treat missing optional personalization as a
blocker. Career owns complete generic planning defaults.

Keep the Knowledge snapshot and Career profile only in memory or in a
permission-restricted temporary file. Remove any temporary file before returning,
including on errors. Never write a profile, snapshot, token, cache, receipt,
ledger, or resumption record in Agentic OS.

Immediately before any dependent Career write, ask the installed Knowledge
interface to validate the opaque Snapshot Token. Never parse, compare, log, or
derive meaning from the token. If covered Knowledge changed, discard all derived
inputs and repeat fresh Knowledge readiness, Career readiness, lookup, mapping,
and validation once. Persistent drift returns `blocked`; never combine revisions.

When unchanged, invoke only:

```text
node main.mjs career.profile.check/v1 --input -
node main.mjs career.profile.reconcile/v1 --input -
```

Use the same opaque source revision in `snapshot.revision` and
`expected_revision`. Treat check as read-only and let Career own the safe native
delta. Never touch applications, reports, attempts, outcomes, follow-ups, offers,
observations, queues, or generated artifacts directly. Run a new
`career-system.check/v1` for all three pursue capabilities after reconciliation;
only this post-reconcile evidence authorizes pursuit.

### 3. Select eligible work

Invoke only:

```text
node main.mjs career.opportunity.select-related/v1 --input -
```

Pass a versioned request containing the optional caller-supplied opportunity
references and the resolved throughput selection. Explicit references narrow
scope but never override native eligibility, lifecycle, ownership, or
related-opportunity suppression.

Treat the native eligible set as exclusive. Preserve suppressed alternatives and
research-blocked groups exactly as references and summaries returned by Career.
Never reconstruct candidates from Career files, add suppressed work back, or use
an unattended override. Research-blocked groups remain blocked while independent
eligible groups may continue.

### 4. Advance and review through native capabilities

For eligible Agent-owned work, invoke only:

```text
node main.mjs career.opportunity.advance/v1 --input -
```

Career owns selection order, lifecycle routing, communication planning, artifact
generation, evidence checks, and safe projection writes. Agent-owned planning,
draft packs, and the internal projection that a draft now exists may proceed
without approval when the native result explicitly classifies them as safe.

For due or cold externally owned waits, invoke only:

```text
node main.mjs career.opportunity.review-waiting/v1 --input -
```

Use only confirmed native attempt and outcome evidence. The capability may
recommend waiting, draft a next route, or recommend deprioritizing or discarding.
It must not invent a reply, record an attempt, or change a factual lifecycle
state. Wait reviews do not count toward the application-throughput target.

Keep every real-world boundary approval-gated. Never submit an application, send
a message, click a final action, contact a person, record a follow-up as sent,
assert a reply or external outcome, or mark a factual real-world lifecycle change
without explicit user approval and the evidence required by Career. A draft does
not prove that an external event happened. Return required actions as human
approvals, not completed events.

If the native result surfaces a durable Knowledge signal, return it only as a
proposed capture. Any Knowledge write remains behind the installed `/capture`
approval contract and requires a fresh read before application.

Preserve every native plan, draft, safe advance, and recommendation when later
work blocks or fails. Do not delete, reset, rewrite, or roll back partial Career
work. Use only native continuation references; never create an Agentic OS cache.

### 5. Return the scoped result

Return `agentic-os.pursue.result/v1` with capability `agentic-os.pursue`. Include
fresh readiness evidence; selected, suppressed, and research-blocked references;
plans and draft packs; wait recommendations; safe Agent-owned advances; evidence
sufficiency; capacity shortfall; required human approvals; reconciliation;
proposed captures; and blocked actions. Reference native artifacts instead of
copying them and redact private profile or personalization values.

Use terminal statuses exactly:

- `completed`: every usable selected opportunity advanced safely, or a checked
  genuinely idle run found no useful work; a throughput shortfall may coexist with
  completion when every usable opportunity advanced;
- `blocked`: a recoverable prerequisite, busy state, required field, required
  capability, or persistent drift prevented safe progress;
- `incomplete`: native recovery paths ended after preserving partial work;
- `failed`: a schema, protocol, approval-boundary, or post-check invariant was
  violated.

Return one result even when pursuit stops before selection. Unresolved data blocks
only its dependent opportunity or capability. Optional personalization always
degrades to Career-owned generic defaults. Unrelated System capabilities remain
usable.

## Upskill contract

Upskill reconciles current Career demand and Knowledge-owned Upskill Mappings into
Mastery-owned Cycle Proposal lifecycles. Return a document matching
[`resources/upskill-result.schema.json`](resources/upskill-result.schema.json).
Agentic OS coordinates only the three canonical versioned System interfaces. It
does not inspect a Knowledge provider, Career reports or trackers, Mastery issues
or storage, or any System implementation module.

### 1. Establish fresh readiness

Resolve the installed Knowledge interface, configured Career System root, and
configured Mastery System root. Do not fetch, upgrade, or repair a System.

Run a fresh read-only `/setup-knowledge-system check` for
`agentic-os.upskill`. Require `knowledge.project.snapshot/v1` to be ready. From
the Career root invoke only:

```text
node main.mjs career-system.check/v1 --input -
```

Require `career.requisite.snapshot/v1`. From the Mastery root invoke only:

```text
node main.mjs setup-mastery-system check
```

Require the standalone Mastery setup result to be ready. Establish
`mastery.cycles.snapshot` availability from the valid snapshot acquired in the
next step, and establish `mastery.cycles.reconcile` availability only through its
canonical versioned result when reconciliation is needed. A missing root, unsafe
repository state, malformed result, or unavailable capability returns a blocker
scoped to `agentic-os.upskill`. Do not guess a fallback, import provider structure,
or invoke an internal System script. When readiness blocks before snapshot
acquisition completes, report summaries only for snapshots actually acquired.
An empty `snapshots` object is valid when none were acquired; never fabricate
snapshot evidence to fill an unobserved System slot. Report
`snapshot_acquisition` as `not_started`, `partial`, or `completed` to match zero,
one or two, or all three acquired summaries.

### 2. Acquire exactly three fresh snapshots

Acquire one complete input set with exactly these revisioned snapshots:

```text
node main.mjs career.requisite.snapshot/v1 --input -
knowledge.project.snapshot/v1
node main.mjs mastery.cycles.snapshot
```

Send `career.requisite.snapshot.request/v1` through the Career gateway. Send the
caller-supplied project references to the installed Knowledge interface in a
`knowledge.project.snapshot/v1` request whose caller and capability are
`agentic-os` and `agentic-os.upskill`. Never resolve a provider or infer a
project, mapping, Requisite, Capability, or project seam. Let the Knowledge
System establish those values. Treat disabled mappings as resolvable input.

Require each snapshot's exact schema, revision token, and observation time.
Require Career's native `status`, Knowledge's native `capability_status`, and
Mastery's native capability identifier `mastery.cycles.snapshot`; do not require
a status field that a System snapshot contract does not declare. Keep tokens
opaque. Do not parse, log, persist, or derive ordering from them. Keep all three
snapshots only in memory or in permission-restricted temporary files and remove
every temporary file before returning.

An unresolved Knowledge project or mapping blocks only the affected reference.
Partial Career coverage blocks mappings whose Requisite is not established, but
does not block mappings backed by a returned Requisite. An unknown Mastery
Capability blocks only its mapping. Continue independent mappings.

### 3. Build one deterministic reconciliation plan

Use `mapping_key` as the sole managed identity. Never synthesize or normalize it,
and never use a title, Capability label, project label, provider identifier, or
array position as identity. Match a mapping to Career demand only when its
Knowledge-owned Requisite key exactly equals a returned Career `requisite_key`.

For each fully resolved mapping:

- request `proposal` only when the project has `mastery_enabled` value `true`,
  the mapping is enabled, and the exact Career Requisite is current;
- request `withdrawn` when Mastery is explicitly disabled, the mapping is
  disabled, or complete Career coverage establishes that the Requisite is not
  current;
- preserve the existing Mastery lifecycle when absence, ambiguity, partial
  coverage, a missing Capability, or an invalid prerequisite prevents a safe
  decision.

Use only the Knowledge-owned Capability key as `primary_capability_id`. Use the
lexicographically first canonical project reference as `project_ref`. Render the
display-only title as `Cycle: <Capability label> in <Project name>` and pass the
Knowledge rationale unchanged.

Prerequisite edges come only from `prerequisite_mapping_keys`. Validate the full
returned mapping graph before writing. Missing keys and cycles block every
affected dependent mapping without changing its lifecycle. Order actionable
mappings with a stable topological sort: prerequisites first, then higher Career
`weighted_score`, higher `opportunity_count`, higher `prevalence`, lexical
Requisite key, and lexical `mapping_key`. Treat missing Career ranking values as
zero only when complete Career coverage safely establishes the Requisite as not
current. Never use input array order as a tiebreaker.

### 4. Revalidate and reconcile through Mastery

Immediately before a write, reacquire the Knowledge Project and Career Requisite
snapshots through the same canonical versioned interfaces and require their opaque
revision tokens to be unchanged. Equality-check tokens only; never interpret
them. If either changed, discard the entire Career, Knowledge, and Mastery input
set, rebuild all three fresh snapshots, and recompute once. Persistent drift
returns scoped blockers. Never combine snapshot revisions.

Pass the deterministic plan and the Mastery snapshot's opaque revision token to:

```text
node main.mjs mastery.cycles.reconcile --input -
```

Use `mastery.cycles.reconcile.request/v1`. Mastery alone creates or updates Cycle
Proposals, preserves active and terminal lifecycles, materializes native
dependencies, validates its revision, and writes operational state. Agentic OS
must not open, edit, close, label, rank, or link a Mastery issue directly.

Accept only `mastery.cycles.reconcile.result/v1`. Preserve every safe independent
native action if another mapping blocks. Do not retry a native write after an
ambiguous response.

### 5. Verify the full graph and return one terminal result

After reconciliation, acquire a fresh `mastery.cycles.snapshot/v1` through
`mastery.cycles.snapshot`. Verify the full returned graph, not only changed
mappings: every `mapping_key` is unique, every safe managed lifecycle matches or
is natively preserved, every nonterminal prerequisite edge is present, no
unexpected managed edge was introduced, and every native claimed write is
observable. A post-check mismatch is `failed`.

Return `agentic-os.upskill.result/v1` with a summary for every System snapshot
actually acquired, the deterministic rank, the native terminal result for every
mapping, write count, full-graph verification, and capability-scoped blockers.
After acquisition completes this is exactly three snapshot summaries. A result
that stops earlier contains only the acquired subset, including none when
readiness blocked before acquisition. Set `snapshot_acquisition` from the actual
summary count independently of terminal status. Reference native cycles instead
of copying their contents and never return revision tokens.

Use terminal statuses exactly:

- `completed`: all safe mappings reached or preserved their native lifecycle and
  the full-graph post-check passed;
- `blocked`: no write occurred and recoverable scoped blockers prevented at least
  one mapping;
- `incomplete`: safe writes were preserved but at least one mapping remains
  blocked;
- `failed`: a schema, protocol, identity, authority, native result, or full-graph
  invariant was violated.

An identical rerun after `completed` must submit the same ordered plan, receive
only native unchanged or preserved results, pass the same full-graph post-check,
report `writes` as zero, and write nothing in any System. Knowledge writes remain
behind explicit `/capture` approval, and this capability never requests capture.
Real-world Career actions remain outside this capability.
