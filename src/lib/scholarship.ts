import type { Scholarship, CountryKey, ScholarshipWithCountry } from '../types/scholarship';

// Re-export the data-contract types so components/routes can import everything
// scholarship-related from `$lib/scholarship` (keeps `src/types` the source of truth).
export type {
  Scholarship,
  Timeline,
  AcceptanceRate,
  Source,
  CountryKey,
  ScholarshipWithCountry,
} from '../types/scholarship';

// Deterministic "now" — anchored to the project date so builds are reproducible
// and consistent with the data's lastVerified / timeline anchor (2026-06).
export const SITE_NOW = new Date('2026-06-06T00:00:00Z');

export const COUNTRY_ORDER: CountryKey[] = [
  'uk', 'europe', 'australia', 'usa', 'china', 'japan',
  'southkorea', 'taiwan', 'singapore', 'malaysia',
];

export const COUNTRY_LABELS: Record<CountryKey, string> = {
  uk: 'United Kingdom',
  europe: 'Europe',
  usa: 'United States',
  japan: 'Japan',
  china: 'China',
  australia: 'Australia',
  southkorea: 'South Korea',
  taiwan: 'Taiwan',
  singapore: 'Singapore',
  malaysia: 'Malaysia',
};

/** Emoji flag per country bucket — a quick visual anchor in the aggregated ledger. */
export const COUNTRY_FLAG: Record<CountryKey, string> = {
  uk: '🇬🇧',
  europe: '🇪🇺',
  usa: '🇺🇸',
  japan: '🇯🇵',
  china: '🇨🇳',
  australia: '🇦🇺',
  southkorea: '🇰🇷',
  taiwan: '🇹🇼',
  singapore: '🇸🇬',
  malaysia: '🇲🇾',
};

/** Attach the country bucket to a list of scholarships (for the aggregated index/filter). */
export function withCountry(list: Scholarship[], key: CountryKey): ScholarshipWithCountry[] {
  return list.map((s) => ({ ...s, countryKey: key, countryLabel: COUNTRY_LABELS[key] }));
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Best-effort parse of a free-text deadline like "7 November 2024",
 * "1 December 2025 (23:59 GMT)", "early November 2025", "2025-12-01".
 * Returns null when no confident date can be read (status then = "unknown").
 */
export function parseDeadline(input?: string): Date | null {
  if (!input) return null;
  let s = input.trim();
  // Drop parentheticals / time-of-day / timezone noise.
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\b\d{1,2}:\d{2}\b/g, ' ');
  // Drop vague qualifiers.
  s = s.replace(/\b(early|mid|late|by|around|approx\.?|approximately|before|until|end of|beginning of|start of)\b/gi, ' ');
  // Ordinal suffixes: 1st -> 1.
  s = s.replace(/(\d{1,2})(st|nd|rd|th)\b/gi, '$1');
  s = s.replace(/\s+/g, ' ').trim();

  // ISO-ish first.
  const iso = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }
  // "7 November 2024" or "November 7 2024" or "November 2025".
  const monthIdx = MONTHS.findIndex((m) => new RegExp(`\\b${m}\\b`, 'i').test(s));
  const yearM = s.match(/\b(20\d{2})\b/);
  if (monthIdx >= 0 && yearM) {
    const dayM = s.match(/\b(\d{1,2})\b/);
    const day = dayM ? Math.min(Math.max(parseInt(dayM[1], 10), 1), 28) : 28;
    const d = new Date(Date.UTC(parseInt(yearM[1], 10), monthIdx, day));
    return isNaN(d.getTime()) ? null : d;
  }
  // Last resort: native parse.
  const native = new Date(s);
  return isNaN(native.getTime()) ? null : native;
}

export type StatusKey = 'open' | 'closing-soon' | 'opens-soon' | 'closed' | 'unknown';

export interface DeadlineStatus {
  key: StatusKey;
  label: string;
  /** epoch ms of the parsed deadline, or null. Used for sorting. */
  deadlineTs: number | null;
  /** month name of the parsed deadline, or null. */
  month: string | null;
}

const DAY = 86_400_000;

export function deadlineStatus(s: Scholarship, now: Date = SITE_NOW): DeadlineStatus {
  const d = parseDeadline(s.timeline.deadline);
  const o = parseDeadline(s.timeline.opens);
  const deadlineTs = d ? d.getTime() : null;
  const month = d ? MONTHS[d.getUTCMonth()] : null;
  if (!d) return { key: 'unknown', label: 'See dates', deadlineTs, month };
  const n = now.getTime();
  if (o && n < o.getTime()) return { key: 'opens-soon', label: 'Opens soon', deadlineTs, month };
  if (n > d.getTime()) return { key: 'closed', label: 'Closed', deadlineTs, month };
  if (d.getTime() - n <= 30 * DAY) return { key: 'closing-soon', label: 'Closing soon', deadlineTs, month };
  return { key: 'open', label: 'Open', deadlineTs, month };
}

/** Stored tags merged with computed status tags, normalised and de-duplicated. */
export function effectiveTags(s: Scholarship, status: DeadlineStatus): string[] {
  const set = new Set<string>((s.tags ?? []).map((t) => t.trim()).filter(Boolean));
  if (status.key === 'open') set.add('#OpenNow');
  if (status.key === 'closing-soon') set.add('#ClosingSoon');
  return [...set];
}

/** Human metadata for known tags (label + short hint). Unknown tags fall back to the raw string. */
export const TAG_META: Record<string, { label: string; hint: string }> = {
  '#FullyFunded': { label: 'Fully funded', hint: 'Tuition + living stipend' },
  '#TuitionOnly': { label: 'Tuition only', hint: 'No living stipend' },
  '#NoIELTS': { label: 'No IELTS', hint: 'English test may be waived' },
  '#NoApplicationFee': { label: 'No application fee', hint: 'Free to apply' },
  '#NoGRE': { label: 'No GRE', hint: 'GRE not required' },
  '#SupervisorRequired': { label: 'Supervisor first', hint: 'Secure a professor before applying' },
  '#ReturnHomeBond': { label: 'Return-home bond', hint: 'Must return after study' },
  '#CoversFamily': { label: 'Covers family', hint: 'Dependent support available' },
  '#OpenNow': { label: 'Open now', hint: 'Accepting applications' },
  '#ClosingSoon': { label: 'Closing soon', hint: 'Deadline within ~30 days' },
};

export function tagLabel(tag: string): string {
  if (TAG_META[tag]) return TAG_META[tag].label;
  // Humanise unknown camelCase tags: "#TwoStepProcess" -> "Two Step Process".
  return tag.replace(/^#/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

/** Lowercased free-text blob for the search filter. */
export function searchText(item: ScholarshipWithCountry): string {
  const parts: string[] = [
    item.name,
    item.countryLabel,
    item.host?.country ?? '',
    item.host?.city ?? '',
    ...(item.host?.universities ?? []),
    item.degreeType ?? '',
    ...(item.benefits ?? []),
    ...(item.mustKnow ?? []),
    ...(item.tags ?? []),
    item.eligibleNationalities ?? '',
  ];
  return parts.join(' ').toLowerCase();
}

/** "Featured" ordering for the static build: actionable (open/closing/opens) first
 *  by soonest deadline, then dates-unconfirmed, then closed last. */
export function sortFeatured(items: ScholarshipWithCountry[]): ScholarshipWithCountry[] {
  const rank = (k: StatusKey) =>
    k === 'open' || k === 'closing-soon' || k === 'opens-soon' ? 0 : k === 'unknown' ? 1 : 2;
  return [...items]
    .map((it) => ({ it, st: deadlineStatus(it) }))
    .sort((a, b) => {
      const ra = rank(a.st.key), rb = rank(b.st.key);
      if (ra !== rb) return ra - rb;
      if (ra === 0) {
        const ta = a.st.deadlineTs ?? Infinity, tb = b.st.deadlineTs ?? Infinity;
        if (ta !== tb) return ta - tb;
      }
      if (ra === 2) {
        const ta = a.st.deadlineTs ?? -Infinity, tb = b.st.deadlineTs ?? -Infinity;
        if (ta !== tb) return tb - ta; // most recently closed first
      }
      return a.it.name.localeCompare(b.it.name);
    })
    .map((x) => x.it);
}

/** A minimal, valid all-day VCALENDAR for the deadline, as a data: URL (works with no JS). */
export function icsHref(item: ScholarshipWithCountry, status: DeadlineStatus): string | null {
  if (!status.deadlineTs) return null;
  const d = new Date(status.deadlineTs);
  const stamp = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, '');
  const next = new Date(status.deadlineTs + DAY);
  const uid = `${item.countryKey}-${item.name.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 24)}@fullfundedmasters`;
  const esc = (t: string) => t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Full-Funded Masters Wiki//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(SITE_NOW)}T000000Z`,
    `DTSTART;VALUE=DATE:${stamp(d)}`,
    `DTEND;VALUE=DATE:${stamp(next)}`,
    `SUMMARY:${esc(item.name)} — application deadline`,
    `DESCRIPTION:${esc(`Deadline: ${item.timeline.deadline}. More: ${item.officialLink}`)}`,
    `URL:${item.officialLink}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
}
