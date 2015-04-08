
//
// Not is use right now!
// This will become handy when there is no need to wrap promise-chain
// methods in mocha tests anymore, but directly use generators as test
//
// e.g. mocha --harmony --require test/co-mocha ./test/config.js ./test/web_api/index.js


var co       = require('co');
var mocha    = require('mocha');
var Runnable = mocha.Runnable;
var run      = Runnable.prototype.run;

/**
 * Override the Mocha function runner and enable generator support with co.
 *
 * @param {Function} fn
 */
Runnable.prototype.run = function (fn) {
  if (this.fn.constructor.name === 'GeneratorFunction') {
    this.fn   = co(this.fn);
    this.sync = !(this.async = true);
  }

  return run.call(this, fn);
};