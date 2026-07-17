import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphValidationError, validateGraph } from './validate-graph.mjs';

const manifest = () => ({
  spec: '1234',
  tickets: [
    { id: '43', title: 'Root', state: 'open', blockedBy: [] },
    { id: '44', title: 'Child A', state: 'open', blockedBy: ['43'] },
    { id: '46', title: 'Child B', state: 'open', blockedBy: ['43'] },
  ],
  externalBlockers: [],
});

test('reports the complete frontier', () => {
  assert.deepEqual(validateGraph(manifest()).frontier, ['43']);

  const next = manifest();
  next.tickets[0].state = 'closed';
  assert.deepEqual(validateGraph(next).frontier, ['44', '46']);
});

test('accepts a declared closed external blocker', () => {
  const input = manifest();
  input.tickets[0].blockedBy = ['other/repo#7'];
  input.externalBlockers = [{ id: 'other/repo#7', state: 'closed' }];
  assert.deepEqual(validateGraph(input).frontier, ['43']);
});

test('keeps an open external dependency out of the frontier', () => {
  const input = manifest();
  input.tickets[0].blockedBy = ['other/repo#7'];
  input.externalBlockers = [{ id: 'other/repo#7', state: 'open' }];
  const result = validateGraph(input);
  assert.deepEqual(result.frontier, []);
  assert.deepEqual(result.externalOpen, ['other/repo#7']);
});

test('rejects unknown blockers', () => {
  const input = manifest();
  input.tickets[1].blockedBy = ['999'];
  assert.throws(() => validateGraph(input), GraphValidationError);
});

test('rejects dependency cycles', () => {
  const input = manifest();
  input.tickets[0].blockedBy = ['44'];
  assert.throws(() => validateGraph(input), /dependency cycle/);
});

test('rejects duplicate tickets', () => {
  const input = manifest();
  input.tickets.push({ ...input.tickets[0] });
  assert.throws(() => validateGraph(input), /duplicate ticket/);
});

test('rejects a non-array blockedBy value', () => {
  const input = manifest();
  input.tickets[0].blockedBy = '43';
  assert.throws(() => validateGraph(input), /blockedBy must be an array/);
});
