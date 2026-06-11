import { error } from '@sveltejs/kit';
import { COUNTRY_ORDER, COUNTRY_LABELS } from '$lib/scholarship';
import type { CountryKey } from '$lib/scholarship';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender one static page per country bucket.
export const entries: EntryGenerator = () => COUNTRY_ORDER.map((country) => ({ country }));

export const load: PageLoad = ({ params }) => {
  const key = params.country as CountryKey;
  if (!COUNTRY_ORDER.includes(key)) error(404, 'Unknown destination');
  return { key, label: COUNTRY_LABELS[key] };
};
