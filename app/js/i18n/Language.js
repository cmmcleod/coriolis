import EN from 'en';
import DE from 'de';
import ES from 'es';
import FR from 'fr';
import IT from 'it';
import RU from 'RU';
import d3 from 'd3';

let fallbackTerms = EN.terms;
let currentLanguage;
let currentTerms;
let format = {
  rPct: d3.format('%')
};

export format;

export function setLanguage(langCode) {
  let lang;

  switch (langCode) {
    case 'de': lang = DE; break;
    case 'es': lang = ES; break;
    case 'fr': lang = FR; break;
    case 'it': lang = IT; break;
    case 'ru': lang = RU; break;
    default: lang = EN;
  }

  currentTerms = lang.terms;
  d3Locale = d3.locale(lang.formats);

  format.gen = d3Locale.numberFormat('n');
  format.crd = d3Locale.numberFormat(',.0f');
  format.pwr = d3Locale.numberFormat(',.2f');
  format.round = (d) => format.gen(d3.round(d, 2));
  format.pct = d3Locale.numberFormat('.2%');
  format.pct1 = d3Locale.numberFormat('.1%');
}

export const Languages = {
  en: 'English',
  de: 'Deutsh',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  ru: 'ру́сский'
};

export function term(t) {
  return currentTerms[t] || fallbackTerms[t];
}
