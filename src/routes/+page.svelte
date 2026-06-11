<script lang="ts">
  import Directory from '$lib/components/Directory.svelte';
  import { allWithCountry, DATA } from '$data/all';
  import { COUNTRY_ORDER } from '$lib/scholarship';

  const all = allWithCountry();
  const total = all.length;
  const destinations = COUNTRY_ORDER.filter((k) => DATA[k].length > 0).length;
  const withStipend = all.filter((s) => !(s.tags ?? []).includes('#TuitionOnly')).length;
</script>

<svelte:head>
  <title>Fully Funded Masters — verified scholarship wiki</title>
  <meta
    name="description"
    content="A hand-verified directory of fully funded master's scholarships across the UK, Europe, China and Japan — every deadline, benefit and acceptance rate traced to its official source."
  />
</svelte:head>

<section class="hero">
  <div class="container hero-inner">
    <p class="eyebrow">Tuition + living stipend · cited to source · verified June 2026</p>
    <h1 class="hero-title">
      Find a master’s the<br />world will <em>pay for</em>.
    </h1>
    <p class="hero-lede">
      A hand-verified directory of fully funded master’s scholarships. Every benefit, deadline and
      acceptance rate is traced to its official page — so you can decide where to apply, not just
      dream about it.
    </p>

    <div class="stats">
      <div class="stat">
        <span class="stat-n">{total}</span>
        <span class="stat-l">scholarships</span>
      </div>
      <div class="stat">
        <span class="stat-n">{destinations}</span>
        <span class="stat-l">destinations</span>
      </div>
      <div class="stat">
        <span class="stat-n">{withStipend}</span>
        <span class="stat-l">with a living stipend</span>
      </div>
    </div>

    <ul class="trust">
      <li>✓ Official links only</li>
      <li>✓ No invented statistics</li>
      <li>✓ Every claim cited</li>
    </ul>
  </div>
</section>

<div class="container directory-wrap">
  <Directory items={all} showCountry={true} />
</div>

<style>
  .hero { position: relative; overflow: clip; }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(680px 360px at 88% -8%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%),
      radial-gradient(560px 360px at 6% 0%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    position: relative;
    padding-top: clamp(2.6rem, 7vw, 5rem);
    padding-bottom: clamp(1.8rem, 4vw, 2.6rem);
    max-width: 60rem;
  }

  .hero-title {
    font-size: clamp(2.3rem, 6.4vw, 4.1rem);
    line-height: 1.04;
    letter-spacing: -0.02em;
    margin-top: 0.9rem;
  }
  .hero-title em {
    font-style: italic;
    color: var(--brand);
    position: relative;
  }
  .hero-title em::after {
    content: '';
    position: absolute; left: 0; right: 0; bottom: 0.06em;
    height: 0.14em;
    background: color-mix(in srgb, var(--accent) 42%, transparent);
    border-radius: 2px;
    z-index: -1;
  }

  .hero-lede {
    margin-top: 1.2rem;
    max-width: 52ch;
    font-size: clamp(1rem, 2.1vw, 1.16rem);
    line-height: 1.6;
    color: var(--ink-soft);
  }

  .stats { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.8rem; }
  .stat {
    display: flex; flex-direction: column; gap: 0.1rem;
    padding: 0.85rem 1.2rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r);
    box-shadow: var(--shadow-sm);
    min-width: 7rem;
  }
  .stat-n { font-family: var(--font-serif); font-size: 1.9rem; font-weight: 600; line-height: 1; color: var(--brand); }
  .stat-l { font-size: 0.82rem; color: var(--ink-mute); }

  .trust {
    display: flex; flex-wrap: wrap; gap: 0.4rem 1.3rem;
    list-style: none; margin-top: 1.5rem;
    font-size: 0.86rem; color: var(--ink-soft);
  }
  .trust li { white-space: nowrap; }

  .directory-wrap { margin-top: clamp(1.6rem, 4vw, 2.6rem); }
</style>
