import fs from 'fs';
import path from 'path';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeDocx(outputPath, paragraphs) {
  const entries = [];

  function addEntry(name, content) {
    const nameBytes = Buffer.from(name, 'utf8');
    const data = Buffer.from(content, 'utf8');
    entries.push({ name: nameBytes, data, crc: crc32(data) });
  }

  const bodyXml = paragraphs.map(p => {
    const esc = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (!esc.trim()) return '<w:p/>';
    return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:t xml:space="preserve">${esc}</w:t></w:r></w:p>`;
  }).join('');

  addEntry('[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>');

  addEntry('_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>');

  addEntry('word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');

  addEntry('word/document.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' + bodyXml +
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
    '</w:body></w:document>');

  // Write ZIP
  const localHeaderOffsets = [];
  const parts = [];
  let offset = 0;

  for (const e of entries) {
    const lh = Buffer.alloc(30 + e.name.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(e.crc, 14);
    lh.writeUInt32LE(e.data.length, 18); lh.writeUInt32LE(e.data.length, 22);
    lh.writeUInt16LE(e.name.length, 26); lh.writeUInt16LE(0, 28);
    e.name.copy(lh, 30);
    localHeaderOffsets.push(offset);
    parts.push(lh, e.data);
    offset += lh.length + e.data.length;
  }

  const cdOffset = offset;
  const cdParts = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const cd = Buffer.alloc(46 + e.name.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10); cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(e.crc, 16);
    cd.writeUInt32LE(e.data.length, 20); cd.writeUInt32LE(e.data.length, 24);
    cd.writeUInt16LE(e.name.length, 28);
    cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32); cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38); cd.writeUInt32LE(localHeaderOffsets[i], 42);
    e.name.copy(cd, 46);
    cdParts.push(cd);
    offset += cd.length;
  }
  const cdSize = offset - cdOffset;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12); eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.concat([...parts, ...cdParts, eocd]));
}

const ROOT = 'C:/Users/lalit/OneDrive/Desktop/Cover Letter and Resume';
const COMPANIES = ['Evtaar', 'Infosys', 'TCS', 'Wipro'];

const CV_CONTENT = [
  'SUBHAM JOSHI',
  'joshisubham442@gmail.com  |  linkedin.com/in/subham-joshi-b25778280  |  Dehradun, India',
  '',
  'PROFESSIONAL SUMMARY',
  'Data Analyst with ~1.5 years of hands-on experience in SQL, Python, dbt, and Power BI delivering KPI tracking, statistical anomaly detection, and root-cause investigations in logistics and operations contexts. Skilled at building self-serve BI dashboards, owning data integrity across cross-functional teams, and translating ambiguous business questions into auditable analyses.',
  '',
  'EXPERIENCE',
  'Data Analyst (Management Trainee Program) — Logistics Integrators Pvt. Ltd.',
  'Dehradun, India  |  Mar 2025 – Mar 2026',
  '  • Built SQL-based statistical anomaly detection and threshold-based alerting on operational and sales datasets, surfacing outliers before they impacted SLAs',
  '  • Owned weekly BI dashboards in Power BI tracking 10+ business KPIs across freight operations; established the single source of truth for cross-team reporting',
  '  • Led root-cause analysis (RCA) on performance spikes — shipment delays, turnaround drops, cost overruns — partnering with 3–5 cross-functional teams',
  '  • Designed conversion, funnel, and drop-off analysis on shipment journeys (start-to-delivery), informing operational interventions and process redesigns',
  '  • Drove data quality and data integrity workflows: validation, reconciliation, ETL audit',
  '  • Automated recurring reporting workflows in Python (Pandas, NumPy)',
  '',
  'Operations Analyst (Intern) — Vrun Minerals Pvt. Ltd.',
  'Dehradun, India  |  Feb 2024 – Jul 2024',
  '  • Cleaned and validated distributor and sales datasets using Excel and Python (Pandas); built dashboards with deviation highlighting on inventory and sales trends',
  '  • Performed inventory reconciliation and data accuracy checks across daily operations',
  '  • Conducted business trend analysis to generate actionable insights for supply-chain decisions',
  '',
  'EDUCATION',
  'MBA / PGPM — Operations Management  |  ICFAI Business School, Mumbai  |  2025  |  CGPA 6.83',
  'Bachelor of Computer Applications (BCA)  |  Shree Guru Ram Rai I.T.S., Dehradun  |  2022  |  72.68%',
  '',
  'SKILLS',
  'SQL (joins, window functions, CTEs, aggregations) · Python (Pandas, NumPy) · Power BI · dbt Core · MS Excel',
  'Statistical Analysis · ETL Validation · Data Quality · KPI Tracking · Root Cause Analysis · A/B Testing Principles',
  'Stakeholder Management · Data Storytelling · Cross-functional Collaboration',
  '',
  'CERTIFICATIONS',
  'dbt Fundamentals — dbt Labs (2026)',
];

for (const co of COMPANIES) {
  const dir = path.join(ROOT, co);
  const cvPath = path.join(dir, `Resume_${co}.docx`);
  const clPath = path.join(dir, `Cover_Letter_${co}.docx`);

  if (!fs.existsSync(cvPath)) {
    makeDocx(cvPath, CV_CONTENT);
    console.log(`  CREATED  Resume_${co}.docx`);
  } else {
    console.log(`  EXISTS   Resume_${co}.docx (skipped)`);
  }

  const CL_CONTENT = [
    'Subham Joshi',
    'joshisubham442@gmail.com  |  Dehradun, India',
    '',
    '24 May 2026',
    '',
    'Hiring Team',
    co,
    '',
    'Re: Application — [Role Title]',
    '',
    '[Opening paragraph — connect your background directly to the role and why this company.]',
    '',
    '[Body paragraph 1 — first proof point with a metric or outcome.]',
    '',
    '[Body paragraph 2 — second proof point or skill directly matching the JD.]',
    '',
    '[Body paragraph 3 — third proof point or why you are a fit for this specific team.]',
    '',
    '[Closing — mention availability for a call and any location flexibility if relevant.]',
    '',
    'Warm regards,',
    'Subham Joshi',
  ];

  if (!fs.existsSync(clPath)) {
    makeDocx(clPath, CL_CONTENT);
    console.log(`  CREATED  Cover_Letter_${co}.docx`);
  } else {
    console.log(`  EXISTS   Cover_Letter_${co}.docx (skipped)`);
  }
}

console.log('\nDone.');
