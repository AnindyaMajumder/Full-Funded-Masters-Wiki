<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { browser } from '$app/environment';
  import ScholarshipRow from './ScholarshipRow.svelte';
  import type { ScholarshipWithCountry, CountryKey } from '$lib/scholarship';
  import {
    deadlineStatus,
    effectiveTags,
    searchText,
    sortFeatured,
    tagLabel,
    TAG_META,
    COUNTRY_LABELS
  } from '$lib/scholarship';

  let { items, showCountry = true }: { items: ScholarshipWithCountry[]; showCountry?: boolean } =
    $props();

  const MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const STATUS_ORDER = ['open', 'closing-soon', 'opens-soon', 'closed', 'unknown'];
  const STATUS_LABEL: Record<string, string> = {
    open: 'Open now', 'closing-soon': 'Closing soon', 'opens-soon': 'Opens soon',
    closed: 'Closed', unknown: 'Dates unconfirmed'
  };
  const TAG_PRIORITY = [
    '#OpenNow', '#ClosingSoon', '#FullyFunded', '#NoIELTS', '#NoApplicationFee',
    '#NoGRE', '#SupervisorRequired', '#ReturnHomeBond', '#CoversFamily', '#TuitionOnly'
  ];

  // Enrich once, in the static "featured" order (actionable & soonest first).
  const base = $derived(
    sortFeatured(items).map((item) => {
      const status = deadlineStatus(item);
      return { item, status, tags: effectiveTags(item, status), search: searchText(item) };
    })
  );

  // — Facets —
  const facetCountries = $derived([...new Set(base.map((e) => e.item.countryKey))] as CountryKey[]);
  const facetMonths = $derived(
    [...new Set(base.map((e) => e.status.month).filter(Boolean) as string[])].sort(
      (a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
    )
  );
  const facetStatuses = $derived(STATUS_ORDER.filter((s) => base.some((e) => e.status.key === s)));
  const facetTags = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const e of base) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.keys()]
      .filter((t) => TAG_META[t] || (counts.get(t) ?? 0) >= 2)
      .sort((a, b) => {
        const ia = TAG_PRIORITY.indexOf(a), ib = TAG_PRIORITY.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
      });
  });

  // — Filter state —
  let q = $state('');
  let country = $state('all');
  let month = $state('all');
  let statusF = $state('all');
  let sort = $state<'featured' | 'deadline' | 'name'>('featured');
  let activeTags = $state<string[]>([]);

  const tokens = $derived(q.toLowerCase().split(/\s+/).filter(Boolean));
  const hasFilters = $derived(
    !!q || country !== 'all' || month !== 'all' || statusF !== 'all' || activeTags.length > 0 || sort !== 'featured'
  );

  const rank = (k: string) =>
    k === 'open' || k === 'closing-soon' || k === 'opens-soon' ? 0 : k === 'closed' ? 2 : 1;

  const filtered = $derived.by(() => {
    let list = base.filter((e) => {
      if (country !== 'all' && e.item.countryKey !== country) return false;
      if (month !== 'all' && e.status.month !== month) return false;
      if (statusF !== 'all' && e.status.key !== statusF) return false;
      for (const t of activeTags) if (!e.tags.includes(t)) return false;
      for (const t of tokens) if (!e.search.includes(t)) return false;
      return true;
    });
    if (sort === 'name') {
      list = [...list].sort((a, b) => a.item.name.localeCompare(b.item.name));
    } else if (sort === 'deadline') {
      list = [...list].sort((a, b) => {
        const ra = rank(a.status.key), rb = rank(b.status.key);
        if (ra !== rb) return ra - rb;
        const ta = a.status.deadlineTs, tb = b.status.deadlineTs;
        if (ra === 0) return (ta ?? Infinity) - (tb ?? Infinity);
        if (ra === 2) return (tb ?? -Infinity) - (ta ?? -Infinity);
        return a.item.name.localeCompare(b.item.name);
      });
    }
    return list;
  });

  function toggleTag(t: string) {
    activeTags = activeTags.includes(t) ? activeTags.filter((x) => x !== t) : [...activeTags, t];
  }
  function clearAll() {
    q = ''; country = 'all'; month = 'all'; statusF = 'all'; activeTags = []; sort = 'featured';
  }

  // Expand / collapse every row — a client-only convenience over native <details>.
  let ledgerEl: HTMLElement | undefined = $state();
  function setAll(open: boolean) {
    ledgerEl?.querySelectorAll<HTMLDetailsElement>('details.row').forEach((d) => (d.open = open));
  }

  // Respect reduced-motion for the JS-driven filter/reorder/entrance animations.
  let reduced = $state(false);
  $effect(() => {
    if (!browser) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    const on = () => (reduced = mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  });
  const dur = $derived(reduced ? 0 : 170);
  const stagger = $derived(reduced ? 0 : 16);
</script>

<section class="directory">
  <div class="toolbar">
    <div class="toolbar-row">
      <div class="search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M21 20.3 16.7 16a8 8 0 1 0-1.4 1.4l4.3 4.3 1.4-1.4ZM4 10.5a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"/></svg>
        <input
          type="search"
          bind:value={q}
          placeholder="Search by program, field, university, country…"
          aria-label="Search scholarships"
        />
      </div>

      <div class="selects">
        {#if showCountry && facetCountries.length > 1}
          <label class="select">
            <span class="sr-only">Country</span>
            <select bind:value={country} aria-label="Filter by country">
              <option value="all">All countries</option>
              {#each facetCountries as c}<option value={c}>{COUNTRY_LABELS[c]}</option>{/each}
            </select>
          </label>
        {/if}
        {#if facetMonths.length}
          <label class="select">
            <span class="sr-only">Deadline month</span>
            <select bind:value={month} aria-label="Filter by deadline month">
              <option value="all">Any month</option>
              {#each facetMonths as m}<option value={m}>{m}</option>{/each}
            </select>
          </label>
        {/if}
        {#if facetStatuses.length > 1}
          <label class="select">
            <span class="sr-only">Status</span>
            <select bind:value={statusF} aria-label="Filter by status">
              <option value="all">Any status</option>
              {#each facetStatuses as s}<option value={s}>{STATUS_LABEL[s]}</option>{/each}
            </select>
          </label>
        {/if}
        <label class="select">
          <span class="sr-only">Sort</span>
          <select bind:value={sort} aria-label="Sort scholarships">
            <option value="featured">Sort: Featured</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: A–Z</option>
          </select>
        </label>
      </div>
    </div>

    {#if facetTags.length}
      <div class="chips-scroll" role="group" aria-label="Filter by tag">
        <div class="chips">
          {#each facetTags as t}
            <button
              type="button"
              class="chip"
              class:on={activeTags.includes(t)}
              aria-pressed={activeTags.includes(t)}
              title={TAG_META[t]?.hint}
              onclick={() => toggleTag(t)}
            >{tagLabel(t)}</button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="toolbar-meta">
      <span aria-live="polite">
        <strong>{filtered.length}</strong> of {base.length} scholarship{base.length === 1 ? '' : 's'}
      </span>
      <div class="meta-actions">
        {#if filtered.length}
          <button type="button" class="link-btn" onclick={() => setAll(true)}>Expand all</button>
          <span class="meta-sep">·</span>
          <button type="button" class="link-btn" onclick={() => setAll(false)}>Collapse all</button>
        {/if}
        {#if hasFilters}
          <span class="meta-sep">·</span>
          <button type="button" class="link-btn link-btn--accent" onclick={clearAll}>Clear filters</button>
        {/if}
      </div>
    </div>
  </div>

  {#if filtered.length}
    <div class="ledger" bind:this={ledgerEl}>
      <div class="ledger-head" aria-hidden="true">
        <span>Scholarship</span>
        <span>Deadline</span>
        <span>Key facts</span>
        <span></span>
      </div>
      {#each filtered as e, i (e.item.countryKey + '::' + e.item.name)}
        <div
          class="row-wrap"
          animate:flip={{ duration: dur }}
          in:fly={{ y: 10, duration: dur + 60, delay: Math.min(i, 16) * stagger }}
          out:fade={{ duration: dur }}
        >
          <ScholarshipRow item={e.item} {showCountry} />
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty">
      <div class="empty-emoji" aria-hidden="true">🔍</div>
      <p>No scholarships match these filters.</p>
      <button type="button" class="btn" onclick={clearAll}>Clear all filters</button>
    </div>
  {/if}
</section>

<style>
  .directory { display: flex; flex-direction: column; gap: 1.2rem; }

  .toolbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    backdrop-filter: saturate(1.3) blur(12px);
    -webkit-backdrop-filter: saturate(1.3) blur(12px);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 1rem;
    box-shadow: var(--shadow-sm);
  }

  .toolbar-row { display: flex; gap: 0.7rem; flex-wrap: wrap; }

  .search { position: relative; flex: 1 1 16rem; display: flex; align-items: center; }
  .search svg { position: absolute; left: 0.9rem; color: var(--ink-mute); pointer-events: none; transition: color var(--t-fast) var(--ease); }
  .search input {
    width: 100%;
    font: inherit;
    font-size: 0.92rem;
    padding: 0.72rem 0.9rem 0.72rem 2.5rem;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    color: var(--ink);
    transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  }
  .search input::placeholder { color: var(--ink-mute); }
  .search input:focus { outline: none; border-color: var(--brand-soft); box-shadow: 0 0 0 3px var(--brand-tint); }
  .search:focus-within svg { color: var(--brand-soft); }

  .selects { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .select { position: relative; display: inline-flex; }
  .select::after {
    content: '';
    position: absolute; right: 0.85rem; top: 50%;
    width: 8px; height: 8px;
    border-right: 2px solid var(--ink-mute);
    border-bottom: 2px solid var(--ink-mute);
    transform: translateY(-65%) rotate(45deg);
    pointer-events: none;
  }
  .select select {
    appearance: none;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 500;
    color: var(--ink);
    padding: 0.66rem 2.2rem 0.66rem 0.95rem;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    cursor: pointer;
    transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  }
  .select select:hover { border-color: #d8d2c6; }
  .select select:focus-visible { outline: none; border-color: var(--brand-soft); box-shadow: 0 0 0 3px var(--brand-tint); }

  .chips-scroll {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* fade edges to hint more content */
    mask-image: linear-gradient(
      to right,
      transparent 0,
      black 0.8rem,
      black calc(100% - 1.5rem),
      transparent 100%
    );
    margin-inline: -0.5rem;
    padding-inline: 0.5rem;
  }
  .chips-scroll::-webkit-scrollbar { display: none; }
  .chips {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.4rem;
    width: max-content;
    padding-bottom: 2px;
  }
  .chip {
    font: inherit;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--ink-soft);
    padding: 0.34rem 0.72rem;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    cursor: pointer;
    transition: transform var(--t-fast) var(--ease), background var(--t-fast) var(--ease),
      color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
  }
  .chip:hover { border-color: var(--brand-soft); color: var(--brand); transform: translateY(-1px); }
  .chip:active { transform: translateY(0); }
  .chip.on {
    color: #fff;
    background: var(--brand);
    border-color: var(--brand-ink);
    box-shadow: var(--shadow-sm);
  }

  .toolbar-meta { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; font-size: 0.84rem; color: var(--ink-soft); }
  .toolbar-meta strong { color: var(--ink); font-weight: 700; }
  .meta-actions { display: flex; align-items: center; gap: 0.5rem; }
  .meta-sep { color: var(--line); }
  .link-btn {
    font: inherit; font-size: 0.82rem; font-weight: 550;
    color: var(--brand-soft); background: none; border: none; cursor: pointer;
    padding: 0.2rem 0.3rem; border-radius: var(--r-sm);
    transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .link-btn:hover { background: var(--brand-tint); }
  .link-btn--accent { color: var(--accent); }
  .link-btn--accent:hover { background: var(--accent-tint); }

  /* ── Ledger: one surface, hairline-divided rows (reads as a data table) ── */
  .ledger {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-sm);
    overflow: clip;
  }
  .ledger-head {
    display: grid;
    grid-template-columns: var(--row-cols);
    gap: 0.6rem 1.4rem;
    padding: 0.7rem 1.15rem 0.7rem 1.25rem;
    background: color-mix(in srgb, var(--surface-sunken) 55%, var(--surface));
    border-bottom: 1px solid var(--line);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  .row-wrap { border-top: 1px solid var(--line-soft); }
  .row-wrap:first-of-type { border-top: none; }

  .empty {
    display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
    text-align: center; padding: 3.5rem 1rem; color: var(--ink-soft);
    background: var(--surface); border: 1px dashed var(--line); border-radius: var(--r-lg);
  }
  .empty-emoji { font-size: 2rem; opacity: 0.7; animation: float 3s var(--ease) infinite; }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }

  @media (max-width: 860px) {
    .ledger-head { display: none; }
  }

  @media (max-width: 560px) {
    .toolbar { padding: 0.85rem; border-radius: var(--r); }
    .selects { width: 100%; }
    .select { flex: 1 1 8rem; }
    .select select { width: 100%; }
    .toolbar-meta { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
  }
</style>
