import fs from 'fs';

const path = 'data/pipeline.md';
const content = fs.readFileSync(path, 'utf8');

const processed = [
  ['https://job-boards.greenhouse.io/gleanwork/jobs/4694878005', '019', 'Glean', 'Accounting Apprentice', '2.4/5'],
  ['https://www.okta.com/company/careers/opportunity/7926062?gh_jid=7926062', '020', 'Okta', 'Data Quality Analyst II', '2.7/5'],
  ['https://stripe.com/jobs/search?gh_jid=7236933', '021', 'Stripe', 'Operations Associate, Apprenticeship', '3.9/5'],
  ['https://stripe.com/jobs/search?gh_jid=7179634', '022', 'Stripe', 'Bridge - Operations Associate', '3.0/5'],
  ['https://stripe.com/jobs/search?gh_jid=5423044', '023', 'Stripe', 'Risk Operations Associate', '2.8/5'],
  ['https://stripe.com/jobs/search?gh_jid=7738241', '024', 'Stripe', 'Verifications Operations Associate', '3.6/5'],
  ['https://job-boards.greenhouse.io/newrelic/jobs/5220010008', '025', 'New Relic', 'Revenue Operations Analyst', '2.8/5'],
  ['https://www.okta.com/company/careers/opportunity/7906283?gh_jid=7906283', '026', 'Okta', 'Data Governance & Workday Reporting Specialist', '1.8/5'],
  ['https://job-boards.greenhouse.io/twilio/jobs/7923207', '027', 'Twilio', 'Marketing Analyst, PLG & Self-Serve Analytics', '2.4/5'],
  ['https://job-boards.greenhouse.io/grafanalabs/jobs/5980438004', '028', 'Grafana Labs', 'People Analytics Analyst (Spain)', '1.7/5'],
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let updated = content;
let removedCount = 0;
for (const [url] of processed) {
  const re = new RegExp(`^- \\[ \\] ${escapeRe(url)}[^\\n]*\\n`, 'gm');
  if (re.test(updated)) {
    updated = updated.replace(re, '');
    removedCount++;
  }
}

const block = `\n## Processed — 2026-05-20 (sample-10 with new filter + new CV)\n\n` +
  processed.map(([url, num, co, role, score]) =>
    `- [x] #${num} | ${url} | ${co} | ${role} | ${score} | PDF ❌`
  ).join('\n') + '\n';

updated = updated.trimEnd() + '\n' + block;
fs.writeFileSync(path, updated);
console.log(`Removed ${removedCount}/${processed.length} URLs from Pendientes.`);
