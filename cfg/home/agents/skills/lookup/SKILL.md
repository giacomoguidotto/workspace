---
name: lookup
description: Look up live KB context from the Knowledge Bank without writing. Use when a task or automation needs scoped KB context, or when unresolved knowledge needs clarification before the caller can continue.
---

# Lookup

## Purpose

Lookup is a read-only retrieval primitive for the Knowledge Bank. It returns
scoped KB context by default and clarifies unresolved knowledge only when the
caller asks for that detour. It never writes.

Lookup is provider-agnostic. It talks to whatever KB provider connector the
harness exposes; the caller's binding names the provider.

## Branches

- `context`: retrieve relevant KB context for the caller.
- `clarification`: build a caller-relevant question queue, then ask the user one
  question at a time.

## Workflow

### 1. Set Scope

Identify the caller's objective, the endpoints it needs, and the branch. An
endpoint is a named context surface or rule-set (selected projects, public-safe
claim source, portfolio change rules, and so on); the caller declares which ones
it reads. Resolve each endpoint to a KB location live rather than assuming a
fixed page.

Completion criterion: the branch, the endpoints in scope, the KB anchors found
for them, and any connector limits are stated.

### 2. Search Live KB

Use the KB provider connector and fetch likely pages before judging them. Search
from the caller's objective outward: endpoint owners, parent/child pages,
relations, project pages, and relevant sibling examples.

Look for:

- relevant canonical facts for the caller's task
- page ownership and placement context
- status, dates, markers, or properties the caller asked lookup to consider
- evidence that the caller's task depends on a missing, stale, or ambiguous fact
- related pages that help avoid duplicate or contradictory context

Do not broaden into caller-irrelevant audits. Lookup supplies the retrieval
pattern; callers supply their own signal policy.

Completion criterion: every retained source has fetched KB evidence, external
evidence, or an explicit `unverified` note, and every searched area is tied to
the caller's objective.

### 3. Compare External Evidence

Compare external evidence only when the caller asks for it or the endpoint
requires it. For project drift, compare the project page with recent local git
history when the clone is available, or remote history when it is not. Ignore
mechanical churn unless it changes durable project state.

Completion criterion: every external comparison states whether it produced
relevant context, a candidate gap, or no durable signal.

### 4. Classify

Give each retained candidate the smallest useful state:

- `relevant`: context the caller can use now.
- `missing`: the KB lacks a fact the evidence implies.
- `stale`: the KB states an old current state.
- `scheduled`: a dated task, deadline, or caller-defined time signal is due or past.
- `deferred`: a caller-defined marker or question has a future date.
- `already-handled`: the canonical page already holds the resolved state.
- `uncertain`: the evidence is too weak or ambiguous to classify further.

Each state routes to the return packet: `relevant` feeds Context or Answered;
`missing`, `stale`, and `uncertain` feed Gaps; `scheduled` and `deferred` feed
marker candidates; `already-handled` needs no action.

Two answer outcomes exist only in the clarification branch:

- `discard`: the user says the finding is not worth carrying forward; no write.
- `final-form`: the user says the topic should not be questioned again; produce a
  final form marker candidate.

Do not use local automation state to suppress knowledge questions. The KB is the
ledger; unresolved questions may be found again.

Completion criterion: every retained item has one classification, one short
rationale, and a next action.

### 5. Return Context

For the `context` branch, return a compact lookup packet:

```md
Sources:
- <KB page/search/external source>

Context:
- <fact or page-specific context the caller can use>

Gaps:
- <missing/stale/uncertain item, only if relevant to the caller>

Use:
- <how this should affect the caller's next step>
```

Do not ask a clarification question from this branch unless the caller allowed
clarification and the gap blocks the task.

Completion criterion: the caller has enough KB context to continue, or the
blocking gap is explicit.

### 6. Clarify Gaps

For the `clarification` branch, build the complete question queue before asking.
Group questions by the caller's register and priority policy. With no policy,
order the queue:

1. Blocking gaps for the caller's current task.
2. Due caller-defined markers or dated signals.
3. Externally evidenced mismatches.
4. Personal or identity-level questions.
5. Other missing, stale, or low-confidence candidates.

Before the first question, state the total queue count and the first group. Run
the queue like a `grill-me` decision tree: ask one question, wait for the answer,
classify it, then choose the next branch. If an answer raises a more important
follow-up, ask that follow-up before the next queued item. Do not dump the full
queue unless asked.

Use a soft cap of 10 questions per sitting unless the caller sets another limit.
At the cap, state how many remain and ask whether to continue or defer.

Completion criterion: every queued item is answered, deferred, discarded,
converted into a final form marker candidate, or left as an explicit unresolved
question.

### 7. Return Clarification Results

Return structured results to the caller. Lookup does not choose the downstream
write workflow. For marker candidates, use the marker formats in
[knowledge-bank-conventions.md](../../docs/knowledge-bank-conventions.md).

```md
Answered updates:
- <durable KB update candidate>

Follow-up marker candidates:
- <date, target, prompt, rationale>

Final form marker candidates:
- <target, scope, rationale>

Discarded:
- <finding discarded without KB trace>

Unresolved:
- <question still open>
```

Completion criterion: the caller can hand the result to its own approval, write,
or planning flow without hidden context.

## Rules

- The KB is canonical; repo docs and local state are routing surfaces.
- Skip final form sections entirely unless the user explicitly reopens them.
- Read broadly enough to satisfy the caller, but fetch only plausible sources.
- Never write to the KB from lookup.
- Do not invent exact dates from relative phrases.
- Do not duplicate KB knowledge into local state.
- If the caller makes lookup stateful, treat local state as replaceable hints:
  deleting it must make lookup slower, not less correct.
