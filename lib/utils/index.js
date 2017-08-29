'use strict';

const methods = require('./methods');
const args = require('./arguments');

module.exports = {
  getMethods: methods.getMethods,
  getArguments: args.getArguments,
  compareArguments: args.compareArguments,
  compareMethods: methods.compareMethods,
};
