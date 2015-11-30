import request from 'superagent';

const SHORTEN_API = 'https://www.googleapis.com/urlshortener/v1/url?key=';

export default function shortenUrl(url, success, error) {
  if (window.navigator.onLine) {
    request.post(SHORTEN_API + GAPI_KEY)
      .send({ longUrl: url })
      .end(function(err, response) {
        if (err) {
          error('Error');
        } else {
          success(response.data.id);
        }
      });
  } else {
    return error('Not Online');
  }
}
