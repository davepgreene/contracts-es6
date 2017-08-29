'use strict';

const ImplementationError = require('../error').ImplementationError;
const Mode = require('../utils/mode');

/**
 * Parses a function signature for its arguments
 *
 * @param {Function} func
 * @return {Array.<String>}
 */
const getFunctionArguments = function getFunctionArguments(func) {
  const args = func.toString().match(/\(([^)]*)\)/)[1];

  return args.split(',')
    // Skip inline comments and trim the whitespace.
    .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
    // Ensure no undefined values are added.
    .filter(arg => arg);
};

/**
 * Generate a map of method to arguments
 *
 * @param {Array.<String>} methods
 * @param {Object} obj
 * @returns {Map}
 */
const getArguments = function getArguments(methods, obj) {
  const map = new Map();

  methods.forEach(el => map.set(el, getFunctionArguments(obj[el])));

  return map;
};

/**
 * Compare argument number and names
 *
 * @param {Map} impl
 * @param {Map} contract
 * @return {Map} a map of method name to any error object
 */
const compareArguments = function compareArguments(impl, contract) {
  const map = new Map();

  impl.forEach((args, method) => {
    const contractArgs = contract.get(method);
    const signature = `${method}(${contractArgs.join(', ').trim()})`;
    const err = {
      type: '',
      mode: [Mode.STRICT],
      signature,
    };

    if (args.length !== contractArgs.length) {
      err.type = ImplementationError.INCORRECT_ARGUMENT_NUMBER;
      map.set(method, err);
      return;
    }

    // If the impl and contract both have no arguments, we don't have an argument error
    if (args.length === 0) {
      return;
    }

    contractArgs.forEach((contractArg) => {
      if (args.indexOf(contractArg) < 0) {
        err.type = ImplementationError.INCORRECT_ARGUMENT_NAMES;
        map.set(method, err);
      }
    });
  });

  return map;
};


module.exports = {
  getArguments,
  compareArguments,
  getFunctionArguments,
};
