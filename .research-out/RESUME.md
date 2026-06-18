# RESUME — europe-expand merge (WIP)

Workflow `.europe-expand.workflow.mjs` finished and wrote **19 candidate JSON** to
`.research-out/europe/`. Vetting is **done**; the merge into `src/data/europe.ts` is
**not done yet**. `src/data/europe.ts` still holds the original 19 records.

## Vetting result (2026-06-18) — 15 unique programs (4 dupe variants)

### ACCEPT — 12 (fully funded, living stipend present)
- daad-epos-development-related-postgraduate-courses
- daad-hilde-domin-programme-master-s-for-at-risk-students
- friedrich-ebert-stiftung-fes-scholarship-for-international-s
- international-scholarship-programme-isp-avicenna-studienwerk
- kaad-scholarship-programme-1-catholic-academic-exchange-serv
- maastricht-university-nl-high-potential-scholarship
- amp-re-excellence-scholarship-ens-de-lyon
- ens-psl-international-selection-cole-normale-sup-rieure-psl
- rosa-luxemburg-stiftung-scholarship-studienwerk-internationa
- universit-paris-saclay-international-master-s-scholarship-id
- justus-louise-van-effen-excellence-scholarship  (TU Delft — full tuition + living)
- anne-van-den-ban-fund-abf-wageningen-university-research  (full-funding track)

### REJECT — 3 (record itself says NOT fully funded — tuition-only/partial, no stipend)
- cole-polytechnique-master-s-msc-t-excellence-scholarship-eco
- sciences-po-mile-boutmy-scholarship
- amsterdam-merit-scholarship-ams-university-of-amsterdam

### DUPES dropped (keep richer variant, drop these)
- amp-re-scholarships-of-excellence-bourse-d-excellence-amp-re
- universit-paris-saclay-international-master-s-scholarship-pr
- rosa-luxemburg-stiftung-scholarship-international-study-scho
- ens-psl-international-selection-s-lection-internationale-col

## Next steps (not yet done)
1. Re-verify the 12 accepts each have the 9 required contract fields + Bangladesh eligibility.
2. Merge: `src/data/europe.ts` body is valid JSON — strip the banner +
   `export const europe: Scholarship[] = ` prefix + trailing `;`, parse the existing 19,
   concat the 12 accepted JSON into one `merged.json` array, then run
   `node scripts/build-data.mjs europe merged.json` (overwrites, whitelists contract
   fields, de-dupes by name, sorts → 31 records).
3. `npm run check` must pass.
4. CLAUDE.md Coverage: Europe 19 → 31, total 93 → 105, list the new programs.

Anchors: ANCHOR=2026-06, lastVerified=2026-06-18.
