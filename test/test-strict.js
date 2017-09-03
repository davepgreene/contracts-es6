import test from 'ava';

import { ImplementationError } from '../lib/error';
import { TestStrictImpl, TestInheritStrictImpl, TestInterface, ERROR_BASE, reset } from './_consts';
import Interface from '../lib/interface';

// Call this at the end of every test
test.afterEach.always(reset);

test('Strict Mode - Not specifying interface type defaults to strict mode', (t) => {
  class DefaultToStrictModeImpl extends Interface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams() { }
  }

  const error = t.throws(() => new DefaultToStrictModeImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} DefaultToStrictModeImpl implements \`method3WithParams\` with an incorrect ` +
    `number of arguments. The correct signature is \`${signature}\`.`;
  t.is(error.message, errString);
});

test('Strict Mode - Throws if all methods are not implemented', (t) => {
  const error = t.throws(() => new TestStrictImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestStrictImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(error.message, errString);
});

test('Strict Mode - Throws if all methods are implemented but with incorrect number of args', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestStrictImpl.prototype.method2 = () => { };
  TestStrictImpl.prototype.method3WithParams = (foo, bar, baz, quiz) => { };

  const error = t.throws(() => new TestStrictImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestStrictImpl implements \`method3WithParams\` with an incorrect ` +
    `number of arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});

test('Strict Mode - Throws if all methods are implemented but with incorrectly named args', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestStrictImpl.prototype.method2 = () => { };
  TestStrictImpl.prototype.method3WithParams = (foo, bar, quiz) => { };

  const error = t.throws(() => new TestStrictImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestStrictImpl implements \`method3WithParams\` with incorrectly ` +
    `named arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});

test('Strict Mode - Doesn\'t throw if all methods are implemented with the correct args', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestStrictImpl.prototype.method2 = () => { };
  TestStrictImpl.prototype.method3WithParams = (foo, bar, baz) => { };

  const impl = new TestStrictImpl();

  t.is(impl.constructor.name, 'TestStrictImpl');
});

test('Strict Mode - Descendent classes can implement missing methods', (t) => {
  TestInheritStrictImpl.prototype.method1 = () => { };
  TestInheritStrictImpl.prototype.method2 = () => { };
  TestInheritStrictImpl.prototype.method3WithParams = (foo, bar, baz) => { };

  const parentError = t.throws(() => new TestStrictImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestStrictImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(parentError.message, errString);

  const impl = new TestInheritStrictImpl();

  t.is(impl.constructor.name, 'TestInheritStrictImpl');
});

test('Strict Mode - Descendent classes can break a functional interface', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestStrictImpl.prototype.method2 = () => { };
  TestStrictImpl.prototype.method3WithParams = (foo, bar, baz) => { };
  TestInheritStrictImpl.prototype.method3WithParams = (foo, bar, baz, quiz) => { };

  const impl = new TestStrictImpl();
  t.is(impl.constructor.name, 'TestStrictImpl');

  const error = t.throws(() => new TestInheritStrictImpl(), ImplementationError);
  const signature = 'method3WithParams(foo, bar, baz)';
  const errString = `${ERROR_BASE} TestInheritStrictImpl implements \`method3WithParams\` with an incorrect ` +
    `number of arguments. The correct signature is \`${signature}\`.`;

  t.is(error.message, errString);
});
