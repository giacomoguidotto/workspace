#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export class GraphValidationError extends Error {}

function idOf(value) {
  return String(value ?? '').trim().replace(/^#/, '');
}

function byId(a, b) {
  const an = Number(a);
  const bn = Number(b);
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  return a.localeCompare(b);
}

export function normalizeTicketMode(value) {
  const mode = String(value ?? '').trim().toLowerCase();
  return mode === 'hilt' ? 'hitl' : mode;
}

export function validateGraph(input) {
  if (!input || typeof input !== 'object') {
    throw new GraphValidationError('manifest must be an object');
  }

  const spec = idOf(input.spec);
  if (!spec) throw new GraphValidationError('spec is required');
  if (!Array.isArray(input.tickets) || input.tickets.length === 0) {
    throw new GraphValidationError('tickets must be a non-empty array');
  }

  if (!Array.isArray(input.externalBlockers ?? [])) {
    throw new GraphValidationError('externalBlockers must be an array');
  }

  const missingNativeSubIssues = input.tickets
    .filter((ticket) => ticket?.nativeSubIssue !== true)
    .map((ticket, index) => idOf(ticket?.id) || `index ${index}`);
  if (missingNativeSubIssues.length > 0) {
    throw new GraphValidationError(
      `tickets ${missingNativeSubIssues.join(', ')} are not native sub-issues of spec ${spec}`,
    );
  }

  const externalBlockers = new Map();
  for (const blocker of input.externalBlockers ?? []) {
    const id = idOf(blocker?.id);
    const state = String(blocker?.state ?? '').trim().toLowerCase();
    if (!id) throw new GraphValidationError('external blocker has no id');
    if (!['open', 'closed'].includes(state)) {
      throw new GraphValidationError(`external blocker ${id} has invalid state ${state || '<empty>'}`);
    }
    if (externalBlockers.has(id)) {
      throw new GraphValidationError(`duplicate external blocker ${id}`);
    }
    externalBlockers.set(id, state);
  }

  const tickets = input.tickets.map((ticket, index) => {
    const id = idOf(ticket?.id);
    const parent = idOf(ticket?.parent);
    const title = String(ticket?.title ?? '').trim();
    const state = String(ticket?.state ?? '').trim().toLowerCase();
    const mode = normalizeTicketMode(ticket?.mode);

    if (!id) throw new GraphValidationError(`ticket ${index} has no id`);
    if (parent !== spec) {
      throw new GraphValidationError(
        `ticket ${id} has parent ${parent || '<empty>'}; expected ${spec}`,
      );
    }
    if (!title) throw new GraphValidationError(`ticket ${id} has no title`);
    if (!['open', 'closed'].includes(state)) {
      throw new GraphValidationError(`ticket ${id} has invalid state ${state || '<empty>'}`);
    }
    if (!['afk', 'hitl'].includes(mode)) {
      throw new GraphValidationError(`ticket ${id} has invalid mode ${mode || '<empty>'}`);
    }
    if (!Array.isArray(ticket?.blockedBy ?? [])) {
      throw new GraphValidationError(`ticket ${id} blockedBy must be an array`);
    }
    const blockedBy = (ticket.blockedBy ?? []).map(idOf);
    if (new Set(blockedBy).size !== blockedBy.length) {
      throw new GraphValidationError(`ticket ${id} repeats a blocker`);
    }
    if (blockedBy.includes(id)) {
      throw new GraphValidationError(`ticket ${id} blocks itself`);
    }
    return { id, parent, title, state, mode, blockedBy };
  });

  const ids = new Set();
  for (const ticket of tickets) {
    if (ids.has(ticket.id)) {
      throw new GraphValidationError(`duplicate ticket ${ticket.id}`);
    }
    ids.add(ticket.id);
  }

  const byTicket = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  for (const ticket of tickets) {
    for (const blocker of ticket.blockedBy) {
      if (!byTicket.has(blocker) && !externalBlockers.has(blocker)) {
        throw new GraphValidationError(`ticket ${ticket.id} has unknown blocker ${blocker}`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (id, trail = []) => {
    if (visiting.has(id)) {
      throw new GraphValidationError(`dependency cycle: ${[...trail, id].join(' -> ')}`);
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const ticket = byTicket.get(id);
    for (const blocker of ticket.blockedBy) {
      if (byTicket.has(blocker)) visit(blocker, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const ticket of tickets) visit(ticket.id);

  const satisfied = (id) => externalBlockers.get(id) === 'closed' || byTicket.get(id)?.state === 'closed';
  const frontierTickets = tickets.filter(
    (ticket) => ticket.state === 'open' && ticket.blockedBy.every(satisfied),
  );
  const frontier = frontierTickets
    .map((ticket) => ticket.id)
    .sort(byId);
  const launchable = frontierTickets
    .filter((ticket) => ticket.mode === 'afk')
    .map((ticket) => ticket.id)
    .sort(byId);
  const hitlFrontier = frontierTickets
    .filter((ticket) => ticket.mode === 'hitl')
    .map((ticket) => ticket.id)
    .sort(byId);
  const blocked = tickets
    .filter((ticket) => ticket.state === 'open' && !ticket.blockedBy.every(satisfied))
    .map((ticket) => ticket.id)
    .sort(byId);

  return {
    valid: true,
    spec,
    ticketCount: tickets.length,
    frontier,
    launchable,
    hitlFrontier,
    blocked,
    externalOpen: [...externalBlockers]
      .filter(([, state]) => state === 'open')
      .map(([id]) => id)
      .sort(byId),
    allClosed: tickets.every((ticket) => ticket.state === 'closed'),
  };
}

async function readInput(path) {
  if (path) return readFile(path, 'utf8');
  let text = '';
  for await (const chunk of process.stdin) text += chunk;
  return text;
}

async function main() {
  try {
    const text = await readInput(process.argv[2]);
    const result = validateGraph(JSON.parse(text));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ valid: false, error: message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
