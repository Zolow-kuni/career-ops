#!/usr/bin/env node
// [MAIN PIPELINE] Append the 20-URL scored table to data/pipeline.md
// Move 2 sub-4.0 URLs from Pendientes to existing Archive section.

import fs from 'fs';

const PATH = 'data/pipeline.md';

const scored = [
  { n: 1,  url: 'https://boomi.com/boomi-jobs/?gh_jid=5971692004', co: 'Boomi', role: 'Campaign Marketing Ops Specialist (Hybrid Vancouver)', score: 4.0, bucket: '🔄 Maybe', cv: 'CV1', exp: 'Marketing ops', sal_usd: 'Vancouver CAD 60-80k', sal_inr: '₹38-50 LPA equiv', rec: 'skip', notes: 'Hybrid Vancouver — no relocation; marketing ops not Subham\'s track' },
  { n: 2,  url: 'https://n26.com/en-eu/careers/positions/7806657?gh_jid=7806657', co: 'N26', role: 'Banking Operations Analyst - French speaker', score: 4.1, bucket: '🔄 Maybe', cv: 'CV2', exp: '1y banking ops', sal_usd: 'Not disclosed', sal_inr: 'EU comp', rec: 'skip', notes: 'French fluency hard requirement; Madrid on-site' },
  { n: 3,  url: 'https://n26.com/en-eu/careers/positions/7530714?gh_jid=7530714', co: 'N26', role: 'Banking Ops Associate - Excellence and Readiness', score: 4.3, bucket: '🔄 Maybe', cv: 'CV2', exp: 'Unconfirmed', sal_usd: 'Not disclosed', sal_inr: 'EU comp', rec: 'skip', notes: 'Posting 404; EU on-site' },
  { n: 4,  url: 'https://n26.com/en-eu/careers/positions/7811309?gh_jid=7811309', co: 'N26', role: 'Banking Ops Associate - Treasury Operations', score: 2.9, bucket: '❌ Skip', cv: 'CV2', exp: '5+ years', sal_usd: 'Not disclosed', sal_inr: 'EU senior', rec: 'skip', notes: '5+y senior; treasury/capital markets domain; EU on-site' },
  { n: 5,  url: 'https://jobs.ashbyhq.com/resend/7c0abe7b-04a4-4876-9803-7c07acc869d1', co: 'Resend', role: 'Data Analyst, Trust & Safety', score: 6.9, bucket: '✅ Good Fit', cv: 'CV2', exp: '3+ years (first DA on squad)', sal_usd: 'Not disclosed', sal_inr: 'Likely $60-90k → ₹50-75 LPA', rec: 'apply', notes: 'SQL + anomaly + RCA direct match; remote-global; Americas-shift OK. Years short (1.5 vs 3+) but "first DA" framing rewards ownership' },
  { n: 6,  url: 'https://jobs.lever.co/cred/e6e4ce2d-3e20-429a-ae8b-b94b63e0937a', co: 'CRED', role: 'Product Analyst', score: 6.5, bucket: '✅ Good Fit', cv: 'CV1', exp: 'Skills-based (no years stated)', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹10-18 LPA', rec: 'apply', notes: 'No years requirement; SQL+Python+Excel+dashboards match; Hyderabad on-site' },
  { n: 7,  url: 'https://stripe.com/jobs/search?gh_jid=7923895', co: 'Stripe', role: 'Operations Associate', score: 5.3, bucket: '🔄 Maybe', cv: 'CV1', exp: '2-6 years', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹10-18 LPA', rec: 'maybe', notes: '100% Bengaluru office; customer-service ops not analyst track' },
  { n: 8,  url: 'https://stripe.com/jobs/search?gh_jid=7780256', co: 'Stripe', role: 'Operations Associate, GTM Accelerate (Bangalore)', score: 5.3, bucket: '🔄 Maybe', cv: 'CV1', exp: '2+ years', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹12-20 LPA', rec: 'maybe', notes: 'Implementation consulting / debug APIs; APAC shift 7am-4pm IST; 100% Bangalore office' },
  { n: 9,  url: 'https://stripe.com/jobs/search?gh_jid=7540835', co: 'Stripe', role: 'Operations Associate, Sanctions (FinCrime)', score: 4.8, bucket: '🔄 Maybe', cv: 'CV2', exp: '2+ years Sanctions/OFAC/AML', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹12-20 LPA', rec: 'skip', notes: 'Sanctions domain — Subham has none; 100% Bengaluru office' },
  { n: 10, url: 'https://stripe.com/jobs/search?gh_jid=6814190', co: 'Stripe', role: 'Product Support Operations Associate, Weekend Shift', score: 5.0, bucket: '🔄 Maybe', cv: 'CV1', exp: 'Entry-level', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹8-14 LPA', rec: 'skip', notes: 'CX role not analyst; weekend shifts; 100% Bengaluru office' },
  { n: 11, url: 'https://stripe.com/jobs/search?gh_jid=7645711', co: 'Stripe', role: 'Treasury Operations Specialist', score: 4.3, bucket: '🔄 Maybe', cv: 'CV2', exp: '4+ years Treasury', sal_usd: 'Not disclosed', sal_inr: 'Est. ₹12-20 LPA', rec: 'skip', notes: '4+y Treasury domain; min 50% Bengaluru office' },
  { n: 12, url: 'https://www.pinterestcareers.com/jobs/?gh_jid=7890197', co: 'Pinterest', role: 'Lead Product Analyst, Pinner Engagement', score: 4.3, bucket: '🔄 Maybe', cv: 'CV1', exp: '8+ years', sal_usd: '$145,747-$300,067', sal_inr: 'US-band far above target', rec: 'skip', notes: 'Lead title = 8+y; US-only remote' },
  { n: 13, url: 'https://job-boards.greenhouse.io/grafanalabs/jobs/5980431004', co: 'Grafana Labs', role: 'People Analytics Analyst (Ireland Remote)', score: 4.9, bucket: '🔄 Maybe', cv: 'CV1', exp: 'Not specified', sal_usd: '€92-110k (~$98-118k)', sal_inr: 'EU band', rec: 'skip', notes: 'Ireland work auth required; no India hire path' },
  { n: 14, url: 'https://job-boards.greenhouse.io/grafanalabs/jobs/5980443004', co: 'Grafana Labs', role: 'People Analytics Analyst (Sweden Remote)', score: 4.9, bucket: '🔄 Maybe', cv: 'CV1', exp: 'Not specified', sal_usd: 'SEK 687-824k (~$65-78k)', sal_inr: 'EU band', rec: 'skip', notes: 'Sweden work auth required; no India hire path' },
  { n: 15, url: 'https://job-boards.greenhouse.io/twilio/jobs/7861935', co: 'Twilio', role: 'Compliance Operations Specialist 1', score: 5.6, bucket: '🔄 Maybe', cv: 'CV2', exp: '1-2 years fraud/abuse', sal_usd: 'Not listed', sal_inr: 'Colombia LATAM band', rec: 'skip', notes: 'Anomaly/pattern detection strong CV2 fit but LATAM-only hiring; weekends' },
  { n: 16, url: 'https://job-boards.greenhouse.io/twilio/jobs/7627768', co: 'Twilio', role: 'Fast Track Operations Specialist 2', score: 4.3, bucket: '🔄 Maybe', cv: 'CV1', exp: '2+ years A2P', sal_usd: 'Not listed', sal_inr: 'Colombia band', rec: 'skip', notes: 'A2P/telecom domain Subham lacks; LATAM-only' },
  { n: 17, url: 'https://job-boards.greenhouse.io/twilio/jobs/7622280', co: 'Twilio', role: 'MDM Data Specialist', score: 5.7, bucket: '🔄 Maybe', cv: 'CV2', exp: '3-5 years MDM', sal_usd: 'Not listed', sal_inr: 'Colombia band', rec: 'skip', notes: 'Near-perfect skill match (SQL+DQ+RCA+golden record) but 3-5y exp gap + LATAM-only' },
  { n: 18, url: 'https://job-boards.greenhouse.io/twilio/jobs/7861941', co: 'Twilio', role: 'Onboarding Operations Specialist 1', score: 4.3, bucket: '🔄 Maybe', cv: 'CV1', exp: '1-2 years', sal_usd: 'Not listed', sal_inr: 'Colombia band', rec: 'skip', notes: 'Pure CX ops, no data skills; LATAM-only' },
  { n: 19, url: 'https://job-boards.greenhouse.io/twilio/jobs/7722119', co: 'Twilio', role: 'Phone Numbers Operations Specialist 1', score: 4.1, bucket: '🔄 Maybe', cv: 'CV1', exp: '1+ year', sal_usd: 'Not listed', sal_inr: 'Colombia band', rec: 'skip', notes: 'Customer-support email role; LATAM-only' },
  { n: 20, url: 'https://job-boards.greenhouse.io/twilio/jobs/7833997', co: 'Twilio', role: 'Regulatory and Inventory Ops (Japanese)', score: 3.6, bucket: '❌ Skip', cv: 'CV1', exp: '3+ years (desired)', sal_usd: 'Not listed', sal_inr: 'Estonia band', rec: 'skip', notes: 'Fluent Japanese hard blocker; Estonia-based' },
];

// Group by bucket for display
function buildScoredBlock() {
  const groups = { '🔥 Must Apply (8.0-10)': [], '✅ Good Fit (6.0-7.9)': [], '🔄 Maybe (4.0-5.9)': [], '❌ Skip (<4.0)': [] };
  for (const r of scored) {
    if (r.score >= 8) groups['🔥 Must Apply (8.0-10)'].push(r);
    else if (r.score >= 6) groups['✅ Good Fit (6.0-7.9)'].push(r);
    else if (r.score >= 4) groups['🔄 Maybe (4.0-5.9)'].push(r);
    else groups['❌ Skip (<4.0)'].push(r);
  }
  let out = '## Scored — Main Pipeline — 2026-05-20\n\n';
  out += '**Rubric:** Skill 35% · Exp 25% · Remote 20% · Salary 10% · Growth 10% (1-10 scale)\n';
  out += '**Quality gate:** 4.0 minimum to stay in Pendientes · <4.0 → Archive\n\n';
  for (const [name, rows] of Object.entries(groups)) {
    if (!rows.length) { out += `### ${name}\n\n*(none)*\n\n`; continue; }
    out += `### ${name}\n\n`;
    out += '| # | Job Title | Company | Score | Exp | Salary (USD) | Salary (INR) | CV | Apply | Notes |\n';
    out += '|---|-----------|---------|------:|-----|--------------|--------------|----|-------|-------|\n';
    for (const r of rows) {
      out += `| ${r.n} | ${r.role} | ${r.co} | ${r.score.toFixed(1)} | ${r.exp} | ${r.sal_usd} | ${r.sal_inr} | ${r.cv} | [link](${r.url}) | ${r.notes} |\n`;
    }
    out += '\n';
  }
  return out;
}

const content = fs.readFileSync(PATH, 'utf8');

// 1. Append scored block (before Archive section if it exists, else at end)
const scoredBlock = buildScoredBlock();
let updated = content;
const archIdx = updated.indexOf('## Archive — 2026-05-20');
if (archIdx >= 0) {
  updated = updated.slice(0, archIdx).trimEnd() + '\n\n' + scoredBlock + '\n' + updated.slice(archIdx);
} else {
  updated = updated.trimEnd() + '\n\n' + scoredBlock + '\n';
}

// 2. Move sub-4.0 URLs from Pendientes → Archive
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const subFour = scored.filter(r => r.score < 4.0);
for (const r of subFour) {
  const re = new RegExp(`^- \\[ \\] ${escapeRe(r.url)}[^\\n]*\\n`, 'gm');
  updated = updated.replace(re, '');
}
// Append sub-4.0 entries at end of Archive section (or create one if missing)
if (subFour.length) {
  const newArchEntries = subFour.map(r =>
    `- [ ] ${r.url} | ${r.co} | ${r.role}   <!-- scored: ${r.score.toFixed(1)} (sub-4) -->`
  ).join('\n');
  if (updated.includes('## Archive — 2026-05-20')) {
    updated = updated.replace(/(## Archive — 2026-05-20[^\n]*\n)/, `$1\n${newArchEntries}\n`);
  } else {
    updated += `\n\n## Archive — 2026-05-20 (sub-4 from Main Pipeline scoring)\n\n${newArchEntries}\n`;
  }
}

fs.writeFileSync(PATH, updated);
console.log(JSON.stringify({
  appended_scored_block: true,
  sub_4_moved_to_archive: subFour.length,
  buckets: {
    must_apply: scored.filter(r => r.score >= 8).length,
    good_fit: scored.filter(r => r.score >= 6 && r.score < 8).length,
    maybe: scored.filter(r => r.score >= 4 && r.score < 6).length,
    skip: scored.filter(r => r.score < 4).length,
  },
}, null, 2));
