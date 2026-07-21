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

test('conductor and implementers use separate fresh Codex tasks', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');

  assert.match(skill, /separate fresh Codex\s+task/);
  assert.match(skill, /`create_thread`/);
  assert.match(skill, /model=gpt-5\.6-luna`\s+with `thinking=low/);
  assert.doesNotMatch(skill, /spawn_agent/);
  assert.match(runtime, /environment=`worktree`/);
  assert.match(runtime, /`model=gpt-5\.6-sol`\s+and\s+`thinking=medium`/);
  assert.doesNotMatch(runtime, /spawn_agent/);
});

test('implementers signal reliably and only the conductor integrates', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(contract, /`send_message_to_thread`/);
  assert.match(contract, /retry delivery twice/);
  assert.match(contract, /source conductor task/);
  assert.match(runtime, /Accept\s+only the actor's final lifecycle signal/);
  assert.match(contract, /keep `direct` local/);
  assert.match(contract, /After local review qualifies/);
  assert.match(runtime, /normal non-forced\npush/);
});

test('recovery state survives target movement and terminal blockers', async () => {
  const runtime = await read('RUNTIME.md');

  assert.match(runtime, /base, target, feature, pr, head/);
  assert.match(runtime, /Keep the recorded lease unchanged/);
  assert.match(runtime, /only\s+then atomically replace the base\s+lease and ready artifact/);
  assert.match(runtime, /On `ORCH_BLOCKED`/);
  assert.match(runtime, /preserve the exact task, worktree, branch, and head/);
  assert.match(runtime, /clientThreadId/);
  assert.match(runtime, /restore the prior assignment and pre-lease state/);
  assert.match(runtime, /Never retry while an orphaned lease may exist/);
  assert.match(runtime, /invalidate the READY artifact/);
});

test('worker execution never asks the user for operational approval', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');
  const implementer = await read('IMPLEMENTER.md');

  assert.match(skill, /Worker execution permission is not a supervision axis/);
  assert.match(runtime, /## Execution permission invariant/);
  assert.match(runtime, /`approval_policy=never`/);
  assert.match(runtime, /`sandbox_mode=danger-full-access`/);
  assert.match(runtime, /enabled network access/);
  assert.match(runtime, /`create_thread`/);
  assert.match(implementer, /Never request user\s+approval/);
  assert.match(implementer, /reason=worker-permission-mismatch/);
  assert.doesNotMatch(implementer, /Assign the ticket/);
});

test('reasoning starts lean and escalates once on evidence', async () => {
  const contract = await read('IMPLEMENTER.md');
  const runtime = await read('RUNTIME.md');

  assert.match(contract, /ORCH_ESCALATE/);
  const medium = runtime.indexOf('thinking=medium');
  const request = runtime.indexOf('ORCH_ESCALATE');
  const high = runtime.indexOf('thinking=high');

  assert.ok(medium >= 0 && medium < request && request < high);
  assert.equal(runtime.match(/thinking=high/g)?.length, 1);
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

  assert.match(skill, /`#<spec-id> · Orchestrator`/);
  assert.match(runtime, /`#\{\{SPEC_ISSUE\}\} · Implementer of #<issue-id>`/);
  assert.match(runtime, /archive the implementer task/);
  assert.match(skill, /archive the conductor\s+task/);
  assert.match(skill, /completion, approval, HITL pause,\s+structural drift, or a concrete blocker/);
});
