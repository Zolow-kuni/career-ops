import fs from 'fs';

const path = 'data/pipeline.md';
const content = fs.readFileSync(path, 'utf8');

const processed = [
  ['https://job-boards.greenhouse.io/phonepe/jobs/7701648003', '009', 'PhonePe', 'Business Analyst Lending (2-5y)', '3.2/5'],
  ['https://job-boards.greenhouse.io/phonepe/jobs/7701646003', '010', 'PhonePe', 'Business Analyst Merchant (4-6y)', '2.5/5'],
  ['https://jobs.lever.co/paytm/df9dd6cd-f1a4-4d25-ae66-8b0b7ae4b434', '011', 'Paytm', 'Associate Product/Business Analyst (Telco)', '2.8/5'],
  ['https://jobs.lever.co/paytm/656c9424-0b62-46fc-ba1f-f070819a6cd2', '012', 'Paytm', 'Business Analyst Deputy Manager', '3.0/5'],
  ['https://jobs.lever.co/cred/150186f5-4eaf-4afe-ae08-bb36c71abb83', '013', 'CRED', 'Risk Analyst (Prefr)', '2.7/5'],
  ['https://stripe.com/jobs/search?gh_jid=7794729', '014', 'Stripe', 'Data Analyst', '2.8/5'],
  ['https://stripe.com/jobs/search?gh_jid=7667847', '015', 'Stripe', 'Strategy & Analytics Analyst', '2.5/5'],
  ['https://stripe.com/jobs/search?gh_jid=7597622', '016', 'Stripe', 'Finance Analytics Analyst', '2.2/5'],
  ['https://stripe.com/jobs/search?gh_jid=7795191', '017', 'Stripe', 'Monetization Operations Analyst', '3.2/5'],
  ['https://www.mongodb.com/careers/job/?gh_jid=7616983', '018', 'MongoDB', 'Senior Data Analyst', '2.3/5'],
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

const processedBlock = `\n## Processed — 2026-05-19 (sample-10)\n\n` +
  processed.map(([url, num, co, role, score]) =>
    `- [x] #${num} | ${url} | ${co} | ${role} | ${score} | PDF ❌`
  ).join('\n') + '\n';

updated = updated.trimEnd() + '\n' + processedBlock;
fs.writeFileSync(path, updated);
console.log(`Removed ${removedCount}/${processed.length} URLs from Pendientes.`);
