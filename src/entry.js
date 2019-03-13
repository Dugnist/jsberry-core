/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const CONFIG = require('./core/config')();
const Logger = require('./core/logger');
const ROUTER = require('./core/router');
const APP = require('./core/bootstrap');
const utils = require('./core/utils.js');
const Mediator = require('./core/mediator');
const processBalancer = require('./core/balancer');

/**
 *************************
 * Configure application *
 *************************
 */
APP.use({
  utils,
  ROUTER,
  CONFIG,
  show: Logger,
  ACTIONS: new Mediator(),
});

/**
 * Turn entity's to global debug console
 * debugger vision: npm run inspect
 * chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${uuid}
 * where "uuid" - debug session id from console
 */
global.CONFIG = CONFIG;
global.APP = APP;

/**
 ****************************************
 *  Make sure we are running node 8.6+  *
 ****************************************
 */

const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 8 || (major === 8 && minor <= 5)) {
  console.log('Please go to nodejs.org and download last stable version!');
  process.exit();
}

/**
 ****************************************
 * Start application at several process *
 * ToDo: load balancer                  *
 ****************************************
 */

const start = (APP = {}) => {
  return (memory = 0) => {
    APP.use({ startMemory: memory });
    APP.run();
    APP.show.log(`Run app | Employed memory: ${memory}%`);
  };
};

(CONFIG.mode === 'development') ? start(APP)() : processBalancer(start(APP));
