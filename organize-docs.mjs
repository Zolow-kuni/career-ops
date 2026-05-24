#!/usr/bin/env node
/**
 * organize-docs.mjs
 * Copies a generated resume + cover letter into Cover Letter and Resume/{Company}/
 * and renames them to the canonical pattern.
 *
 * Usage:
 *   node organize-docs.mjs <CompanyName> [cvPath] [clPath]
 *
 * If cvPath / clPath are omitted the script auto-detects the latest matching
 * files in output/ using the known naming conventions.
 *
 * Called automatically by career-ops after document generation.
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_DIR  = join(__dirname, 'Cover Letter and Resume');
const OUTPUT_DIR = join(__dirname, 'output');

// Ensure base folder exists (idempotent)
mkdirSync(BASE_DIR, { recursive: true });

const [,, companyArg, cvArg, clArg] = process.argv;

if (!companyArg) {
  console.error('Usage: node organize-docs.mjs <CompanyName> [cvPath] [clPath]');
  process.exit(1);
}

const company = companyArg.trim();
const slug    = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/** Find the latest file in output/ matching a predicate, sorted by mtime desc */
function findLatest(predicate) {
  const files = readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.pdf') && predicate(f))
    .map(f => ({ name: f, path: join(OUTPUT_DIR, f) }))
    .sort((a, b) => {
      const ma = a.name.match(/(\d+)/);
      const mb = b.name.match(/(\d+)/);
      // prefer higher numbered version
      if (ma && mb) return parseInt(mb[0]) - parseInt(ma[0]);
      return 0;
    });
  return files[0]?.path ?? null;
}

// Resolve cv path
let cvPath = cvArg ? resolve(cvArg) : findLatest(
  f => (f.startsWith('cv-subham') || f.startsWith('resume-subham')) &&
       f.includes(slug)
);

// Resolve cover letter path
let clPath = clArg ? resolve(clArg) : findLatest(
  f => (f.startsWith('cover-letter') || f.startsWith('cl-')) &&
       f.includes(slug)
);

if (!cvPath || !existsSync(cvPath)) {
  console.error(`CV not found for company "${company}". Pass the path explicitly.`);
  process.exit(1);
}
if (!clPath || !existsSync(clPath)) {
  console.error(`Cover letter not found for company "${company}". Pass the path explicitly.`);
  process.exit(1);
}

// Create company subfolder
const companyDir = join(BASE_DIR, company);
mkdirSync(companyDir, { recursive: true });

// Copy + rename
const destCV = join(companyDir, `Resume_${company}.pdf`);
const destCL = join(companyDir, `Cover_Letter_${company}.pdf`);

copyFileSync(cvPath, destCV);
copyFileSync(clPath, destCL);

console.log(`\nOrganized docs for ${company}:`);
console.log(`  Resume      -> Cover Letter and Resume/${company}/Resume_${company}.pdf`);
console.log(`  Cover Letter-> Cover Letter and Resume/${company}/Cover_Letter_${company}.pdf`);

// Print updated folder tree
console.log('\nUpdated folder tree:');
try {
  const tree = execSync(`cmd /c "tree /f \\"${BASE_DIR}\\""`, { encoding: 'utf8' });
  console.log(tree);
} catch {
  // fallback: just list directories
  readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .forEach(d => {
      console.log(`  ${d.name}/`);
      readdirSync(join(BASE_DIR, d.name)).forEach(f => console.log(`    ${f}`));
    });
}
