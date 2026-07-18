#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { normalizeTicketMode, validateGraph } from './validate-graph.mjs';

function idOf(value) {
  return String(value ?? '').trim().replace(/^#/, '');
}

function byId(a, b) {
  return a.id.localeCompare(b.id, undefined, { numeric: true });
}

function escapeLabel(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

export function renderGraph(input) {
  const result = validateGraph(input);
  const tickets = input.tickets
    .map((ticket) => ({
      id: idOf(ticket.id),
      title: String(ticket.title).trim(),
      state: String(ticket.state).trim().toLowerCase(),
      mode: normalizeTicketMode(ticket.mode),
      blockedBy: ticket.blockedBy.map(idOf).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    }))
    .sort(byId);
  const externalBlockers = (input.externalBlockers ?? [])
    .map((blocker) => ({
      id: idOf(blocker.id),
      state: String(blocker.state).trim().toLowerCase(),
    }))
    .sort(byId);

  const ticketNodes = new Map(
    tickets.map((ticket, index) => [ticket.id, `ticket_${index}`]),
  );
  const externalNodes = new Map(
    externalBlockers.map((blocker, index) => [blocker.id, `external_${index}`]),
  );
  const frontier = new Set(result.frontier);
  const hitl = new Set(
    tickets.filter((ticket) => ticket.mode === 'hitl').map((ticket) => ticket.id),
  );
  const lines = [
    'flowchart LR',
    '  %% Arrows point from each blocker to the ticket it unlocks.',
  ];

  for (const [index, ticket] of tickets.entries()) {
    lines.push(
      `  ticket_${index}["#${escapeLabel(ticket.id)} ${escapeLabel(ticket.title)}<br/>${ticket.mode.toUpperCase()} · ${ticket.state}"]`,
    );
  }
  for (const [index, blocker] of externalBlockers.entries()) {
    lines.push(
      `  external_${index}["${escapeLabel(blocker.id)}<br/>external ${blocker.state}"]`,
    );
  }

  for (const ticket of tickets) {
    for (const blocker of ticket.blockedBy) {
      const source = ticketNodes.get(blocker) ?? externalNodes.get(blocker);
      lines.push(`  ${source} --> ${ticketNodes.get(ticket.id)}`);
    }
  }

  lines.push(
    '  classDef frontier fill:#dcfce7,stroke:#16a34a,stroke-width:2px',
    '  classDef blocked fill:#fef3c7,stroke:#d97706',
    '  classDef hitl fill:#ede9fe,stroke:#7c3aed,stroke-width:2px',
    '  classDef closed fill:#e5e7eb,stroke:#6b7280,color:#374151',
    '  classDef externalOpen fill:#fee2e2,stroke:#dc2626,stroke-dasharray:4 2',
    '  classDef externalClosed fill:#e5e7eb,stroke:#6b7280,stroke-dasharray:4 2',
  );

  for (const [index, ticket] of tickets.entries()) {
    const className = ticket.state === 'closed'
      ? 'closed'
      : hitl.has(ticket.id)
        ? 'hitl'
        : frontier.has(ticket.id)
          ? 'frontier'
          : 'blocked';
    lines.push(`  class ticket_${index} ${className}`);
  }
  for (const [index, blocker] of externalBlockers.entries()) {
    lines.push(
      `  class external_${index} external${blocker.state === 'open' ? 'Open' : 'Closed'}`,
    );
  }

  return `${lines.join('\n')}\n`;
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
    process.stdout.write(renderGraph(JSON.parse(text)));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ valid: false, error: message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
