/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * init application
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const os = require('os');
const CONFIG = require('./config')();
const MODULES = require(`../${CONFIG.dir.modules}/index`)(CONFIG);
const PLUGINS = require(`../${CONFIG.dir.plugins}/index`)(CONFIG);

const APP = {

  /**
   *******************
   * Run application *
   *******************
   *   init history logs
   *   init modules and plugins store
   *   init catching system errors
   *   run default plugins (graphql, websockets, rest api)
   */
  run() {
    APP.Model.ACTIONS = APP.ACTIONS;
    // run application step by step
    APP.initLogs();
    APP.initModulesAndPlugins();
    APP.catchErrors();
    APP.runMainModulesAndPlugins();
  },

  /**
   * Connect modules and plugins
   * transfer actions and routes to main thread
   */
  initModulesAndPlugins() {
    MODULES.concat(PLUGINS).forEach((module) => {
      module(APP);
    });
  },

  /**
  * Run modules and plugins
  */
  runMainModulesAndPlugins() {
    /**
     * Start main API plugin:
     */
    this.ACTIONS.send('api')
      .catch((warning) => this.show.warn(warning));

    /**
     * Load all postinit configurations
     */
    this.ACTIONS.send('postinit')
      .catch((warning) => this.show.warn(warning));
  },

  /**
   * Create timer for clearing logs
   * every "clear_logs_time"
   */
  initLogs() {
    this.show.init(`${os.platform()}.${os.hostname()}`);
    setInterval(() => {
      this.show.clear();
    }, CONFIG.clear_logs_time);
  },

  /**
   * Connect start configurations to application
   * @param  {Object} props [description]
   *
   * For example: APP.use({ startMemory: '20%' });
   */
  use(props = {}) {
    for (let key in props) {
      this[key] = props[key];
    }
  },

  /**
   * Show API paths list for
   * current applications
   * @param {Object} type - function/async
   */
  showAPIPaths(type = (async() => {}).constructor) {
    const actionsList = this.ACTIONS.getAll();
    this.show.warn('--------API ROUTES--------');
    for (const path in actionsList) {
      if (actionsList[path] instanceof type) this.show.warn(path);
    }
    this.show.warn('--------------------------');
  },

  /**
   * Catch system errors and exception
   * log every event and send sms notification
   */
  catchErrors() {
    process.on('uncaughtException', (err = {}) => {
      const message = `${process.pid} dead | Memory: ${this.startMemory}%`;

      this.show.error(message, err.stack);
      this.ACTIONS.send(`${CONFIG.notification_service}.send`, { message });

      setTimeout(() => process.exit(1), 1000);
    });
  },

};

module.exports = APP;
