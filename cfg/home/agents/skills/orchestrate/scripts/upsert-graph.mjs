#!/usr/bin/env node

const START = '<!-- orchestrate:graph:start -->';
const END = '<!-- orchestrate:graph:end -->';

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function requireSectionString(value, name) {
  const normalized = requireString(value, name);
  if (normalized.includes(START) || normalized.includes(END)) {
    throw new TypeError(`${name} must not contain orchestration graph markers`);
  }
  return normalized;
}

function markerCount(body, marker) {
  return body.split(marker).length - 1;
}

export function renderGraphSection({ graph, profile, hitlPauses = [] }) {
  const renderedGraph = requireSectionString(graph, 'graph');
  const selectedProfile = requireSectionString(profile, 'profile');
  if (!Array.isArray(hitlPauses) || hitlPauses.some((pause) => typeof pause !== 'string')) {
    throw new TypeError('hitlPauses must be an array of strings');
  }

  const pauses = hitlPauses.length === 0
    ? 'HITL pauses: none'
    : [
      'HITL pauses:',
      ...hitlPauses.map((pause) => `- ${requireSectionString(pause, 'hitlPauses entry')}`),
    ].join('\n');

  return [
    START,
    '## Orchestration graph',
    '',
    `Profile: \`${selectedProfile}\``,
    '',
    'Arrows point from each blocker to the ticket it unlocks.',
    '',
    '```mermaid',
    renderedGraph,
    '```',
    '',
    pauses,
    END,
  ].join('\n');
}

export function upsertGraphSection({ body = '', ...sectionInput }) {
  if (typeof body !== 'string') {
    throw new TypeError('body must be a string');
  }

  const starts = markerCount(body, START);
  const ends = markerCount(body, END);
  if (starts !== ends || starts > 1) {
    throw new Error('spec body must contain zero or one balanced orchestration graph section');
  }

  const section = renderGraphSection(sectionInput);
  if (starts === 0) {
    if (body === '') return section;
    const separator = body.endsWith('\n\n') ? '' : body.endsWith('\n') ? '\n' : '\n\n';
    return `${body}${separator}${section}`;
  }

  const start = body.indexOf(START);
  const endMarker = body.indexOf(END);
  if (endMarker < start) {
    throw new Error('orchestration graph end marker must follow its start marker');
  }
  const end = endMarker + END.length;
  return `${body.slice(0, start)}${section}${body.slice(end)}`;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  process.stdout.write(upsertGraphSection(JSON.parse(input)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
