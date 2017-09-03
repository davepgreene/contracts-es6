'use strict';

const ImplementationError = require('./error').ImplementationError;
const Utils = require('./utils');
const Mode = require('./utils/mode');

/**
 * Generates implementation errors
 *
 * @param {Object} obj - the object under test
 * @param {Object} contract - the contract to fulfill
 * @return {Map}
 */
const implementationErrors = (identity, klass) => (obj, contract, mode) => {
  const errorMap = new Map();

  // Traverse prototype chain to get all interface methods and obj methods before the
  // interface class
  const contractMethods = Utils.getMethods(contract, [], Object.getPrototypeOf(contract));
  let implMethods = Utils.getMethods(obj, [], contract, [identity.prototype, klass.prototype]);

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
};

/**
 *
 * @param {Object} klass
 * @param {Integer} mode
 * @return {Interface}
 */
const Interface = (klass, m) => {
  if (typeof m === 'undefined') {
    m = Mode.STRICT; // eslint-disable-line no-param-reassign
  }

  const Interface = class {
    /**
     * Constructor
     */
    constructor() {
      const contract = klass.prototype;
      const obj = Object.getPrototypeOf(this);
      const errors = Interface.implementationErrors(obj, contract, m);
      const errorMessages = [];

      errors.forEach((error, method) => {
        errorMessages.push(ImplementationError.generateErrorString(
          this.constructor.name,
          method,
          error,
        ).trim());
      });

      if (errorMessages.length > 0) {
        throw new ImplementationError(errorMessages);
      }
    }
  };

  Interface.implementationErrors = implementationErrors(Interface, klass);
  Interface.interface = klass;

  return Interface;
};

Interface.STRICT = Mode.STRICT;
Interface.LOOSE = Mode.LOOSE;
Interface.StrictInterface = klass => Interface(klass, Interface.STRICT);
Interface.LooseInterface = klass => Interface(klass, Interface.LOOSE);

/**
 * "Static" method to check a class against the interface it extends
 *
 * NOTE: This method does not instantiate an instance of the class and
 * is appropriate for checking implementations at boot time.
 *
 * @param {Class} obj - The implementing class
 * @param {Boolean} [strict] - Whether strict mode rules should apply
 * @returns {boolean}
 */
Interface.check = (obj, strict) => {
  const contract = obj.interface;
  const impl = Interface(contract, strict);
  const mode = (strict || strict === undefined) ? Mode.STRICT : Mode.LOOSE;
  const errors = impl.implementationErrors(obj.prototype, contract.prototype, mode);

  return (errors.size === 0);
};

module.exports = Interface;
