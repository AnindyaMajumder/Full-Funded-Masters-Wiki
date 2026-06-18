#!/usr/bin/env node
// Run AFTER the Europe re-sweep completes. Isolates the NEW accepted records (files that
// appeared since the pre-sweep baseline), validates each, and assembles the final merged
// array. Does NOT compile on its own — prints a vetting report; review, then run build-data.
import fs from 'node:fs';
import path from 'node:path';

const DIR = '.research-out/europe';
const REQ = ['name', 'officialLink', 'requiredDocuments', 'timeline', 'benefits', 'acceptanceRate', 'mustKnow', 'sources', 'lastVerified'];

// Files that existed BEFORE the re-sweep (12 merged + 3 tuition-only merged + 4 dupes).
const baseline = new Set(
  fs.readFileSync('.research-out/_baseline_before_resweep.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean),
);

// Existing europe.ts records (currently 34).
const ts = fs.readFileSync('src/data/europe.ts', 'utf8');
const marker = 'export const europe: Scholarship[] = ';
let body = ts.slice(ts.indexOf(marker) + marker.length).trim();
if (body.endsWith(';')) body = body.slice(0, -1).trim();
const existing = JSON.parse(body);
const existingNames = new Set(existing.map((s) => s.name));

const all = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));
const newFiles = all.filter((f) => !baseline.has(f)).sort();
console.log(`baseline ${baseline.size} files; folder now ${all.length}; NEW from re-sweep: ${newFiles.length}`);

const accept = [];
const flagged = [];
for (const f of newFiles) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const miss = REQ.filter((k) => o[k] === undefined || (Array.isArray(o[k]) && o[k].length === 0));
  const h = JSON.stringify(o).toLowerCase();
  const flags = [];
  if (miss.length) flags.push('MISSING:' + miss.join(','));
  if (!h.includes('bangladesh')) flags.push('NO-BD-MENTION');
  if (existingNames.has(o.name)) flags.push('DUP-OF-EXISTING');
  const country = (o.host && o.host.country) || '?';
  const stipend = o.monthlyStipend ? 'stipend' : (h.includes('tuition') && /tuitiononly|tuitionnotcovered|tuition-only/.test(JSON.stringify(o.tags || []).toLowerCase()) ? 'PARTIAL' : '?');
  const rec = { f, name: o.name, country, tags: o.tags || [], stipend, flags };
  if (flags.length) flagged.push(rec);
  else accept.push({ o, rec });
}

console.log('\n=== NEW accepts (clean) ===');
for (const { rec } of accept) console.log(`  + [${rec.country}] ${rec.name}  ${rec.stipend}  ${JSON.stringify(rec.tags)}`);
if (flagged.length) {
  console.log('\n=== FLAGGED (review before merging) ===');
  for (const rec of flagged) console.log(`  ⚠ ${rec.name}  (${rec.f})  ${rec.flags.join(' | ')}`);
}

// Assemble final array: existing + clean new accepts, de-duped by name.
const seen = new Set(existing.map((s) => s.name));
const add = accept.map((a) => a.o).filter((o) => (seen.has(o.name) ? false : (seen.add(o.name), true)));
fs.writeFileSync('.research-out/europe-merged-all.json', JSON.stringify([...existing, ...add], null, 2));
console.log(`\nwrote .research-out/europe-merged-all.json: ${existing.length} existing + ${add.length} new = ${existing.length + add.length}`);
console.log('NEXT (after reviewing the report above): node scripts/build-data.mjs europe .research-out/europe-merged-all.json');
