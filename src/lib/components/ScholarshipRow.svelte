<script lang="ts">
  import type { ScholarshipWithCountry } from '$lib/scholarship';
  import {
    deadlineStatus,
    effectiveTags,
    tagLabel,
    TAG_META,
    icsHref,
    COUNTRY_FLAG
  } from '$lib/scholarship';

  let { item, showCountry = true }: { item: ScholarshipWithCountry; showCountry?: boolean } =
    $props();

  type Fact = { k: string; v: string };

  const status = $derived(deadlineStatus(item));
  const tags = $derived(effectiveTags(item, status));
  const sources = $derived(item.sources ?? []);
  const ics = $derived(icsHref(item, status));
  const actionable = $derived(
    status.key === 'open' || status.key === 'closing-soon' || status.key === 'opens-soon'
  );
  const universities = $derived(item.host?.universities ?? []);
  const hostLine = $derived([item.host?.city, item.host?.country].filter(Boolean).join(', '));
  const flag = $derived(COUNTRY_FLAG[item.countryKey]);

  const DEGREE_LABEL: Record<string, string> = {
    taught: 'Taught',
    research: 'Research',
    both: 'Taught & research'
  };

  // Short values become the at-a-glance "Key facts" column; long ones (some
  // stipend/fee fields are whole sentences) drop into the expanded detail grid.
  const SHORT = 42;
  const facts = $derived.by(() => {
    const pills: Fact[] = [];
    const rows: Fact[] = [];
    const route = (k: string, v?: string | null) => {
      if (v) (v.length <= SHORT ? pills : rows).push({ k, v });
    };
    const row = (k: string, v?: string | null) => {
      if (v) rows.push({ k, v });
    };

    route('Stipend', item.monthlyStipend);
    route('Duration', item.duration);
    if (item.degreeType) pills.push({ k: 'Degree', v: DEGREE_LABEL[item.degreeType] ?? item.degreeType });
    route('App. fee', item.applicationFee);
    route('Age limit', item.ageLimit);

    if (universities.length) row('Universities', universities.join(', '));
    row('Intake', item.intake?.join(', '));
    row('Eligible nationalities', item.eligibleNationalities);
    row('Language', item.languageRequirements);
    row('Standardized tests', item.standardizedTests);
    row('Min GPA', item.minGPA);
    if (item.fundingCovers?.length) row('Funding covers', item.fundingCovers.join(' · '));
    if (item.supervisorRequired !== undefined)
      row('Supervisor first', item.supervisorRequired ? 'Required before applying' : 'Not required');
    if (item.twoStepProcess !== undefined)
      row('Two-step process', item.twoStepProcess ? 'Admission, then scholarship' : 'No');
    row('Bond / service', item.bondObligation);
    if (item.coversDependents !== undefined) row('Covers dependents', item.coversDependents ? 'Yes' : 'No');
    if (item.interviewStage !== undefined) row('Interview stage', item.interviewStage ? 'Yes' : 'No');
    row('Renewal', item.renewalConditions);
    row('Post-study work', item.postStudyWork);
    row('Opens', item.timeline.opens);
    row('Results by', item.timeline.resultsBy);
    row('Timeline notes', item.timeline.notes);

    return { pills, rows };
  });
  const keyFacts = $derived(facts.pills);
  const moreRows = $derived(facts.rows);

  const benefitsSummary = $derived(item.benefits.join(' · '));
  const stopToggle = (e: Event) => e.stopPropagation();
</script>

<details class="row" data-status={status.key}>
  <summary class="row-head">
    <!-- 1 — Scholarship -->
    <div class="r-main">
      <div class="r-title-line">
        {#if showCountry}<span class="r-flag" title={item.countryLabel}>{flag}</span>{/if}
        <h3 class="r-name">{item.name}</h3>
      </div>
      {#if hostLine || universities.length}
        <p class="r-host">
          {#if showCountry}<span class="r-country">{item.countryLabel}</span> · {/if}{hostLine}{#if universities.length}{hostLine ? ' · ' : ''}{universities.slice(0, 2).join(', ')}{universities.length > 2 ? ` +${universities.length - 2}` : ''}{/if}
        </p>
      {/if}

      <p class="r-benefits" title={benefitsSummary}>
        <span class="r-benefits-k">Funds</span>{benefitsSummary}
      </p>

      {#if tags.length}
        <div class="r-tags">
          {#each tags as t}
            <span class="tag" class:tag--known={TAG_META[t]} title={TAG_META[t]?.hint}>{tagLabel(t)}</span>
          {/each}
        </div>
      {/if}
    </div>

    <!-- 2 — Deadline -->
    <div class="r-col r-deadline">
      <span class="r-col-k">Deadline</span>
      <span class="badge" data-status={status.key}><span class="dot"></span>{status.label}</span>
      <span class="r-date" title={item.timeline.deadline}>{item.timeline.deadline}</span>
      <span class="r-cycle">Cycle {item.timeline.cycle}</span>
    </div>

    <!-- 3 — Key facts -->
    <div class="r-col r-facts">
      <span class="r-col-k">Key facts</span>
      {#if keyFacts.length}
        <dl class="mini">
          {#each keyFacts as f}
            <div class="mini-row"><dt>{f.k}</dt><dd>{f.v}</dd></div>
          {/each}
        </dl>
      {:else}
        <span class="r-dash">See details ↓</span>
      {/if}
    </div>

    <!-- 4 — Actions + expand affordance -->
    <div class="r-end">
      <a
        class="icon-btn"
        href={item.officialLink}
        onclick={stopToggle}
        target="_blank"
        rel="noopener noreferrer"
        title="Open the official page"
        aria-label="Open the official page"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59l-9.3 9.29 1.42 1.42L19 6.41V10h2V3h-7ZM5 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-2v5H5V7h5V5H5Z"/></svg>
      </a>
      {#if ics && actionable}
        <a
          class="icon-btn"
          href={ics}
          download={`${item.countryKey}-deadline.ics`}
          onclick={stopToggle}
          title="Add this deadline to your calendar"
          aria-label="Add this deadline to your calendar"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 7v10H5V9h14Zm-6 2h-2v3H8v2h3v3h2v-3h3v-2h-3v-3Z"/></svg>
        </a>
      {/if}
      <span class="r-chev" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 15.4 6.6 10l1.4-1.4 4 4 4-4 1.4 1.4z"/></svg>
      </span>
    </div>
  </summary>

  <!-- Expanded detail — full width below the row header -->
  <div class="row-body">
    <div class="body-cols">
      <div class="bcol">
        <section class="block">
          <span class="section-k">What the funding covers</span>
          <ul class="benefit-list">
            {#each item.benefits as b}<li>{b}</li>{/each}
          </ul>
        </section>

        {#if item.mustKnow.length}
          <section class="block block--warn">
            <span class="section-k section-k--warn">⚠ Must know before you apply</span>
            <ul class="plain-list">{#each item.mustKnow as m}<li>{m}</li>{/each}</ul>
          </section>
        {/if}
      </div>

      <div class="bcol">
        <section class="block">
          <span class="section-k">Documents required</span>
          <ol class="doc-list">{#each item.requiredDocuments as d}<li>{d}</li>{/each}</ol>
        </section>

        {#if moreRows.length}
          <section class="block">
            <span class="section-k">Full details</span>
            <dl class="def">
              {#each moreRows as r}
                <div class="def-row"><dt>{r.k}</dt><dd>{r.v}</dd></div>
              {/each}
            </dl>
          </section>
        {/if}
      </div>
    </div>

    {#if sources.length}
      <section class="block block--sources">
        <span class="section-k">Sources &amp; provenance</span>
        <ol class="src-list">
          {#each sources as s}
            <li>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              <span class="accessed">accessed {s.accessed}</span>
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    <div class="body-foot">
      <a class="btn btn--primary" href={item.officialLink} target="_blank" rel="noopener noreferrer">
        Visit official page
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59l-9.3 9.29 1.42 1.42L19 6.41V10h2V3h-7ZM5 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-2v5H5V7h5V5H5Z"/></svg>
      </a>
      <span class="verified" title="Date the facts were last checked against the official source">
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="m9.55 17.6-4.6-4.6 1.42-1.42 3.18 3.18 7.68-7.68 1.42 1.42-9.1 9.1Z"/></svg>
        Verified {item.lastVerified}
      </span>
    </div>
  </div>
</details>

<style>
  .row {
    position: relative;
    background: var(--surface);
    transition: background var(--t-fast) var(--ease);
  }
  /* Status rail — slim, brightens on hover/open. */
  .row::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--st-unknown);
    opacity: 0.5;
    transition: opacity var(--t) var(--ease), width var(--t) var(--ease-out);
  }
  .row[data-status='open']::before { background: var(--st-open); }
  .row[data-status='closing-soon']::before { background: var(--st-soon); }
  .row[data-status='opens-soon']::before { background: var(--st-opens); }
  .row[data-status='closed']::before { background: var(--st-closed); }
  .row:hover { background: color-mix(in srgb, var(--brand-tint) 32%, var(--surface)); }
  .row:hover::before, .row[open]::before { opacity: 1; width: 4px; }
  .row[open] { background: color-mix(in srgb, var(--brand-tint) 24%, var(--surface)); }

  /* ── Summary / header row ─────────────────────────────────────────── */
  .row-head {
    display: grid;
    grid-template-columns: var(--row-cols);
    gap: 0.6rem 1.4rem;
    align-items: start;
    padding: 0.95rem 1.15rem 0.95rem 1.25rem;
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .row-head::-webkit-details-marker { display: none; }
  .row-head:focus-visible { outline: 2.5px solid var(--brand-soft); outline-offset: -3px; border-radius: var(--r-sm); }

  /* 1 — Scholarship */
  .r-main { min-width: 0; display: flex; flex-direction: column; gap: 0.34rem; }
  .r-title-line { display: flex; align-items: baseline; gap: 0.45rem; }
  .r-flag { font-size: 1rem; line-height: 1; flex-shrink: 0; filter: saturate(1.05); }
  .r-name {
    font-size: 1.02rem;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: -0.005em;
    transition: color var(--t-fast) var(--ease);
  }
  .row:hover .r-name { color: var(--brand); }
  .r-host { font-size: 0.8rem; color: var(--ink-mute); line-height: 1.35; }
  .r-country { color: var(--brand-soft); font-weight: 600; }

  .r-benefits {
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .r-benefits-k {
    display: inline-block;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--brand-soft);
    background: var(--brand-tint);
    padding: 0.05rem 0.36rem;
    border-radius: var(--r-xs);
    margin-right: 0.42rem;
    vertical-align: 0.06em;
  }

  .r-tags { display: flex; flex-wrap: wrap; gap: 0.32rem; margin-top: 0.1rem; }
  .tag {
    font-size: 0.69rem;
    font-weight: 550;
    padding: 0.16rem 0.5rem;
    border-radius: var(--r-pill);
    color: var(--ink-soft);
    background: var(--surface-sunken);
    border: 1px solid transparent;
    transition: transform var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
  }
  .tag--known { color: var(--accent); background: var(--accent-tint); border-color: color-mix(in srgb, var(--accent) 18%, transparent); }
  .row:hover .tag { transform: translateY(-1px); }

  /* shared column scaffolding */
  .r-col { min-width: 0; display: flex; flex-direction: column; gap: 0.28rem; }
  .r-col-k {
    display: none; /* desktop: the ledger header labels these columns */
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }

  /* 2 — Deadline */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.34rem;
    width: fit-content;
    font-size: 0.69rem;
    font-weight: 650;
    padding: 0.18rem 0.55rem 0.18rem 0.45rem;
    border-radius: var(--r-pill);
    color: var(--st-unknown);
    background: var(--st-unknown-bg);
  }
  .badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .badge[data-status='open'] { color: var(--st-open); background: var(--st-open-bg); }
  .badge[data-status='closing-soon'] { color: var(--st-soon); background: var(--st-soon-bg); }
  .badge[data-status='opens-soon'] { color: var(--st-opens); background: var(--st-opens-bg); }
  .badge[data-status='closed'] { color: var(--st-closed); background: var(--st-closed-bg); }
  .badge[data-status='open'] .dot { animation: pulse 2.4s var(--ease) infinite; }
  .badge[data-status='closing-soon'] .dot { animation: pulse 1.6s var(--ease) infinite; }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent); }
    55% { box-shadow: 0 0 0 4px transparent; }
  }
  .r-date {
    font-size: 0.82rem;
    line-height: 1.32;
    font-weight: 550;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .r-cycle { font-size: 0.7rem; color: var(--ink-mute); }

  /* 3 — Key facts */
  .mini { display: flex; flex-direction: column; gap: 0.18rem; }
  .mini-row { display: flex; gap: 0.4rem; align-items: baseline; font-size: 0.78rem; line-height: 1.3; }
  .mini-row dt { color: var(--ink-mute); flex-shrink: 0; }
  .mini-row dd { margin: 0; color: var(--ink); font-weight: 550; min-width: 0; }
  .r-dash { font-size: 0.76rem; color: var(--ink-mute); font-style: italic; }

  /* 4 — Actions + chevron */
  .r-end { display: flex; align-items: center; gap: 0.28rem; justify-self: end; }
  .icon-btn {
    display: grid; place-items: center;
    width: 32px; height: 32px;
    color: var(--brand-soft);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    transition: transform var(--t-fast) var(--ease), background var(--t-fast) var(--ease),
      color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);
  }
  .icon-btn:hover { background: var(--brand); color: #fff; border-color: var(--brand-ink); transform: translateY(-1px); }
  .icon-btn:active { transform: translateY(0); }
  .r-chev {
    display: grid; place-items: center;
    width: 26px; height: 26px;
    color: var(--ink-mute);
    border-radius: 50%;
    transition: transform var(--t) var(--ease-spring), background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .row[open] .r-chev { transform: rotate(180deg); color: var(--brand); background: var(--brand-tint); }
  .row:hover .r-chev { color: var(--brand-soft); }

  /* ── Expanded body ────────────────────────────────────────────────── */
  .row-body {
    padding: 0.2rem 1.25rem 1.3rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    animation: reveal var(--t-slow) var(--ease-out);
  }
  @keyframes reveal { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

  /* Smooth height animation for the disclosure where the browser supports it. */
  .row::details-content {
    overflow: clip;
    transition: height var(--t-slow) var(--ease-out), content-visibility var(--t-slow) allow-discrete;
    height: 0;
  }
  .row[open]::details-content { height: auto; }

  .body-cols {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 1.1rem 2rem;
    align-items: start;
  }
  .bcol { display: flex; flex-direction: column; gap: 1.1rem; min-width: 0; }

  .block { min-width: 0; }
  .section-k { display: block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 0.5rem; }

  .benefit-list { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; }
  .benefit-list li { position: relative; padding-left: 1.45rem; font-size: 0.86rem; line-height: 1.45; color: var(--ink-soft); }
  .benefit-list li::before {
    content: ''; position: absolute; left: 0; top: 0.26em;
    width: 15px; height: 15px; background: var(--brand-tint); border-radius: 50%;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 18%, transparent);
  }
  .benefit-list li::after {
    content: ''; position: absolute; left: 4px; top: 0.48em;
    width: 7px; height: 4px;
    border-left: 1.8px solid var(--brand-soft); border-bottom: 1.8px solid var(--brand-soft);
    transform: rotate(-45deg);
  }

  .block--warn { background: linear-gradient(180deg, #fdf6ea, #fbf0e0); border: 1px solid #f0ddb8; border-radius: var(--r); padding: 0.85rem 0.95rem; }
  .section-k--warn { color: var(--accent); }

  .plain-list, .doc-list, .src-list { padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.34rem; }
  .plain-list { list-style: none; padding-left: 0; }
  .plain-list li { position: relative; padding-left: 1rem; font-size: 0.84rem; line-height: 1.5; color: var(--ink-soft); }
  .plain-list li::before { content: ''; position: absolute; left: 0; top: 0.62em; width: 5px; height: 5px; border-radius: 50%; background: var(--accent-soft); }
  .doc-list li, .src-list li { font-size: 0.84rem; line-height: 1.5; color: var(--ink-soft); }
  .doc-list li::marker, .src-list li::marker { color: var(--ink-mute); font-weight: 600; }

  .def { display: flex; flex-direction: column; gap: 0.5rem; }
  .def-row { display: grid; grid-template-columns: minmax(7.5rem, 0.42fr) 1fr; gap: 0.4rem 0.9rem; align-items: baseline; }
  .def-row dt { font-size: 0.75rem; font-weight: 600; color: var(--ink-mute); }
  .def-row dd { margin: 0; font-size: 0.84rem; line-height: 1.5; color: var(--ink-soft); }

  .block--sources {
    border-top: 1px solid var(--line-soft);
    padding-top: 1rem;
  }
  .src-list a { font-weight: 500; }
  .accessed { display: block; font-size: 0.73rem; color: var(--ink-mute); }

  .body-foot {
    display: flex; align-items: center; gap: 0.8rem 1rem; flex-wrap: wrap;
    padding-top: 0.5rem;
    border-top: 1px solid var(--line-soft);
  }
  .verified { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.76rem; color: var(--ink-mute); }
  .verified svg { color: var(--st-open); }

  /* ── Mobile: the table collapses to a stacked, self-labelled block ── */
  @media (max-width: 860px) {
    .row-head {
      grid-template-columns: 1fr;
      gap: 0.7rem;
      padding: 1rem 1.1rem 1rem 1.2rem;
    }
    .r-col-k { display: block; }
    .r-col { gap: 0.34rem; }
    .r-deadline, .r-facts {
      padding-top: 0.7rem;
      border-top: 1px dashed var(--line);
    }
    .r-end {
      justify-self: start;
      position: absolute;
      top: 0.85rem;
      right: 1rem;
    }
    .r-chev { margin-left: 0.1rem; }
    .body-cols { grid-template-columns: 1fr; gap: 1.1rem; }
  }

  @media (max-width: 520px) {
    .row-body { padding-inline: 1.1rem; }
    .def-row { grid-template-columns: 1fr; gap: 0.1rem; }
  }
</style>
