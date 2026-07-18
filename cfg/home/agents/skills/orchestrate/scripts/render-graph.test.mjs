import assert from 'node:assert/strict';
import test from 'node:test';

import { renderGraph } from './render-graph.mjs';

const manifest = () => ({
  spec: '1234',
  tickets: [
    {
      id: '43',
      parent: '1234',
      title: 'Root',
      state: 'open',
      mode: 'afk',
      blockedBy: [],
    },
    {
      id: '44',
      parent: '1234',
      title: 'Child A',
      state: 'open',
      mode: 'afk',
      blockedBy: ['43'],
    },
    {
      id: '46',
      parent: '1234',
      title: 'Child B',
      state: 'open',
      mode: 'afk',
      blockedBy: ['43'],
    },
  ],
  externalBlockers: [],
});

test('renders blockers toward the tickets they unlock', () => {
  const graph = renderGraph(manifest());

  assert.match(graph, /^flowchart LR/);
  assert.match(graph, /ticket_0\["#43 Root<br\/>AFK · open"\]/);
  assert.match(graph, /ticket_0 --> ticket_1/);
  assert.match(graph, /ticket_0 --> ticket_2/);
  assert.match(graph, /class ticket_0 frontier/);
  assert.match(graph, /class ticket_1 blocked/);
});

test('renders HITL tickets as pause points', () => {
  const input = manifest();
  input.tickets[0].mode = 'hitl';

  const graph = renderGraph(input);
  assert.match(graph, /ticket_0\["#43 Root<br\/>HITL · open"\]/);
  assert.match(graph, /class ticket_0 hitl/);
  assert.doesNotMatch(graph, /class ticket_0 frontier/);
});

test('renders and classifies external blockers', () => {
  const input = manifest();
  input.tickets[0].blockedBy = ['other/repo#7'];
  input.externalBlockers = [{ id: 'other/repo#7', state: 'closed' }];

  const graph = renderGraph(input);
  assert.match(graph, /external_0\["other\/repo#7<br\/>external closed"\]/);
  assert.match(graph, /external_0 --> ticket_0/);
  assert.match(graph, /class external_0 externalClosed/);
});

test('escapes ticket labels for Mermaid', () => {
  const input = manifest();
  input.tickets[0].title = 'Parse "A" < B & C';

  assert.match(renderGraph(input), /Parse &quot;A&quot; &lt; B &amp; C/);
});

test('rejects an invalid graph before rendering', () => {
  const input = manifest();
  input.tickets[0].blockedBy = ['44'];

  assert.throws(() => renderGraph(input), /dependency cycle/);
});
