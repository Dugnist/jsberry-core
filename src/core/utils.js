/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * helper tools
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const util = require('util');

/**
 * Method for convertation object keys
 * from underscore to dots
 * @param  {object} reference - object for convertation
 * @return {object} - converted object
 */

const _convertKeysToDots = (reference = {}) =>
  Object.keys(reference).reduce((res, curr) => ({
     ...res,
    [curr]: curr.replace('_', '.'),
  }), {});

/**
 * Check any source object for valid type
 * @param  {Object} source Any object
 * @param  {String} type   Expected source type
 * @return {Boolean}        If ok - return true
 */
const _checkForType = (source = {}, type = 'Object') => {
  const check = Object.prototype.toString.call(source);
  const parsed = JSON.stringify(source);

  if (!(check === `[object ${type}]`)) {
    throw Error(`${parsed} must use an ${type}!`);
  }

  return true;
};

/**
 * Method for attach essense operations
 * from graphql markup to router schema
 * @param  {object} schema - routing schema
 * @param  {object} operations - model operations
 * @return {object} - converted object
 *
 * ToDo: rewrite to universalize
 */
const _attachToSchema = (schema = {}, operations = {}) => {
  for (let name in schema) {
    const schemaPart = schema[name];
    schema[name].operation = operations[schemaPart.model];
  }
  return schema;
};

/**
 * Method for convert array to objecy
 * with sort values by key
 * @param  {object} key - sort key
 * @param  {object} unsortedArray - input array to sort
 * @return {object} - converted object
 */
const _groupByKey = (key = '', unsortedArray = []) =>
  unsortedArray.map((value) => (value[key] = value[key] || '', value))
    .reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), {});

module.exports = {
  promisify: util.promisify,
  convertKeysToDots: _convertKeysToDots,
  checkForType: _checkForType,
  attachToSchema: _attachToSchema,
  groupByKey: _groupByKey,
};
