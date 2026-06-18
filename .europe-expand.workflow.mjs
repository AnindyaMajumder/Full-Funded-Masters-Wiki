export const meta = {
  name: 'europe-expand',
  description: "Sweep every European country for fully-funded master's scholarships a BANGLADESHI national is eligible for (government + major university awards), EXCLUDING the 19 already in src/data/europe.ts. Discover candidates, crawl official pages for ground truth, extract the six required fields with verbatim evidence, adversarially verify, then write accepted records to .research-out/europe/.",
  phases: [
    { title: 'Discover', detail: 'one agent per European country lists NEW fully-funded, Bangladeshi-eligible master\'s programs + official URLs' },
    { title: 'Extract', detail: 'crawl4ai ground-truth crawl + field extraction with verbatim quotes; confirm Bangladesh eligibility' },
    { title: 'Verify', detail: 'adversarial re-check of each field vs saved page text; confirm official link resolves + Bangladesh eligibility; persist JSON' },
  ],
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const REPO = '/home/xiang-yu/Documents/Full-Funded-Masters-Wiki'
const ANCHOR = '2026-06'
const TODAY = '2026-06-18'

// The 34 programs ALREADY in src/data/europe.ts (as of 2026-06-18) — discovery MUST NOT
// re-propose these (regenerate from data with:
//   node -e "const t=require('fs').readFileSync('src/data/europe.ts','utf8');const m='export const europe: Scholarship[] = ';let b=t.slice(t.indexOf(m)+m.length).trim().replace(/;$/,'');JSON.parse(b).forEach(s=>console.log('  '+JSON.stringify(s.name)+','))").
const ALREADY_LISTED = [
  "Ampère Excellence Scholarship (ENS de Lyon)",
  "Amsterdam Merit Scholarship (AMS) — University of Amsterdam",
  "Anne van den Ban Fund (ABF) — Wageningen University & Research",
  "ARES International Training Scholarships (Bourses de formations internationales) — Wallonia-Brussels Federation, Belgium",
  "Czech Government Scholarships for Developing Countries",
  "DAAD EPOS - Development-Related Postgraduate Courses",
  "DAAD Helmut-Schmidt-Programme (Master's Scholarships for Public Policy and Good Governance - PPGG)",
  "DAAD Hilde Domin Programme (Master's for At-Risk Students)",
  "DAAD Study Scholarships - Master Studies for Graduates of All Disciplines",
  "École Polytechnique Master's (MSc&T) Excellence Scholarship — Ecole Polytechnique Foundation",
  "ENS-PSL International Selection (École Normale Supérieure - PSL)",
  "EPFL Master Excellence Fellowships",
  "Erasmus Mundus Joint Masters (EMJM) Scholarships",
  "Eric Bleumink Fellowship (Talent Grant) — University of Groningen",
  "ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)",
  "France Excellence Eiffel Scholarship Programme",
  "Friedrich-Ebert-Stiftung (FES) Scholarship for International Students",
  "Fundación Carolina Postgraduate Scholarships (Becas de Postgrado)",
  "Heinrich Böll Foundation Scholarships (Studienwerk)",
  "International Scholarship Programme (ISP) — Avicenna-Studienwerk",
  "Invest Your Talent in Italy Scholarship",
  "Italian Government Scholarships (MAECI) for Foreign Students and Italian Citizens Living Abroad (IRE)",
  "Justus & Louise van Effen Excellence Scholarship",
  "KAAD Scholarship Programme 1 (Catholic Academic Exchange Service)",
  "Konrad-Adenauer-Stiftung (KAS) Scholarship Programme for International Students",
  "Maastricht University NL-High Potential Scholarship",
  "Rosa-Luxemburg-Stiftung Scholarship (Studienwerk) — International Students (Master's)",
  "Sciences Po Émile Boutmy Scholarship",
  "Stefan Banach NAWA Scholarship Programme (Banach NAWA)",
  "Stipendium Hungaricum Scholarship",
  "Swedish Institute Scholarship for Global Professionals (SISGP)",
  "Türkiye Scholarships (Türkiye Burslari)",
  "Université Paris-Saclay International Master's Scholarship (IDEX)",
  "VLIR-UOS ICP Connect Scholarships",
]

// One bucket per European country (plus a pan-Europe bucket for cross-border programmes).
// `flagships` are HINTS to seed discovery — the agent confirms/expands and drops dead ones.
// `target` caps how many candidates we carry into Extract.
const ALL_COUNTRIES = [
  { key: 'germany', label: 'Germany', target: 6, flagships: [
    'DAAD EPOS — Development-Related Postgraduate Courses', 'KAAD (Catholic Academic Exchange Service) Scholarship',
    'Friedrich-Ebert-Stiftung (FES) Scholarship', 'Rosa-Luxemburg-Stiftung Scholarship', 'Hanns-Seidel-Stiftung Scholarship',
    'Friedrich-Naumann-Stiftung Scholarship', 'Bayer Foundation / Carl Duisberg fellowships', 'Mawista Scholarship' ],
    note: 'EXCLUDE (already listed): DAAD Study Scholarships, DAAD Helmut-Schmidt (PPGG), DAAD EPOS, DAAD Hilde Domin, KAS, Heinrich Böll, Friedrich-Ebert (FES), Rosa-Luxemburg, KAAD, Avicenna ISP. Find OTHER German awards open to Bangladeshis: Hanns-Seidel (HSS) and Friedrich-Naumann (FNF) Studienwerke, Bayer Foundation / Carl Duisberg fellowships, DAAD STIBET, Deutschlandstipendium (only €300/mo partial — include only if tagged partial), Mawista (tuition contribution). Confirm Bangladeshis eligible; mark coverage honestly.' },
  { key: 'france', label: 'France', target: 5, flagships: [
    'Sciences Po Émile-Boutmy Scholarship', 'Ampère Excellence Scholarship (ENS de Lyon)', 'École Polytechnique Master\'s Scholarship (incl. Excellence)',
    'ENS International Selection (PSL)', 'France Excellence (French Embassy in Bangladesh / Campus France)', 'INSP / Sorbonne / IDEX excellence scholarships' ],
    note: 'EXCLUDE (already listed): Eiffel, Ampère (ENS de Lyon), ENS-PSL International Selection, Paris-Saclay IDEX, École Polytechnique MSc&T Excellence, Sciences Po Émile-Boutmy. Find OTHER French awards open to Bangladeshis: INSP / IEP graduate scholarships, Sorbonne & PSL faculty scholarships, IMT, Université Grenoble Alpes IDEX, emlyon/HEC need-based, France Excellence Major. Mark tuition-only vs +stipend honestly.' },
  { key: 'netherlands', label: 'the Netherlands', target: 6, flagships: [
    'Holland Scholarship', 'Amsterdam Excellence Scholarship (AES, University of Amsterdam)', 'Radboud Scholarship Programme',
    'Leiden University Excellence Scholarship (LExS)', 'Utrecht Excellence Scholarship', 'Maastricht University NL-High Potential / UM Holland-High Potential',
    'Wageningen University Anniversary / Africa Scholarship', 'Delft Excellence (Justus & Louise van Effen)', 'Erasmus University Holland Scholarship' ],
    note: 'EXCLUDE (already listed): Eric Bleumink (Groningen), Maastricht NL-High Potential, Justus & Louise van Effen (TU Delft), Anne van den Ban (WUR), Amsterdam Merit (AMS, UvA). NOTE: Amsterdam EXCELLENCE Scholarship (AES) is DISTINCT from AMS Merit (AES adds tuition+living) — it IS a candidate. Orange Knowledge Programme (OKP) ended 2024 — only list a successor/active call. Holland Scholarship is a €5,000 one-off — include but mark partial honestly. Also Radboud, Leiden LExS, Utrecht Excellence, Erasmus Holland, Tilburg, Twente, TU/e awards — confirm Bangladesh eligibility + exact coverage.' },
  { key: 'switzerland', label: 'Switzerland', target: 5, flagships: [
    'Swiss Government Excellence Scholarships (ESKAS/FCS)', 'Geneva Excellence Master Fellowships (University of Geneva)',
    'Graduate Institute Geneva (IHEID) Scholarships', 'University of Lausanne Master\'s Grant', 'ETH Zurich (other than ESOP)' ],
    note: 'EXCLUDE ETH Zurich ESOP and EPFL Excellence (already listed). Swiss Government Excellence Scholarships (research scholarships, art scholarships) — confirm whether Bangladesh is on the eligible-country list FOR THE CURRENT CYCLE (it varies year to year). Mark coverage precisely.' },
  { key: 'sweden', label: 'Sweden', target: 5, flagships: [
    'Lund University Global Scholarship', 'Uppsala University IPK Scholarship', 'KTH Royal Institute of Technology Scholarship',
    'Karolinska Institutet Global Master\'s Scholarship', 'Chalmers IPOET Scholarship', 'University of Gothenburg Study Scholarship' ],
    note: 'EXCLUDE Swedish Institute SISGP (already listed). MANY Swedish university scholarships cover TUITION ONLY (no living costs) — mark tuitionOnly:true honestly; do NOT call them fully funded. Confirm Bangladesh eligibility (usually open to non-EU/EEA fee-paying students).' },
  { key: 'belgium', label: 'Belgium', target: 4, flagships: [
    'Master Mind Scholarships (Government of Flanders)', 'KU Leuven Science@Leuven Scholarship', 'Ghent University Top-up / Master Top-up Scholarship',
    'University of Antwerp scholarships', 'ULB / VUB international master scholarships' ],
    note: 'EXCLUDE ARES and VLIR-UOS ICP Connect (already listed). Master Mind (Flanders gov) is a competitive merit award. Confirm coverage and Bangladesh eligibility.' },
  { key: 'italy', label: 'Italy', target: 6, flagships: [
    'Regional Right-to-Study (DSU) grants — e.g. EDISU Piemonte, DSU Toscana, ER-GO Emilia-Romagna, DiSCo Lazio',
    'University of Bologna Study Grants (Unibo Actions)', 'Politecnico di Milano Merit-based / International Scholarship',
    'University of Padua Excellence Scholarship', 'Scuola Superiore Sant\'Anna / Scuola IUSS Pavia', 'University of Pavia / EDiSU Pavia', 'Bocconi Graduate Merit Award' ],
    note: 'EXCLUDE MAECI (Italian Government) and Invest Your Talent (already listed). Italian REGIONAL right-to-study (DSU/borsa di studio) grants are genuinely fully funded for low-income internationals (fee waiver + cash + canteen + housing) — confirm Bangladesh/non-EU eligibility and the income/merit thresholds. Bologna Study Grants and Padua Excellence are full (waiver + stipend).' },
  { key: 'spain', label: 'Spain', target: 3, flagships: [
    'MAEC-AECID Scholarships (Spanish Agency for International Development Cooperation)', 'University-specific master scholarships (UAB, UCM, UB)' ],
    note: 'EXCLUDE Fundación Carolina (already listed). MAEC-AECID has tracks open to developing countries — confirm Bangladesh eligibility and coverage.' },
  { key: 'austria', label: 'Austria', target: 4, flagships: [
    'OeAD Ernst Mach Grant (worldwide)', 'Scholarship Foundation of the Republic of Austria (Stipendienstiftung)',
    'OeAD Scholarships (Ernst Mach – ASEA-UNINET)', 'University of Vienna / TU Wien international scholarships' ],
    note: 'Ernst Mach Grant worldwide funds master/incoming students with a monthly stipend — confirm the master-level track and Bangladesh eligibility (some Ernst Mach tracks are region-restricted).' },
  { key: 'ireland', label: 'Ireland', target: 4, flagships: [
    'Government of Ireland International Education Scholarships (GOI-IES)', 'Trinity College Dublin Global Excellence Scholarship',
    'University College Dublin (UCD) Global Scholarships', 'University of Galway Hardiman / International Student Scholarships', 'Maynooth University International Scholarship' ],
    note: 'GOI-IES is fully funded (€10,000 stipend + fee waiver) for one year, open worldwide — confirm Bangladesh eligibility. University awards are often partial fee-reductions — mark honestly.' },
  { key: 'norway', label: 'Norway', target: 3, flagships: [
    'NTNU scholarships', 'University of Oslo scholarships', 'BI Norwegian Business School Presidential Scholarship' ],
    note: 'The Quota Scheme was discontinued in 2016. Since 2023 non-EU/EEA students pay tuition. Genuine fully-funded master\'s awards for Bangladeshis are rare — only list ones you can verify on an official page; otherwise return few/none.' },
  { key: 'denmark', label: 'Denmark', target: 3, flagships: [
    'Danish Government Scholarships (Cultural Agreements)', 'Technical University of Denmark (DTU) scholarships',
    'University of Copenhagen / Aarhus University scholarships' ],
    note: 'Danish Government Scholarships are limited and allocated via universities (tuition waiver + sometimes living grant). Confirm Bangladesh eligibility — many are restricted to specific cultural-agreement countries.' },
  { key: 'finland', label: 'Finland', target: 4, flagships: [
    'Finland Scholarship (tuition fee + €5,000 relocation)', 'University of Helsinki Scholarship', 'Aalto University Scholarship',
    'Tampere University Scholarship', 'University of Oulu / Turku scholarships' ],
    note: 'Most Finnish university scholarships cover tuition + first-year relocation grant but NOT full living costs — mark coverage precisely (often tuition-only or tuition+one-off). Confirm Bangladesh eligibility (open to non-EU/EEA fee-payers).' },
  { key: 'portugal', label: 'Portugal', target: 3, flagships: [
    'Calouste Gulbenkian Foundation Scholarships', 'University of Lisbon / NOVA / Porto international scholarships',
    'Católica Lisbon scholarships' ],
    note: 'FCT funding is mostly doctoral. Confirm any master-level fully-funded award and Bangladesh eligibility before listing.' },
  { key: 'poland', label: 'Poland', target: 3, flagships: [
    'NAWA scholarship programmes (other than Banach)', 'Łukasiewicz Scholarship', 'Warsaw / Lodz university international scholarships' ],
    note: 'EXCLUDE Stefan Banach NAWA (already listed). Look for OTHER NAWA programmes open to Bangladeshis (e.g. Solidarity-with..., Poland My First Choice). Confirm coverage.' },
  { key: 'hungary', label: 'Hungary', target: 2, flagships: [
    'Central European University (CEU) Master\'s Scholarships', 'University of Debrecen / Szeged international scholarships' ],
    note: 'EXCLUDE Stipendium Hungaricum (already listed). CEU (now Vienna + Budapest) offers generous merit + need-based master\'s financial aid open worldwide — confirm coverage and Bangladesh eligibility.' },
  { key: 'czechia', label: 'the Czech Republic', target: 2, flagships: [
    'Charles University / Masaryk University scholarships', 'Czech university merit scholarships' ],
    note: 'EXCLUDE Czech Government Scholarships for Developing Countries (already listed). Only list verifiable fully-funded master awards open to Bangladeshis.' },
  { key: 'estonia', label: 'Estonia', target: 3, flagships: [
    'Estonian Government Scholarships (study, via the Education and Youth Board / Dora Plus successor)',
    'University of Tartu scholarships', 'TalTech (Tallinn University of Technology) scholarships' ],
    note: 'Estonia offers government + university tuition-waiver + stipend awards open to non-EU students — confirm Bangladesh eligibility and exactly what is covered.' },
  { key: 'latvia', label: 'Latvia', target: 2, flagships: [
    'Latvian State Scholarships (State Education Development Agency, VIAA/govt bilateral)', 'University of Latvia / RTU scholarships' ],
    note: 'Latvian State Scholarships are bilateral and country-restricted — confirm whether Bangladesh has an agreement before listing; otherwise return none.' },
  { key: 'lithuania', label: 'Lithuania', target: 2, flagships: [
    'Lithuanian State Scholarships (via the Education Exchanges Support Foundation)', 'Vilnius University / KTU scholarships' ],
    note: 'Lithuanian State Scholarships list specific eligible countries each year — confirm Bangladesh is included; mark coverage precisely.' },
  { key: 'slovakia', label: 'Slovakia', target: 2, flagships: [
    'National Scholarship Programme of the Slovak Republic (NSP)', 'Slovak university scholarships' ],
    note: 'NSP is open to international master/PhD students and researchers (monthly stipend) — confirm Bangladesh eligibility and coverage.' },
  { key: 'slovenia', label: 'Slovenia', target: 2, flagships: [
    'Slovenian Government / CMEPIUS / Public Scholarship Fund (Ad futura) scholarships', 'University of Ljubljana scholarships' ],
    note: 'Confirm a master-level award open to Bangladeshis on an official page before listing.' },
  { key: 'romania', label: 'Romania', target: 3, flagships: [
    'Romanian Government Scholarships (Ministry of Foreign Affairs, for non-EU/foreign citizens)',
    'Romanian Government Scholarships (Ministry of Education, "Eugen Ionescu" is francophone-only)', 'Babeș-Bolyai University scholarships' ],
    note: 'Romanian Government Scholarships (MAE) are open to non-EU citizens incl. many Asian/African countries — confirm Bangladesh eligibility and coverage (tuition waiver + monthly stipend + accommodation).' },
  { key: 'bulgaria', label: 'Bulgaria', target: 2, flagships: [
    'Bulgarian Government Scholarships (Ministry of Education and Science, bilateral)', 'Bulgarian university scholarships' ],
    note: 'Bilateral, country-restricted — confirm Bangladesh agreement before listing; otherwise return none.' },
  { key: 'croatia', label: 'Croatia', target: 2, flagships: [
    'Croatian Government Scholarships (Agency for Mobility and EU Programmes, bilateral)', 'University of Zagreb scholarships' ],
    note: 'Bilateral, country-restricted — confirm Bangladesh agreement before listing; otherwise return none.' },
  { key: 'greece', label: 'Greece', target: 3, flagships: [
    'Onassis Foundation Scholarships for Foreigners', 'IKY State Scholarships Foundation', 'Aristotle University / University of Athens scholarships' ],
    note: 'Onassis Foundation funds foreigners for master\'s (monthly stipend + tuition) — confirm Bangladesh eligibility (open to all nationalities for some categories). IKY is mostly for Greeks/EU.' },
  { key: 'cyprus', label: 'Cyprus', target: 2, flagships: [
    'University of Cyprus scholarships', 'Cyprus University of Technology (CUT) scholarships' ],
    note: 'Genuine fully-funded master awards for non-EU are rare — only list verifiable ones; otherwise return none.' },
  { key: 'iceland', label: 'Iceland', target: 2, flagships: [
    'University of Iceland scholarships', 'Reykjavik University scholarships' ],
    note: 'Few full master scholarships for non-EU/EEA — only list verifiable ones; otherwise return none.' },
  { key: 'luxembourg', label: 'Luxembourg', target: 2, flagships: [
    'University of Luxembourg scholarships / grants', 'Luxembourg State financial aid (AideFi) for higher education' ],
    note: 'Confirm a master-level award open to Bangladeshis on an official page; mark coverage precisely.' },
  { key: 'malta', label: 'Malta', target: 2, flagships: [
    'Endeavour Scholarships Scheme (Government of Malta)', 'University of Malta scholarships' ],
    note: 'Endeavour is largely ESF/EU-funded and may be restricted to Malta residents/EU — confirm Bangladesh eligibility before listing; otherwise return none.' },
  { key: 'russia', label: 'Russia', target: 2, flagships: [
    'Open Doors: Russian Scholarship Project (Global Universities Association)', 'Russian Government Scholarship (Rossotrudnichestvo / Russia quota)' ],
    note: 'Open Doors and the Russian Government quota are open to Bangladeshi nationals and fund master\'s (tuition-free + stipend). Confirm on the official page. Keep facts strictly to the official source.' },
  { key: 'serbia', label: 'Serbia', target: 2, flagships: [
    'World in Serbia Scholarship (for Non-Aligned Movement & G-77 countries)', 'University of Belgrade / Novi Sad scholarships' ],
    note: '"World in Serbia" targets Non-Aligned Movement / G-77 countries — Bangladesh is typically eligible. Confirm on the official Serbian government / university page and state coverage.' },
  { key: 'turkey-uni', label: 'Türkiye (university awards)', target: 3, flagships: [
    'Koç University Graduate Scholarship', 'Sabancı University Scholarship', 'Bilkent University Comprehensive Scholarship', 'METU / Boğaziçi graduate assistantships' ],
    note: 'EXCLUDE Türkiye Bursları / Türkiye Scholarships (the government programme, already listed). Several private Turkish universities (Koç, Sabancı, Bilkent) offer full master\'s scholarships (tuition + stipend + housing) open to internationals — confirm Bangladesh eligibility.' },
  { key: 'paneurope', label: 'Europe-wide (cross-border programmes)', target: 3, flagships: [
    'Aga Khan Foundation International Scholarship Programme (ISP)', 'OPEC Fund / OFID Scholarship', 'Open Society Foundations scholarships' ],
    note: 'EXCLUDE Erasmus Mundus Joint Masters (already listed). Aga Khan ISP covers tuition + living for master\'s but is 50% grant / 50% loan — list it but make the loan component explicit in mustKnow. Only list programmes actually open to Bangladeshis and still active (OFID scholarship may be discontinued — verify).' },
]

// ultracode full re-sweep: optionally scale every bucket's candidate target (args.targetBoost; default 1).
const TARGET_BOOST = (args && args.targetBoost) || 1
if (TARGET_BOOST !== 1) for (const c of ALL_COUNTRIES) c.target = Math.ceil(c.target * TARGET_BOOST)
const TARGET_BY_KEY = Object.fromEntries(ALL_COUNTRIES.map(c => [c.key, c.target]))
const CRAWL_CONCURRENCY = (args && args.crawlConcurrency) || 3

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}
function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() }
const EXCLUDE_NORM = ALREADY_LISTED.map(norm)

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const SCHOLARSHIP = {
  type: 'object', additionalProperties: false,
  required: ['name', 'officialLink', 'requiredDocuments', 'timeline', 'benefits', 'acceptanceRate', 'mustKnow', 'sources', 'lastVerified'],
  properties: {
    name: { type: 'string' },
    officialLink: { type: 'string', description: 'Primary/official source ONLY (funder or university own page). Never an aggregator/blog.' },
    requiredDocuments: { type: 'array', items: { type: 'string' }, minItems: 1 },
    timeline: {
      type: 'object', additionalProperties: false,
      required: ['cycle', 'deadline'],
      properties: {
        cycle: { type: 'string', description: 'ABSOLUTE year(s) e.g. "2025-2026" — never "this year"' },
        opens: { type: 'string' },
        deadline: { type: 'string' },
        resultsBy: { type: 'string' },
        notes: { type: 'string', description: 'If current cycle not yet open as of ' + ANCHOR + ', say which cycle these dates are from.' },
      },
    },
    benefits: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'What the funding actually covers' },
    acceptanceRate: {
      type: 'object', additionalProperties: false,
      required: ['value', 'isOfficial'],
      properties: {
        value: { type: 'string', description: 'A number like "12%" ONLY with a real source, else exactly "Not officially published"' },
        isOfficial: { type: 'boolean' },
        source: { type: 'string', description: 'REQUIRED whenever value is a number' },
        estimateNote: { type: 'string', description: 'Only for a real, clearly-labeled third-party estimate' },
      },
    },
    mustKnow: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Critical gotchas: age limits, bonds, supervisor-first, two-step, nationality limits, tuition-only vs stipend, medical forms, loan components' },
    host: {
      type: 'object', additionalProperties: false,
      required: ['country'],
      properties: { country: { type: 'string' }, city: { type: 'string' }, universities: { type: 'array', items: { type: 'string' } } },
    },
    degreeType: { type: 'string', enum: ['taught', 'research', 'both'] },
    duration: { type: 'string' },
    intake: { type: 'array', items: { type: 'string' } },
    eligibleNationalities: { type: 'string' },
    languageRequirements: { type: 'string' },
    standardizedTests: { type: 'string' },
    minGPA: { type: 'string' },
    ageLimit: { type: 'string' },
    applicationFee: { type: 'string' },
    fundingCovers: { type: 'array', items: { type: 'string' } },
    monthlyStipend: { type: 'string' },
    supervisorRequired: { type: 'boolean' },
    twoStepProcess: { type: 'boolean' },
    bondObligation: { type: 'string' },
    coversDependents: { type: 'boolean' },
    interviewStage: { type: 'boolean' },
    renewalConditions: { type: 'string' },
    postStudyWork: { type: 'string' },
    sources: {
      type: 'array', minItems: 1,
      items: { type: 'object', additionalProperties: false, required: ['label', 'url', 'accessed'],
        properties: { label: { type: 'string' }, url: { type: 'string' }, accessed: { type: 'string' } } },
    },
    lastVerified: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
}

const DISCOVER_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['candidates'],
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'officialUrl', 'fullyFundedRationale', 'tuitionOnly', 'bangladeshEligible', 'eligibilityNote'],
        properties: {
          name: { type: 'string' },
          officialUrl: { type: 'string', description: 'The funder/university OWN page — not an aggregator' },
          keyPages: { type: 'array', items: { type: 'string' }, description: 'Sub-pages for eligibility / benefits / deadlines / how-to-apply' },
          fullyFundedRationale: { type: 'string' },
          tuitionOnly: { type: 'boolean', description: 'true if it does NOT include a living stipend' },
          bangladeshEligible: { type: 'boolean', description: 'true if a Bangladeshi national is (or is very likely) eligible — confirmed in extract' },
          eligibilityNote: { type: 'string', description: 'Why a Bangladeshi national qualifies (open to all / developing countries / Asia / specific list incl. BD)' },
        },
      },
    },
  },
}

const EXTRACT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['found'],
  properties: {
    found: { type: 'boolean', description: 'false if not a genuine fully-funded program, not Bangladesh-eligible, a duplicate of an already-listed one, or no official page could be confirmed' },
    skipReason: { type: 'string' },
    slug: { type: 'string' },
    savedFiles: { type: 'array', items: { type: 'string' }, description: 'Relative paths of crawled markdown saved under sources/europe/' },
    crawlOk: { type: 'boolean' },
    bangladeshEligible: { type: 'boolean', description: 'true only if the official source confirms a Bangladeshi national can apply (not excluded by a country list)' },
    bangladeshEvidence: { type: 'string', description: 'Verbatim quote / eligibility-list detail proving Bangladesh is not excluded' },
    fullyFunded: { type: 'boolean', description: 'true = tuition + living stipend; false = tuition-only or partial' },
    coverageNote: { type: 'string', description: 'Exactly what is covered, especially if tuition-only/partial' },
    scholarship: SCHOLARSHIP,
    evidence: {
      type: 'object', additionalProperties: false,
      properties: {
        deadline: { type: 'object', additionalProperties: false, required: ['quote', 'url'], properties: { quote: { type: 'string' }, url: { type: 'string' } } },
        benefits: { type: 'object', additionalProperties: false, required: ['quote', 'url'], properties: { quote: { type: 'string' }, url: { type: 'string' } } },
        requiredDocuments: { type: 'object', additionalProperties: false, required: ['quote', 'url'], properties: { quote: { type: 'string' }, url: { type: 'string' } } },
        mustKnow: { type: 'object', additionalProperties: false, required: ['quote', 'url'], properties: { quote: { type: 'string' }, url: { type: 'string' } } },
        eligibility: { type: 'object', additionalProperties: false, required: ['quote', 'url'], properties: { quote: { type: 'string' }, url: { type: 'string' } } },
      },
    },
  },
}

const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['accept', 'officialLinkResolves', 'bangladeshEligibleConfirmed', 'issues'],
  properties: {
    accept: { type: 'boolean' },
    officialLinkResolves: { type: 'boolean' },
    officialLinkStatus: { type: 'string', description: 'e.g. "200 https://final-url"' },
    bangladeshEligibleConfirmed: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
    removedOrFixedFields: { type: 'array', items: { type: 'string' } },
    correctedScholarship: SCHOLARSHIP,
  },
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
const INTEGRITY = `DATA-INTEGRITY RULES (load-bearing — violating these ruins the dataset):
1. NEVER invent a statistic or a source. If acceptance rate is not officially published, set value EXACTLY "Not officially published" and isOfficial false. A third-party estimate is allowed ONLY if it is real and clearly labeled via estimateNote (with its source). Acceptance rate is the single most-fabricated field — DEFAULT to "Not officially published".
2. officialLink = primary source ONLY (the program/funder's or university's own site). Aggregators/blogs may appear in sources[] only if actually used, NEVER as officialLink.
3. Cite a real, working URL + access date (${TODAY}) for every non-obvious claim in sources[] — especially acceptance rate, deadline, and benefits.
4. Timeline anchor = ${ANCHOR}: if the program's CURRENT cycle has not yet opened, document the most recent known/completed cycle instead and say so in timeline.notes. Always write the ABSOLUTE year(s) in timeline.cycle (e.g. "2025-2026"), never "this year".
5. If you cannot verify a recommended field, OMIT it — do not guess. Set lastVerified to ${TODAY}.
6. The SIX required fields (officialLink, requiredDocuments, timeline, benefits, acceptanceRate, mustKnow) cannot be empty. If you cannot support all six from the official source, set found=false rather than shipping a thin/guessed entry.
7. BANGLADESH GATE: this wiki entry is for a BANGLADESHI applicant. If the official eligibility excludes Bangladesh (e.g. a closed bilateral country list that omits Bangladesh, EU/EEA-only, residents-only), set found=false. Only ship if a Bangladeshi national can genuinely apply.`

function discoverPrompt(c) {
  return `You are a meticulous scholarship researcher for a "Full-Funded Masters Wiki". Find NEW genuinely fully-funded master's scholarships in ${c.label} that a BANGLADESHI national is eligible for.

"Fully funded" = covers tuition AND a living stipend (and usually airfare/insurance). A famous TUITION-ONLY or partial award may still be listed but you MUST mark tuitionOnly:true and say so in fullyFundedRationale.

SCOPE: include BOTH national/government schemes AND major university-specific fully-funded master's awards.

BANGLADESH FILTER (hard): only return programs a Bangladeshi national can apply to — open to all nationalities, or to developing countries / Asia / non-EU fee-payers, or a specific country list that INCLUDES Bangladesh. If a program is EU/EEA-only, residents-only, or a closed bilateral list that omits Bangladesh, DO NOT return it.

EXCLUDE — these are ALREADY in the wiki, do NOT propose them again (or trivial renames of them):
${ALREADY_LISTED.map(n => '  - ' + n).join('\n')}

Start from these hints, CONFIRM each is real and still active, then EXPAND to other genuinely fully-funded programs you can tie to an official page:
HINTS: ${c.flagships.join('; ')}
IMPORTANT CONTEXT: ${c.note}

For each candidate return: name; officialUrl (the funder's/university's OWN page, NOT an aggregator like scholars4dev/scholarshipsads); keyPages (1-4 sub-pages for eligibility/benefits/deadlines/required-documents); fullyFundedRationale (one line on coverage); tuitionOnly (boolean); bangladeshEligible (boolean); eligibilityNote (why a Bangladeshi qualifies).

Use WebSearch to find programs and WebFetch to confirm the official domain + Bangladesh eligibility. Return up to ${c.target + 3} STRONG candidates. If the country genuinely has NO qualifying program for Bangladeshis, return an empty candidates array — do NOT pad. Deduplicate.

Load web tools first if needed: ToolSearch with query "select:WebSearch,WebFetch".

Return ONLY the structured object.`
}

function extractPrompt(c, cand) {
  const slug = slugify(cand.name)
  const dir = `sources/europe`
  return `You are a meticulous, skeptical scholarship data extractor. Build ONE verified record for this program for the "Full-Funded Masters Wiki" (audience: a BANGLADESHI applicant).

PROGRAM: ${cand.name}
HOST COUNTRY/REGION: ${c.label}
CANDIDATE OFFICIAL URL: ${cand.officialUrl}
CANDIDATE KEY PAGES: ${(cand.keyPages || []).join(' | ') || '(none provided — find them)'}
DISCOVERER'S BANGLADESH NOTE: ${cand.eligibilityNote || '(none)'}

WORKING DIRECTORY: ${REPO}  (run all shell commands from here)
SLUG: ${slug}

${INTEGRITY}

STEP 0 — Not a duplicate. This must NOT be one of the already-listed programs (or a trivial rename). If it is, set found=false, skipReason="duplicate of already-listed".

STEP 1 — Confirm the official page. The officialLink MUST be the funder's/university's own site. If the candidate URL is wrong or an aggregator, WebSearch for the real official page.

STEP 2 — Get GROUND TRUTH page text (facts MUST come from the page, not your memory). For the official page and 1-3 key sub-pages (eligibility, benefits/funding, deadlines, how-to-apply), run crawl4ai from ${REPO}:
    .venv/bin/crwl '<URL>' -o markdown-fit
Run them ONE AT A TIME (each launches a headless browser; do NOT parallelize — RAM is limited). Save each crawl to a file under ${dir}/ named ${slug}__<n>.md using the Write tool (paste the crawl output). Record these relative paths in savedFiles. If a crawl fails or returns junk, fall back to WebFetch for that URL and note crawlOk:false.

STEP 3 — Extract the six required fields + any RECOMMENDED fields you can verify from the crawled text. Decide fullyFunded (tuition + stipend) vs tuition-only/partial; write coverageNote. Set eligibleNationalities precisely.

STEP 4 — BANGLADESH GATE. From the eligibility text, confirm a Bangladeshi national can apply. Set bangladeshEligible and paste bangladeshEvidence (verbatim eligibility text / country-list detail). If Bangladesh is excluded, set found=false.

STEP 5 — Evidence. For deadline, benefits, requiredDocuments, mustKnow, and eligibility, provide a VERBATIM quote copied from the crawled page text plus the url it came from (a later verifier string-matches it). Never fabricate.

STEP 6 — Tags. Apply any that genuinely apply: "#NoIELTS", "#NoApplicationFee", "#NoGRE", "#SupervisorRequired", "#ReturnHomeBond", "#CoversFamily", "#FullyFunded", "#TuitionOnly". (Open/closing-soon are computed later — do not add those.)

GATE: If this is not a genuine fully-funded (or notable tuition-only) master's program, not Bangladesh-eligible, a duplicate, or you cannot support all six required fields from the official source, set found=false with a skipReason.

Set scholarship.lastVerified=${TODAY}, every source.accessed=${TODAY}, scholarship.host.country appropriately.

Return ONLY the structured object.`
}

function verifyPrompt(c, ex) {
  const sch = ex.out.scholarship
  const ev = ex.out.evidence || {}
  return `You are an ADVERSARIAL fact-checker. Treat every claim as WRONG until the saved source proves it. You are verifying one extracted scholarship record (audience: a BANGLADESHI applicant) before it ships.

WORKING DIRECTORY: ${REPO}
COUNTRY: ${c.label}
SAVED SOURCE FILES (read these with the Read tool): ${(ex.out.savedFiles || []).join(' | ') || '(none — extractor saved nothing; you must re-fetch)'}
EXTRACTOR'S BANGLADESH EVIDENCE: ${ex.out.bangladeshEvidence || '(none)'}

EXTRACTED RECORD (JSON):
${JSON.stringify(sch, null, 1)}

SUPPORTING QUOTES CLAIMED BY THE EXTRACTOR:
${JSON.stringify(ev, null, 1)}

CHECKS:
1. officialLink resolves: run
     curl -sS -m 25 -o /dev/null -w '%{http_code} %{url_effective}' -L '${sch.officialLink}'
   It must return 200 and NOT redirect to a generic homepage/404. Put the result in officialLinkStatus and set officialLinkResolves.
2. For deadline, benefits, requiredDocuments, mustKnow, eligibility: open the saved source file(s) and confirm the claimed quote ACTUALLY appears and genuinely supports the stated value. If a quote is not found, re-crawl that one URL with  .venv/bin/crwl '<url>' -o markdown-fit  (one at a time) or WebFetch to check. Anything unsupported is an issue.
3. BANGLADESH GATE: confirm from the source that a Bangladeshi national is eligible (not excluded by an EU/EEA-only rule or a closed bilateral list omitting Bangladesh). Set bangladeshEligibleConfirmed. If you cannot confirm eligibility, set accept=false.
4. Acceptance rate: if value is a number, it MUST have a real official source (isOfficial true) or a clearly-labeled real third-party estimate (estimateNote). Otherwise FORCE it to {value:"Not officially published", isOfficial:false} in the corrected record.
5. officialLink must be a primary source, not an aggregator. Timeline must use an absolute cycle year and note the anchor (${ANCHOR}) if the cycle hadn't opened. Coverage must be honest: if tuition-only/partial, tags must include "#TuitionOnly" and mustKnow must say so — do NOT let a partial award be presented as fully funded.
6. Remove any RECOMMENDED field that is not actually supported. The SIX required fields must remain populated and supported; if any cannot be supported, set accept=false.

PERSIST: If (and only if) accept=true AND bangladeshEligibleConfirmed=true, write the final correctedScholarship as pretty JSON (a single scholarship object) to the file
    .research-out/europe/${slugify(sch.name)}.json
using the Write tool, BEFORE returning. (Create directories as needed.) This is the durable record that will be compiled into the site.

OUTPUT: set accept (true only if all six required fields are supported, officialLink resolves, AND Bangladesh eligibility confirmed), list issues and removedOrFixedFields, and return correctedScholarship = the final cleaned record to ship (with fixes applied, lastVerified=${TODAY}). If accept=false you may still return correctedScholarship as your best cleaned version, but it will not be shipped.

Return ONLY the structured object.`
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
phase('Discover')
log(`Sweeping ${ALL_COUNTRIES.length} European buckets for NEW Bangladeshi-eligible fully-funded master's scholarships (excluding ${ALREADY_LISTED.length} already listed). crawlConcurrency=${CRAWL_CONCURRENCY}`)
const discovered = await parallel(ALL_COUNTRIES.map(c => () =>
  agent(discoverPrompt(c), { label: `discover:${c.key}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then(r => ({ c, candidates: (r && r.candidates) || [] }))
))

// Flatten + filter: Bangladesh-eligible, not an already-listed program, dedup across countries.
const seenNames = new Set()
const jobs = []
let droppedExcluded = 0, droppedIneligible = 0
for (const d of discovered.filter(Boolean)) {
  let taken = 0
  for (const cand of d.candidates) {
    if (taken >= TARGET_BY_KEY[d.c.key]) break
    const nn = norm(cand.name)
    if (cand.bangladeshEligible === false) { droppedIneligible++; continue }
    if (EXCLUDE_NORM.some(e => e === nn || (nn.length > 8 && (e.includes(nn) || nn.includes(e))))) { droppedExcluded++; continue }
    if (seenNames.has(nn)) continue
    seenNames.add(nn)
    jobs.push({ c: d.c, cand })
    taken++
  }
}
log(`Discovered ${jobs.length} candidate programs (dropped ${droppedExcluded} already-listed, ${droppedIneligible} Bangladesh-ineligible). Per country: ${ALL_COUNTRIES.map(c => `${c.key}:${jobs.filter(j => j.c.key === c.key).length}`).join(' ')}`)
if (!jobs.length) { log('No new candidates — aborting.'); return { shipped: [], dropped: [], counts: {} } }

// Extract → Verify, chunked to bound concurrent headless-browser crawls.
phase('Extract')
const shipped = []
const dropped = []
let processed = 0
for (const grp of chunk(jobs, CRAWL_CONCURRENCY)) {
  const results = await parallel(grp.map(j => () =>
    agent(extractPrompt(j.c, j.cand), {
      label: `extract:${j.c.key}:${slugify(j.cand.name)}`, phase: 'Extract', schema: EXTRACT_SCHEMA,
    }).then(async (out) => {
      if (!out || !out.found || !out.scholarship) {
        return { dropped: { country: j.c.key, name: j.cand.name, reason: (out && out.skipReason) || 'extract: not found/eligible' } }
      }
      const verdict = await agent(verifyPrompt(j.c, { out }), {
        label: `verify:${j.c.key}:${slugify(out.scholarship.name)}`, phase: 'Verify', schema: VERIFY_SCHEMA,
      })
      if (verdict && verdict.accept && verdict.bangladeshEligibleConfirmed && verdict.correctedScholarship) {
        return { shipped: { country: j.c.key, scholarship: verdict.correctedScholarship } }
      }
      return { dropped: { country: j.c.key, name: out.scholarship.name, reason: (verdict && verdict.issues && verdict.issues.join('; ')) || 'verify failed/null' } }
    })
  ))
  for (const r of results.filter(Boolean)) {
    if (r.shipped) shipped.push(r.shipped)
    else if (r.dropped) dropped.push(r.dropped)
  }
  processed += grp.length
  log(`Progress: ${processed}/${jobs.length} processed — ${shipped.length} shipped, ${dropped.length} dropped`)
}

const counts = {}
for (const s of shipped) counts[s.country] = (counts[s.country] || 0) + 1
log(`DONE. Shipped ${shipped.length} new Europe scholarships. By country: ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')}`)
log(`Dropped ${dropped.length}: ${dropped.slice(0, 40).map(d => `${d.country}/${d.name}`).join(' | ')}`)

return { shipped: shipped.map(s => ({ country: s.country, name: s.scholarship.name })), dropped, counts, total: shipped.length }
