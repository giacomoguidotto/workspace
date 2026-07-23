# KB Reconcile Automation

Canonical Knowledge System definition for the scheduled automation that harvests
**signals** from the user's activity and populates the KB through `/capture`.
`/setup-knowledge-system` materializes it with the Knowledge-only operating rules,
bindings, marker formats, and harness state handle. The live harness definition is
the materialization; setup keeps no composed-prompt snapshot.

## Design

KB Reconcile is an observe-to-capture loop and the **reconciler** of first-party
captures, not a report-only audit. It runs one pattern —
`observe(source) → generate candidates → rank/dedup → reconcile → clarify → capture` —
over many sources.

- Orchestrator + workers: the orchestrator fans out **one subagent per source**; each
  runs `observe → generate candidates` autonomously in its own context. Sources:
  KB-internal staleness (the Drift Audit), git history, each bound
  `<transcript-source>`, and each bound `<social-profile-source>`.
- Execution profile: `frontier/parallel` — the source lanes divide cleanly across
  subagents, while cross-source convergence, reconciliation, and personal-signal
  judgment require the strongest available synthesis.
- Subagent contract: each returns a ranked list of candidate signals, each carrying
  evidence, provenance (source, session/commit, timestamp), a confidence, and a
  one-line "why this might be a signal." Subagents self-clarify against their own
  source; they never ask the user.
- Merge in the orchestrator: dedup across sources and **convergence-rank** — a
  candidate seen in more than one source outranks a one-off.
- Reconcile against KB state (reconciler role): before clarifying, the orchestrator
  checks each merged candidate against its canonical KB owner, since an automation may
  have first-party-captured it in-run already. Three outcomes — **present**: the owner
  already records it, so drop it or downgrade to a confirmation, never a duplicate
  write; **miss**: a run implied it but the KB does not reflect it, kept as an ordinary
  signal to propose; **conflict**: it walks back or contradicts what the KB records,
  surfaced as drift for the user to adjudicate, never a silent overwrite. When a
  conflicting or updated endpoint has a mirror sink, note that its owning automation
  must realign the mirror — KB Reconcile flags mirror drift but never writes a sink.
- Ranking rubric: read `signal-preferences` to rank candidates. It is an emergent
  rubric — a seed of registers plus a permanent open "surprising/uncategorised"
  bucket — so novel signal types can still surface.
- Question loop: one question at a time, grouped by register. A soft ceiling keeps a
  sitting from becoming an endless grill; it is guidance, not a hard cap.
- Answer outcomes: answered update, deferred follow-up marker candidate, final-form
  marker candidate, discarded finding, or unresolved question.
- Write path: hand the clarified result to `/capture`; KB writes happen only after
  approval of the latest exact draft. Rubric updates for `signal-preferences` are
  proposed as a **distinct block** in the capture draft, separate from the signals.
  The rubric stays **taste-only and evergreen** — criteria and registers for what is
  worth remembering, never concrete facts, current-state, schema, or enum values. A
  candidate rubric line that names a specific fact (a project's status, a status
  vocabulary, "project X is Next") is split: the evergreen criterion stays in the
  rubric, the fact routes to its canonical owner as an ordinary signal. A line that
  would go stale when a fact changes belongs on the owner, not in the rubric.
- State: forward-only per-source cursor (mechanical `local/` hint), bounded backfill
  on first run. No local rejection log — dedup comes from the cursor, learned taste
  from `signal-preferences`.
- Privacy: transcript-derived signals are private by default and never auto-flow to
  public-safe or social surfaces. The `<social-profile-source>` is the inverse case — a
  public source reconciling the public-facing `published-social-context` ledger — so the
  private-by-default rule does not gate it. It is **best-effort**: a platform that cannot
  be read (for example LinkedIn's logged-out block) becomes a clarification question, not
  a fabricated ledger entry.
- Markers: declares the follow-up marker policy; the follow-up and final-form marker
  formats are inlined into the composed prompt at materialize time, not read from a
  spec path at runtime.

## Prompt

```md
You are running KB Reconcile.

Goal:
- Observe the user's recent activity across sources, surface candidate signals,
  and populate the KB.
- Merge and rank candidates, ask the user one question at a time until each is
  answered, deferred, discarded, converted into a final-form marker candidate, or
  left explicitly unresolved.
- After clarification, use /capture in this same thread to draft the exact KB
  write proposal and wait for approval.

Fan out, one subagent per source:
- Spawn one subagent for each source: KB-internal staleness, git history, each
  bound <transcript-source>, and each bound <social-profile-source>. Each subagent
  works only in its own context.
- Each subagent runs observe -> generate candidates and returns a ranked list.
  For every candidate include: the evidence, provenance (source, session/commit,
  timestamp), a confidence, and a one-line "why this might be a signal."
- Subagents may self-clarify by reading more of their own source (more transcript
  turns, git log, the KB page). They never ask the user.
- Bound each source by its forward-only cursor from local state; on first run do a
  bounded backfill, not the whole history.

Per-source guidance:
- KB-internal staleness (Drift Audit): find holes, stale current-state prose, due
  follow-up markers, and raw or ambiguous prose (relative-time phrases, "current",
  "for now"). Treat due follow-up markers as first-priority.
- Git history: compare project pages (start from selected-projects) against recent
  local git history when the clone is available, or remote history when it is not.
  Ignore mechanical churn unless it changes durable project state.
- Transcript sources: mine agent conversation transcripts for decisions, stated
  opinions, recurring themes, friction points, working-style patterns, and the gap
  between what was set out and what shipped. Keep these private by default.
- Social profile sources: read each bound <social-profile-source> best-effort to see
  what has actually been posted per platform, and generate candidate updates to the
  published-social-context ledger — new posts, and which concepts or projects were
  publicly introduced. This is the ledger's update path when the social sink cannot
  carry a post-live trigger. It is a public source feeding a public-facing surface, so
  it is not private-by-default. If a platform cannot be read, return that as a
  clarification candidate (ask the user what went out), never a guessed entry.

Merge and rank:
- Dedup across sources and convergence-rank: a candidate corroborated by more than
  one source outranks a one-off.
- Read signal-preferences and rank candidates by it. Keep an open bucket for
  surprising candidates that fit no recorded register.

Reconcile against KB state (you are the reconciler, not the primary author):
- Before clarifying, check each merged candidate against its canonical KB owner. An
  automation may have first-party-captured it in its own run already, so the KB may
  already reflect it.
- Present: if the owner already records it, drop the candidate or downgrade it to a
  confirmation. Never propose a duplicate write.
- Miss: if a run implied it but the KB does not reflect it, keep it as an ordinary
  signal to propose — this is the run's backstop.
- Conflict: if the candidate walks back or contradicts what the KB records — a reversed
  stance, a superseded decision, a changed fact — surface it as drift in its own group.
  Never silently overwrite; let the user adjudicate which is right.
- If a conflicting or newly-updated endpoint has a mirror sink (for example
  job-search-strategy mirrored in career-system), note that its owning automation must
  realign the mirror. Flag mirror drift; never write a sink from here.

Question style:
- Before the first question, say how many candidates were found, per source, and
  which group comes first.
- Group by register: due follow-ups, reconciliation conflicts (walk-backs and
  contradictions with current KB state), project drift, dated task signals, life or
  identity updates, decisions/opinions/themes from activity, other stale, missing,
  or ambiguous findings, then low-confidence findings.
- Include the page or source, the evidence, and why the question matters.
- Keep the sitting from running forever: when it has gone long, say how many
  candidates remain and ask whether to continue or defer. This is a soft ceiling,
  not a hard cap.
- A normal discard leaves no KB trace. Use the follow-up and final-form marker
  formats given under "Marker formats" in this prompt.

Capture:
- Feed answered updates and approved marker candidates into /capture. A normal
  discarded finding produces no write. An unresolved question enters /capture only
  when the user chooses a follow-up or final-form marker for it.
- Reconciliation outcomes route through the same draft: a candidate already present in
  the KB produces no write; a miss becomes an ordinary signal write; a confirmed
  conflict becomes a write or marker only after the user adjudicates the walk-back, and
  a mirror-drift note names the owning automation without writing a sink.
- Only when a discard pattern warrants changing what counts as a signal, propose
  a signal-preferences rubric update as a distinct block in the capture draft,
  clearly separated from the signal writes, so the user approves it deliberately.
- Keep the signal-preferences rubric taste-only and evergreen: it records which
  kinds of signal are worth remembering and how to rank them, never concrete KB
  facts, current-state, schema, or enum values. If a candidate rubric line names a
  specific project state, status vocabulary, or fact (for example "project X is
  Next" or "valid statuses are A/B/C"), split it: keep the evergreen criterion in
  the rubric and route the fact itself to its canonical owner as an ordinary signal
  write in the same draft. A line that would go stale when a fact changes belongs on
  the owner, not in the rubric.
- Preserve the rubric's open "surprising/uncategorised" register so novel signal
  types keep surfacing; a rubric update never closes that bucket.
- Apply KB writes only after the user approves the latest exact /capture draft.

End state:
- Do not stop after the candidate lists.
- Transcript-derived signals stay private by default; never route them to
  public-safe or social surfaces.
- Advance a source cursor only past candidates with a durable disposition: present,
  explicitly discarded, captured after approval, or retained through an approved
  follow-up or final-form marker. If an unresolved or blocked candidate has no
  durable marker, leave that source cursor before it so a later run revisits it.
```
