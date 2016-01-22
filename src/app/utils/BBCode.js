/**
 * Generate a BBCode (Forum) compatible table from comparisons
 * @param  {Function} translate Translate language function
 * @param  {object} formats     Number Formats
 * @param  {array} facets       Ship Facets
 * @param  {object} builds      Ship builds
 * @param  {string} link        Link to the comparison
 * @return {string}             the BBCode
 */
export function comparisonBBCode(translate, formats, facets, builds, link) {
  let colCount = 2, b, i, j, k, f, fl, p, pl, l = [];

  for (i = 0; i < facets.length; i++) {
    if (facets[i].active) {
      f = facets[i];
      p = f.props;

      if (p.length == 1) {
        l.push('[th][B][COLOR=#FF8C0D]', translate(f.title).toUpperCase(), '[/COLOR][/B][/th]');
        colCount++;
      } else {
        for (j = 0; j < p.length; j++) {
          l.push('[th][B][COLOR=#FF8C0D]', translate(f.title).toUpperCase(), '\n', translate(f.lbls[j]).toUpperCase(), '[/COLOR][/B][/th]');
          colCount++;
        }
      }
    }
  }
  l.push('[/tr]\n');

  for (i = 0; i < builds.length; i++) {
    b = builds[i];

    l.push('[tr][td]', b.name, '[/td][td]', b.buildName, '[/td]');

    for (j = 0, fl = facets.length; j < fl; j++) {
      if (facets[j].active) {
        f = facets[j];
        p = f.props;
        for (k = 0, pl = p.length; k < pl; k++) {
          l.push('[td="align: right"]', formats[f.fmt](b[p[k]]), ' [size=-2]', translate(f.unit), '[/size][/td]');
        }
      }
    }
    l.push('[/tr]\n');
  }
  l.push('[tr][td="align: center, colspan:', colCount, '"][size=-3]\n[url=', link, ']Interactive Comparison at Coriolis.io[/url][/td][/tr]\n[/size][/table]');
  l.unshift('[table="width:', colCount * 90, ',align: center"]\n[tr][th][B][COLOR=#FF8C0D]Ship[/COLOR][/B][/th][th][B][COLOR="#FF8C0D"]Build[/COLOR][/B][/th]');
  return l.join('');
}
