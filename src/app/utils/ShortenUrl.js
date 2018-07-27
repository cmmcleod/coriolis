import request from 'superagent';


/**
 * Shorten a URL
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
export default function shorternUrl(url, success, error) {
  orbisShorten(url, success, error);
}

const SHORTEN_API_GOOGLE = 'https://www.googleapis.com/urlshortener/v1/url?key=';
/**
 * Shorten a URL using Google's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function shortenUrlGoogle(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_GOOGLE + window.CORIOLIS_GAPI_KEY)
        .send({ longUrl: url })
        .end(function(err, response) {
          if (err) {
            error(response.statusText == 'OK' ? 'Bad Request' : response.statusText);
          } else {
            success(response.body.id);
          }
        });
    } catch (e) {
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const SHORTEN_API_EDDP = 'https://eddp.co/u';
/**
 * Shorten a URL using EDDP's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function shortenUrlEddp(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_EDDP)
        .send(url)
        .end(function(err, response) {
          if (err) {
            error('Bad Request');
          } else {
            success(response.header['location']);
          }
        });
    } catch (e) {
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const SHORTEN_API_ORBIS = 'https://s.orbis.zone/a';
/**
 * Shorten a URL using Orbis's URL shortener API
 * @param  {string} url        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
function orbisShorten(url, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(SHORTEN_API_ORBIS)
        .field('lsturl', url)
        .field('format', 'json')
        .end(function(err, response) {
          if (err) {
            error('Bad Request');
          } else {
            success(response.body.short);
          }
        });
    } catch (e) {
      console.log(e);
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}

const API_ORBIS = 'http://localhost:3000/builds/add';
/**
 * Upload to Orbis
 * @param  {object} ship        The URL to shorten
 * @param  {function} success   Success callback
 * @param  {function} error     Failure/Error callback
 */
export function orbisUpload(ship, success, error) {
  if (window.navigator.onLine) {
    try {
      request.post(API_ORBIS)
        .send(ship)
        .end(function(err, response) {
          if (err) {
            error('Bad Request');
          } else {
            success(response.body.link);
          }
        });
    } catch (e) {
      console.log(e);
      error(e.message ? e.message : e);
    }
  } else {
    error('Not Online');
  }
}
