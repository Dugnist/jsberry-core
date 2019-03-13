/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * global channels store
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const channels = {};

module.exports = class Mediator {
  /**
    * Subscribe to channel
    * @param {string} action - Action from module.
    * @param {function} fn - Function that will be execute.
    * @return {boolean} - Result of subscribe.
    */
  on(action = '', fn = () => {}) {
    if (typeof fn !== 'function') return false;
    if (!channels.hasOwnProperty(action)) channels[action] = [];

    channels[action] = fn;
  }

  /**
    * Unsubscribe channel from store
    * @param {string} action - Action from module.
    * @return {this} actions - Return this for chaining.
    */
  off(action = '') {
    this.send(`clear.${action}`);

    delete channels[action];

    return true;
  }

  /**
    * Send action with payload to chanel parameters
    * @param {string} action - Action from module.
    * @param {object} payload - Parameters that will need to send to the module.
    * @return {callback} - Result of subscribe.
    */
    send(action = '', payload = {}) {
      return Object.keys(channels).map((_action) => {
        const checkAction = _action.split(action);
        if (
          checkAction[0] === '' && checkAction[1].indexOf('.') === 0 ||
          checkAction[0] === '' && !checkAction[1]
        ) {
          const response = channels[_action](payload);

          return (
            response &&
            (response instanceof Promise || response.then && response.catch)
          ) ? response : false;
        }
      }).filter((result) => result)[0] ||
        Promise.reject(`Not handled action '${action}'!`);
    }

  /**
    * Get all actions from registry
    * @return {channels} channels - Return all channels from store.
    */
  getAll() {
    return channels;
  }
};
