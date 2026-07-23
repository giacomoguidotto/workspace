#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { renderGraph } from './render-graph.mjs';
import { renderGraphSection } from './upsert-graph.mjs';
import { validateGraph } from './validate-graph.mjs';

const START = '<!-- orchestrate:graph:start -->';
const END = '<!-- orchestrate:graph:end -->';
const PROFILES = new Set([
  'lean + supervised',
  'lean + unsupervised',
  'deep + supervised',
  'deep + unsupervised',
]);
const ACTOR_STATUSES = new Set(['active', 'ready', 'blocked', 'terminal']);
const CLEANUP_STATES = new Set(['pending', 'complete', 'retained']);

export class ConductorStateError extends Error {}

function idOf(value) {
  return String(value ?? '').trim().replace(/^#/, '');
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ConductorStateError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function byId(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export function expectedActorTitle(spec, actor) {
  const role = requireString(actor?.role, 'actor role').toLowerCase();
  const ticket = idOf(actor?.ticket);
  if (!ticket) throw new ConductorStateError(`${role} actor requires a ticket`);
  if (role === 'implementer') return `#${spec} · Implementer of #${ticket}`;
  if (role === 'recovery') return `#${spec} · Recovery of #${ticket}`;
  throw new ConductorStateError(`unknown actor role ${role}`);
}

export function extractManagedGraph(body) {
  if (typeof body !== 'string') {
    throw new ConductorStateError('specBody must be a string');
  }
  const startCount = body.split(START).length - 1;
  const endCount = body.split(END).length - 1;
  if (startCount !== 1 || endCount !== 1) return null;
  const start = body.indexOf(START);
  const end = body.indexOf(END, start);
  if (end < start) return null;
  return body.slice(start, end + END.length);
}

function normalizeActor(actor, index, spec) {
  if (!actor || typeof actor !== 'object') {
    throw new ConductorStateError(`actor ${index} must be an object`);
  }
  const role = requireString(actor.role, `actor ${index} role`).toLowerCase();
  if (!['implementer', 'recovery'].includes(role)) {
    throw new ConductorStateError(`actor ${index} has invalid role ${role}`);
  }
  const ticket = idOf(actor.ticket);
  const status = requireString(actor.status, `actor ${index} status`).toLowerCase();
  const cleanup = requireString(actor.cleanup, `actor ${index} cleanup`).toLowerCase();
  if (!ACTOR_STATUSES.has(status)) {
    throw new ConductorStateError(`actor ${index} has invalid status ${status}`);
  }
  if (!CLEANUP_STATES.has(cleanup)) {
    throw new ConductorStateError(`actor ${index} has invalid cleanup ${cleanup}`);
  }
  const normalized = {
    ...actor,
    role,
    ticket,
    status,
    cleanup,
    expectedTitle: expectedActorTitle(spec, { role, ticket }),
  };
  return normalized;
}

function hasProvenExternalBlocker(blocker) {
  if (!blocker || blocker.external !== true) return false;
  if (typeof blocker.reason !== 'string' || blocker.reason.trim() === '') return false;
  if (!Array.isArray(blocker.exhaustedAlternatives) || blocker.exhaustedAlternatives.length === 0) {
    return false;
  }
  return Array.isArray(blocker.recoveryAttempts)
    && blocker.recoveryAttempts.some(
      (attempt) => attempt?.thinking === 'high' && attempt?.outcome === 'unsolved',
    );
}

export function evaluateConductorState(input) {
  if (!input || typeof input !== 'object') {
    throw new ConductorStateError('state must be an object');
  }

  const graph = validateGraph(input.manifest);
  const profile = requireString(input.profile, 'profile').toLowerCase();
  if (!PROFILES.has(profile)) {
    throw new ConductorStateError(`invalid profile ${profile}`);
  }
  const hitlPauses = input.hitlPauses ?? [];
  if (!Array.isArray(hitlPauses)) {
    throw new ConductorStateError('hitlPauses must be an array');
  }
  const actors = (input.actors ?? []).map((actor, index) =>
    normalizeActor(actor, index, graph.spec));
  const finalIntegration = requireString(
    input.finalIntegration,
    'finalIntegration',
  ).toLowerCase();
  if (!['pending', 'complete'].includes(finalIntegration)) {
    throw new ConductorStateError(`invalid finalIntegration ${finalIntegration}`);
  }

  const expectedGraph = renderGraphSection({
    graph: renderGraph(input.manifest),
    profile,
    hitlPauses,
  });
  const actualGraph = extractManagedGraph(input.specBody);
  const graphSynchronized = actualGraph === expectedGraph;

  const missingActorRecords = actors
    .filter((actor) =>
      !actor.threadId || !actor.hostId || !actor.workingDirectory)
    .map((actor) => ({
      ticket: actor.ticket || graph.spec,
      role: actor.role,
      missing: [
        !actor.threadId && 'threadId',
        !actor.hostId && 'hostId',
        !actor.workingDirectory && 'workingDirectory',
      ].filter(Boolean),
    }));
  const titleFixes = actors
    .filter((actor) => actor.title !== actor.expectedTitle)
    .map((actor) => ({
      threadId: actor.threadId ?? null,
      current: actor.title ?? null,
      expected: actor.expectedTitle,
    }));

  const result = {
    valid: true,
    spec: graph.spec,
    graphSynchronized,
    frontier: graph.frontier,
    launchable: graph.launchable,
    hitlFrontier: graph.hitlFrontier,
    allClosed: graph.allClosed,
    missingActorRecords,
    titleFixes,
  };
  const finish = (name, details = {}) => ({
    ...result,
    requiredAction: { name, ...details },
  });

  if (!graphSynchronized) {
    return finish('publish_graph', { expectedGraph });
  }
  if (missingActorRecords.length > 0) {
    return finish('repair_actor_records', { actors: missingActorRecords });
  }
  if (titleFixes.length > 0) {
    return finish('set_actor_titles', { actors: titleFixes });
  }

  const readyActors = actors.filter((actor) => actor.status === 'ready');
  const readyRecoveryActors = readyActors.filter((actor) => actor.role === 'recovery');
  if (readyRecoveryActors.length > 0) {
    return finish('apply_recovery', {
      tickets: readyRecoveryActors.map((actor) => actor.ticket).sort(byId),
    });
  }
  const readyImplementers = readyActors.filter((actor) => actor.role === 'implementer');
  if (readyImplementers.length > 0) {
    if (profile.endsWith(' + supervised')) {
      return finish('supervised_approval', {
        tickets: readyImplementers.map((actor) => actor.ticket).sort(byId),
      });
    }
    return finish('integrate_ready', {
      tickets: readyImplementers.map((actor) => actor.ticket).sort(byId),
    });
  }

  const activeActors = actors.filter((actor) => actor.status === 'active');
  const blockedActors = actors.filter((actor) => actor.status === 'blocked');
  if (blockedActors.length > 0) {
    if (hasProvenExternalBlocker(input.blocker)) {
      if (activeActors.length > 0) {
        return finish('wait', {
          threads: activeActors.map((actor) => ({
            threadId: actor.threadId,
            hostId: actor.hostId,
          })),
        });
      }
      const coveredTickets = new Set(actors.map((actor) => actor.ticket));
      const independentLaunch = graph.launchable.filter(
        (ticket) => !coveredTickets.has(ticket),
      );
      if (independentLaunch.length > 0) {
        return finish('launch_tickets', { tickets: independentLaunch });
      }
      return finish('external_blocker', {
        reason: input.blocker.reason,
        tickets: blockedActors.map((actor) => actor.ticket).sort(byId),
      });
    }
    return finish('recover_blockers', {
      tickets: blockedActors.map((actor) => actor.ticket).sort(byId),
    });
  }

  if (activeActors.length > 0) {
    return finish('wait', {
      threads: activeActors.map((actor) => ({
        threadId: actor.threadId,
        hostId: actor.hostId,
      })),
    });
  }

  if (!graph.allClosed) {
    const terminalTickets = new Set(
      actors
        .filter((actor) => actor.status === 'terminal')
        .map((actor) => actor.ticket),
    );
    const launch = graph.launchable.filter((ticket) => !terminalTickets.has(ticket));
    if (launch.length > 0) {
      return finish('launch_tickets', { tickets: launch });
    }
    if (graph.hitlFrontier.length > 0) {
      return finish('hitl_pause', { tickets: graph.hitlFrontier });
    }
    if (hasProvenExternalBlocker(input.blocker)) {
      return finish('external_blocker', { reason: input.blocker.reason });
    }
    return finish('recover_graph', {
      openExternalBlockers: graph.externalOpen,
      blockedTickets: graph.blocked,
    });
  }

  const cleanupActors = actors.filter(
    (actor) => actor.cleanup !== 'complete',
  );
  if (cleanupActors.length > 0) {
    return finish('clean_actors', {
      actors: cleanupActors.map((actor) => ({
        threadId: actor.threadId,
        ticket: actor.ticket || graph.spec,
        cleanup: actor.cleanup,
      })),
    });
  }
  if (finalIntegration !== 'complete') {
    return finish('final_integration');
  }
  return finish('complete');
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  try {
    process.stdout.write(`${JSON.stringify(evaluateConductorState(JSON.parse(input)), null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ valid: false, error: message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
