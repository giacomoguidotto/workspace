import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateConductorState, expectedActorTitle } from './conductor-state.mjs';
import { renderGraph } from './render-graph.mjs';
import { renderGraphSection } from './upsert-graph.mjs';

function manifest(state = 'open') {
  return {
    spec: '38',
    tickets: [{
      id: '54',
      parent: '38',
      nativeSubIssue: true,
      title: 'Root',
      state,
      mode: 'afk',
      blockedBy: [],
    }],
    externalBlockers: [],
  };
}

function graphBody(inputManifest = manifest()) {
  return renderGraphSection({
    graph: renderGraph(inputManifest),
    profile: 'lean + unsupervised',
    hitlPauses: [],
  });
}

function actor(overrides = {}) {
  return {
    ticket: '54',
    role: 'implementer',
    threadId: 'thread-54',
    hostId: 'local',
    workingDirectory: '/tmp/54',
    title: '#38 · Implementer of #54',
    status: 'active',
    cleanup: 'pending',
    ...overrides,
  };
}

function state(overrides = {}) {
  const inputManifest = overrides.manifest ?? manifest();
  return {
    manifest: inputManifest,
    profile: 'lean + unsupervised',
    hitlPauses: [],
    specBody: graphBody(inputManifest),
    actors: [],
    finalIntegration: 'pending',
    blocker: null,
    ...overrides,
  };
}

test('the live graph is synchronized before any lifecycle action', () => {
  const input = state({ specBody: '# stale spec', actors: [actor()] });
  const result = evaluateConductorState(input);

  assert.equal(result.requiredAction.name, 'publish_graph');
  assert.match(result.requiredAction.expectedGraph, /#54 Root/);
});

test('every created actor receives its canonical title before waiting', () => {
  const input = state({
    actors: [actor({ title: 'Implement Root' })],
  });
  const result = evaluateConductorState(input);

  assert.equal(result.requiredAction.name, 'set_actor_titles');
  assert.deepEqual(result.requiredAction.actors, [{
    threadId: 'thread-54',
    current: 'Implement Root',
    expected: '#38 · Implementer of #54',
  }]);
  assert.equal(
    expectedActorTitle('38', { role: 'recovery', ticket: '54' }),
    '#38 · Recovery of #54',
  );
});

test('missing actor records block the watchdog', () => {
  const input = state({
    actors: [actor({ workingDirectory: '' })],
  });
  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'repair_actor_records',
  );
});

test('an actor blocker enters recovery instead of ending the run', () => {
  const input = state({
    actors: [actor({ status: 'blocked' })],
  });
  assert.deepEqual(
    evaluateConductorState(input).requiredAction,
    { name: 'recover_blockers', tickets: ['54'] },
  );
});

test('an external blocker requires an exhausted high-reasoning recovery', () => {
  const blocked = state({
    actors: [actor({ status: 'blocked' })],
    blocker: {
      external: true,
      reason: 'missing-credential',
      exhaustedAlternatives: ['no authorized token exists'],
      recoveryAttempts: [{ thinking: 'medium', outcome: 'unsolved' }],
    },
  });
  assert.equal(
    evaluateConductorState(blocked).requiredAction.name,
    'recover_blockers',
  );

  blocked.blocker.recoveryAttempts.push({
    thinking: 'high',
    outcome: 'unsolved',
  });
  assert.equal(
    evaluateConductorState(blocked).requiredAction.name,
    'external_blocker',
  );
});

test('independent work continues before a proven external blocker is surfaced', () => {
  const inputManifest = {
    ...manifest(),
    tickets: [
      ...manifest().tickets,
      {
        id: '55',
        parent: '38',
        nativeSubIssue: true,
        title: 'Independent',
        state: 'open',
        mode: 'afk',
        blockedBy: [],
      },
    ],
  };
  const input = state({
    manifest: inputManifest,
    specBody: graphBody(inputManifest),
    actors: [actor({ status: 'blocked' })],
    blocker: {
      external: true,
      reason: 'missing-credential',
      exhaustedAlternatives: ['no authorized token exists'],
      recoveryAttempts: [{ thinking: 'high', outcome: 'unsolved' }],
    },
  });

  assert.deepEqual(
    evaluateConductorState(input).requiredAction,
    { name: 'launch_tickets', tickets: ['55'] },
  );
});

test('active actors wait and ready actors integrate', () => {
  assert.equal(
    evaluateConductorState(state({ actors: [actor()] })).requiredAction.name,
    'wait',
  );
  assert.equal(
    evaluateConductorState(state({
      actors: [actor({ status: 'ready' })],
    })).requiredAction.name,
    'integrate_ready',
  );
});

test('supervised readiness pauses for exact admission', () => {
  const input = state({
    profile: 'lean + supervised',
    actors: [actor({ status: 'ready' })],
  });
  input.specBody = renderGraphSection({
    graph: renderGraph(input.manifest),
    profile: input.profile,
    hitlPauses: [],
  });

  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'supervised_approval',
  );
});

test('a ready recovery actor produces a plan instead of an integration', () => {
  const input = state({
    actors: [actor({
      role: 'recovery',
      status: 'ready',
      title: '#38 · Recovery of #54',
    })],
  });

  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'apply_recovery',
  );
});

test('an unattended frontier is dispatched', () => {
  assert.deepEqual(
    evaluateConductorState(state()).requiredAction,
    { name: 'launch_tickets', tickets: ['54'] },
  );
});

test('completion is gated by actor cleanup and final integration', () => {
  const closed = manifest('closed');
  const terminal = actor({
    status: 'terminal',
    cleanup: 'pending',
  });
  const input = state({
    manifest: closed,
    specBody: graphBody(closed),
    actors: [terminal],
  });

  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'clean_actors',
  );
  input.actors[0].cleanup = 'complete';
  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'final_integration',
  );
  input.finalIntegration = 'complete';
  assert.equal(
    evaluateConductorState(input).requiredAction.name,
    'complete',
  );
});
