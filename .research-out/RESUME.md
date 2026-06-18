# DONE — europe-expand merge (completed 2026-06-18)

Workflow `.europe-expand.workflow.mjs` wrote 19 candidate JSON to `.research-out/europe/`.
Vetting + merge are **complete**. `src/data/europe.ts` now holds **31 records** (original 19
+ 12 accepts), `npm run check` and `npm run build` pass, and CLAUDE.md Coverage was updated
(Europe 19→31, total 93→105). No pending work remains.

## Vetting outcome — 15 unique programs (4 dupe variants)

### ACCEPTED — 12 (merged in)
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
- justus-louise-van-effen-excellence-scholarship
- anne-van-den-ban-fund-abf-wageningen-university-research  (kept but tagged #TuitionOnly —
  its own mustKnow flags "NOT GUARANTEED FULL FUNDING"; offers a genuine full track, handled
  honestly like GREAT / LKYSPP-Hinrich elsewhere in the dataset)

All 12 re-verified at merge time: 9 required contract fields present + Bangladesh eligibility
documented on the official page + living-stipend (or full-funding) signal.

### REJECTED — 3 (record itself says NOT fully funded — tuition-only/partial, no stipend)
- cole-polytechnique-master-s-msc-t-excellence-scholarship-eco
- sciences-po-mile-boutmy-scholarship
- amsterdam-merit-scholarship-ams-university-of-amsterdam

### DUPES dropped — 4 (kept the richer variant of each)
- amp-re-scholarships-of-excellence-bourse-d-excellence-amp-re
- universit-paris-saclay-international-master-s-scholarship-pr
- rosa-luxemburg-stiftung-scholarship-international-study-scho
- ens-psl-international-selection-s-lection-internationale-col

Anchors: ANCHOR=2026-06, lastVerified=2026-06-18.
