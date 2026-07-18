import assert from 'node:assert/strict';
import test from 'node:test';

import { GraphValidationError, validateGraph } from './validate-graph.mjs';

const manifest = () => ({
  spec: '1234',
  tickets: [
    {
      id: '43',
      parent: '1234',
      nativeSubIssue: true,
      title: 'Root',
      state: 'open',
      mode: 'afk',
      blockedBy: [],
    },
    {
      id: '44',
      parent: '1234',
      nativeSubIssue: true,
      title: 'Child A',
      state: 'open',
      mode: 'afk',
      blockedBy: ['43'],
    },
    {
      id: '46',
      parent: '1234',
      nativeSubIssue: true,
      title: 'Child B',
      state: 'open',
      mode: 'afk',
      blockedBy: ['43'],
    },
  ],
  externalBlockers: [],
});

test('reports the complete frontier', () => {
  assert.deepEqual(validateGraph(manifest()).frontier, ['43']);
  assert.deepEqual(validateGraph(manifest()).launchable, ['43']);

  const next = manifest();
  next.tickets[0].state = 'closed';
  assert.deepEqual(validateGraph(next).frontier, ['44', '46']);
});

test('requires tickets and binds each one to the spec', () => {
  const empty = manifest();
  empty.tickets = [];
  assert.throws(() => validateGraph(empty), /non-empty array/);

  const foreign = manifest();
  foreign.tickets[0].parent = '999';
  assert.throws(() => validateGraph(foreign), /expected 1234/);
});

test('requires every implementation ticket to be a native sub-issue', () => {
  const input = manifest();
  input.tickets[0].nativeSubIssue = false;
  delete input.tickets[2].nativeSubIssue;

  assert.throws(
    () => validateGraph(input),
    /tickets 43, 46 are not native sub-issues of spec 1234/,
  );
});

test('reports HITL as a pause frontier instead of launchable work', () => {
  const input = manifest();
  input.tickets[0].mode = 'hitl';

  const result = validateGraph(input);
  assert.deepEqual(result.frontier, ['43']);
  assert.deepEqual(result.launchable, []);
  assert.deepEqual(result.hitlFrontier, ['43']);
  assert.deepEqual(result.blocked, ['44', '46']);

  input.tickets[0].state = 'closed';
  const resumed = validateGraph(input);
  assert.deepEqual(resumed.hitlFrontier, []);
  assert.deepEqual(resumed.launchable, ['44', '46']);
});

test('accepts HILT as an alias for HITL', () => {
  const input = manifest();
  input.tickets[0].mode = 'hilt';
  assert.deepEqual(validateGraph(input).hitlFrontier, ['43']);
});

test('requires every ticket to declare AFK or HITL mode', () => {
  const input = manifest();
  delete input.tickets[0].mode;
  assert.throws(() => validateGraph(input), /invalid mode/);
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
