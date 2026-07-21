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
  assert.match(runtime, /`wait_threads` is the mandatory watchdog/);
  assert.match(runtime, /must never become idle/);
});

test('launcher publishes only a freshly revalidated accepted graph', async () => {
  const skill = await read('SKILL.md');

  assert.match(skill, /## 4\. Publish the accepted graph/);
  assert.match(skill, /Structural or delivery-evidence drift returns\nto the launch gate/);
  assert.match(skill, /require its body and\n`updatedAt` to match/);
  assert.match(skill, /scripts\/upsert-graph\.mjs/);
  assert.match(skill, /live spec contains exactly one verified managed/);
});

test('profile axes and automatic delivery stay orthogonal', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');

  for (const value of ['lean', 'deep', 'supervised', 'unsupervised']) {
    assert.match(skill, new RegExp(value));
  }
  assert.match(runtime, /## Select delivery/);
  assert.match(runtime, /Any uncertainty, PR-only check, or parallel frontier selects `pr`/);
});

test('multi-ticket runs use fresh workers and solo runs use one lifecycle actor', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');
  const implementer = await read('IMPLEMENTER.md');

  assert.match(skill, /exactly one unfinished ticket exists and it is launchable AFK/);
  assert.match(skill, /model=gpt-5\.6-sol` and `thinking=medium/);
  assert.match(skill, /model=gpt-5\.6-luna` and `thinking=low/);
  assert.match(runtime, /Create a fresh worktree actor/);
  assert.match(runtime, /LIFECYCLE=solo/);
  assert.match(implementer, /After qualification in `solo`, send no readiness signal/);
});

test('implementers signal reliably and only the conductor integrates', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(contract, /send_message_to_thread/);
  assert.match(contract, /Delivery is complete only when\nthe tool reports/);
  assert.match(contract, /reason=signal-delivery-failed/);
  assert.match(contract, /watchdog recovers it from task completion/);
  assert.match(contract, /keep `direct` local/);
  assert.match(contract, /After local review qualifies/);
  assert.match(runtime, /normal non-forced\npush/);
});

test('reasoning starts lean and escalates once on evidence', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(runtime, /thinking=medium/);
  assert.match(contract, /ORCH_ESCALATE/);
  assert.match(runtime, /thinking=high/);
  assert.match(runtime, /A second request is blocked/);
  assert.match(runtime, /Consume only remaining\nreview passes/);
});

test('one review contract owns the bounded local review gate', async () => {
  const review = await read('REVIEW.md');
  const implementer = await read('IMPLEMENTER.md');

  assert.match(review, /at most two review passes/);
  assert.match(review, /coderabbit review --agent --light/);
  assert.match(review, /Request no third review/);
  assert.match(review, /substitute one reviewer in `lean` and two/);
  assert.match(implementer, /Read \{\{REVIEW_PATH\}\} fully/);
});

test('task titles retain the strict spec and role format', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');

  assert.match(skill, /`#<spec-id> · Orchestrator`/);
  assert.match(runtime, /`#\{\{SPEC_ISSUE\}\} · Implementer of #<issue-id>`/);
});
