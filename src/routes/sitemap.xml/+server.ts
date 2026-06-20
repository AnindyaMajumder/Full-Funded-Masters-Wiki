import { COUNTRY_ORDER } from '$lib/scholarship';
import { SITE_URL } from '$lib/seo';

// Prerendered into a static sitemap.xml at build time.
export const prerender = true;

// Anchored to the project's verification date (see CLAUDE.md timeline rule).
const LASTMOD = '2026-06-20';

export function GET() {
  const paths = ['/', ...COUNTRY_ORDER.map((c) => `/${c}/`)];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths
      .map(
        (p) =>
          '  <url>\n' +
          `    <loc>${SITE_URL}${p}</loc>\n` +
          `    <lastmod>${LASTMOD}</lastmod>\n` +
          `    <changefreq>weekly</changefreq>\n` +
          `    <priority>${p === '/' ? '1.0' : '0.8'}</priority>\n` +
          '  </url>'
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
