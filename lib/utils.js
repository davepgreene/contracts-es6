'use strict';

const methods = require('./utils/methods');
const args = require('./utils/arguments');

module.exports = {
  getMethods: methods.getMethods,
  getArguments: args.getArguments,
  compareArguments: args.compareArguments,
  compareMethods: methods.compareMethods,
};
