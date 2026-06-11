<script lang="ts">
  import type { ScholarshipWithCountry } from '$lib/scholarship';
  import {
    deadlineStatus,
    effectiveTags,
    tagLabel,
    TAG_META,
    icsHref
  } from '$lib/scholarship';

  let { item, showCountry = true }: { item: ScholarshipWithCountry; showCountry?: boolean } =
    $props();

  type Fact = { k: string; v: string };

  // Everything below derives from the (immutable per instance) `item` prop.
  const status = $derived(deadlineStatus(item));
  const tags = $derived(effectiveTags(item, status));
  const sources = $derived(item.sources ?? []);
  const ar = $derived(item.acceptanceRate);
  const ics = $derived(icsHref(item, status));
  const actionable = $derived(
    status.key === 'open' || status.key === 'closing-soon' || status.key === 'opens-soon'
  );
  const arSrcN = $derived(ar.source ? sources.findIndex((s) => s.url === ar.source) + 1 : 0);
  const universities = $derived(item.host?.universities ?? []);
  const hostLine = $derived([item.host?.city, item.host?.country].filter(Boolean).join(', '));

  const DEGREE_LABEL: Record<string, string> = {
    taught: 'Taught',
    research: 'Research',
    both: 'Taught & research'
  };

  // Glance pills hold short values only; anything long (some stipend/fee fields are
  // whole sentences) is routed into the details drawer so the pills stay clean.
  const SHORT = 40;
  const facts = $derived.by(() => {
    const pills: Fact[] = [];
    const rows: Fact[] = [];
    const route = (k: string, v?: string | null) => {
      if (v) (v.length <= SHORT ? pills : rows).push({ k, v });
    };
    const row = (k: string, v?: string | null) => {
      if (v) rows.push({ k, v });
    };

    route('Duration', item.duration);
    route('Stipend', item.monthlyStipend);
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

    // Timeline context, so a clamped deadline never hides a date.
    row('Opens', item.timeline.opens);
    row('Results by', item.timeline.resultsBy);
    row('Timeline notes', item.timeline.notes);

    return { pills, rows };
  });
  const quickFacts = $derived(facts.pills);
  const moreRows = $derived(facts.rows);

  const detailCount = $derived(item.mustKnow.length + item.requiredDocuments.length);
</script>

<article class="card" data-status={status.key}>
  <header class="card-head">
    <div class="card-eyebrow">
      {#if showCountry}<span class="country">{item.countryLabel}</span>{/if}
      <span class="badge" data-status={status.key}>
        <span class="dot"></span>{status.label}
      </span>
    </div>
    <h3 class="card-title">{item.name}</h3>
    {#if hostLine || universities.length}
      <p class="card-host">
        {hostLine}{#if universities.length}{hostLine ? ' · ' : ''}{universities.slice(0, 2).join(', ')}{universities.length > 2 ? ' +' + (universities.length - 2) : ''}{/if}
      </p>
    {/if}
  </header>

  <div class="deadline" data-status={status.key}>
    <div class="deadline-info">
      <span class="deadline-label">Deadline · {item.timeline.cycle}</span>
      <span class="deadline-date" title={item.timeline.deadline}>{item.timeline.deadline}</span>
    </div>
    {#if ics && actionable}
      <a class="btn btn--sm cal-btn" href={ics} download={`${item.countryKey}-deadline.ics`} title="Add this deadline to your calendar">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 7v10H5V9h14Zm-6 2h-2v3H8v2h3v3h2v-3h3v-2h-3v-3Z"/></svg>
        Calendar
      </a>
    {/if}
  </div>

  {#if quickFacts.length || ar.value}
    <div class="facts">
      <span class="fact fact--acc">
        <span class="fact-k">Acceptance</span>
        <span class="fact-v">
          {ar.isOfficial ? ar.value : 'Not published'}
          {#if ar.isOfficial}<span class="acc-tag" title="Officially published figure">official</span>{/if}
          {#if arSrcN > 0}<a class="cite" href={ar.source} target="_blank" rel="noopener noreferrer" title={`Source ${arSrcN}`}>{arSrcN}</a>{/if}
        </span>
      </span>
      {#each quickFacts as f}
        <span class="fact">
          <span class="fact-k">{f.k}</span>
          <span class="fact-v">{f.v}</span>
        </span>
      {/each}
    </div>
  {/if}

  <div class="benefits">
    <span class="section-k">What you get</span>
    <ul class="benefit-list">
      {#each item.benefits as b}<li>{b}</li>{/each}
    </ul>
  </div>

  {#if tags.length}
    <div class="tag-row">
      {#each tags as t}
        <span class="tag" class:tag--known={TAG_META[t]} title={TAG_META[t]?.hint}>{tagLabel(t)}</span>
      {/each}
    </div>
  {/if}

  <div class="card-foot">
    <a class="btn btn--primary" href={item.officialLink} target="_blank" rel="noopener noreferrer">
      Official page
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59l-9.3 9.29 1.42 1.42L19 6.41V10h2V3h-7ZM5 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-2v5H5V7h5V5H5Z"/></svg>
    </a>
    <span class="verified" title="Date the facts were last checked against the official source">
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="m9.55 17.6-4.6-4.6 1.42-1.42 3.18 3.18 7.68-7.68 1.42 1.42-9.1 9.1Z"/></svg>
      Verified {item.lastVerified}
    </span>
  </div>

  <details class="disclose">
    <summary>
      <span class="disclose-text">Must-knows, documents &amp; {sources.length} source{sources.length === 1 ? '' : 's'}</span>
      <span class="disclose-count">{detailCount}</span>
      <svg class="chev" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 15.4 6.6 10l1.4-1.4 4 4 4-4 1.4 1.4z"/></svg>
    </summary>
    <div class="disclose-body">
      {#if item.mustKnow.length}
        <section class="block block--warn">
          <span class="section-k section-k--warn">⚠ Must know before you apply</span>
          <ul class="plain-list">{#each item.mustKnow as m}<li>{m}</li>{/each}</ul>
        </section>
      {/if}

      <section class="block">
        <span class="section-k">Documents required</span>
        <ol class="doc-list">{#each item.requiredDocuments as d}<li>{d}</li>{/each}</ol>
      </section>

      {#if !ar.isOfficial && ar.estimateNote}
        <section class="block">
          <span class="section-k">On the acceptance rate</span>
          <p class="note">{ar.estimateNote}</p>
        </section>
      {/if}

      {#if moreRows.length}
        <section class="block">
          <span class="section-k">More details</span>
          <dl class="def">
            {#each moreRows as r}
              <div class="def-row"><dt>{r.k}</dt><dd>{r.v}</dd></div>
            {/each}
          </dl>
        </section>
      {/if}

      {#if sources.length}
        <section class="block">
          <span class="section-k">Sources</span>
          <ol class="src-list">
            {#each sources as s, i}
              <li>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                <span class="accessed">accessed {s.accessed}</span>
              </li>
            {/each}
          </ol>
        </section>
      {/if}
    </div>
  </details>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 1.25rem 1.25rem 0.5rem;
    box-shadow: var(--shadow-sm);
    transition: transform var(--t) var(--ease-out), box-shadow var(--t) var(--ease-out),
      border-color var(--t) var(--ease-out);
    position: relative;
    overflow: clip;
  }
  .card::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--st-unknown);
    opacity: 0.55;
    transition: opacity var(--t) var(--ease);
  }
  .card[data-status='open']::before { background: var(--st-open); }
  .card[data-status='closing-soon']::before { background: var(--st-soon); }
  .card[data-status='opens-soon']::before { background: var(--st-opens); }
  .card[data-status='closed']::before { background: var(--st-closed); }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: color-mix(in srgb, var(--brand) 22%, var(--line));
  }
  .card:hover::before { opacity: 1; }

  .card-eyebrow { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.5rem; }
  .country { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brand-soft); }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.36rem;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.22rem 0.6rem 0.22rem 0.5rem;
    border-radius: var(--r-pill);
    margin-left: auto;
    color: var(--st-unknown);
    background: var(--st-unknown-bg);
  }
  .badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .badge[data-status='open'] { color: var(--st-open); background: var(--st-open-bg); }
  .badge[data-status='closing-soon'] { color: var(--st-soon); background: var(--st-soon-bg); }
  .badge[data-status='opens-soon'] { color: var(--st-opens); background: var(--st-opens-bg); }
  .badge[data-status='closed'] { color: var(--st-closed); background: var(--st-closed-bg); }
  .badge[data-status='open'] .dot { animation: pulse 2.4s var(--ease) infinite; }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--st-open) 55%, transparent); } 50% { box-shadow: 0 0 0 4px transparent; } }

  .card-title { font-size: 1.18rem; line-height: 1.22; }
  .card-host { margin-top: 0.3rem; font-size: 0.84rem; color: var(--ink-mute); }

  .deadline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    background: linear-gradient(180deg, color-mix(in srgb, var(--surface-sunken) 45%, transparent), var(--surface-sunken));
    border: 1px solid var(--line-soft);
    border-radius: var(--r);
    padding: 0.7rem 0.9rem;
  }
  .deadline[data-status='closing-soon'] { background: linear-gradient(180deg, #fdf4e3, #fbeacf); border-color: #f1d9ab; }
  .deadline[data-status='open'] { background: linear-gradient(180deg, #eef6f0, #e4f1e9); border-color: #cfe6d8; }
  .deadline-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
  .deadline-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-mute); }
  .deadline-date {
    font-family: var(--font-serif);
    font-size: 0.97rem;
    line-height: 1.32;
    font-weight: 500;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cal-btn { flex-shrink: 0; background: var(--surface); }

  .facts { display: flex; flex-wrap: wrap; gap: 0.45rem; }
  .fact {
    display: inline-flex;
    align-items: baseline;
    gap: 0.34rem;
    font-size: 0.78rem;
    padding: 0.28rem 0.6rem;
    background: var(--surface-sunken);
    border-radius: var(--r-pill);
  }
  .fact-k { color: var(--ink-mute); font-weight: 500; }
  .fact-v { color: var(--ink); font-weight: 550; }
  .fact--acc { background: var(--brand-tint); }
  .acc-tag { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--st-open); font-weight: 700; }
  .cite {
    display: inline-grid; place-items: center;
    min-width: 15px; height: 15px; padding: 0 3px;
    font-size: 0.62rem; font-weight: 700;
    color: var(--brand-soft); background: #fff;
    border: 1px solid color-mix(in srgb, var(--brand) 25%, var(--line));
    border-radius: 5px; text-decoration: none;
  }
  .cite:hover { background: var(--brand); color: #fff; }

  .section-k { display: block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 0.4rem; }

  .benefit-list { list-style: none; display: flex; flex-direction: column; gap: 0.28rem; }
  .benefit-list li { position: relative; padding-left: 1.45rem; font-size: 0.88rem; line-height: 1.45; color: var(--ink-soft); }
  .benefit-list li::before {
    content: '';
    position: absolute; left: 0; top: 0.28em;
    width: 15px; height: 15px;
    background: var(--brand-tint);
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 18%, transparent);
  }
  .benefit-list li::after {
    content: '';
    position: absolute; left: 4px; top: 0.5em;
    width: 7px; height: 4px;
    border-left: 1.8px solid var(--brand-soft);
    border-bottom: 1.8px solid var(--brand-soft);
    transform: rotate(-45deg);
  }

  .tag-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .tag {
    font-size: 0.74rem; font-weight: 550;
    padding: 0.26rem 0.62rem; border-radius: var(--r-pill);
    color: var(--ink-soft); background: var(--surface-sunken);
    border: 1px solid transparent;
  }
  .tag--known { color: var(--accent); background: var(--accent-tint); border-color: color-mix(in srgb, var(--accent) 18%, transparent); }

  .card-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
    flex-wrap: wrap;
    padding-top: 0.5rem;
    margin-top: auto;
  }
  .verified { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.76rem; color: var(--ink-mute); }
  .verified svg { color: var(--st-open); }

  .disclose {
    border-top: 1px solid var(--line-soft);
    margin: 0.35rem -1.25rem 0;
  }
  .disclose summary {
    display: flex; align-items: center; gap: 0.5rem;
    list-style: none; cursor: pointer;
    padding: 0.85rem 1.25rem;
    font-size: 0.82rem; font-weight: 550; color: var(--brand-soft);
    transition: background var(--t-fast) var(--ease);
    user-select: none;
  }
  .disclose summary::-webkit-details-marker { display: none; }
  .disclose summary:hover { background: var(--brand-tint); }
  .disclose-count {
    font-size: 0.68rem; font-weight: 700; color: var(--ink-mute);
    background: var(--surface-sunken); border-radius: var(--r-pill);
    padding: 0.05rem 0.4rem;
  }
  .chev { margin-left: auto; color: var(--ink-mute); transition: transform var(--t) var(--ease); }
  .disclose[open] .chev { transform: rotate(180deg); }

  .disclose-body { padding: 0.2rem 1.25rem 1.1rem; display: flex; flex-direction: column; gap: 1.05rem; animation: reveal var(--t) var(--ease-out); }
  @keyframes reveal { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }

  .block--warn { background: linear-gradient(180deg, #fdf6ea, #fbf0e0); border: 1px solid #f0ddb8; border-radius: var(--r); padding: 0.85rem 0.95rem; }
  .section-k--warn { color: var(--accent); }

  .plain-list, .doc-list, .src-list { padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.34rem; }
  .plain-list { list-style: none; padding-left: 0; }
  .plain-list li { position: relative; padding-left: 1rem; font-size: 0.85rem; line-height: 1.5; color: var(--ink-soft); }
  .plain-list li::before { content: ''; position: absolute; left: 0; top: 0.62em; width: 5px; height: 5px; border-radius: 50%; background: var(--accent-soft); }
  .doc-list li, .src-list li { font-size: 0.85rem; line-height: 1.5; color: var(--ink-soft); }
  .doc-list li::marker, .src-list li::marker { color: var(--ink-mute); font-weight: 600; }

  .note { font-size: 0.83rem; line-height: 1.55; color: var(--ink-soft); }

  .def { display: flex; flex-direction: column; gap: 0.5rem; }
  .def-row { display: grid; grid-template-columns: minmax(8rem, 0.42fr) 1fr; gap: 0.5rem 0.9rem; align-items: baseline; }
  .def-row dt { font-size: 0.76rem; font-weight: 600; color: var(--ink-mute); }
  .def-row dd { margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--ink-soft); }

  .src-list a { font-weight: 500; }
  .accessed { display: block; font-size: 0.74rem; color: var(--ink-mute); }

  @media (max-width: 480px) {
    .card { padding-inline: 1rem; }
    .disclose { margin-inline: -1rem; }
    .disclose summary, .disclose-body { padding-inline: 1rem; }
    .def-row { grid-template-columns: 1fr; gap: 0.1rem; }
  }
</style>
