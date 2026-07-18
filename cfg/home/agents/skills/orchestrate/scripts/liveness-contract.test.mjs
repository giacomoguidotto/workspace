import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(name) {
  return readFile(new URL(name, root), 'utf8');
}

test('conductor cannot idle with unfinished work', async () => {
  const runtime = await read('RUNTIME.md');

  assert.match(runtime, /## Liveness invariant/);
  assert.match(runtime, /wait_threads` is the mandatory\nwatchdog/);
  assert.match(runtime, /must never become idle/);
});

test('every implementer requires acknowledged signal delivery', async () => {
  for (const name of ['DIRECT.md', 'PROMPTS.md']) {
    const contract = await read(name);

    assert.match(contract, /send_message_to_thread/);
    assert.match(contract, /Delivery is complete\nonly when the tool reports success/);
    assert.match(contract, /reason=signal-delivery-failed/);
  }
});

test('launcher verifies conductor liveness before returning', async () => {
  const skill = await read('SKILL.md');

  assert.match(skill, /confirm the conductor entered its mandatory\nwait/);
  assert.match(skill, /active and not idle while work is\nunfinished/);
});
