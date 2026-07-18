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

  assert.match(skill, /confirm the conductor entered its\s+mandatory wait/);
  assert.match(skill, /active and not idle while work is\nunfinished/);
});

test('task titles use the strict spec and role format', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');

  assert.match(skill, /`#<spec-id> · Orchestrator` exactly/);
  assert.doesNotMatch(skill, /<repo> Spec #<id> · Orchestrator/);
  assert.match(
    runtime,
    /`#\{\{SPEC_ISSUE\}\} · Implementer of #<issue-id>` exactly/,
  );
  assert.doesNotMatch(runtime, /#<id> Implement · <short title>/);
});

test('Codex review is bounded and cannot become a fixed-point loop', async () => {
  for (const name of ['DIRECT.md', 'PROMPTS.md']) {
    const contract = await read(name);

    assert.match(contract, /at most two Codex passes per PR/);
    assert.match(contract, /Never request a third pass/);
    assert.match(
      contract,
      /Never request the same SHA again after a\n   terminal result/,
    );
    assert.match(
      contract,
      /No fresh Codex review is required after second-pass fixes/,
    );
    assert.doesNotMatch(contract, /Fix every valid finding/);
  }

  const runtime = await read('RUNTIME.md');
  assert.match(runtime, /exhausted Codex budget is\nterminal/);
});
