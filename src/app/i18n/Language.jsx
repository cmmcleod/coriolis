import React from 'react';
import * as EN from './en';
import * as DE from './de';
import * as ES from './es';
import * as FR from './fr';
import * as IT from './it';
import * as RU from './ru';
import d3 from 'd3';

let fallbackTerms = EN.terms;

export function getLanguage(langCode) {
  let lang, translate;

  switch (langCode) {
    case 'de': lang = DE; break;
    case 'es': lang = ES; break;
    case 'fr': lang = FR; break;
    case 'it': lang = IT; break;
    case 'ru': lang = RU; break;
    default:
      lang = EN;
  }

  let currentTerms = lang.terms;
  let d3Locale = d3.locale(lang.formats);
  let gen = d3Locale.numberFormat('n');

  if(lang === EN) {
    translate = (t) => { return currentTerms[t] || t; };
  } else {
    translate = (t) => { return currentTerms[t] || fallbackTerms[t] || t; };
  }

  return {
    formats: {
      gen: gen,                               // General number format (.e.g 1,001,001.1234)
      int: d3Locale.numberFormat(',.0f'),     // Fixed to 0 decimal places (.e.g 1,001)
      f2: d3Locale.numberFormat(',.2f'),      // Fixed to 2 decimal places (.e.g 1,001.10)
      pct: d3Locale.numberFormat('.2%'),      // % to 2 decimal places (.e.g 5.40%)
      pct1: d3Locale.numberFormat('.1%'),     // % to 1 decimal places (.e.g 5.4%)
      r2: d3Locale.numberFormat('.2r'),       // Rounded to 2 decimal places (.e.g 5.12, 4.10)
      rPct: d3.format('%'),                   // % to 0 decimal places (.e.g 5%)
      round: (d) => gen(d3.round(d, 2)),      // Rounded to 0-2 decimal places (.e.g 5.12, 4.1)
      time: (d) => Math.floor(d / 60) + ':' + ('00' + Math.floor(d % 60)).substr(-2, 2)
    },
    translate,
    units: {
      CR: <u>{' ' + translate('CR')}</u>,     // Credits
      kg: <u>{' ' + translate('kg')}</u>,     // Kilograms
      kgs: <u>{' ' + translate('kg/s')}</u>,  // Kilograms per second
      km: <u>{' ' + translate('km')}</u>,     // Kilometers
      Ls: <u>{' ' + translate('Ls')}</u>,     // Light Seconds
      LY: <u>{' ' + translate('LY')}</u>,     // Light Years
      MJ: <u>{' ' + translate('MJ')}</u>,     // Mega Joules
      ms: <u>{' ' + translate('m/s')}</u>,    // Meters per second
      MW: <u>{' ' + translate('MW')}</u>,     // Mega Watts (same as Mega Joules per second)
      ps: <u>{translate('/s')}</u>,           // per second
      T: <u>{' ' + translate('T')}</u>,       // Metric Tons
    }
  }

}

export const Languages = {
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  ru: 'ру́сский'
};
