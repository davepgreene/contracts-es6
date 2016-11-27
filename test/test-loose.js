const test = require('ava');

const ImplementationError = require('../lib/error').ImplementationError;
const setup = require('./_consts');

const TestLooseImpl = setup.TestLooseImpl;
const TestInheritLooseImpl = setup.TestInheritLooseImpl;
const ERROR_BASE = setup.ERROR_BASE;


// Call this at the end of every test
test.afterEach.always(require('./_consts').reset);

test('Loose Mode - Throws if all methods are not implemented', (t) => {
  const error = t.throws(() => new TestLooseImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestLooseImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(error.message, errString);
});

test('Loose Mode - Throws if more methods are implemented than in interface', (t) => {
  TestLooseImpl.prototype.method1 = function () { };
  TestLooseImpl.prototype.method2 = function () { };
  TestLooseImpl.prototype.method3WithParams = function (foo, bar, baz) { };
  TestLooseImpl.prototype.method4 = function () { };

  const error = t.throws(() => new TestLooseImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestLooseImpl implements more public methods than its interface.`;
  t.is(error.message, errString);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented', (t) => {
  TestLooseImpl.prototype.method1 = function () { };
  TestLooseImpl.prototype.method2 = function () { };
  TestLooseImpl.prototype.method3WithParams = function (foo, bar, baz) { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented but with incorrect number of args', (t) => {
  TestLooseImpl.prototype.method1 = function () { };
  TestLooseImpl.prototype.method2 = function () { };
  TestLooseImpl.prototype.method3WithParams = function (foo, bar, baz, quiz) { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented but with incorrectly named args', (t) => {
  TestLooseImpl.prototype.method1 = function () { };
  TestLooseImpl.prototype.method2 = function () { };
  TestLooseImpl.prototype.method3WithParams = function (foo, bar, blarg) { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Descendent classes can implement missing methods', (t) => {
  TestInheritLooseImpl.prototype.method1 = function () { };
  TestInheritLooseImpl.prototype.method2 = function () { };
  TestInheritLooseImpl.prototype.method3WithParams = function (foo, bar, baz) { };

  const parentError = t.throws(() => new TestLooseImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestLooseImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(parentError.message, errString);

  const impl = new TestInheritLooseImpl();
  t.deepEqual(impl.constructor.name, TestInheritLooseImpl.prototype.constructor.name);
});
