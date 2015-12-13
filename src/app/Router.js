import Persist from './stores/Persist';

function isStandAlone() {
  try {
    return window.navigator.standalone || (window.external && window.external.msIsSiteMode && window.external.msIsSiteMode());
  } catch (ex) {
    return false;
  }
}

/**
 * Register `path` with callback `fn()`,
 * or route `path`, or `Router.start()`.
 *
 *   Router('*', fn);
 *   Router('/user/:id', load, user);
 *   Router('/user/' + user.id, { some: 'thing' });
 *   Router('/user/' + user.id);
 *   Router();
 *
 * @param {String} path
 * @param {Function} fn...
 * @api public
 */
function Router(path, fn) {
    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      Router.callbacks.push(route.middleware(arguments[i]));
    }
}

/**
 * Callback functions.
 */

Router.callbacks = [];

Router.start = function(){
  window.addEventListener('popstate', onpopstate, false);

  if (isStandAlone()) {
    var state = Persist.getState();
    // If a previous state has been stored, load that state
    if (state && state.name && state.params) {
      Router(this.props.initialPath || '/');
      //$state.go(state.name, state.params, { location: 'replace' });
    } else {
      Router('/');
    }
  } else {
    var url = location.pathname + location.search;
    Router.replace(url, null, true, true);
  }
};

/**
 * Show `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @return {Context}
 * @api public
 */
Router.go = function(path, state) {
  gaTrack(path);
  var ctx = new Context(path, state);
  Router.dispatch(ctx);
  if (!ctx.unhandled) {
    history.pushState(ctx.state, ctx.title, ctx.canonicalPath);
  }
  return ctx;
};

/**
 * Replace `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @return {Context}
 * @api public
 */

Router.replace = function(path, state, dispatch) {
  gaTrack(path);
  var ctx = new Context(path, state);
  if (dispatch) Router.dispatch(ctx);
  history.replaceState(ctx.state, ctx.title, ctx.canonicalPath);
  return ctx;
};

/**
 * Dispatch the given `ctx`.
 *
 * @param {Object} ctx
 * @api private
 */

Router.dispatch = function(ctx){
  var i = 0;

  function next() {
    var fn = Router.callbacks[i++];
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
 * @param {Context} ctx
 * @api private
 */

function unhandled(ctx) {
  var current = window.location.pathname + window.location.search;
  if (current != ctx.canonicalPath) {
    window.location = ctx.canonicalPath;
  }
  return ctx;
}

/**
 * Initialize a new "request" `Context`
 * with the given `path` and optional initial `state`.
 *
 * @param {String} path
 * @param {Object} state
 * @api public
 */

function Context(path, state) {
  var i = path.indexOf('?');

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
    this.params[query[0]] =  decodeURIComponent(query[1]);
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
 * @param {String} path
 * @param {Object} options.
 * @api private
 */

function Route(path, options) {
  options = options || {};
  this.path = path;
  this.method = 'GET';
  this.regexp = pathtoRegexp(path
    , this.keys = []
    , options.sensitive
    , options.strict);
}

/**
 * Return route middleware with
 * the given callback `fn()`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

Route.prototype.middleware = function(fn){
  var self = this;
  return function(ctx, next){
    if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
    next();
  };
};

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {String} path
 * @param {Array} params
 * @return {Boolean}
 * @api private
 */

Route.prototype.match = function(path, params){
  var keys = this.keys
    , qsIndex = path.indexOf('?')
    , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
    , m = this.regexp.exec(decodeURIComponent(pathname));

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];

    if (key) {
      params[key.name] = undefined !== params[key.name] ? params[key.name] : val;
    }
  }

  return true;
};


/**
 * Check if the app is running in stand alone mode.
 * @return {Boolean} true if running in Standalone mode
 */
function isStandAlone() {
  try {
    return window.navigator.standalone || (window.external && window.external.msIsSiteMode && window.external.msIsSiteMode());
  } catch (ex) {
    return false;
  }
}

/**
 * Track a page view in Google Analytics
 * @param  {string} path
 */
function gaTrack(path) {
  if (window.ga) {
    window.ga('send', 'pageview', { page: path });
  }
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
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

/**
 * Handle "populate" events.
 */

function onpopstate(e) {
  if (e.state) {
    var path = e.state.path;
    Router.replace(path, e.state, true);
  }
}

export default Router;
