'use strict';

const BASE_ERR_MESSAGE = 'The prototype chain does not fully implement this interface.';

/**
 * Error type for unimplemented methods
 */
class ImplementationError extends Error {
  /**
   * Constructor
   * @param {string} message
   */
  constructor(message) {
    const m = `${BASE_ERR_MESSAGE} ${message}`;

    super(m);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = m;
  }
}

ImplementationError.METHOD_MISSING = 1;
ImplementationError.MORE_METHODS = 2;
ImplementationError.INCORRECT_ARGUMENT_NUMBER = 3;
ImplementationError.INCORRECT_ARGUMENT_NAMES = 4;

ImplementationError.generateErrorString = function generateErrorString(implName, method, error) {
  let msg;
  switch (error.type) {
    case ImplementationError.METHOD_MISSING:
      msg = `${implName} must implement \`${method}\` with the following signature: \`${error.signature}\`.`;
      break;
    case ImplementationError.MORE_METHODS:
      msg = `${implName} implements more public methods than its interface.`;
      break;
    case ImplementationError.INCORRECT_ARGUMENT_NUMBER:
      msg = `${implName} implements \`${method}\` with an incorrect number of arguments. ` +
        `The correct signature is \`${error.signature}\`.`;
      break;
    case ImplementationError.INCORRECT_ARGUMENT_NAMES:
      msg = `${implName} implements \`${method}\` with incorrectly named arguments. ` +
        `The correct signature is \`${error.signature}\`.`;
      break;
    default:
      // Some sort of other error here
      throw new TypeError('Unknown error.');
  }
  return msg;
};

module.exports = {
  ImplementationError,
};
