// Source of truth for every scholarship entry in this wiki.
// The six required fields are the user's spec — keep them verbatim.
// Everything under "recommended" is extra context an aspirant needs to decide,
// and may be omitted when unknown (never guessed).

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

/** The canonical country buckets the wiki is organised into. */
export type CountryKey =
  | 'uk'
  | 'europe'
  | 'usa'
  | 'japan'
  | 'china'
  | 'australia'
  | 'southkorea'
  | 'taiwan'
  | 'singapore'
  | 'malaysia';

/** A Scholarship plus the country bucket it belongs to (used by the aggregated index/filter). */
export interface ScholarshipWithCountry extends Scholarship {
  countryKey: CountryKey;
  countryLabel: string;
}
