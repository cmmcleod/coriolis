
/**
 * Generates a URL for the outiffing page
 * @param  {String} shipId    Ship Id
 * @param  {String} code      [optional] Serliazed build code
 * @param  {String} buildName [optional] Build name
 * @return {String}           URL
 */
export function outfitURL(shipId, code, buildName) {
  let parts = ['/outfit/', shipId];

  if (code) {
    parts.push('/', code);
  }

  if (buildName) {
    parts.push('?bn=', encodeURIComponent(buildName));
  }
  return parts.join('');
}

