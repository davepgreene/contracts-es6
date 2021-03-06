'use strict';

const BASE_ERR_MESSAGE = 'The provided implementation does not fully implement this interface.';

/**
 * Error type for unimplemented methods
 */
class ImplementationError extends Error {
  /**
   * Constructor
   * @param {Array} message
   */
  constructor(messages) {
    super(BASE_ERR_MESSAGE);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.errors = messages;
  }

  static generateErrorString(implName, method, error) {
    let msg;
    switch (error.type) {
      case ImplementationError.METHOD_MISSING:
        msg = `${implName} must implement \`${method}\` with the following signature: \`${error.signature}\`.`;
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
  }
}

ImplementationError.METHOD_MISSING = 1;
ImplementationError.INCORRECT_ARGUMENT_NUMBER = 2;
ImplementationError.INCORRECT_ARGUMENT_NAMES = 3;

module.exports = {
  ImplementationError,
};
