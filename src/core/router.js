/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * default router options
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */
const UTILS = require('./utils');

const TYPES = ['routes', 'events', 'schema', 'middlewares'];
const LAYERS = {
  0: {
    // REST routers store
    routes: {},
    // WebSockets events
    events: {},
    // GraphQL schema
    schema: {},
    // Middlewares
    middlewares: {},
    // ROUTER.middlewares.mw_name = (app) => {}
  },
};

const Router = {
  /**
   * Get list of routes/events/schema/middleware
   * @param  {String} type - type of queried data
   * @return  {Object} - type of queried data
   * @param  {Object} order - position in store (optional)
   */
  get: (type = 'routes', order) => {
    UTILS.checkForType(type, 'String');

    if (!order && order !== 0) {
      return Object.keys(LAYERS)
        .map((key) =>
          (parseInt(key) == key) ? (LAYERS[key] || {})[type] : null)
        .filter((value) => value)
        .reduce((prev, current) =>
          Object.assign(prev || {}, current || {}));
    } else {
      return (LAYERS[order] || {})[type];
    }
  },

  /**
   * Set routes/events/schema/middleware to Router store
   * @param  {String} type - type of queried data
   * @param  {Object} value - data for addition
   * @param  {Object} order - position in store (optional)
   * @return  {this} - for chaining
   */
  set: (type = 'routes', value = {}, order = 0) => {
    UTILS.checkForType(type, 'String');
    Router.checkRouteType(type);

    if (!order) order = 0;
    // if empty new layer - create it with empty types
    if (!LAYERS[order]) {
      LAYERS[order] = TYPES
        .map((type) => ({ [type]: {} }))
        .reduce((prev, current) =>
          Object.assign(prev, current));
    }
    // set data to layer
    LAYERS[order][type] = Object.assign(Router.get(type, order), value);

    return Router;
  },

  /**
   * Set routes/events/schema/middleware to Router store
   * @param  {String} type - type of queried data
   * @return  {this} - for chaining
   */
  checkRouteType: (type = 'routes') => {
    if (!TYPES.find((route) => route === type)) {
      throw Error(`Router type ${type} set incorrect!`);
    }

    return Router;
  },

};

module.exports = Router;
