// Central SEO + social-share config and structured-data builders.
//
// One source of truth for: the canonical origin, the metadata that drives
// social-share previews (Open Graph / Twitter cards), and the JSON-LD that
// powers Google's rich results (organisation logo, sitelinks search box,
// breadcrumbs). Pages render this through `$lib/components/Seo.svelte`.

import { COUNTRY_LABELS } from './scholarship';
import type { CountryKey } from './scholarship';

/** Canonical production origin — NO trailing slash. Move the site? Change this one line. */
export const SITE_URL = 'https://full-funded-masters.anindya.pro';
export const SITE_NAME = 'Fully Funded Masters';
export const SITE_TAGLINE = 'verified scholarship wiki';

export const DEFAULT_DESCRIPTION =
  "A hand-verified directory of fully funded master's scholarships across the UK, Europe, " +
  'China, Japan and beyond — every deadline, benefit and requirement traced to its official source.';

/** Resolve a site-relative path to an absolute URL ("/uk/" → "https://…/uk/"). */
export function abs(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`);
}

/**
 * Serialise a value for safe embedding inside a `<script type="application/ld+json">`.
 * Escaping `<` is enough to neutralise `</script>` and `<!--` sequence breakouts.
 */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// ── Structured data (schema.org / JSON-LD) ──────────────────────────────────

/** Publisher identity — drives the logo/knowledge surfaces in Google. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 512, height: 512 },
    description: DEFAULT_DESCRIPTION
  };
}

/**
 * Site identity + sitelinks search box. The SearchAction is honest: the
 * directory reads `?q=` on load (see Directory.svelte), so `/?q={term}` works.
 */
export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: 'Full-Funded Masters Wiki',
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string'
    }
  };
}

/** Breadcrumb trail (Home → …) — Google renders this above the result title. */
export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path)
    }))
  };
}

/** Describe a listing page (the home index or a country page). */
export function collectionPageLd(opts: {
  path: string;
  name: string;
  description: string;
  numberOfItems: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${abs(opts.path)}#webpage`,
    url: abs(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.numberOfItems
    }
  };
}

/** A compact ItemList of destinations for the home page (internal links, ~10 items). */
export function destinationListLd(entries: { key: CountryKey; count: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Scholarship destinations',
    itemListElement: entries.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: COUNTRY_LABELS[e.key],
      url: abs(`/${e.key}/`)
    }))
  };
}
