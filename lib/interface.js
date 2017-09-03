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
const InterfaceFactory = (klass, mode) => {
  if (typeof mode === 'undefined') {
    mode = Mode.STRICT; // eslint-disable-line no-param-reassign
  }

  const Interface = class {
    /**
     * Constructor
     */
    constructor() {
      const contract = klass.prototype;
      const obj = Object.getPrototypeOf(this);
      const errors = Interface.implementationErrors(obj, contract, mode);
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
  Interface.mode = mode;

  return Interface;
};

InterfaceFactory.STRICT = Mode.STRICT;
InterfaceFactory.LOOSE = Mode.LOOSE;
InterfaceFactory.StrictInterface = klass => InterfaceFactory(klass, InterfaceFactory.STRICT);
InterfaceFactory.LooseInterface = klass => InterfaceFactory(klass, InterfaceFactory.LOOSE);

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
InterfaceFactory.check = (obj) => {
  const contract = obj.interface;
  const mode = Object.getPrototypeOf(obj).mode;
  const impl = InterfaceFactory(contract, mode);
  const errors = impl.implementationErrors(obj.prototype, contract.prototype, mode);

  return (errors.size === 0);
};

module.exports = InterfaceFactory;
