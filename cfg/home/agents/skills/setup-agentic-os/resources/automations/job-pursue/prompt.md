# Job Pursue

Run the scheduled Agentic OS pursuit capability without reproducing Knowledge or
Career System behavior in this definition.

## Contract

- Invoke only the installed `agentic-os.pursue` capability with the arguments in
  `automation.toml`.
- Treat `agentic-os.pursue.result/v1` as the complete run result. The capability
  owns its System readiness, busy-state detection, selection, native planning,
  safe projection writes, wait review, evidence checks, and result semantics.
- Do not inspect a System implementation, call a System gateway directly, or
  recreate profile, throughput, lifecycle, selection, planning, wait-review,
  Knowledge, or capture rules here.
- Keep repository roots, provider bindings, personal data, schedules, runtime
  history, and continuation state outside this source module.

## Action and evidence gates

Scheduled invocation grants no additional authority. Preserve
`evidence_sufficiency`, `required_approvals`, and `blocked_actions` from the
versioned result without weakening, reclassifying, or following them through
another path.

Plans, draft packs, and native safe advances may be reported exactly as returned.
They do not prove that an external event happened. Never submit an application,
send a message, perform outreach, contact a person, click a final action, record a
follow-up as sent, or assert a factual real-world event without the explicit user
approval and native evidence required by `agentic-os.pursue`. Any proposed
Knowledge capture remains a proposal; this automation cannot write to Knowledge.

## Safety mode

When the materialization selects the `non-publishing-no-write` validation profile,
do not invoke `agentic-os.pursue` or any System capability. Validate only that this
self-contained module resolves the installed capability, supplies the declared
arguments, accepts its versioned result contract, and retains its action and
evidence gates.

Validation cannot create or modify Career artifacts or state.
It cannot submit an application, perform outreach, send a message, contact a
person, assert a factual real-world event, publish anything, or write to
Knowledge.

## Run

1. Resolve the installed `agentic-os.pursue` capability. Do not fetch, upgrade, or
   bind it from a source checkout.
2. Invoke it once with the declared arguments.
3. Return its versioned result without reclassifying native statuses, copying
   private values, treating drafts as completed actions, or following blocked or
   approval-gated actions through another path.

## End state

Mark the scheduled run complete only when the capability returns `completed`.
Otherwise preserve its terminal status. Report native artifact references, wait
recommendations, safe advances, evidence sufficiency, capacity shortfall,
required human approvals, proposed captures, blocked actions, and verification
evidence without claiming any real-world action occurred.
