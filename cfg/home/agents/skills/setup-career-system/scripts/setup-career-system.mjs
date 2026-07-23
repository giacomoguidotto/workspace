#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { constants, copyFileSync, existsSync } from 'fs';
import { isAbsolute, join, resolve } from 'path';

const DEFAULT_CAPABILITIES = [
  'career-system.capabilities/v1',
  'career-system.check/v1',
  'career.profile.check/v1',
  'career.profile.reconcile/v1',
];

const SYSTEM_REQUIREMENTS = [
  'main.mjs',
  'lib/career-opportunity-discovery.mjs',
  'lib/career-opportunity-pursuit.mjs',
  'lib/career-system-gateway.mjs',
  'lib/career-profile-reconciliation.mjs',
  'opportunity-lifecycle.mjs',
  'templates/states.yml',
  'tracker-parse.mjs',
  'tracker-utils.mjs',
  'tracker-aliases.json',
  'candidacy-select.mjs',
  'followup-cadence.mjs',
  'approach-attempts.mjs',
  'approach-evidence.mjs',
  'advance-stage.mjs',
  'pdf-artifact.mjs',
  '.agents/skills/career-ops/SKILL.md',
  'modes/_profile.template.md',
  'modes/_custom.template.md',
];

const USER_REQUIREMENTS = [
  'cv.md',
  'config/profile.yml',
  'modes/_profile.md',
  'portals.yml',
];

const SAFE_TEMPLATE_COPIES = [
  ['modes/_profile.template.md', 'modes/_profile.md'],
  ['modes/_custom.template.md', 'modes/_custom.md'],
];

function parseArgs(argv) {
  let mode = 'reconcile';
  let root = process.cwd();
  const capabilities = [];
  const args = [...argv];

  if (args[0] === 'check' || args[0] === 'reconcile') mode = args.shift();

  while (args.length > 0) {
    const flag = args.shift();
    const value = args.shift();
    if (!value) throw new Error(`${flag} requires a value`);
    if (flag === '--root') root = value;
    else if (flag === '--capability') capabilities.push(value);
    else throw new Error(`unknown argument: ${flag}`);
  }

  root = resolve(root);
  if (!isAbsolute(root)) throw new Error('--root must resolve to an absolute path');
  return { mode, root, capabilities: capabilities.length > 0 ? capabilities : DEFAULT_CAPABILITIES };
}

function inspectFiles(root, paths) {
  return paths.map((path) => ({ path, status: existsSync(join(root, path)) ? 'ready' : 'blocked' }));
}

function invokeGateway(root, capabilities) {
  const payload = JSON.stringify({ capabilities });
  const stdout = execFileSync(
    process.execPath,
    [join(root, 'main.mjs'), 'career-system.check/v1', '--input', '-'],
    { cwd: root, encoding: 'utf8', input: payload, stdio: ['pipe', 'pipe', 'pipe'] },
  );
  return JSON.parse(stdout);
}

function reconcileSafeTemplates(root) {
  const changed = [];
  for (const [source, destination] of SAFE_TEMPLATE_COPIES) {
    const sourcePath = join(root, source);
    const destinationPath = join(root, destination);
    if (!existsSync(sourcePath)) continue;
    try {
      copyFileSync(sourcePath, destinationPath, constants.COPYFILE_EXCL);
      changed.push(destination);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  return changed;
}

function freshCheck(root, capabilities) {
  const system = inspectFiles(root, SYSTEM_REQUIREMENTS);
  const user = inspectFiles(root, USER_REQUIREMENTS);
  let gateway;

  if (system.every(({ status }) => status === 'ready')) {
    gateway = invokeGateway(root, capabilities);
  } else {
    gateway = { status: 'blocked', result: { capabilities: [] }, reason: 'gateway-missing' };
  }

  const ready = system.every(({ status }) => status === 'ready')
    && user.every(({ status }) => status === 'ready')
    && gateway.status === 'ready';

  const importReady = system.every(({ status }) => status === 'ready') && gateway.status === 'ready';
  const importReasons = [
    ...system.filter(({ status }) => status !== 'ready').map(({ path }) => `missing:${path}`),
    ...(gateway.status === 'ready' ? [] : ['gateway-capability-blocked']),
  ];
  const operationalReasons = [
    ...importReasons,
    ...user.filter(({ status }) => status !== 'ready').map(({ path }) => `missing:${path}`),
  ];

  return {
    status: ready ? 'converged' : 'blocked',
    import_ready: { status: importReady ? 'ready' : 'blocked', reasons: importReasons },
    operational_ready: { status: ready ? 'ready' : 'blocked', reasons: operationalReasons },
    system,
    user,
    gateway,
  };
}

function main() {
  const { mode, root, capabilities } = parseArgs(process.argv.slice(2));
  const sourceReady = inspectFiles(root, SYSTEM_REQUIREMENTS).every(({ status }) => status === 'ready');
  const changed = mode === 'reconcile' && sourceReady ? reconcileSafeTemplates(root) : [];
  const result = freshCheck(root, capabilities);
  process.stdout.write(`${JSON.stringify({ mode, root, changed, ...result })}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
