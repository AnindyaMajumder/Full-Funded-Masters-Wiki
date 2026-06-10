#!/usr/bin/env node
/**
 * Compile verified scholarship JSON into a typed src/data/<country>.ts file.
 *
 * Usage:
 *   node scripts/build-data.mjs <countryKey> <source>
 *
 *   <source> may be:
 *     - a directory containing one *.json per scholarship (Phase 3 / .research-out/<key>/)
 *     - a .json file holding an array of scholarships
 *     - a .json file holding { byCountry: { <key>: [...] } } or { <key>: [...] }
 *
 * Only fields in the Scholarship contract are kept (extras like evidence/countryKey
 * are stripped). Entries missing any of the six required fields are dropped with a warning.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [, , key, source] = process.argv;
if (!key || !source) {
  console.error('usage: node scripts/build-data.mjs <countryKey> <source>');
  process.exit(1);
}

// Whitelist of Scholarship keys (order preserved for readability).
const SCALAR = [
  'name', 'officialLink', 'requiredDocuments', 'timeline', 'benefits', 'acceptanceRate',
  'mustKnow', 'host', 'degreeType', 'duration', 'intake', 'eligibleNationalities',
  'languageRequirements', 'standardizedTests', 'minGPA', 'ageLimit', 'applicationFee',
  'fundingCovers', 'monthlyStipend', 'supervisorRequired', 'twoStepProcess',
  'bondObligation', 'coversDependents', 'interviewStage', 'renewalConditions',
  'postStudyWork', 'sources', 'lastVerified', 'tags',
];
const REQUIRED = ['name', 'officialLink', 'requiredDocuments', 'timeline', 'benefits', 'acceptanceRate', 'mustKnow', 'sources', 'lastVerified'];

function loadEntries(src) {
  const p = resolve(src);
  const st = statSync(p);
  if (st.isDirectory()) {
    return readdirSync(p).filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(p, f), 'utf8')));
  }
  const parsed = JSON.parse(readFileSync(p, 'utf8'));
  if (Array.isArray(parsed)) return parsed;
  if (parsed.byCountry && parsed.byCountry[key]) return parsed.byCountry[key];
  if (parsed[key]) return parsed[key];
  if (parsed.scholarship) return [parsed.scholarship];
  throw new Error('Could not find an array of scholarships in ' + src);
}

function clean(raw) {
  const out = {};
  for (const k of SCALAR) {
    if (raw[k] !== undefined && raw[k] !== null && !(Array.isArray(raw[k]) && raw[k].length === 0)) {
      out[k] = raw[k];
    }
  }
  return out;
}

const raw = loadEntries(source);
const kept = [];
const dropped = [];
for (const r of raw) {
  const c = clean(r);
  const missing = REQUIRED.filter((f) => c[f] === undefined);
  if (missing.length) { dropped.push({ name: r.name || '(unnamed)', missing }); continue; }
  kept.push(c);
}
// De-dupe by name, sort by name for stable diffs.
const seen = new Set();
const unique = kept.filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)));
unique.sort((a, b) => a.name.localeCompare(b.name));

const banner = `import type { Scholarship } from '../types/scholarship';\n\n// Auto-compiled from verified research output. Do not hand-edit casually;\n// re-run: node scripts/build-data.mjs ${key} <source>\n`;
const body = `export const ${key}: Scholarship[] = ${JSON.stringify(unique, null, 2)};\n`;
writeFileSync(resolve('src/data', `${key}.ts`), banner + '\n' + body);

console.log(`[build-data] ${key}: wrote ${unique.length} scholarships -> src/data/${key}.ts`);
if (dropped.length) {
  console.log(`[build-data] dropped ${dropped.length} entr(y/ies) missing required fields:`);
  for (const d of dropped) console.log(`   - ${d.name}: missing ${d.missing.join(', ')}`);
}
