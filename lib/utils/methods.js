'use strict';

const ImplementationError = require('../error').ImplementationError;
const getFunctionArguments = require('./arguments').getFunctionArguments;
const Mode = require('./mode');

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
const getMethods = (obj, accumulator, terminator, swapper) => {
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
const compareMethods = (impl, contract) => {
  const map = new Map();

  const implMethods = impl.methods;
  const contractObj = contract.object;
  const contractMethods = contract.methods;

  return contractMethods.reduce((m, val) => {
    if (implMethods.indexOf(val) < 0) {
      m.set(val, {
        type: ImplementationError.METHOD_MISSING,
        mode: [Mode.STRICT, Mode.LOOSE],
        signature: `${val}(${getFunctionArguments(contractObj[val]).join(', ').trim()})`,
      });
    }
    return m;
  }, new Map());
};

module.exports = {
  getMethods,
  compareMethods,
};
