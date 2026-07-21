import assert from 'node:assert/strict';
import test from 'node:test';

import { renderGraphSection, upsertGraphSection } from './upsert-graph.mjs';

const input = (overrides = {}) => ({
  body: '# Spec\n\nKeep me.',
  graph: 'flowchart LR\n  ticket_0 --> ticket_1',
  profile: 'lean + supervised',
  hitlPauses: ['#12: approve schema'],
  ...overrides,
});

test('appends one managed graph section while preserving the spec', () => {
  const result = upsertGraphSection(input());

  assert.match(result, /^# Spec\n\nKeep me\./);
  assert.match(result, /<!-- orchestrate:graph:start -->/);
  assert.match(result, /Profile: `lean \+ supervised`/);
  assert.match(result, /```mermaid\nflowchart LR/);
  assert.match(result, /- #12: approve schema/);
  assert.equal(result.split('<!-- orchestrate:graph:start -->').length - 1, 1);

  const trailing = upsertGraphSection(input({ body: '# Spec\n\n  \n' }));
  assert.match(trailing, /^# Spec\n\n  \n\n<!-- orchestrate:graph:start -->/);
});

test('replaces the managed section idempotently', () => {
  const first = upsertGraphSection(input());
  const second = upsertGraphSection(input({ body: first }));
  assert.equal(second, first);

  const replaced = upsertGraphSection(input({
    body: first,
    profile: 'deep + unsupervised',
    hitlPauses: [],
  }));
  assert.match(replaced, /Profile: `deep \+ unsupervised`/);
  assert.match(replaced, /HITL pauses: none/);
  assert.doesNotMatch(replaced, /#12: approve schema/);
  assert.match(replaced, /^# Spec\n\nKeep me\./);
});

test('rejects malformed or duplicate managed sections', () => {
  assert.throws(
    () => upsertGraphSection(input({ body: '<!-- orchestrate:graph:start -->' })),
    /zero or one balanced/,
  );
  const section = renderGraphSection(input());
  assert.throws(
    () => upsertGraphSection(input({ body: `${section}\n${section}` })),
    /zero or one balanced/,
  );
  assert.throws(
    () => upsertGraphSection(input({
      body: '<!-- orchestrate:graph:end -->\n<!-- orchestrate:graph:start -->',
    })),
    /end marker must follow/,
  );
});

test('validates publication inputs', () => {
  assert.throws(() => renderGraphSection({ graph: '', profile: 'lean' }), /graph/);
  assert.throws(
    () => renderGraphSection({ graph: 'flowchart LR', profile: 'lean', hitlPauses: [1] }),
    /array of strings/,
  );
  for (const marker of [
    '<!-- orchestrate:graph:start -->',
    '<!-- orchestrate:graph:end -->',
  ]) {
    assert.throws(
      () => renderGraphSection({ graph: `flowchart LR\n${marker}`, profile: 'lean' }),
      /must not contain orchestration graph markers/,
    );
    assert.throws(
      () => renderGraphSection({
        graph: 'flowchart LR',
        profile: 'lean',
        hitlPauses: [`#12 ${marker}`],
      }),
      /must not contain orchestration graph markers/,
    );
  }
});
