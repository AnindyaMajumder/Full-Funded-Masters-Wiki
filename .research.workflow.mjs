export const meta = {
  name: 'fund-research',
  description: 'Research genuinely fully-funded master\'s scholarships per country: discover, crawl official pages for ground truth, extract the six required fields with verbatim supporting quotes, then adversarially verify before shipping.',
  phases: [
    { title: 'Discover', detail: 'one agent per country lists candidate fully-funded programs + official URLs' },
    { title: 'Extract', detail: 'crawl4ai ground-truth crawl + field extraction, RAM-capped at 3 concurrent' },
    { title: 'Verify', detail: 'adversarial re-check of each high-risk field against saved page text; confirm official link resolves' },
  ],
}

// ---------------------------------------------------------------------------
// Config. Country configs live HERE; args just selects which to run.
//   args = { only: ['uk'], crawlConcurrency: 3 }   (only defaults to ['uk'])
// args may arrive as an object or a JSON string — handle both.
// ---------------------------------------------------------------------------
const REPO = '/home/xiang-yu/Documents/Full-Funded-Masters-Wiki'
const ANCHOR = '2026-06'
const TODAY = '2026-06-06'

const ALL_COUNTRIES = {
  uk: {
    key: 'uk', label: 'the United Kingdom', target: 16,
    flagships: [
      'Chevening Scholarships (UK FCDO)',
      "Commonwealth Master's Scholarships (CSC UK)",
      'Gates Cambridge Scholarship (University of Cambridge)',
      'Clarendon Fund Scholarships (University of Oxford)',
      'Rhodes Scholarship (University of Oxford)',
      'Felix Scholarship (Oxford/SOAS/Reading)',
      'Oxford-Weidenfeld and Hoffmann Scholarships',
      'Cambridge Trust Scholarships',
      'Edinburgh Global Scholarships',
      'GREAT Scholarships (British Council)',
    ],
    note: "Marshall Scholarship is US-citizens-only. Many UK university awards are partial fee-discounts only — EXCLUDE those. Include only genuinely fully-funded (tuition + living stipend) master's programmes, or a notable tuition-only award clearly tagged #TuitionOnly. Gates Cambridge and Rhodes fund master's degrees too, not only PhD.",
  },
  europe: {
    key: 'europe', label: 'Europe (continental)', target: 16,
    flagships: [
      'Erasmus Mundus Joint Masters (European Commission)',
      'DAAD Scholarships (Germany — EPOS / Study Scholarships)',
      'Swedish Institute Scholarships for Global Professionals (SISGP)',
      'Eiffel Excellence Scholarship Programme (France, Campus France)',
      'Swiss Government Excellence Scholarships',
      'Holland Scholarship / Orange Knowledge Programme (Netherlands)',
      'Stipendium Hungaricum (Hungary)',
      'Italian Government Scholarships (MAECI)',
      'Ernst Mach Grant (Austria, OeAD)',
      'VLIR-UOS Scholarships (Belgium)',
    ],
    note: "Cover continental Europe (NOT the UK). Erasmus Mundus is the flagship and is multi-country. Include only genuinely fully-funded (tuition + living stipend/monthly allowance) master's programmes. Government scholarships (DAAD, SI, Eiffel, Swiss, Stipendium Hungaricum) are the strongest. Many country-specific gov scholarships exist — prefer the official government/agency page as officialLink.",
  },
  australia: {
    key: 'australia', label: 'Australia', target: 12,
    flagships: [
      'Australia Awards Scholarships (DFAT)',
      'Australian Government Research Training Program (RTP)',
      'University of Melbourne Graduate Research Scholarships',
      'ANU (Australian National University) scholarships',
      'University of Sydney International Scholarship (USydIS)',
      'University of Queensland Research Training Scholarship',
      'Monash International Scholarships',
      'Adelaide Scholarships International',
    ],
    note: "Endeavour Leadership Program is DISCONTINUED — exclude it. Australia Awards (DFAT) target developing/partner countries. RTP is for research degrees (incl. Master's by Research) and includes a stipend. Coursework master's full funding is rarer — be honest about what's covered. Include only tuition + living stipend programmes.",
  },
  usa: {
    key: 'usa', label: 'the United States', target: 12,
    flagships: [
      'Fulbright Foreign Student Program',
      'Knight-Hennessy Scholars (Stanford University)',
      'Hubert H. Humphrey Fellowship Program',
      'Rotary Peace Fellowship',
      'Joint Japan/World Bank Graduate Scholarship Program (some US host universities)',
      'Aga Khan Foundation International Scholarship Programme',
      'Yale World Fellows',
      'MIT / Stanford / Ivy League departmental fellowships (representative examples)',
    ],
    note: "CRITICAL: most fully-funded master's funding in the USA comes from DEPARTMENTAL assistantships/fellowships (TA/RA), NOT named scholarships. Include the few genuine named fully-funded programs (Fulbright FSP, Knight-Hennessy, Humphrey, Rotary Peace). For departmental funding, you may include ONE or TWO representative, verifiable university fellowship pages and make the 'mostly assistantships' reality explicit in mustKnow. Do NOT invent named USA scholarships to pad the count.",
  },
  china: {
    key: 'china', label: 'China', target: 12,
    flagships: [
      'Chinese Government Scholarship (CSC) — CGS',
      'Schwarzman Scholars (Tsinghua University)',
      'Yenching Academy of Peking University',
      'Confucius Institute Scholarship (CIS / Chinese Government Scholarship for Chinese Language)',
      'Belt and Road / Silk Road Scholarship',
      'University-specific President scholarships (e.g. Tsinghua, Peking, Fudan, Zhejiang, SJTU)',
    ],
    note: "CSC (Chinese Government Scholarship) is the flagship and has multiple application channels (Type A via embassy, Type B/C via university). Schwarzman and Yenching are master's programmes at Tsinghua/Peking. Be explicit about Chinese-language requirements vs English-taught tracks, and any post-study/bond conditions. Include only fully-funded (tuition + monthly stipend + accommodation/insurance).",
  },
  japan: {
    key: 'japan', label: 'Japan', target: 12,
    flagships: [
      'MEXT Scholarship (Japanese Government) — Research Students / University Recommendation',
      'ADB-Japan Scholarship Program (ADB-JSP)',
      'ABE Initiative (African Business Education)',
      'Joint Japan/World Bank Graduate Scholarship Program (GRIPS / Japanese host universities)',
      'IMF-Japan / Asian Scholarship at GRIPS',
      'University-specific scholarships (e.g. University of Tokyo, Kyoto, GRIPS, APU)',
    ],
    note: "MEXT is the flagship: two main routes (Embassy Recommendation and University Recommendation) — explain the age limit, the research-student vs degree distinction, and that a supervisor/letter of acceptance is often needed. ADB-JSP targets ADB developing member countries. Include only fully-funded (tuition + monthly stipend + airfare) programmes.",
  },
}

let _A = args
if (typeof _A === 'string') { try { _A = JSON.parse(_A) } catch (e) { _A = {} } }
if (!_A || typeof _A !== 'object') _A = {}
const only = Array.isArray(_A.only) && _A.only.length ? _A.only : ['uk']
const countries = only.map((k) => ALL_COUNTRIES[k]).filter(Boolean)
const CRAWL_CONCURRENCY = _A.crawlConcurrency || 3

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}
function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const EVID = {
  type: 'object', additionalProperties: false,
  required: ['quote', 'url'],
  properties: {
    quote: { type: 'string', description: 'VERBATIM text copied from the crawled page that supports the field' },
    url: { type: 'string', description: 'The page URL the quote came from' },
  },
}

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
    mustKnow: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Critical gotchas: age limits, bonds, supervisor-first, two-step, nationality limits, tuition-only vs stipend, medical forms' },
    host: {
      type: 'object', additionalProperties: false,
      required: ['country'],
      properties: {
        country: { type: 'string' },
        city: { type: 'string' },
        universities: { type: 'array', items: { type: 'string' } },
      },
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
      items: {
        type: 'object', additionalProperties: false,
        required: ['label', 'url', 'accessed'],
        properties: { label: { type: 'string' }, url: { type: 'string' }, accessed: { type: 'string' } },
      },
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
        required: ['name', 'officialUrl', 'fullyFundedRationale', 'tuitionOnly'],
        properties: {
          name: { type: 'string' },
          officialUrl: { type: 'string', description: 'The funder/university OWN page — not an aggregator' },
          keyPages: { type: 'array', items: { type: 'string' }, description: 'Sub-pages for eligibility / benefits / deadlines / how-to-apply' },
          fullyFundedRationale: { type: 'string' },
          tuitionOnly: { type: 'boolean', description: 'true if it does NOT include a living stipend' },
        },
      },
    },
  },
}

const EXTRACT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['found'],
  properties: {
    found: { type: 'boolean', description: 'false if not a genuine fully-funded program or no official page could be confirmed' },
    skipReason: { type: 'string' },
    slug: { type: 'string' },
    savedFiles: { type: 'array', items: { type: 'string' }, description: 'Relative paths of crawled markdown saved under sources/<country>/' },
    crawlOk: { type: 'boolean' },
    fullyFunded: { type: 'boolean', description: 'true = tuition + living stipend; false = tuition-only or partial' },
    coverageNote: { type: 'string', description: 'Exactly what is covered, especially if tuition-only' },
    scholarship: SCHOLARSHIP,
    evidence: {
      type: 'object', additionalProperties: false,
      properties: {
        deadline: EVID, benefits: EVID, acceptanceRate: EVID, requiredDocuments: EVID, mustKnow: EVID,
      },
    },
  },
}

const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['accept', 'officialLinkResolves', 'issues'],
  properties: {
    accept: { type: 'boolean' },
    officialLinkResolves: { type: 'boolean' },
    officialLinkStatus: { type: 'string', description: 'e.g. "200 https://final-url"' },
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
6. The SIX required fields (officialLink, requiredDocuments, timeline, benefits, acceptanceRate, mustKnow) cannot be empty. If you cannot support all six from the official source, set found=false rather than shipping a thin/guessed entry.`

function discoverPrompt(c) {
  return `You are a meticulous scholarship researcher for a "Full-Funded Masters Wiki". Find GENUINELY FULLY-FUNDED master's scholarships for international students to study in ${c.label}.

"Fully funded" = covers tuition AND a living stipend (and usually airfare/insurance). A famous TUITION-ONLY award may still be listed but mark tuitionOnly:true.

Start from these flagship programs and CONFIRM each is real, then EXPAND to other well-known genuinely fully-funded programs:
FLAGSHIPS: ${c.flagships.join('; ')}
${c.note ? 'IMPORTANT CONTEXT: ' + c.note : ''}

For each candidate return:
- name
- officialUrl: the funder's or university's OWN page (NOT an aggregator like scholars4dev, scholarshipsads, etc.)
- keyPages: 1-4 sub-pages likely holding eligibility / benefits / deadlines / required-documents
- fullyFundedRationale: one line on what it covers
- tuitionOnly: boolean

Use WebSearch to find programs and WebFetch only to confirm the official domain. Return up to ${c.target + 6} STRONG candidates (flagships first). Exclude clearly partial/merit-discount-only awards and anything you cannot tie to an official page. Deduplicate.

If WebSearch/WebFetch are not already available, load them first via ToolSearch with query "select:WebSearch,WebFetch".

Return ONLY the structured object.`
}

function extractPrompt(c, cand) {
  const slug = slugify(cand.name)
  const dir = `sources/${c.key}`
  return `You are a meticulous, skeptical scholarship data extractor. Build ONE verified record for this program for the "Full-Funded Masters Wiki".

PROGRAM: ${cand.name}
HOST COUNTRY/REGION: ${c.label}
CANDIDATE OFFICIAL URL: ${cand.officialUrl}
CANDIDATE KEY PAGES: ${(cand.keyPages || []).join(' | ') || '(none provided — find them)'}

WORKING DIRECTORY: ${REPO}  (run all shell commands from here)
SLUG: ${slug}

${INTEGRITY}

STEP 1 — Confirm the official page. The officialLink MUST be the funder's/university's own site. If the candidate URL is wrong or an aggregator, WebSearch for the real official page.

STEP 2 — Get GROUND TRUTH page text (facts MUST come from the page, not your memory). For the official page and 1-3 key sub-pages (eligibility, benefits/funding, deadlines, how-to-apply), run crawl4ai:
    .venv/bin/crwl '<URL>' -o markdown-fit
Run them ONE AT A TIME (each launches a headless browser; do not parallelize — RAM is limited). Save each crawl to a file under ${dir}/ named ${slug}__<n>.md using the Write tool (paste the crawl output). Record these relative paths in savedFiles. If a crawl fails or returns junk, fall back to WebFetch for that URL and note crawlOk:false.

STEP 3 — Extract the six required fields + any RECOMMENDED fields you can verify from the crawled text. Decide fullyFunded (tuition + stipend) vs tuition-only; write coverageNote.

STEP 4 — Evidence. For deadline, benefits, acceptanceRate (if any number), requiredDocuments, and mustKnow, provide a VERBATIM quote copied from the crawled page text plus the url it came from. The quote must literally appear in the text you saved (a later verifier will string-match it). If a field has no support in the source, do not fabricate — leave acceptanceRate as "Not officially published", and for the others use only what the page states.

STEP 5 — Tags. Apply any that genuinely apply: "#NoIELTS", "#NoApplicationFee", "#NoGRE", "#SupervisorRequired", "#ReturnHomeBond", "#CoversFamily", "#FullyFunded", "#TuitionOnly". (Open/closing-soon are computed later — do not add those.)

GATE: If this is not a genuine fully-funded (or notable tuition-only) master's program, or you cannot support all six required fields from the official source, set found=false with a skipReason.

Set scholarship.lastVerified=${TODAY}, every source.accessed=${TODAY}, scholarship.host.country appropriately.

Return ONLY the structured object.`
}

function verifyPrompt(c, ex) {
  const sch = ex.out.scholarship
  const ev = ex.out.evidence || {}
  return `You are an ADVERSARIAL fact-checker. Treat every claim as WRONG until the saved source proves it. You are verifying one extracted scholarship record before it ships.

WORKING DIRECTORY: ${REPO}
COUNTRY: ${c.label}
SAVED SOURCE FILES (read these with the Read tool): ${(ex.out.savedFiles || []).join(' | ') || '(none — extractor saved nothing; you must re-fetch)'}

EXTRACTED RECORD (JSON):
${JSON.stringify(sch, null, 1)}

SUPPORTING QUOTES CLAIMED BY THE EXTRACTOR:
${JSON.stringify(ev, null, 1)}

CHECKS:
1. officialLink resolves: run
     curl -sS -m 25 -o /dev/null -w '%{http_code} %{url_effective}' -L '${sch.officialLink}'
   It must return 200 and NOT redirect to a generic homepage/404. Put the result in officialLinkStatus and set officialLinkResolves.
2. For deadline, benefits, acceptanceRate, requiredDocuments, mustKnow: open the saved source file(s) and confirm the claimed quote ACTUALLY appears and genuinely supports the stated value. If a quote is not found in the saved files, re-crawl that one URL with  .venv/bin/crwl '<url>' -o markdown-fit  (one at a time) or WebFetch to check. Anything unsupported is an issue.
3. Acceptance rate: if value is a number, it MUST have a real official source (isOfficial true) or a clearly-labeled real third-party estimate (estimateNote). Otherwise FORCE it to {value:"Not officially published", isOfficial:false} in the corrected record.
4. officialLink must be a primary source, not an aggregator. Timeline must use an absolute cycle year and note the anchor (${ANCHOR}) if the cycle hadn't opened.
5. Remove any RECOMMENDED field that is not actually supported. The SIX required fields must remain populated and supported; if any cannot be supported, set accept=false.

PERSIST: If (and only if) accept=true, write the final correctedScholarship as pretty JSON (a single scholarship object) to the file
    .research-out/${c.key}/${slugify(sch.name)}.json
using the Write tool, BEFORE returning. (Create directories as needed.) This is the durable record that will be compiled into the site.

OUTPUT: set accept (true only if all six required fields are supported and officialLink resolves), list issues and removedOrFixedFields, and return correctedScholarship = the final cleaned record to ship (with fixes applied, lastVerified=${TODAY}). If accept=false you may still return correctedScholarship as your best cleaned version, but it will not be shipped.

Return ONLY the structured object.`
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
phase('Discover')
log(`args typeof=${typeof args}; selected=[${only.join(',')}]; resolved ${countries.length} countries; crawlConcurrency=${CRAWL_CONCURRENCY}`)
if (!countries.length) { log('No countries resolved — aborting.'); return { byCountry: {}, dropped: [], counts: {}, error: 'no countries' } }
log(`Discovering candidates for: ${countries.map(c => c.key).join(', ')}`)
const discovered = await parallel(countries.map(c => () =>
  agent(discoverPrompt(c), { label: `discover:${c.key}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then(r => ({ c, candidates: (r && r.candidates) || [] }))
))

const jobs = []
for (const d of discovered.filter(Boolean)) {
  const cap = d.c.target + 6
  for (const cand of d.candidates.slice(0, cap)) jobs.push({ c: d.c, cand })
}
log(`Discovered ${jobs.length} candidate programs total`)

phase('Extract')
const extracted = []
let done = 0
for (const grp of chunk(jobs, CRAWL_CONCURRENCY)) {
  const res = await parallel(grp.map(j => () =>
    agent(extractPrompt(j.c, j.cand), {
      label: `extract:${j.c.key}:${slugify(j.cand.name)}`, phase: 'Extract', schema: EXTRACT_SCHEMA,
    }).then(out => ({ job: j, out }))
  ))
  for (const r of res.filter(Boolean)) extracted.push(r)
  done += grp.length
  log(`Extract progress: ${done}/${jobs.length} (kept ${extracted.filter(e => e.out && e.out.found && e.out.scholarship).length} found so far)`)
}

const toVerify = extracted.filter(e => e.out && e.out.found && e.out.scholarship)
log(`Extracted ${toVerify.length} programs with full records; verifying...`)

phase('Verify')
const verified = await parallel(toVerify.map(e => () =>
  agent(verifyPrompt(e.job.c, e), {
    label: `verify:${e.job.c.key}:${slugify(e.out.scholarship.name)}`, phase: 'Verify', schema: VERIFY_SCHEMA,
  }).then(verdict => ({ e, verdict }))
))

const byCountry = {}
for (const c of countries) byCountry[c.key] = []
const dropped = []
for (const v of verified.filter(Boolean)) {
  const key = v.e.job.c.key
  if (v.verdict && v.verdict.accept && v.verdict.correctedScholarship) {
    byCountry[key].push(v.verdict.correctedScholarship)
  } else {
    dropped.push({ country: key, name: v.e.out.scholarship && v.e.out.scholarship.name, issues: (v.verdict && v.verdict.issues) || ['verify failed/null'] })
  }
}

const summary = countries.map(c => `${c.key}: ${byCountry[c.key].length} shipped`).join(' | ')
log(`DONE. ${summary}. Dropped: ${dropped.length}`)

return { byCountry, dropped, counts: Object.fromEntries(countries.map(c => [c.key, byCountry[c.key].length])) }
