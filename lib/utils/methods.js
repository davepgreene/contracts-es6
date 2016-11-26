const { ImplementationError } = require('../error');
const { getFunctionArguments } = require('./arguments');

/* eslint-disable no-param-reassign */
/**
 * Walk the prototype inheritance chain until we reach the terminator and get all public methods
 * minus the constructor
 *
 * @param {Object} obj - class under test
 * @param {Array} accumulator
 * @param {Object} terminator - the prototype of the class to terminate the traversal
 * @param {Array.<Object>} [swapper] - swap swapper[1] class for swapper[0] class if it occurs in
 * the inheritance chain
 * @return {Array.<string>}
 * @private
 */
const getMethods = function getMethods(obj, accumulator, terminator, swapper) {
  if (swapper) {
    if (obj === swapper[0]) {
      obj = swapper[1];
    }
  }

  if (obj === terminator) {
    return accumulator;
  }

  accumulator = accumulator
    .concat(Object.getOwnPropertyNames(obj))
    // Filter private methods
    .filter(el => !el.startsWith('_'))
    // Filter constructors
    .filter(el => el !== 'constructor');

  // Filter duplicates
  accumulator = Array.from(new Set(accumulator));

  return getMethods(Object.getPrototypeOf(obj), accumulator, terminator, swapper);
};
/* eslint-enable no-param-reassign */

/**
 * Compares implementation methods to contract methods
 *
 * @param {Object} impl
 * @param {Object} contract
 * @return {Map} a map of method name to any error object
 */
const compareMethods = function compareMethods(impl, contract) {
  const map = new Map();

  const { methods: implMethods } = impl;
  const { object: contractObj, methods: contractMethods } = contract;

  contractMethods.forEach((el) => {
    if (implMethods.indexOf(el) < 0) {
      map.set(el, {
        type: ImplementationError.METHOD_MISSING,
        strict: false,
        signature: `${el}(${getFunctionArguments(contractObj[el]).join(', ').trim()})`,
      });
    }
  });

  return map;
};

module.exports = {
  getMethods,
  compareMethods,
};