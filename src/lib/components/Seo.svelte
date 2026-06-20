<script lang="ts">
  // Per-page social-share + search metadata. Emits the document <title>,
  // canonical link, Open Graph + Twitter cards, and any page-level JSON-LD.
  import { page } from '$app/state';
  import { SITE_NAME, SITE_TAGLINE, DEFAULT_DESCRIPTION, abs, ldJson } from '$lib/seo';

  let {
    title,
    description = DEFAULT_DESCRIPTION,
    image = '/og.png',
    imageAlt = `${SITE_NAME} — ${SITE_TAGLINE}`,
    type = 'website',
    ogTitle,
    jsonLd = []
  }: {
    /** Full document title (used verbatim for <title> and as the social title). */
    title: string;
    description?: string;
    /** Site-relative or absolute path to the 1200×630 share image. */
    image?: string;
    imageAlt?: string;
    type?: string;
    /** Override the social-card title if it should differ from <title>. */
    ogTitle?: string;
    /** One or more schema.org objects to embed as JSON-LD. */
    jsonLd?: unknown | unknown[];
  } = $props();

  const canonical = $derived(abs(page.url.pathname));
  const img = $derived(abs(image));
  const social = $derived(ogTitle ?? title);
  const blocks = $derived((Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- Open Graph (Facebook, LinkedIn, WhatsApp, Slack, …) -->
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content={social} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={img} />
  <meta property="og:image:secure_url" content={img} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={imageAlt} />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={social} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={img} />
  <meta name="twitter:image:alt" content={imageAlt} />

  {#each blocks as block}
    {@html `<script type="application/ld+json">${ldJson(block)}<\/script>`}
  {/each}
</svelte:head>
