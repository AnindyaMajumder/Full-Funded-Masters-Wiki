<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { DATA } from '$data/all';
  import { COUNTRY_ORDER, COUNTRY_LABELS } from '$lib/scholarship';

  let { children } = $props();

  // Only surface destinations we actually have verified data for.
  const navCountries = COUNTRY_ORDER.filter((k) => DATA[k].length > 0).map((k) => ({
    key: k,
    label: COUNTRY_LABELS[k],
    count: DATA[k].length
  }));

  const path = $derived(page.url.pathname);
  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);
</script>

<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Fully Funded Masters — home">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="30" height="30">
          <rect width="32" height="32" rx="9" fill="var(--brand)" />
          <path d="M16 7 4.5 11.7 16 16.4l8.5-3.47V19h1.6v-6.9z" fill="#f4d58a" />
          <path d="M9.4 14.9V19c0 1.7 2.95 3.1 6.6 3.1s6.6-1.4 6.6-3.1v-4.1L16 17.6z" fill="#f4d58a" opacity=".8" />
        </svg>
      </span>
      <span class="brand-text">
        <span class="brand-name">Fully&nbsp;Funded&nbsp;Masters</span>
        <span class="brand-sub">verified scholarship wiki</span>
      </span>
    </a>

    <nav class="nav" aria-label="Destinations">
      <a class="nav-link" href="/" class:active={isActive('/')}>All</a>
      {#each navCountries as c}
        <a class="nav-link" href={`/${c.key}/`} class:active={isActive(`/${c.key}/`)}>
          {c.label}<span class="nav-count">{c.count}</span>
        </a>
      {/each}
    </nav>
  </div>
</header>

<main id="main">
  {@render children()}
</main>

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-meta faint">
      <span>Facts last verified June 2026</span>
      <span>·</span>
      <span>Built as a static, open resource</span>
    </div>
  </div>
</footer>

<style>
  .skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    background: var(--brand);
    color: #fff;
    padding: 0.7rem 1rem;
    border-radius: 0 0 var(--r-sm) 0;
  }
  .skip:focus { left: 0; color: #fff; }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--bg) 78%, transparent);
    backdrop-filter: saturate(1.4) blur(14px);
    -webkit-backdrop-filter: saturate(1.4) blur(14px);
    border-bottom: 1px solid var(--line-soft);
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 68px;
    padding-block: 0.55rem;
  }

  .brand { display: inline-flex; align-items: center; gap: 0.6rem; color: var(--ink); }
  .brand-mark { display: grid; place-items: center; filter: drop-shadow(0 3px 6px rgba(19, 75, 69, 0.25)); }
  .brand-mark svg { border-radius: 9px; }
  .brand-text { display: flex; flex-direction: column; line-height: 1.05; }
  .brand-name { font-family: var(--font-serif); font-weight: 600; font-size: 1.06rem; letter-spacing: -0.01em; }
  .brand-sub { font-size: 0.7rem; letter-spacing: 0.04em; color: var(--ink-mute); }

  .nav {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-inline: -0.4rem;
    padding-inline: 0.4rem;
  }
  .nav::-webkit-scrollbar { display: none; }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink-soft);
    padding: 0.42rem 0.72rem;
    border-radius: var(--r-pill);
    white-space: nowrap;
    transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease);
  }
  .nav-link:hover { background: var(--surface-sunken); color: var(--ink); }
  .nav-link.active { background: var(--brand-tint); color: var(--brand-ink); }
  .nav-count {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--ink-mute);
    background: color-mix(in srgb, var(--surface-sunken) 70%, transparent);
    padding: 0.05rem 0.36rem;
    border-radius: var(--r-pill);
  }
  .nav-link.active .nav-count { background: #fff; color: var(--brand-soft); }

  main { min-height: 60vh; }

  .site-footer {
    margin-top: 4rem;
    border-top: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface) 50%, transparent);
  }
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 2.2rem;
  }
  .footer-meta { display: flex; gap: 0.5rem; font-size: 0.8rem; flex-wrap: wrap; }

  @media (max-width: 720px) {
    .header-inner { flex-direction: column; align-items: stretch; gap: 0.5rem; min-height: 0; }
    .brand { align-self: flex-start; }
    .nav { padding-bottom: 0.15rem; }
    .brand-sub { display: none; }
  }
</style>
