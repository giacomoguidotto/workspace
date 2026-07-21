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
  assert.match(skill, /Structural or\s+delivery-evidence drift returns\s+to the launch gate/);
  assert.match(skill, /require its body and `updatedAt` to\s+match/);
  assert.match(skill, /scripts\/upsert-graph\.mjs/);
  assert.match(skill, /live spec contains exactly one verified managed/);
  assert.match(skill, /complete graph-input snapshot/);
  assert.match(skill, /implementation\s+targets,\s+target\s+bindings,\s+branches,\s+rules,\s+and\s+PR\s+state/);
  assert.match(skill, /exclusive per-spec mutation lease/);
  assert.match(skill, /hold\s+it through verification, publication, and post-write reconciliation/);
  assert.match(skill, /Release the\s+lease only after successful reconciliation/);
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
  assert.match(runtime, /type: 'worktree'/);
  assert.match(runtime, /model: 'gpt-5\.6-sol'/);
  assert.match(runtime, /thinking: 'medium'/);
  assert.doesNotMatch(runtime, /spawn_agent/);
});

test('launcher exits after terminal handoff and never shadow-conducts', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');
  const launch = skill.slice(skill.indexOf('## 5. Launch'));

  assert.match(launch, /`ORCH_LAUNCHED spec=ID conductor=THREAD_ID host=HOST_ID`/);
  assert.match(launch, /exit immediately/);
  assert.doesNotMatch(launch, /Wait for its first checkpoint/);
  assert.doesNotMatch(launch, /Return the conductor's final signal/);
  assert.doesNotMatch(launch, /archive the conductor/);
  assert.match(runtime, /sole post-handoff owner/);
  assert.match(runtime, /archive\s+this\s+conductor\s+task/);
});

test('task launch uses the exact nested app schema and self-corrects shape errors', async () => {
  const runtime = await read('RUNTIME.md');
  const launchCall = runtime.match(
    /await tools\.codex_app__create_thread\(\{[\s\S]*?target:\s*\{[\s\S]*?type: 'project',[\s\S]*?projectId: targetProjectId,[\s\S]*?environment:\s*\{[\s\S]*?type: 'worktree',[\s\S]*?startingState:\s*\{ type: 'branch', branchName: targetBranch \},[\s\S]*?\},[\s\S]*?\},[\s\S]*?\}\)/,
  );

  assert.ok(launchCall, 'expected one complete nested create_thread payload');
  assert.match(launchCall[0], /model: 'gpt-5\.6-sol'/);
  assert.match(launchCall[0], /thinking: 'medium'/);
  assert.match(runtime, /Read the current tool declaration/);
  assert.match(runtime, /API-shape\s+error before a\s+task exists/);
  assert.match(runtime, /does not consume ticket retry or\s+escalation budget/);
});

test('ledger and implementation targets stay distinct, including empty repositories', async () => {
  const skill = await read('SKILL.md');
  const runtime = await read('RUNTIME.md');
  const implementer = await read('IMPLEMENTER.md');

  assert.match(skill, /ledger repository/);
  assert.match(skill, /implementation target/);
  assert.match(runtime, /`ZERO_SHA`/);
  assert.match(runtime, /type: 'projectless'/);
  assert.match(runtime, /target-specific validation command/);
  assert.match(implementer, /\{\{LEDGER_REPOSITORY\}\}/);
  assert.match(implementer, /\{\{TARGET_REPOSITORY\}\}/);
  assert.match(implementer, /\{\{TARGET_BASE\}\}/);
  assert.match(implementer, /target repository is still empty/);
  assert.match(implementer, /reviewBase=\$\(git hash-object -t tree \/dev\/null\)/);
  assert.match(implementer, /Never use the literal `ZERO_SHA` sentinel or a ledger repository SHA/);
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
  assert.match(runtime, /normal non-forced\s+push/);
});

test('recovery state survives target movement and terminal blockers', async () => {
  const runtime = await read('RUNTIME.md');

  assert.match(runtime, /base, target, feature, pr,\s+head/);
  assert.match(runtime, /Keep the\s+recorded lease unchanged/);
  assert.match(runtime, /only\s+then atomically replace the base\s+lease and ready artifact/);
  assert.match(runtime, /On `ORCH_BLOCKED`/);
  assert.match(runtime, /preserve the exact task, checkout, branch, and\s+head/);
  assert.match(runtime, /clientThreadId/);
  assert.match(runtime, /restore the prior assignment and pre-lease state/);
  assert.match(runtime, /Never retry while an orphaned lease may exist/);
  assert.match(runtime, /invalidate (?:the )?READY/);
  assert.match(runtime, /worker-target-mismatch/);
  assert.match(runtime, /pre-lease branch ownership/);
  assert.match(runtime, /task created the ref/);
  assert.match(runtime, /remote target has no refs/);
  assert.match(runtime, /local\s+checkout has exactly one root commit/);
  assert.match(runtime, /Classify a rejected push/);
  assert.match(runtime, /switch to `pr` delivery or block/);
});

test('startup drift covers every target binding', async () => {
  const runtime = await read('RUNTIME.md');

  for (const field of [
    'targetRepository',
    'targetProject',
    'targetPath',
    'targetValidation',
    'target delivery rules',
  ]) {
    assert.match(runtime, new RegExp(field));
  }
  assert.match(runtime, /Any mismatch\s+returns `ORCH_DRIFT/);
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
  const medium = runtime.indexOf("thinking: 'medium'");
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
  assert.match(runtime, /archive\s+this\s+conductor\s+task/);
  assert.doesNotMatch(skill, /archive the conductor\s+task/);
});
