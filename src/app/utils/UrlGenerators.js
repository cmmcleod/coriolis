/**
 * Generates a URL for the outiffing page
 * @param  {String} shipId    Ship Id
 * @param  {String} code      [optional] Serliazed build code
 * @param  {String} buildName [optional] Build name
 * @return {String}           URL
 */
export function outfitURL(shipId, code, buildName) {
  let path = '/outfit/' + shipId;

  let sepChar = '?';

  if (code) {
    path = path + sepChar + 'code=' + encodeURIComponent(code) + '&ver=2';
    sepChar = '&';
  }

  if (buildName) {
    path = path + sepChar + 'bn=' + encodeURIComponent(buildName);
  }

  return path;
}
