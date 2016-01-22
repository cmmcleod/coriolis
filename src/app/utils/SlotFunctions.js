import React from 'react';
import cn from 'classnames';
import { Infinite } from '../components/SvgIcons';

/**
 * Returns the translate name for the module mounted in the specified
 * slot.
 * @param  {function} translate Translation function
 * @param  {object} slot      Slot object
 * @return {string}           The translated name
 */
export function slotName(translate, slot) {
  return slot.m ? translate(slot.m.name || slot.m.grp) : '';
}

/**
 * Slot name comparator
 * @param  {Function} translate Translate function
 * @param  {Object} a           Slot object
 * @param  {Object} b           Slot object
 * @return {number}             1, 0, -1
 */
export function nameComparator(translate, a, b) {
  return translate(a.name || a.grp).localeCompare(translate(b.name || b.grp));
}

/**
 * Generates an internationalization friendly slot comparator that will
 * sort by specified property (if provided) then by name/group, class, rating
 * @param  {function} translate       Tranlation function
 * @param  {function} propComparator  Optional property comparator
 * @param  {boolean} desc             Use descending order
 * @return {function}                 Comparator function for slot names
 */
export function slotComparator(translate, propComparator, desc) {
  return (a, b) => {
    // retain descending order when sorting sorting by name/group/class/rating
    let am = a.m; // Slot A's mounted module
    let bm = b.m; // Slot B's mounted module

    if (!desc) {  // Flip A and B if ascending order
      let t = a;
      a = b;
      b = t;
    }

    // Check for empty slots first
    if (a.m && !b.m) {
      return 1;
    } else if (!a.m && b.m) {
      return -1;
    } else if (!a.m && !b.m) {
      return 0;
    }
    // If a property comparator is provided use it first
    let diff = propComparator ? propComparator(a, b) : nameComparator(translate, a.m, b.m);

    if (diff) {
      return diff;
    }

    // Property matches so sort by name / group, then class, rating
    if (am.name === bm.name && am.grp === bm.grp) {
      if(am.class == bm.class) {
        return am.rating > bm.rating ? 1 : -1;
      }
      return am.class - bm.class;
    }

    return nameComparator(translate, am, bm);
  };
}

const PROP_BLACKLIST = {
  eddbID: 1,
  'class': 1,
  id: 1,
  maxfuel: 1,
  fuelmul: 1,
  fuelpower: 1,
  optmass: 1,
  maxmass: 1,
  passive: 1,
  thermload: 1,
  ammocost: 1,
  activepower: 1,
  cooldown: 1,
  chargeup: 1,
  ssdam: 1,
  mjdps: 1,
  mjeps: 1,
  M: 1,
  P: 1,
  mass: 1,
  cost: 1
};

const TERM_LOOKUP = {
  pGen: 'power',
  armouradd: 'armour',
  shieldmul: 'shield',
  rof: 'ROF',
  dps: 'DPS'
};

const FORMAT_LOOKUP = {
  time: 'time',
  shieldmul: 'rPct'
};

const UNIT_LOOKUP = {
  fuel: 'T',
  cargo: 'T',
  rate: 'kgs',
  range: 'km',
  recharge: 'MJ',
  rangeLS: 'Ls',
  power: 'MJ',
  pGen: 'MJ',
  rof: 'ps'
};

/**
 * Determine the appropriate class based on diff value
 * @param  {number} a         Potential Module (cannot be null)
 * @param  {number} b         Currently mounted module (optional - null)
 * @param  {boolean} negative A positive diff has a negative implication
 * @return {string}           CSS Class name
 */
function diffClass(a, b, negative) {
  if (b === undefined || a === b) {
    return 'muted';
  } else if (a > b) {
    return negative ? 'warning' : 'secondary';
  }
  return negative ? 'secondary' : 'warning';
}

/**
 * Determine the displayable diff of a module's proprty
 * @param  {Function} format    Formatter
 * @param  {number} mVal        Potential Module property value
 * @param  {number} mmVal       Currently mounted module property value
 * @return {string | React.Component} Component to be rendered
 */
function diff(format, mVal, mmVal) {
  if (mVal == Infinity) {
    return <Infinite/>;
  } else {
    let diff = mVal - mmVal;
    if (!diff || diff == mVal || Math.abs(diff) == Infinity) {
      return format(mVal);
    }
    return `${format(mVal)} (${diff > 0 ? '+' : ''}${format(diff)})`;
  }
}

/**
 * Returns a a summary and diff of the potential module
 * versus the currently mounted module if there is one
 * @param  {Object} language Current language
 * @param  {Object} m        Potential Module (cannot be null)
 * @param  {Object} mm       Currently mounted module (optional - null)
 * @return {React.Component} Component to be rendered
 */
export function diffDetails(language, m, mm) {
  mm = mm || {};
  let { formats, translate, units } = language;
  let propDiffs = [];
  let mMass = m.mass || 0;
  let mmMass = mm.mass || 0;
  let massDiff = mMass - mmMass;
  let capDiff = (m.fuel || m.cargo || 0) - (mm.fuel || mm.cargo || 0);

  propDiffs.push(<div key='cost'>{translate('cost')}: <span className={diffClass(m.cost, mm.cost, true) }>{formats.int(m.cost || 0)}{units.CR}</span></div>);
  propDiffs.push(<div key='mass'>{translate('mass')}: <span className={diffClass(mMass, mm.mass, true)}>{diff(formats.round, mMass, mmMass)}{units.T}</span></div>);

  for (let p in m) {
    if (!PROP_BLACKLIST[p] && !isNaN(m[p])) {
      let mVal = m[p] || Infinity;
      let mmVal = mm[p] === null ? Infinity : mm[p];
      let format = formats[FORMAT_LOOKUP[p]] || formats.round;
      propDiffs.push(<div key={p}>
        {`${translate(TERM_LOOKUP[p] || p)}: `}
        <span className={diffClass(mVal, mmVal, p == 'power')}>{diff(format, mVal, mmVal)}{units[UNIT_LOOKUP[p]]}</span>
      </div>);
    }
  }

  if (m.grp == 'fd' || massDiff || capDiff) {
    let fsd = m.grp == 'fd' ? m : null;
    let maxRange = this.getUnladenRange(massDiff, m.fuel, fsd);
    let ladenRange = this.getLadenRange(massDiff + capDiff, m.fuel, fsd);

    if (maxRange != this.unladenRange) {
      propDiffs.push(<div key='maxRange'>{`${translate('max')} ${translate('jump range')}: `}<span className={maxRange > this.unladenRange ? 'secondary' : 'warning'}>{formats.round(maxRange)}{units.LY}</span></div>);
    }
    if (ladenRange != this.ladenRange) {
      propDiffs.push(<div key='unladenRange'>{`${translate('laden')} ${translate('jump range')}: `}<span className={ladenRange > this.ladenRange ? 'secondary' : 'warning'}>{formats.round(ladenRange)}{units.LY}</span></div>);
    }
  }

  return <div className='cap' style={{ whiteSpace: 'nowrap' }}>{propDiffs}</div>;
}
