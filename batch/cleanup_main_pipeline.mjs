#!/usr/bin/env node
// [OPT-2] Re-filter data/pipeline.md "Pendientes" lines against the new title_filter.
// Moves failures into "## Archive — 2026-05-20 (failed new filter)" section.
// Non-destructive: lines are MOVED within the file, not deleted.

import fs from 'fs';

const PIPELINE = 'data/pipeline.md';
const ARCHIVE_HEADER = '## Archive — 2026-05-20 (failed new filter)';

const POSITIVE = [
  'data analyst', 'junior data analyst', 'business analyst', 'operations analyst',
  'data operations analyst', 'data ops analyst', 'business intelligence analyst',
  'bi analyst', 'junior bi analyst', 'business intelligence', 'analytics engineer',
  'junior analytics engineer', 'product analyst', 'revenue operations analyst',
  'revops analyst', 'revops', 'data quality analyst', 'reporting analyst',
  'mis analyst', 'mis executive', 'kpi analyst', 'supply chain data analyst',
  'supply chain analyst', 'logistics analyst', 'insights analyst', 'analytics analyst',
  'data associate', 'sql analyst', 'dashboard developer', 'power bi developer',
  'tableau developer', 'operations executive', 'operations associate',
  'operations specialist', 'operations coordinator', 'operations trainee',
  'business operations', 'process analyst', 'process associate',
  'risk analyst', 'junior analyst', 'associate analyst', 'analyst trainee',
  'graduate trainee', 'management trainee', 'apprenticeship', 'apprentice',
  'marketing analyst', 'growth analyst', 'financial analyst', 'pricing analyst',
  'revenue analyst', 'sales analyst', 'reporting specialist', 'data specialist',
  'quantitative analyst', 'decision scientist',
];

const NEGATIVE = [
  'senior ', 'sr.', 'sr ', ' lead ', 'lead,', 'lead -', 'principal ',
  'staff ', 'head of', 'head,', 'director', 'vp ', 'vice president',
  'chief ', ' manager', 'manager,', 'manager -', 'architect',
  'deputy manager', 'assistant manager', 'group manager',
  '(4 to', '(5 to', '(6 to', '(7 to', '(8 to',
  '4+ years', '5+ years', '6+ years', '7+ years', '8+ years', '10+ years',
  '4-6 years', '5-7 years', '6-8 years', '7-10 years',
  'test engineer', 'qa engineer', 'sdet', 'qa automation',
  'fp&a', 'investment banking', 'equity research', 'credit underwriter',
  '.net', 'java developer', 'ios developer', 'android developer', 'php',
  'embedded', 'firmware', 'fpga', 'asic',
  'blockchain', 'web3', 'crypto', 'salesforce admin',
  'oracle ebs', 'mainframe', 'cobol',
];

function titleFromLine(line) {
  // Format: "- [ ] URL | Company | Role | ..." OR variations
  const parts = line.split('|').slice(1).map(s => s.trim());
  // role is usually parts[1]; fallback to whole line
  return (parts[1] || parts[0] || line).toLowerCase();
}

function titlePasses(title) {
  if (!POSITIVE.some(k => title.includes(k))) return { pass: false, reason: 'no positive' };
  for (const n of NEGATIVE) if (title.includes(n)) return { pass: false, reason: `neg:${n}` };
  return { pass: true };
}

const content = fs.readFileSync(PIPELINE, 'utf8');
const lines = content.split(/\r?\n/);

let inPending = false;
const out = [];
const archive = [];
let archiveAlreadyExists = false;
let pendingCount = 0, passCount = 0, failCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('## Pendientes') || line.startsWith('## Pending')) {
    inPending = true;
    out.push(line);
    continue;
  }
  if (inPending && line.startsWith('##')) {
    inPending = false;
  }
  if (line.includes(ARCHIVE_HEADER)) {
    archiveAlreadyExists = true;
  }
  if (inPending && line.startsWith('- [ ]')) {
    pendingCount++;
    const title = titleFromLine(line);
    const r = titlePasses(title);
    if (r.pass) {
      passCount++;
      out.push(line);
    } else {
      failCount++;
      archive.push(`${line}   <!-- failed: ${r.reason} -->`);
    }
    continue;
  }
  out.push(line);
}

let final = out.join('\n').trimEnd();
if (archive.length) {
  final += `\n\n${ARCHIVE_HEADER}\n\n${archive.join('\n')}\n`;
}

fs.writeFileSync(PIPELINE, final);
console.log(JSON.stringify({ pending_inspected: pendingCount, passed: passCount, archived: failCount }, null, 2));
