#!/usr/bin/env node
// [MAIN] Step 2b: Build customized HTML CVs from templates/cv-template.html
// Produces:
//   templates/cv-built-cv1.html — CV1 (general) for #021 Stripe Apprenticeship
//   templates/cv-built-cv2.html — CV2 (risk/anomaly) for #024 Stripe Verifications

import fs from 'fs';

const TEMPLATE = 'templates/cv-template.html';
const template = fs.readFileSync(TEMPLATE, 'utf8');

const HEADER_COMMON = {
  NAME: 'Subham Joshi',
  PHONE: '',
  EMAIL: 'joshisubham442@gmail.com',
  LINKEDIN_URL: 'https://linkedin.com/in/subham-joshi-b25778280',
  LINKEDIN_DISPLAY: 'linkedin.com/in/subham-joshi-b25778280',
  PORTFOLIO_URL: '',
  PORTFOLIO_DISPLAY: '',
  LOCATION: 'Dehradun, India · IST',
  LANG: 'en',
  SECTION_SUMMARY: 'PROFESSIONAL SUMMARY',
  SECTION_COMPETENCIES: 'CORE COMPETENCIES',
  SECTION_EXPERIENCE: 'EXPERIENCE',
  SECTION_PROJECTS: 'PROJECTS',
  SECTION_EDUCATION: 'EDUCATION',
  SECTION_CERTIFICATIONS: 'CERTIFICATIONS',
  SECTION_SKILLS: 'SKILLS',
};

// -- CV1: General (for #021 Stripe Apprenticeship) --
// Block E customizations from report 021:
//   1. Summary leads with "2025 MBA Ops grad"
//   2. Skills add: Customer-issue diagnosis, Process Documentation, Apprentice-mindset
//   3. Bullet on RCA bridged to customer troubleshooting

const CV1 = {
  SUMMARY_TEXT: '2025 MBA (Operations Management) grad with ~1.5 years owning KPI dashboards, statistical anomaly detection, and root-cause investigations in a logistics environment. Eager to apply operational fluency, process discipline, and SQL+Python+Power BI muscle in a structured apprenticeship or entry-level analyst role.',

  COMPETENCIES: [
    'SQL', 'Python (Pandas)', 'dbt', 'Power BI', 'KPI Tracking', 'Anomaly Detection',
    'Root Cause Analysis', 'Data Validation', 'Process Documentation', 'Cross-functional Collaboration',
    'Apprentice-mindset', 'Customer-issue Diagnosis (Analogous)',
  ].map(t => `<span class="competency-tag">${t}</span>`).join('\n      '),

  EXPERIENCE: `
    <div class="job">
      <div class="job-header">
        <div class="job-company">Logistics Integrators Pvt. Ltd.</div>
        <div class="job-period">Mar 2025 – Mar 2026</div>
      </div>
      <div class="job-role">Data Analyst (Management Trainee Program)</div>
      <div class="job-location">Dehradun, India</div>
      <ul>
        <li>Built <strong>SQL-based statistical anomaly detection</strong> and threshold-based alerting on operational/sales datasets, surfacing outliers before they impacted SLAs</li>
        <li>Owned weekly <strong>Power BI dashboards</strong> tracking 10+ business KPIs across freight operations; established the single source of truth for cross-team reporting</li>
        <li>Led <strong>root-cause investigations</strong> on operational performance spikes — shipment delays, cost overruns — partnering with 3–5 cross-functional teams to validate data and ship corrective actions (analogous substrate to customer-issue diagnosis)</li>
        <li>Designed <strong>conversion, funnel, and drop-off analysis</strong> on shipment journeys, informing operational interventions and process redesigns</li>
        <li>Drove <strong>data quality and data integrity workflows</strong>: validation, reconciliation, ETL audit — eliminating reporting discrepancies across systems</li>
        <li>Automated recurring reporting workflows in <strong>Python (Pandas, NumPy)</strong>, tightening turnaround on weekly business reviews</li>
      </ul>
    </div>

    <div class="job">
      <div class="job-header">
        <div class="job-company">Vrun Minerals Pvt. Ltd.</div>
        <div class="job-period">Feb 2024 – Jul 2024</div>
      </div>
      <div class="job-role">Operations Analyst (Intern)</div>
      <div class="job-location">Dehradun, India</div>
      <ul>
        <li>Cleaned and validated distributor and sales datasets in Excel + Python; built dashboards with deviation highlighting</li>
        <li>Performed inventory reconciliation and data accuracy checks across daily operations, reducing reporting errors</li>
        <li>Documented data workflows and measurement requirements for non-technical stakeholders</li>
        <li>Conducted business trend analysis to generate actionable insights for supply-chain decisions</li>
      </ul>
    </div>
  `.trim(),

  PROJECTS: '<div class="project-desc" style="color:#888;font-style:italic;">Personal portfolio in progress (target: dbt project + anomaly-detection demo + RCA case study).</div>',

  EDUCATION: `
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-title">MBA / PGPM — Operations Management <span class="edu-org">· ICFAI Business School, Mumbai</span></div>
        <div class="edu-year">2025 · CGPA 6.83</div>
      </div>
      <div class="edu-desc">Focus: data-driven decision making, process optimization, performance analytics.</div>
    </div>
    <div class="edu-item">
      <div class="edu-header">
        <div class="edu-title">Bachelor of Computer Applications (BCA) <span class="edu-org">· Shree Guru Ram Rai I.T.S., Dehradun</span></div>
        <div class="edu-year">2022 · 72.68%</div>
      </div>
      <div class="edu-desc">Foundation in programming (Java, Python), SQL databases, and analytical problem solving.</div>
    </div>
  `.trim(),

  CERTIFICATIONS: `
    <div class="cert-item">
      <div class="cert-title">dbt Fundamentals</div>
      <div class="cert-org">dbt Labs</div>
      <div class="cert-year">2026</div>
    </div>
  `.trim(),

  SKILLS: `
    <div class="skills-grid">
      <div class="skill-item"><span class="skill-category">SQL & Python:</span> SQL (joins, window functions, CTEs), Python (Pandas, NumPy), Statistical Analysis, A/B Testing Principles, Cohort Analysis, Funnel Analytics</div>
      <div class="skill-item"><span class="skill-category">Analytics Engineering:</span> dbt (dbt Core), ELT Pipelines, Data Transformation, ETL Validation, Data Quality, Process Automation</div>
      <div class="skill-item"><span class="skill-category">BI & Visualization:</span> Power BI, MS Excel (Pivot, Modeling), Dashboard Development, Self-serve Analytics, Looker / Metabase (familiar)</div>
      <div class="skill-item"><span class="skill-category">Operations & Analytics:</span> KPI Tracking, Metrics Ownership, RCA, Customer-issue Diagnosis (analogous), Process Documentation, Conversion Analysis, Drop-off Investigation, Apprentice-mindset</div>
      <div class="skill-item"><span class="skill-category">Collaboration:</span> Stakeholder Management, Data Storytelling, Cross-functional Data Validation, Agile</div>
      <div class="skill-item"><span class="skill-category">Other:</span> Manual Testing, API Testing, Java, ESG Reporting</div>
    </div>
  `.trim(),
};

// -- CV2: Risk/Anomaly (for #024 Stripe Verifications) --
// Block E customizations from report 024:
//   1. Summary: "Operations + data analyst..." with migration framing
//   2. Logistics bullet 5: reconciliation framing
//   3. Logistics bullet 6: migration-style workflow keyword
//   4. Skills add: queue management, exception handling, KYC/KYB exposure

const CV2 = {
  SUMMARY_TEXT: 'Operations + data analyst with ~1.5 years in SQL-based anomaly detection, BI dashboarding, and operations investigations across logistics. Track record owning data integrity, threshold-based alerting, and migration-style reconciliation workflows. Strong fit for Verifications, Risk Ops, Data Quality, and Trust & Safety roles.',

  COMPETENCIES: [
    'SQL', 'Python (Pandas)', 'dbt', 'Power BI', 'Anomaly Detection', 'Threshold-based Alerting',
    'Root Cause Analysis', 'Data Validation', 'Data Integrity', 'Queue Management',
    'Exception Handling', 'Migration / Reconciliation', 'KYC/KYB Exposure (vendor docs)',
  ].map(t => `<span class="competency-tag">${t}</span>`).join('\n      '),

  EXPERIENCE: `
    <div class="job">
      <div class="job-header">
        <div class="job-company">Logistics Integrators Pvt. Ltd.</div>
        <div class="job-period">Mar 2025 – Mar 2026</div>
      </div>
      <div class="job-role">Data &amp; Risk Analyst (Management Trainee Program)</div>
      <div class="job-location">Dehradun, India</div>
      <ul>
        <li>Built <strong>SQL + Python pipelines for statistical anomaly detection</strong> on operational and sales datasets, surfacing outliers before they impacted SLAs or revenue</li>
        <li>Designed <strong>threshold-based alerting and pattern-detection rules</strong> across 10+ KPIs; weekly review of flagged anomalies drove operational interventions</li>
        <li>Led <strong>root-cause analysis (RCA)</strong> on performance spikes — shipment delays, cost overruns, freight discrepancies — partnering with 3–5 cross-functional teams to validate data and ship corrective actions</li>
        <li>Owned <strong>queue-style exception handling</strong> on flagged transactions: triage, document review (vendor / freight / distributor documents, analogous to KYC/KYB workflows), corrective action, audit trail</li>
        <li>Built <strong>validation and reconciliation workflows</strong> across ops, sales, and finance datasets — the same auditable pattern verifications and migration work demand</li>
        <li>Executed <strong>migration-style data workflows</strong> in Python (Pandas, NumPy) for recurring reporting and reconciliation — reducing manual touch on weekly business reviews</li>
      </ul>
    </div>

    <div class="job">
      <div class="job-header">
        <div class="job-company">Vrun Minerals Pvt. Ltd.</div>
        <div class="job-period">Feb 2024 – Jul 2024</div>
      </div>
      <div class="job-role">Operations / Data Analyst (Intern)</div>
      <div class="job-location">Dehradun, India</div>
      <ul>
        <li>Cleaned and validated distributor / sales datasets in Excel + Python; built deviation-highlighting dashboards on inventory and sales trends</li>
        <li>Performed <strong>inventory reconciliation and data-accuracy checks</strong> across daily operations, catching discrepancies before they reached reporting systems</li>
        <li>Documented data workflows and measurement definitions for non-technical stakeholders to improve transparency</li>
        <li>Conducted business trend analysis to inform supply-chain decisions</li>
      </ul>
    </div>
  `.trim(),

  PROJECTS: '<div class="project-desc" style="color:#888;font-style:italic;">Personal portfolio in progress (target: anomaly-detection demo + dbt risk-monitoring project + RCA case study).</div>',

  EDUCATION: CV1.EDUCATION,
  CERTIFICATIONS: CV1.CERTIFICATIONS,

  SKILLS: `
    <div class="skills-grid">
      <div class="skill-item"><span class="skill-category">Detection &amp; Monitoring:</span> Statistical Anomaly Detection, Outlier Detection, Threshold-based Alerting, Pattern Detection, Signal Monitoring, Incident Investigation, RCA</div>
      <div class="skill-item"><span class="skill-category">Data Quality &amp; Integrity:</span> Data Validation, Data Integrity, Reconciliation, ETL Validation, Data Audit, Migration Workflows, QA of Data Pipelines</div>
      <div class="skill-item"><span class="skill-category">SQL &amp; Python:</span> SQL (joins, window functions, CTEs), Python (Pandas, NumPy), Statistical Analysis, A/B Testing Principles, Cohort Analysis, Funnel Analytics</div>
      <div class="skill-item"><span class="skill-category">Analytics Engineering:</span> dbt (dbt Core), ELT Pipelines, Data Transformation</div>
      <div class="skill-item"><span class="skill-category">BI &amp; Visualization:</span> Power BI, MS Excel, BI Dashboard Development, Self-serve Analytics, Looker / Metabase (familiar)</div>
      <div class="skill-item"><span class="skill-category">Operations:</span> Queue Management, Exception Handling, KYC/KYB Document Review (analogous via freight vendor work), KPI Tracking, Stakeholder Management, Cross-functional Validation</div>
      <div class="skill-item"><span class="skill-category">Other:</span> Manual Testing, API Testing, Agile, Java, ESG</div>
    </div>
  `.trim(),
};

// -- Build function --
function build(variantData, outPath) {
  let html = template;
  const data = { ...HEADER_COMMON, ...variantData };
  for (const [key, value] of Object.entries(data)) {
    const re = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(re, value);
  }
  fs.writeFileSync(outPath, html);
  return outPath;
}

const cv1Path = build(CV1, 'templates/cv-built-cv1.html');
const cv2Path = build(CV2, 'templates/cv-built-cv2.html');

console.log(JSON.stringify({
  cv1: { path: cv1Path, size: fs.statSync(cv1Path).size },
  cv2: { path: cv2Path, size: fs.statSync(cv2Path).size },
}, null, 2));
