# Full-Funded Masters Wiki

A directory of **fully funded master's scholarships** across Europe, the UK, USA, Japan,
China, and Australia, compiled into one static website. The goal is a trustworthy,
verifiable resource for an aspirant deciding where to apply.

## Tech stack

- **Astro** static site, with **React `.tsx` islands** for interactivity only.
- **TypeScript** everywhere. Scholarship data lives in typed `.ts` data files — one per
  country — validated against a single shared `Scholarship` type. Components only render
  data; they never hold scholarship facts inline.
- Render scholarship cards as **static HTML**. Hydrate a React island **only** where the
  UI is genuinely interactive (search, filter, comparison). Do not make a card a client
  component just to display it.

> The repo is greenfield (only `LICENSE` exists). Scaffold with
> `npm create astro@latest` (add the React integration), then create the layout below.

## Directory layout

```
src/
  types/scholarship.ts     # the Scholarship data contract (source of truth)
  data/
    europe.ts  uk.ts  usa.ts  japan.ts  china.ts  australia.ts
                           # export const <country>: Scholarship[] = [...]
  components/
    ScholarshipCard.tsx    # static render of one scholarship
    ScholarshipFilter.tsx  # React island — interactive search/filter
  layouts/Base.astro
  pages/
    index.astro            # landing + cross-country search
    europe.astro uk.astro usa.astro japan.astro china.astro australia.astro
sources/<country>/<program>.html   # optional: saved official pages used as research input
```

Each `pages/<country>.astro` imports its `data/<country>.ts` array and maps it to
`<ScholarshipCard>`. `index.astro` may aggregate all six arrays.

## The data contract

Every scholarship is one object matching `src/types/scholarship.ts`. The **six required
fields are the user's spec — keep them verbatim**; everything under "recommended" is extra
context an aspirant needs to decide, and may be omitted when unknown.

```ts
export interface Scholarship {
  name: string;

  // ===== The six required fields (spec) =====
  officialLink: string;            // 0. Primary/official source ONLY — never an aggregator blog
  requiredDocuments: string[];     // 1. Exact documents the application asks for
  timeline: Timeline;              // 2. Application cycle dates (see "Timeline rule")
  benefits: string[];              // 3. What the funding actually covers
  acceptanceRate: AcceptanceRate;  // 4. With a real source, or "Not officially published"
  mustKnow: string[];              // 5. Critical factors / gotchas (see below)

  // ===== Recommended (omit if unknown — never guess) =====
  host?: { country: string; city?: string; universities?: string[] };
  degreeType?: 'taught' | 'research' | 'both';
  duration?: string;               // e.g. "2 years"
  intake?: string[];               // e.g. ["Fall 2025"]
  eligibleNationalities?: string;  // restrictions, or "Open to all nationalities"
  languageRequirements?: string;   // IELTS/TOEFL bands + any waiver conditions
  standardizedTests?: string;      // GRE/GMAT, or "Not required"
  minGPA?: string;
  ageLimit?: string;               // many gov scholarships have one (MEXT, CSC, Eiffel...)
  applicationFee?: string;         // amount, "Free", or fee-waiver conditions
  fundingCovers?: string[];        // tuition / stipend / travel / insurance / settlement
  monthlyStipend?: string;         // amount + currency
  supervisorRequired?: boolean;    // must secure a professor BEFORE applying
  twoStepProcess?: boolean;        // e.g. win university admission, then the scholarship
  bondObligation?: string;         // return-home / service requirement, or "None"
  coversDependents?: boolean;
  interviewStage?: boolean;
  renewalConditions?: string;      // GPA/credits needed to keep funding
  postStudyWork?: string;          // stay-back / work-visa options after graduation

  // ===== Provenance (trust) =====
  sources: Source[];               // cite every non-obvious factual claim
  lastVerified: string;            // ISO date the facts were last checked against source
  tags?: string[];                 // e.g. "#NoIELTS", "#NoApplicationFee", "#SupervisorRequired"
}

export interface Timeline {
  cycle: string;        // e.g. "2025-2026"
  opens?: string;
  deadline: string;
  resultsBy?: string;
  notes?: string;
}

export interface AcceptanceRate {
  value: string;        // "12%" OR "Not officially published"
  isOfficial: boolean;
  source?: string;      // REQUIRED whenever value is a number
  estimateNote?: string;// for clearly-labeled third-party estimates
}

export interface Source {
  label: string;
  url: string;
  accessed: string;     // ISO date
}
```

## Design & UX (non-negotiable)

User experience is a primary goal, not a finishing touch. Every page must:

- **Be fully responsive** — mobile-first, then scale up to tablet and desktop. Test layouts
  at ~360px, ~768px, and ~1280px. No horizontal scroll; tap targets ≥ 44px on mobile.
- **Use micro-animations** — subtle, purposeful motion: card hover/lift, smooth filter and
  expand/collapse transitions, button feedback, staggered fade-in on scroll, animated
  status badges. Keep them fast (~150–300ms) and easing-based; they should guide attention,
  never distract or delay. **Respect `prefers-reduced-motion`** and disable non-essential
  motion when set.
- **Grab attention** — a strong landing hero, clear visual hierarchy, generous whitespace,
  and consistent accent colors that flag the things that matter (deadlines, "fully funded",
  key tags). Make the most useful facts impossible to miss.
- **Surface key info instantly** — an aspirant should grasp benefits, deadline, and
  eligibility at a glance on each card, then drill in for detail. Prioritize scannability:
  the six required fields are the headline, everything else is progressive disclosure.
- **Stay accessible & fast** — semantic HTML, sufficient color contrast (WCAG AA), keyboard
  navigability, and Astro's static output kept lean so pages load quickly on mobile data.

Implement animation with CSS transitions/keyframes or a lightweight library inside React
islands; do not pull in a heavy animation dependency for effects CSS can do.

## Data-integrity rules (most important — read first)

This is an LLM-populated factual dataset, so the dominant failure mode is a **plausible
but fabricated fact or citation**. These rules are load-bearing:

1. **Never invent a statistic or a source.** If an acceptance rate is not officially
   published, set `value: "Not officially published"` and `isOfficial: false`. A cited
   third-party estimate is allowed only if it is real and clearly labeled via
   `estimateNote`.
2. **Official link = primary source only.** The scholarship's own page or the
   funding body's site. Never an aggregator/blog as `officialLink` (those may go in
   `sources` if genuinely used).
3. **Cite every non-obvious claim** in `sources` with a working URL and access date.
4. **Set `lastVerified`** whenever you check or update a scholarship's facts.
5. If you cannot verify a recommended field, **omit it** — do not fill it with a guess.

## Timeline rule (anchored)

As of **2026-06**: if a program's current cycle has **not yet opened**, document the
**most recent completed/known cycle** instead (e.g. use 2025-2026 dates), and note this in
`timeline.notes`. Always write the **absolute** cycle/year in `timeline.cycle` — never the
word "this year" — so future sessions don't reinterpret it.

## What belongs in `mustKnow`

The non-obvious things that decide an application: age limits, return-home bonds,
supervisor-first requirements, two-step processes, nationality restrictions, whether an
English-taught track exists, required physical-exam/medical forms, and whether "fully
funded" actually includes a living stipend vs. tuition-only.

## Workflow: adding a scholarship

1. Open the program's **official** page (save to `sources/<country>/` as HTML if useful).
2. Extract the six required fields; add recommended fields you can verify.
3. Apply the timeline and data-integrity rules above.
4. Append the object to the matching `data/<country>.ts` array.
5. Tick it off in the **Coverage** section below.

To add a **country**, create `data/<country>.ts` and `pages/<country>.astro`, then add it
to the **Coverage** section below.

## Coverage

Running checklist (as of 2026-06-11). **70 scholarships live across 4 countries**;
every record is ground-truth-extracted from its official page with verbatim evidence,
official links resolution-checked, and acceptance rates left "Not officially published"
unless a real funder figure exists.

- [x] **UK — 19** Chevening · Commonwealth Master's · Commonwealth Shared · Gates Cambridge ·
  Clarendon · Rhodes · Felix · Oxford-Weidenfeld & Hoffmann · Cambridge Trust · GREAT
  (#TuitionOnly) · Marshall · Ertegun (only numeric AR: 1.5%, funder-published) ·
  Oxford-Pershing Square · OCIS · Skoll · Mastercard@Edinburgh · Saïd · Inlaks · A.S. Hornby.
- [x] **Europe — 19** Erasmus Mundus · DAAD Study Scholarships · DAAD Helmut-Schmidt (PPGG) ·
  Swedish Institute (SISGP) · Eiffel · ETH Zürich ESOP · EPFL · Stipendium Hungaricum ·
  Italian Govt (MAECI) · Invest Your Talent · Türkiye Bursları · Stefan Banach (NAWA, PL) ·
  Czech Govt · Fundación Carolina (ES) · Eric Bleumink (NL) · VLIR-UOS (BE) · ARES (BE) ·
  KAS · Heinrich Böll.
- [x] **China — 19** CSC/CGS (+ Type A/B channels at Zhejiang, Fudan, Tsinghua, SJTU) ·
  Schwarzman · Yenching · Confucius/Intl Chinese Language Teachers · Belt-and-Road/Silk Road
  (PKU, BNU, Fudan) · Beijing & Shanghai Government Scholarships · PKU/Tsinghua/USTC/CAS-ANSO.
- [x] **Japan — 13** MEXT (Research Students + University Recommendation at UTokyo, Kyoto,
  Inst. of Science Tokyo, APU) · MEXT YLP · ADB-JSP · JJ/WBGSP · JISPA · ABE Initiative ·
  JDS · GRIPS. (Japan-WCO/GRIPS Customs course excluded by request.)
- [ ] **Australia** — deferred by request (Australia Awards, RTP not yet added).
- [ ] **USA** — deferred by request (Fulbright, Knight-Hennessy, Humphrey, Rotary Peace;
  note most fully-funded US master's funding is departmental assistantships, not named awards).

Re-run research for a country with: `Workflow .research.workflow.mjs` args `{only:["australia"]}`,
then `node scripts/build-data.mjs <country> <source>`.

## Roadmap — features an aspirant wants

The six required fields cover *what each scholarship is*. These features turn the wiki into
a *decision tool*. Ordered roughly by value-to-effort. All interactive pieces are React
islands (see Design & UX above); everything else is static.

**High value**

- **Search + filter** across all countries: by country, field of study, deadline month,
  and the tags below. This is the core of the site.
- **Tag system** for the decisions that actually gate an application:
  `#NoIELTS` · `#NoApplicationFee` · `#NoGRE` · `#SupervisorRequired` · `#ReturnHomeBond`
  · `#CoversFamily` · `#OpenNow` · `#ClosingSoon`. Let users filter by these directly.
- **Deadline tracker** — sort by deadline; status badges (Open / Opens soon / Closed)
  computed from `timeline`. Export a deadline to calendar via an `.ics` download.
- **"Last verified" date on every card** — shows the data is maintained; builds trust,
  which is the whole point of a scholarship resource.

**Medium value**

- **Eligibility quick-check** — user enters nationality, GPA band, and field; the list
  filters to scholarships they're plausibly eligible for.
- **Comparison view** — pin 2–3 scholarships side by side (benefits, stipend, deadline,
  requirements) to decide between them.
- **Document checklist generator** — turn a scholarship's `requiredDocuments` into a
  printable/checkable list so applicants can track what they've gathered.
- **Country overview pages** — cost of living, post-study work rules, taught vs. research
  norms, typical English-test expectations per destination.

**Nice to have**

- Saved/bookmarked scholarships (localStorage — no backend needed).
- "New this cycle" feed / changelog of added or updated scholarships.
- Dark mode.

**Content priorities (from an aspirant's lens)**

- Surface the **gotchas** prominently: age limits (MEXT, CSC, Eiffel), return-home bonds
  (Chevening, Australia Awards), supervisor-first programs (MEXT, CSC Type A), and
  two-step processes. These decide outcomes more than benefits do.
- Be explicit about **tuition-only vs. living-stipend** — "fully funded" is often misread.
- For the **USA**, make clear that most fully funded master's seats come from departmental
  assistantships/fellowships, not named scholarships — set expectations early.

## Tooling (installed agents & skills)

Vendored into `.claude/` (see `.claude/agents/ATTRIBUTION.md` for sources/licenses):

- **Frontend subagents** (`.claude/agents/`): `astro-expert`, `react-expert`, `css-expert`,
  `html-expert`. Delegate framework/styling/accessibility work to these.
- **`crawl4ai` skill** (`.claude/skills/crawl4ai/`): scrape official scholarship pages and
  extract fields. **Use its CSS/schema (LLM-free) extraction, not LLM extraction** — facts
  must come from the page, not the model (see Data-integrity rules). One-time runtime setup:
  `pip install crawl4ai && crawl4ai-setup` (downloads a headless browser).

Research/finding scholarships is already covered by the installed `deep-research` skill.

## Commands

After scaffolding (`package.json` does not exist yet):

```
npm install
npm run dev       # local dev server
npm run build     # static build -> dist/
npm run preview   # preview the build
```
