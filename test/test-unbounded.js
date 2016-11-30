const test = require('ava');

const ImplementationError = require('../lib/error').ImplementationError;
const setup = require('./_consts');
const Interface = require('../lib/interface');

const TestUnboundedImpl = setup.TestUnboundedImpl;
const TestInheritUnboundedImpl = setup.TestInheritUnboundedImpl;
const TestInterface = setup.TestInterface;
const ERROR_BASE = setup.ERROR_BASE;

// Call this at the end of every test
test.afterEach.always(require('./_consts').reset);

test('Unbounded Mode - Throws if all methods are not implemented', (t) => {
  const error = t.throws(() => new TestUnboundedImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestUnboundedImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(error.message, errString);
});

test('Unbounded Mode - Doesn\'t throw if more methods are implemented than in interface', (t) => {
  TestUnboundedImpl.prototype.method1 = function () { };
  TestUnboundedImpl.prototype.method2 = function () { };
  TestUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz) { };
  TestUnboundedImpl.prototype.method4 = function () { };

  const impl = new TestUnboundedImpl();

  t.is(impl.constructor.name, 'TestUnboundedImpl');
});

test('Unbounded Mode - Throws if all methods are implemented but with incorrect number of args', (t) => {
  TestUnboundedImpl.prototype.method1 = function () { };
  TestUnboundedImpl.prototype.method2 = function () { };
  TestUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz, quiz) { };

  const error = t.throws(() => new TestUnboundedImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestUnboundedImpl implements \`method3WithParams\` with an incorrect ` +
    `number of arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});

test('Unbounded Mode - Throws if all methods are implemented but with incorrectly named args', (t) => {
  TestUnboundedImpl.prototype.method1 = function () { };
  TestUnboundedImpl.prototype.method2 = function () { };
  TestUnboundedImpl.prototype.method3WithParams = function (foo, bar, quiz) { };

  const error = t.throws(() => new TestUnboundedImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestUnboundedImpl implements \`method3WithParams\` with incorrectly ` +
    `named arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});

test('Unbounded Mode - Doesn\'t throw if all methods are implemented with the correct args', (t) => {
  TestUnboundedImpl.prototype.method1 = function () { };
  TestUnboundedImpl.prototype.method2 = function () { };
  TestUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz) { };

  const impl = new TestUnboundedImpl();

  t.is(impl.constructor.name, 'TestUnboundedImpl');
});

test('Unbounded Mode - Descendent classes can implement missing methods', (t) => {
  TestInheritUnboundedImpl.prototype.method1 = function () { };
  TestInheritUnboundedImpl.prototype.method2 = function () { };
  TestInheritUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz) { };

  const parentError = t.throws(() => new TestUnboundedImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestUnboundedImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(parentError.message, errString);

  const impl = new TestInheritUnboundedImpl();

  t.is(impl.constructor.name, 'TestInheritUnboundedImpl');
});

test('Unbounded Mode - Descendent classes can implement additional methods', (t) => {
  TestInheritUnboundedImpl.prototype.method1 = function () { };
  TestInheritUnboundedImpl.prototype.method2 = function () { };
  TestInheritUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz) { };
  TestInheritUnboundedImpl.prototype.method4 = function () { };

  const parentError = t.throws(() => new TestUnboundedImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestUnboundedImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(parentError.message, errString);

  const impl = new TestInheritUnboundedImpl();

  t.is(impl.constructor.name, 'TestInheritUnboundedImpl');
});

test('Unbounded Mode - Descendent classes can break a functional interface', (t) => {
  TestUnboundedImpl.prototype.method1 = function () { };
  TestUnboundedImpl.prototype.method2 = function () { };
  TestUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz) { };
  TestInheritUnboundedImpl.prototype.method3WithParams = function (foo, bar, baz, quiz) { };

  const impl = new TestUnboundedImpl();
  t.is(impl.constructor.name, 'TestUnboundedImpl');

  const error = t.throws(() => new TestInheritUnboundedImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestInheritUnboundedImpl implements \`method3WithParams\` with an incorrect ` +
    `number of arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});
