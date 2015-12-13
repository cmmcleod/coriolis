
/**
 * [slotName description]
 * @param  {[type]} translate [description]
 * @param  {[type]} slot      [description]
 * @return {[type]}           [description]
 */
export function slotName(translate, slot) {
  return slot.m ? translate(slot.m.name || slot.m.grp) : '';
}

/**
 * Generates an internationalization friendly slot name comparator
 * @param  {function} translate   Tranlation function
 * @return {function}             Comparator function for slot names
 */
export function nameComparator(translate) {
  return (a, b) => slotName(translate, a).toLowerCase().localeCompare(slotName(translate, b).toLowerCase());
}