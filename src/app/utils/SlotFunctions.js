
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
 * Generates an internationalization friendly slot name comparator
 * @param  {function} translate   Tranlation function
 * @return {function}             Comparator function for slot names
 */
export function nameComparator(translate) {
  return (a, b) => {
    a = a.m;
    b = b.m;

    if (a && !b) {
      return 1;
    } else if (!a && b) {
      return -1;
    } else if (!a && !b) {
      return 0;
    } else if (a.name === b.name && a.grp === b.grp) {
      if(a.class == b.class) {
        return a.rating > b.rating ? 1 : -1;
      }
      return a.class - b.class;
    }
    return translate(a.name || a.grp).localeCompare(translate(b.name || b.grp));
  };
}