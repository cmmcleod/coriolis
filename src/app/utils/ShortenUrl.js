import request from 'superagent';

const SHORTEN_API = 'https://www.googleapis.com/urlshortener/v1/url?key=';

/**
 * Shorten a URL using Google's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
export default function shortenUrl(url, success, error) {
  if (window.navigator.onLine) {
    request.post(SHORTEN_API + window.CORIOLIS_GAPI_KEY)
      .send({ longUrl: url })
      .end(function(err, response) {
        if (err) {
          error('Error');
        } else {
          success(response.data.id);
        }
      });
  } else {
    error('Not Online');
  }
}
