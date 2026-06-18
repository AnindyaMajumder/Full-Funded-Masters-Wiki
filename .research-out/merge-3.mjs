#!/usr/bin/env node
// Fold the 3 already-verified tuition-only / partial awards (previous run crawled +
// adversarially verified them) into europe.ts. Normalize Amsterdam's non-standard tags.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.research-out/europe';
const ADD = [
  'cole-polytechnique-master-s-msc-t-excellence-scholarship-eco',
  'sciences-po-mile-boutmy-scholarship',
  'amsterdam-merit-scholarship-ams-university-of-amsterdam',
];

// 1. Normalize the Amsterdam artifact's tags to the project vocabulary (honest: stipend-only,
//    tuition NOT covered). Keep mustKnow/benefits untouched.
const amsPath = join(DIR, 'amsterdam-merit-scholarship-ams-university-of-amsterdam.json');
const ams = JSON.parse(readFileSync(amsPath, 'utf8'));
ams.tags = ['#TuitionNotCovered'];
writeFileSync(amsPath, JSON.stringify(ams, null, 2) + '\n');
console.log('normalized Amsterdam tags -> ' + JSON.stringify(ams.tags));

// 2. Parse the existing 31 records out of europe.ts
const ts = readFileSync('src/data/europe.ts', 'utf8');
const marker = 'export const europe: Scholarship[] = ';
let arrText = ts.slice(ts.indexOf(marker) + marker.length).trim();
if (arrText.endsWith(';')) arrText = arrText.slice(0, -1).trim();
const existing = JSON.parse(arrText);
console.log('existing records: ' + existing.length);

// 3. Load the 3 awards + collision check
const existingNames = new Set(existing.map((s) => s.name));
const adds = ADD.map((slug) => JSON.parse(readFileSync(join(DIR, slug + '.json'), 'utf8')));
for (const a of adds) if (existingNames.has(a.name)) console.log('  ⚠ COLLISION: ' + a.name);

const merged = [...existing, ...adds];
writeFileSync('.research-out/europe-merged-34.json', JSON.stringify(merged, null, 2));
console.log('wrote .research-out/europe-merged-34.json with ' + merged.length + ' records');
console.log('added:\n' + adds.map((a) => '  + ' + a.name + '  ' + JSON.stringify(a.tags || [])).join('\n'));
