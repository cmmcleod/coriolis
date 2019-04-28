import Persist from './stores/Persist';

let standalone = undefined;

/**
 * Determine if the app is running in mobile/tablet 'standalone' mode
 * @return {Boolean} True if the app is in standalone mode
 */
function isStandAlone() {
  if (standalone === undefined) {
    try {
      standalone = window.navigator.standalone || (window.external && window.external.msIsSiteMode && window.external.msIsSiteMode());
    } catch (ex) {
      standalone = false;
    }
  }
  return standalone;
}

/**
 * Register path with callback fn(), or route path`, or Router.start().
 *
 *   Router('*', fn);
 *   Router('/user/:id', load, user);
 *   Router('/user/' + user.id, { some: 'thing' });
 *   Router('/user/' + user.id);
 *   Router();
 *
 * @param {String} path path
 * @param {Function} fn Callbacks (fn, fn, ...)
 * @api public
 */
function Router(path, fn) {
  let route = new Route(path);
  for (let i = 1; i < arguments.length; ++i) {
    Router.callbacks.push(route.middleware(arguments[i]));
  }
}

/**
 * Callback functions.
 */

Router.callbacks = [];

Router.start = function() {
  window.addEventListener('popstate', onpopstate, false);

  if (isStandAlone()) {
    let state = Persist.getState();
    // If a previous state has been stored, load that state
    if (state && state.path) {
      Router.replace(state.path, null, true);
    } else {
      Router.replace('/', null, true);
    }
  } else {
    let url = location.pathname + location.search;
    Router.replace(url, null, true);
  }
};

/**
 * Show `path` with optional `state` object.
 *
 * @param {String} path Path
 * @param {Object} state Additional state
 * @return {Context} New Context
 * @api public
 */
Router.go = function(path, state) {
  gaTrack(path);
  let ctx = new Context(path, state);
  Router.dispatch(ctx);
  if (!ctx.unhandled) {
    if (isStandAlone()) {
      Persist.setState(ctx);
    }
    try {
      history.pushState(ctx.state, ctx.title, ctx.canonicalPath);
    } catch (ex) {
      sessionStorage.setItem('__safari_history_fix', JSON.stringify({
        state: ctx.state,
        title: ctx.title,
        path: ctx.canonicalPath
      }));
      location.reload();
    }
  }
  return ctx;
};

/**
 * Replace `path` with optional `state` object.
 *
 * @param {String} path path
 * @param {Object} state State
 * @param {Boolean} dispatch If true dispatch the route / trigger update
 * @return {Context} New Context
 * @api public
 */
Router.replace = function(path, state, dispatch) {
  gaTrack(path);
  let ctx = new Context(path, state);
  if (dispatch) {
    Router.dispatch(ctx);
  }
  if (isStandAlone()) {
    Persist.setState(ctx);
  }
  try {
    history.replaceState(ctx.state, ctx.title, ctx.canonicalPath);
  } catch (ex) {
    sessionStorage.setItem('__safari_history_fix', JSON.stringify({
      state: ctx.state,
      title: ctx.title,
      path: ctx.canonicalPath
    }));
    location.reload();
  }
  return ctx;
};

/**
 * Dispatch the given `ctx`.
 *
 * @param {Context} ctx Context
 * @api private
 */
Router.dispatch = function(ctx) {
  let i = 0;

  /**
   * Handle the next route
   * @return {Function} Unhandled
   */
  function next() {
    let fn = Router.callbacks[i++];
    if (!fn) return unhandled(ctx);
    fn(ctx, next);
  }

  next();
};

/**
 * Unhandled `ctx`. When it's not the initial
 * popstate then redirect. If you wish to handle
 * 404s on your own use `Router('*', callback)`.
 *
 * @param {Context} ctx Context
 * @return {Context} context
 * @api private
 */
function unhandled(ctx) {
  let current = window.location.pathname + window.location.search;
  if (current != ctx.canonicalPath) {
    window.location = ctx.canonicalPath;
  }
  return ctx;
}

/**
 * Initialize a new "request" `Context`
 * with the given `path` and optional initial `state`.
 *
 * @param {String} path Path
 * @param {Object} state State
 * @api public
 */
function Context(path, state) {
  let i = path.indexOf('?');

  this.canonicalPath = path;
  this.path = path || '/';
  this.title = document.title;
  this.state = state || {};
  this.state.path = path;
  this.querystring = ~i ? path.slice(i + 1) : '';
  this.pathname = ~i ? path.slice(0, i) : path;
  this.params = {};

  this.querystring.split('&').forEach((str) =>{
    let query = str.split('=');
    this.params[query[0]] = decodeURIComponent(query[1]);
  }, this);
}

/**
 * Initialize `Route` with the given HTTP `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @param {String} path Path
 * @param {Object} options Options
 * @api private
 */
function Route(path, options) {
  options = options || {};
  this.path = path;
  this.method = 'GET';
  this.regexp = pathtoRegexp(path, this.keys = [], options.sensitive, options.strict);
}

/**
 * Return route middleware with
 * the given callback `fn()`.
 *
 * @param {Function} fn Route function
 * @return {Function} Callback
 * @api public
 */
Route.prototype.middleware = function(fn) {
  let self = this;
  return function(ctx, next) {
    if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
    next();
  };
};

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {String} path Path
 * @param {Array} params Path params
 * @return {Boolean} True if path matches
 * @api private
 */
Route.prototype.match = function(path, params) {
  let keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

  if (!m) return false;

  for (let i = 1, len = m.length; i < len; ++i) {
    let key = keys[i - 1];

    let val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];

    if (key) {
      params[key.name] = undefined !== params[key.name] ? params[key.name] : val;
    }
  }

  return true;
};

/**
 * Track a page view in Google Analytics
 * @param  {string} path Path to track
 */
function gaTrack(path) {
  const _paq = window._paq || [];
  _paq.push(['trackPageView']);
}

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path Path template(s)
 * @param  {Array} keys keys
 * @param  {Boolean} sensitive Case sensitive
 * @param  {Boolean} strict Strict matching
 * @return {RegExp} Regular expression
 * @api private
 */
function pathtoRegexp(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return '' +
        (optional ? '' : slash) +
        '(?:' +
        (optional ? slash : '') +
        (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' +
        (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

/**
 * Handle "populate" events.
 * @param  {Event} e Event object
 */
function onpopstate(e) {
  if (e.state) {
    let path = e.state.path;
    Router.replace(path, e.state, true);
  }
}

export default Router;
