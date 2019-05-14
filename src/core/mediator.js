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

const checkForAction = (action) => {
  if (typeof action !== 'string') {
    throw new Error(`Action name ${action} invalid!`);
  }
};

const checkForSubscribe = (action, fn) => {
  if (typeof fn !== 'function') {
    throw new Error(`Subscribe parameter for action ${
      action
      } is not a function!`);
  }
};

module.exports = class Mediator {
  /**
    * Subscribe to channel
    * @param {string} action - Action from module.
    * @param {function} fn - Function that will be execute.
    * @return {boolean} - Result of subscribe.
    */
  on(action = '', fn = () => {}) {
    try {
      checkForAction(action);
      checkForSubscribe(action, fn);
      
      const _action = action.split('.');

      const addKey = (arr, where, i) => {
        const nextIndex = i + 1;
        const nextKey = arr[nextIndex];
        const isSubscribe = where[arr[i]];

        if (nextKey) {
          !isSubscribe ?
            where[arr[i]] = {} :
            where[arr[i]] = { ...isSubscribe };
        } else {
          !isSubscribe ?
            where[arr[i]] = { _subscribe: fn } :
            where[arr[i]] = { ...isSubscribe, _subscribe: fn };
        }

        nextKey ? addKey(arr, where[arr[i]], nextIndex) : false;
      };

      addKey(_action, channels, 0);

      return true;
    } catch (error) {
      console.log(error.message);
    }
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
    async send(action = '', payload = {}) {
      try {
        const _action = action.split('.');
        const results = [];

        let lastAction = channels;

        _action.forEach((x) =>
          (lastAction && x) ? lastAction = lastAction[x] : null);        

        if (!lastAction) throw new Error(`Not found action ${action}`);

        const searchInAction = (innerAction) => {
          const innerKeys = Object.keys(innerAction);

          innerKeys.forEach((key) => {
            (key !== '_subscribe') ?
              searchInAction(innerAction[key]) :
              results.unshift(innerAction._subscribe(payload));
          });
        };

        searchInAction(lastAction);

        return (results.length < 2) ? results[0] : Promise.all(results);
      } catch (error) {
        return Promise.reject(error.message);
      }
    }

  /**
    * Get all actions from registry
    * @return {channels} channels - Return all channels from store.
    */
  getAll() {
    return channels;
  }
};
