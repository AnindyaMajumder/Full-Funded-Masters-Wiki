import { useEffect, useMemo, useRef, useState } from 'react';
import { tagLabel, TAG_META, COUNTRY_LABELS } from '../lib/scholarship';
import type { CountryKey } from '../types/scholarship';

interface Props {
  /** id of the container holding the static [data-scholarship] cards */
  gridId: string;
  /** hide the country selector on single-country pages */
  showCountry?: boolean;
}

type Sort = 'relevance' | 'deadline' | 'name';

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Display priority for tag chips (known, decision-gating tags first).
const TAG_PRIORITY = [
  '#OpenNow', '#ClosingSoon', '#FullyFunded', '#NoIELTS', '#NoApplicationFee',
  '#NoGRE', '#SupervisorRequired', '#ReturnHomeBond', '#CoversFamily', '#TuitionOnly',
];

export default function ScholarshipFilter({ gridId, showCountry = true }: Props) {
  const cardsRef = useRef<HTMLElement[]>([]);
  const originalOrderRef = useRef<HTMLElement[]>([]);
  const gridRef = useRef<HTMLElement | null>(null);
  const emptyRef = useRef<HTMLElement | null>(null);

  const [ready, setReady] = useState(false);
  const [facets, setFacets] = useState<{
    countries: CountryKey[];
    months: string[];
    statuses: string[];
    tags: string[];
  }>({ countries: [], months: [], statuses: [], tags: [] });

  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const [month, setMonth] = useState('all');
  const [status, setStatus] = useState('all');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>('relevance');
  const [count, setCount] = useState(0);

  // Discover the static cards + their facets once on mount.
  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    gridRef.current = grid;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-scholarship]'));
    cardsRef.current = cards;
    originalOrderRef.current = [...cards];

    const countries = new Set<string>();
    const months = new Set<string>();
    const statuses = new Set<string>();
    const tagCount = new Map<string, number>();
    for (const c of cards) {
      if (c.dataset.country) countries.add(c.dataset.country);
      if (c.dataset.month) months.add(c.dataset.month);
      if (c.dataset.status) statuses.add(c.dataset.status);
      (c.dataset.tags || '').split(/\s+/).filter(Boolean).forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1));
    }
    // Keep the chip row clean: only offer tags that are canonical or shared by 2+ entries.
    // (One-off tags still appear on the cards themselves.)
    const tags = new Set([...tagCount].filter(([t, n]) => TAG_META[t] || n >= 2).map(([t]) => t));
    const sortedTags = [...tags].sort((a, b) => {
      const ia = TAG_PRIORITY.indexOf(a), ib = TAG_PRIORITY.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b);
    });
    setFacets({
      countries: ([...countries] as CountryKey[]).sort(),
      months: [...months].sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)),
      statuses: ['open', 'closing-soon', 'opens-soon', 'closed', 'unknown'].filter((s) => statuses.has(s)),
      tags: sortedTags,
    });
    emptyRef.current = document.getElementById(`${gridId}-empty`);
    setCount(cards.length);
    setReady(true);
  }, [gridId]);

  // Debounce the search term so we don't re-filter ~150 cards on every keystroke.
  const [qDebounced, setQDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q), 180);
    return () => clearTimeout(id);
  }, [q]);
  const tokens = useMemo(() => qDebounced.toLowerCase().split(/\s+/).filter(Boolean), [qDebounced]);

  // Apply filters + sort whenever inputs change.
  useEffect(() => {
    if (!ready) return;
    const cards = cardsRef.current;
    const grid = gridRef.current;
    if (!grid) return;

    let visible = 0;
    for (const c of cards) {
      const d = c.dataset;
      let show = true;
      if (country !== 'all' && d.country !== country) show = false;
      if (show && month !== 'all' && d.month !== month) show = false;
      if (show && status !== 'all' && d.status !== status) show = false;
      if (show && activeTags.size) {
        const ct = new Set((d.tags || '').split(/\s+/));
        for (const t of activeTags) if (!ct.has(t)) { show = false; break; }
      }
      if (show && tokens.length) {
        const hay = d.search || '';
        for (const t of tokens) if (!hay.includes(t)) { show = false; break; }
      }
      c.hidden = !show;
      if (show) visible++;
    }
    setCount(visible);

    // Reorder cards. 'relevance' restores the original featured order (from sortFeatured()).
    // A DocumentFragment batches the moves into a single reflow.
    const ts = (c: HTMLElement) => {
      const v = c.dataset.deadlineTs;
      return v ? Number(v) : NaN;
    };
    const rank = (c: HTMLElement) => {
      const s = c.dataset.status;
      return s === 'open' || s === 'closing-soon' || s === 'opens-soon' ? 0 : s === 'closed' ? 1 : 2;
    };
    let ordered: HTMLElement[];
    if (sort === 'relevance') {
      ordered = originalOrderRef.current;
    } else {
      ordered = [...cards].sort((a, b) => {
        if (sort === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
        // deadline: upcoming first (soonest), then recent-past, then unknown
        const ra = rank(a), rb = rank(b);
        if (ra !== rb) return ra - rb;
        const ta = ts(a), tb = ts(b);
        if (ra === 0) return (isNaN(ta) ? Infinity : ta) - (isNaN(tb) ? Infinity : tb);
        if (ra === 1) return (isNaN(tb) ? -Infinity : tb) - (isNaN(ta) ? -Infinity : ta);
        return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      });
    }
    const frag = document.createDocumentFragment();
    for (const c of ordered) frag.appendChild(c);
    grid.appendChild(frag);

    const emptyEl = emptyRef.current ?? document.getElementById(`${gridId}-empty`);
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }, [ready, country, month, status, activeTags, tokens, sort]);

  const toggleTag = (t: string) =>
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const total = cardsRef.current.length;
  const active = q || country !== 'all' || month !== 'all' || status !== 'all' || activeTags.size > 0 || sort !== 'relevance';
  const clear = () => {
    setQ(''); setCountry('all'); setMonth('all'); setStatus('all');
    setActiveTags(new Set()); setSort('relevance');
  };

  const statusLabel: Record<string, string> = {
    open: 'Open', 'closing-soon': 'Closing soon', 'opens-soon': 'Opens soon',
    closed: 'Closed', unknown: 'Dates unconfirmed',
  };

  return (
    <div className="filter__shell" role="search" aria-label="Filter scholarships">
      <div className="filter__row">
        <div className="filter__search">
          <span className="ico" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by program, field, university, country…"
            aria-label="Search scholarships"
          />
        </div>

        {showCountry && facets.countries.length > 1 && (
          <select className="select" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
            <option value="all">All countries</option>
            {facets.countries.map((c) => (
              <option key={c} value={c}>{COUNTRY_LABELS[c] ?? c}</option>
            ))}
          </select>
        )}

        {facets.months.length > 0 && (
          <select className="select" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by deadline month">
            <option value="all">Any month</option>
            {facets.months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        )}

        {facets.statuses.length > 1 && (
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">Any status</option>
            {facets.statuses.map((s) => <option key={s} value={s}>{statusLabel[s] ?? s}</option>)}
          </select>
        )}

        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="relevance">Sort: featured</option>
          <option value="deadline">Sort: deadline</option>
          <option value="name">Sort: A–Z</option>
        </select>
      </div>

      {facets.tags.length > 0 && (
        <div className="chips" role="group" aria-label="Filter by tag">
          {facets.tags.map((t) => (
            <button
              key={t}
              type="button"
              className="chip-btn"
              aria-pressed={activeTags.has(t)}
              title={TAG_META[t]?.hint}
              onClick={() => toggleTag(t)}
            >
              {tagLabel(t)}
            </button>
          ))}
        </div>
      )}

      <div className="filter__meta">
        <span className="filter__count" aria-live="polite">
          <strong>{count}</strong> of {total} scholarship{total === 1 ? '' : 's'}
        </span>
        {active && (
          <button type="button" className="linklike" onClick={clear}>Clear filters</button>
        )}
      </div>
    </div>
  );
}
