# Job Scout

Run the scheduled Agentic OS scouting capability without reproducing Knowledge or
Career System behavior in this definition.

## Contract

- Invoke only the installed `agentic-os.scout` capability with the arguments in
  `automation.toml`.
- Treat `agentic-os.scout.result/v1` as the complete run result. The capability
  owns its System readiness, coordination, recovery, safety, and result semantics.
- Do not inspect a System implementation, call a System gateway directly, or
  recreate discovery, evaluation, profile, Knowledge, or capture rules here.
- Keep repository roots, provider bindings, personal data, schedules, runtime
  history, and continuation state outside this source module.

## Safety mode

When the materialization selects the `non-publishing-no-write` validation profile,
do not invoke `agentic-os.scout` or any System capability. Validate only that this
self-contained module resolves the installed capability, supplies the declared
arguments, and accepts its versioned result contract.

Validation cannot create or modify Career artifacts or state.
It cannot submit an application, perform outreach, send a message, publish
anything, or write to Knowledge.

## Run

1. Resolve the installed `agentic-os.scout` capability. Do not fetch, upgrade, or
   bind it from a source checkout.
2. Invoke it once with the declared target.
3. Return its versioned result without reclassifying native statuses, copying
   private values, or following blocked actions through another path.

## End state

Mark the scheduled run complete only when the capability returns `completed`.
Otherwise preserve its terminal status and report its successful count, native
artifact references, proposed captures, blockers, and verification evidence.
