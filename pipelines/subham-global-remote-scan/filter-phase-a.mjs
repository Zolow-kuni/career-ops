#!/usr/bin/env node
// [PARALLEL SCAN] Phase A: parse cached API/RSS feeds, filter by analyst keywords + exclusions, dedup, append URLs to pipeline.md
import fs from 'fs';
import path from 'path';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ''));
const PIPELINE = path.join(ROOT, 'pipeline.md');
const LOG = path.join(ROOT, 'scan-log.md');
const HISTORY_TSV = path.resolve(ROOT, '../../data/scan-history.tsv');

// -- title filter (mirrors portals.yml after rewrite) --
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
  'process analytics analyst', 'reporting & insights analyst',
  'risk & data analyst', 'risk analyst', 'junior analyst', 'associate analyst',
  'analyst trainee', 'graduate trainee', 'management trainee', 'apprenticeship',
  'apprentice',
];
const NEGATIVE = [
  // wrong function (user-specified excludes)
  'qa engineer', 'qa automation', 'test engineer', 'sdet', 'software tester',
  'automation tester', 'etl tester', 'api tester', 'rpa analyst',
  'python developer', 'java developer', 'frontend developer', 'backend developer',
  'fullstack developer', 'full stack developer', 'mobile developer',
  // senior/manager floors
  'senior ', 'sr.', 'sr ', ' lead ', 'lead,', 'lead -', 'principal ',
  'staff ', 'head of', 'head,', 'director', 'vp ', 'vice president',
  'chief ', ' manager', 'manager ', 'manager,', 'manager -', 'architect',
  'deputy manager', 'assistant manager', 'senior manager', 'group manager',
  // years
  '(4 to', '(5 to', '(6 to', '(7 to', '(8 to',
  '4+ years', '5+ years', '6+ years', '7+ years', '8+ years', '10+ years',
  '4-6 years', '5-7 years', '6-8 years', '7-10 years',
  // wrong domain
  'fp&a', 'investment banking', 'equity research', 'credit underwriter',
  '.net', 'ios developer', 'android developer', 'php',
  'embedded', 'firmware', 'fpga', 'asic',
  'blockchain', 'web3', 'crypto', 'salesforce admin',
  'oracle ebs', 'mainframe', 'cobol',
];

function titlePassesFilter(title) {
  const t = (title || '').toLowerCase();
  if (!POSITIVE.some(k => t.includes(k))) return { pass: false, reason: 'no positive match' };
  for (const n of NEGATIVE) if (t.includes(n)) return { pass: false, reason: `negative: ${n}` };
  return { pass: true };
}

function loadHistorySet() {
  if (!fs.existsSync(HISTORY_TSV)) return new Set();
  const seen = new Set();
  const lines = fs.readFileSync(HISTORY_TSV, 'utf8').split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols[0]) seen.add(cols[0]);
  }
  return seen;
}

// -- Source parsers --
function parseRemoteOK() {
  const raw = fs.readFileSync(path.join(ROOT, '.cache-remoteok.json'), 'utf8');
  const arr = JSON.parse(raw);
  // First element is metadata; skip
  return arr.filter(j => j && j.position && j.url).map(j => ({
    source: 'remoteok',
    title: j.position,
    company: j.company || '',
    location: j.location || 'Remote',
    url: j.url.startsWith('http') ? j.url : `https://remoteok.com${j.url}`,
    posted_at: j.epoch ? new Date(j.epoch * 1000).toISOString().slice(0, 10) : '',
  }));
}

function parseRemotive() {
  const raw = fs.readFileSync(path.join(ROOT, '.cache-remotive.json'), 'utf8');
  const obj = JSON.parse(raw);
  const jobs = obj.jobs || [];
  return jobs.filter(j => j.title && j.url).map(j => ({
    source: 'remotive',
    title: j.title,
    company: j.company_name || '',
    location: j.candidate_required_location || 'Worldwide',
    url: j.url,
    posted_at: j.publication_date ? j.publication_date.slice(0, 10) : '',
  }));
}

function parseWeWorkRemotely() {
  const raw = fs.readFileSync(path.join(ROOT, '.cache-wwr.xml'), 'utf8');
  const items = [];
  const itemBlocks = raw.split(/<item>/i).slice(1);
  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/title>/);
    const linkMatch = block.match(/<link>([^<]+)<\/link>/);
    const pubMatch = block.match(/<pubDate>([^<]+)<\/pubDate>/);
    if (titleMatch && linkMatch) {
      // WWR titles are "Company: Role" — split
      const raw_title = titleMatch[1].trim();
      let company = '', role = raw_title;
      const colon = raw_title.indexOf(':');
      if (colon > 0) {
        company = raw_title.slice(0, colon).trim();
        role = raw_title.slice(colon + 1).trim();
      }
      items.push({
        source: 'weworkremotely',
        title: role,
        company,
        location: 'Remote',
        url: linkMatch[1].trim(),
        posted_at: pubMatch ? new Date(pubMatch[1]).toISOString().slice(0, 10) : '',
      });
    }
  }
  return items;
}

// -- Main --
const seen = loadHistorySet();
const sources = [
  { name: 'RemoteOK', parser: parseRemoteOK },
  { name: 'Remotive', parser: parseRemotive },
  { name: 'WeWorkRemotely', parser: parseWeWorkRemotely },
];

const stats = [];
const newRows = [];

for (const { name, parser } of sources) {
  let total = 0, passTitle = 0, passDup = 0, added = 0;
  try {
    const jobs = parser();
    total = jobs.length;
    for (const j of jobs) {
      const fr = titlePassesFilter(j.title);
      if (!fr.pass) continue;
      passTitle++;
      if (seen.has(j.url)) continue;
      passDup++;
      added++;
      seen.add(j.url);
      newRows.push(j);
    }
    stats.push({ name, total, passTitle, passDup, added });
  } catch (e) {
    stats.push({ name, total: 0, passTitle: 0, passDup: 0, added: 0, error: e.message });
  }
}

// -- Append to pipeline.md (under "## Pending") --
let pipelineContent = fs.readFileSync(PIPELINE, 'utf8');
const newLines = newRows.map(r => `- [ ] [${r.source}] ${r.url} | ${r.company} | ${r.title} | ${r.location} | ${r.posted_at}`).join('\n');
if (newRows.length) {
  // Insert before "## Processed"
  const procIdx = pipelineContent.indexOf('## Processed');
  if (procIdx >= 0) {
    const before = pipelineContent.slice(0, procIdx).trimEnd();
    const after = pipelineContent.slice(procIdx);
    pipelineContent = `${before}\n\n${newLines}\n\n${after}`;
  } else {
    pipelineContent += `\n${newLines}\n`;
  }
  fs.writeFileSync(PIPELINE, pipelineContent);
}

// -- Update scan-log.md Phase A table --
let logContent = fs.readFileSync(LOG, 'utf8');
const phaseATable = `| Source | URL | Status | Total found | After title filter | After remote filter | Added to pipeline |
|--------|-----|--------|------------:|-------------------:|--------------------:|------------------:|
| RemoteOK | https://remoteok.com/api | ${stats[0]?.error ? 'ERROR' : 'done'} | ${stats[0]?.total} | ${stats[0]?.passTitle} | ${stats[0]?.passTitle} | ${stats[0]?.added} |
| Remotive | https://remotive.com/api/remote-jobs | ${stats[1]?.error ? 'ERROR' : 'done'} | ${stats[1]?.total} | ${stats[1]?.passTitle} | ${stats[1]?.passTitle} | ${stats[1]?.added} |
| WeWorkRemotely | https://weworkremotely.com/categories/all-other-remote-jobs.rss | ${stats[2]?.error ? 'ERROR' : 'done'} | ${stats[2]?.total} | ${stats[2]?.passTitle} | ${stats[2]?.passTitle} | ${stats[2]?.added} |`;
logContent = logContent.replace(/\| Source \| URL \| Status[\s\S]*?\| WeWorkRemotely \|[^\n]*\|/m, phaseATable);
fs.writeFileSync(LOG, logContent);

console.log(JSON.stringify({ stats, added: newRows.length }, null, 2));
