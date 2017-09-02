'use strict';

const ImplementationError = require('../error').ImplementationError;
const Mode = require('../utils/mode');

/**
 * Parses a function signature for its arguments
 *
 * @param {Function} func
 * @return {Array.<String>}
 */
const getFunctionArguments = (func) => {
  const args = func.toString().match(/\(([^)]*)\)/)[1];

  return args.split(',')
    // Skip inline comments and trim the whitespace.
    .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
    // Ensure no undefined values are added.
    .filter(arg => !!arg);
};

/**
 * Generate a map of method to arguments
 *
 * @param {Array.<String>} methods
 * @param {Object} obj
 * @returns {Map}
 */
const getArguments = (methods, obj) => {
  return methods.reduce((map, el) => map.set(el, getFunctionArguments(obj[el])), new Map());
};

/**
 * Compare argument number and names
 *
 * @param {Map} impl
 * @param {Map} contract
 * @return {Map} a map of method name to any error object
 */
const compareArguments = (impl, contract) => {
  return Array.from(impl).reduce((map, val) => {
    const method = val[0];
    const args = val[1];
    const contractArgs = contract.get(method);
    const signature = `${method}(${contractArgs.join(', ').trim()})`;
    const err = {
      type: '',
      mode: [Mode.STRICT],
      signature,
    };

    if (args.length !== contractArgs.length) {
      err.type = ImplementationError.INCORRECT_ARGUMENT_NUMBER;
      return map.set(method, err);
    }

    // If the impl and contract both have no arguments, we don't have an argument error
    if (args.length === 0) {
      return map;
    }

    contractArgs.forEach((contractArg) => {
      if (args.indexOf(contractArg) < 0) {
        err.type = ImplementationError.INCORRECT_ARGUMENT_NAMES;
        map.set(method, err);
      }
    });
    return map;
  }, new Map());
};

module.exports = {
  getArguments,
  compareArguments,
  getFunctionArguments,
};
