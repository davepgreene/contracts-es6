'use strict';

const ImplementationError = require('./error').ImplementationError;
const Utils = require('./utils');
const Mode = require('./utils/mode');

/**
 *
 * @param {Object} klass
 * @param {Integer} mode
 * @return {Interface}
 */
const Interface = function Interface(klass, mode) {
  if (typeof mode === 'undefined') {
    mode = Mode.STRICT; // eslint-disable-line no-param-reassign
  }

  return class Self {
    /**
     * Constructor
     */
    constructor() {
      const contract = klass.prototype;
      const obj = Object.getPrototypeOf(this);
      const implementationErrors = Self.implementationErrors(obj, contract);

      implementationErrors.forEach((error, method) => {
        const errStr = ImplementationError.generateErrorString(
          this.constructor.name,
          method,
          error);

        if (error.mode.indexOf(mode) !== -1) {
          throw new ImplementationError(`${errStr}`.trim());
        }
      });
    }

    /**
     * Generates implementation errors
     *
     * @param {Object} obj - the object under test
     * @param {Object} contract - the contract to fulfill
     * @return {Map}
     */
    static implementationErrors(obj, contract) {
      const errorMap = new Map();

      // Traverse prototype chain to get all interface methods and obj methods before the
      // interface class
      const contractMethods = Utils.getMethods(contract, [], Object.getPrototypeOf(contract));
      let implMethods = Utils.getMethods(obj, [], contract, [Self.prototype, klass.prototype]);

      Utils.compareMethods(
        { object: obj, methods: implMethods },
        { object: contract, methods: contractMethods },
      ).forEach((error, method) => {
        errorMap.set(method, error);
      });

      // We can return early if there are errors based on method naming or we're in loose mode
      if (errorMap.size > 0 || mode === Mode.LOOSE) {
        return errorMap;
      }

      // If we've passed method number and name checks we should filter out
      // methods that aren't being checked
      implMethods = contractMethods;

      // Generate a map with the name of the method and the method's arguments
      const contractArgs = Utils.getArguments(contractMethods, contract);
      const implArgs = Utils.getArguments(implMethods, obj);

      Utils.compareArguments(implArgs, contractArgs).forEach((error, method) => {
        errorMap.set(method, error);
      });

      return errorMap;
    }
  };
};

Interface.STRICT = Mode.STRICT;
Interface.LOOSE = Mode.LOOSE;
Interface.StrictInterface = klass => Interface(klass, Interface.STRICT);
Interface.LooseInterface = klass => Interface(klass, Interface.LOOSE);

module.exports = Interface;
