import type { CountryKey, ScholarshipWithCountry } from '../types/scholarship';
import { COUNTRY_ORDER, withCountry } from '../lib/scholarship';
import { uk } from './uk';
import { europe } from './europe';
import { usa } from './usa';
import { japan } from './japan';
import { china } from './china';
import { australia } from './australia';
import { southkorea } from './southkorea';
import { taiwan } from './taiwan';
import { singapore } from './singapore';
import { malaysia } from './malaysia';

export const DATA = {
  uk, europe, usa, japan, china, australia,
  southkorea, taiwan, singapore, malaysia,
} as const;

export function countryData(key: CountryKey): ScholarshipWithCountry[] {
  return withCountry(DATA[key], key);
}

export function allWithCountry(): ScholarshipWithCountry[] {
  return COUNTRY_ORDER.flatMap((k) => countryData(k));
}

export function countryCount(key: CountryKey): number {
  return DATA[key].length;
}
