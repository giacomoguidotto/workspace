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
  assert.match(runtime, /`wait_agent` is the mandatory watchdog/);
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
  assert.match(skill, /model=gpt-5\.6-sol` and `reasoning_effort=medium/);
  assert.match(skill, /model=gpt-5\.6-luna` with `reasoning_effort=low/);
  assert.match(runtime, /Create a fresh isolated worktree/);
  assert.match(runtime, /LIFECYCLE=solo/);
  assert.match(implementer, /After qualification in `solo`, send no readiness signal/);
});

test('implementers signal reliably and only the conductor integrates', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(contract, /final response is exactly one lifecycle\nsignal/);
  assert.match(runtime, /Accept only the actor's final\nlifecycle signal/);
  assert.match(contract, /keep `direct` local/);
  assert.match(contract, /After local review qualifies/);
  assert.match(runtime, /normal non-forced\npush/);
});

test('recovery state survives target movement and terminal blockers', async () => {
  const runtime = await read('RUNTIME.md');

  assert.match(runtime, /base, target, feature, pr, head/);
  assert.match(runtime, /Keep the recorded lease unchanged/);
  assert.match(runtime, /only then atomically replace the base\nlease and ready artifact/);
  assert.match(runtime, /On `ORCH_BLOCKED`/);
  assert.match(runtime, /preserve the exact worktree, branch, and head/);
});

test('worker execution never asks the user for operational approval', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');
  const implementer = await read('IMPLEMENTER.md');

  assert.match(skill, /Worker execution permission is not a supervision axis/);
  assert.match(runtime, /## Execution permission invariant/);
  assert.match(runtime, /`approval_policy=never`/);
  assert.match(runtime, /must not use app `create_thread` worktree tasks/);
  assert.match(runtime, /`spawn_agent`/);
  assert.match(implementer, /Never request user approval/);
  assert.match(implementer, /reason=worker-permission-mismatch/);
  assert.doesNotMatch(implementer, /Assign the ticket/);
  assert.doesNotMatch(implementer, /send_message_to_thread/);
});

test('reasoning starts lean and escalates once on evidence', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(contract, /ORCH_ESCALATE/);
  const medium = runtime.indexOf('reasoning_effort=medium');
  const request = runtime.indexOf('ORCH_ESCALATE');
  const high = runtime.indexOf('reasoning_effort=high');

  assert.ok(medium >= 0 && medium < request && request < high);
  assert.equal(runtime.match(/reasoning_effort=high/g)?.length, 1);
  assert.match(runtime, /A second request is blocked/);
  assert.match(runtime, /Consume only\s+remaining review passes/);
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

test('actor names retain stable spec and role identity', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');

  assert.match(skill, /`spec_<spec-id>_conductor`/);
  assert.match(runtime, /`spec_\{\{SPEC_ISSUE\}\}_issue_<issue-id>`/);
  assert.match(runtime, /Returning the signal terminates this internal conductor/);
  assert.match(skill, /no matching actor remains\nlive/);
});
