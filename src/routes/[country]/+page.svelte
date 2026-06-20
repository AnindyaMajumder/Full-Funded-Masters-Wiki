<script lang="ts">
  import Directory from '$lib/components/Directory.svelte';
  import { countryData } from '$data/all';
  import type { CountryKey } from '$lib/scholarship';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const items = $derived(countryData(data.key as CountryKey));

  const BLURBS: Record<CountryKey, string> = {
    uk: 'One-year taught master’s and Oxbridge research awards. The flagships — Chevening, Commonwealth, Gates Cambridge, Clarendon, Rhodes — cover full tuition plus a living stipend. Watch for return-home expectations and tight autumn deadlines.',
    europe: 'Erasmus Mundus joint master’s plus national government schemes — DAAD, Swedish Institute, Eiffel, Swiss programmes, Stipendium Hungaricum. Many are English-taught with monthly allowances, and some need no application fee or IELTS.',
    australia: 'Australia Awards (for partner countries) and the Research Training Program lead here. Full funding for coursework master’s is rarer than for research degrees — read what each award actually covers.',
    usa: 'Most fully funded U.S. master’s seats come from departmental assistantships and fellowships, not named scholarships. The named exceptions — Fulbright, Knight-Hennessy, Humphrey, Rotary Peace — belong here, with that reality flagged up front.',
    china: 'The Chinese Government Scholarship (CSC) anchors this list, alongside Schwarzman and Yenching. Check Chinese-language vs English-taught tracks, and whether stipend, accommodation and insurance are all included.',
    japan: 'MEXT (Japanese Government) is the flagship, with two routes and an age limit. ADB-JSP and World Bank programmes add options. Many ask you to line up a supervisor or a letter of acceptance before applying.',
    southkorea: 'The Global Korea Scholarship (GKS) anchors Korea — full tuition, a monthly stipend, airfare and a year of Korean language, with an annual quota for Bangladeshi applicants. KAIST, GIST, UNIST, DGIST and POSTECH fund admitted science/tech master’s students almost automatically; watch the under-40 age limit and TOPIK/English rules on the government awards.',
    taiwan: 'Taiwan funds master’s through the MOE Taiwan Scholarship (a tuition cap plus a monthly stipend) and — more reliably for Bangladeshis — each top university’s own international-student award (NTU, NYCU, NTUST, NCCU). Note that Taiwan ICDF does not cover Bangladesh, and the MOE award for Bangladeshis is processed via Taiwan’s office in New Delhi, so confirm your channel first.',
    singapore: 'Full funding for a Singapore master’s is rare and mostly for research degrees: the NUS and NTU Research Scholarships cover tuition plus a roughly S$2,900/month stipend. The Lee Kuan Yew School of Public Policy is one of the few fully-funded coursework routes. SINGA is PhD-only and ASEAN awards don’t reach Bangladesh.',
    malaysia: 'Malaysia has two named, fully-funded master’s scholarships open to Bangladeshis — MTCP (Bangladesh is explicitly eligible) and the Malaysia International Scholarship (via the Commonwealth route) — both covering tuition plus a living allowance. Beyond these, full funding comes through supervisor-tied research-assistant schemes such as University of Malaya’s UMSS.'
  };
</script>

<svelte:head>
  <title>{data.label} — Fully Funded Masters</title>
  <meta
    name="description"
    content={`Fully funded master's scholarships in ${data.label}, each verified against its official source.`}
  />
</svelte:head>

<section class="hero">
  <div class="container hero-inner">
    <p class="eyebrow">{data.label}</p>
    <h1 class="hero-title">Fully funded master’s in {data.label}</h1>
    <p class="hero-lede">{BLURBS[data.key as CountryKey]}</p>
    <div class="count-pill">
      <span class="count-n">{items.length}</span>
      <span>verified scholarship{items.length === 1 ? '' : 's'}</span>
    </div>
  </div>
</section>

<div class="container directory-wrap">
  {#if items.length}
    <Directory {items} showCountry={false} />
  {:else}
    <div class="soon">
      <p>This destination is still being researched and verified.</p>
      <a class="btn btn--primary" href="/">Browse all scholarships</a>
    </div>
  {/if}
</div>

<style>
  .hero { position: relative; overflow: clip; }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(620px 320px at 90% -10%, color-mix(in srgb, var(--brand) 13%, transparent), transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    position: relative;
    padding-top: clamp(2.2rem, 6vw, 3.6rem);
    padding-bottom: clamp(1.2rem, 3vw, 1.8rem);
    max-width: 56rem;
  }
  .hero-title { font-size: clamp(2rem, 5.2vw, 3.1rem); margin-top: 0.7rem; }
  .hero-lede { margin-top: 1rem; max-width: 60ch; font-size: clamp(0.98rem, 2vw, 1.1rem); line-height: 1.6; color: var(--ink-soft); }

  .count-pill {
    display: inline-flex; align-items: baseline; gap: 0.45rem;
    margin-top: 1.4rem; padding: 0.5rem 1rem;
    background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-pill);
    box-shadow: var(--shadow-sm); font-size: 0.86rem; color: var(--ink-mute);
  }
  .count-n { font-family: var(--font-serif); font-size: 1.3rem; font-weight: 600; color: var(--brand); }

  .directory-wrap { margin-top: clamp(1.4rem, 3.5vw, 2.2rem); }

  @media (max-width: 560px) {
    .hero-inner {
      padding-top: 1.4rem;
      padding-bottom: 0.8rem;
    }
    .hero-lede { margin-top: 0.7rem; }
    .count-pill { margin-top: 0.9rem; }
  }

  .soon {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    text-align: center; padding: 4rem 1rem; color: var(--ink-soft);
    background: var(--surface); border: 1px dashed var(--line); border-radius: var(--r-lg);
  }
</style>
