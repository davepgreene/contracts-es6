import test from 'ava';

import { ImplementationError } from '../lib/error.js';
import { TestInterface, ERROR_BASE, reset } from './_consts.mjs';
import Interface from '../lib/interface.js';

// Call this at the end of every test
test.afterEach.always(reset);

test('Strict Mode - Not specifying interface type defaults to strict mode', (t) => {
  class DefaultToStrictModeImpl extends Interface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams() { }
  }

  const error = t.throws(() => new DefaultToStrictModeImpl(), {instanceOf: ImplementationError});
  const errors = [
    'DefaultToStrictModeImpl implements `method3WithParams` with an incorrect number of arguments. The correct signature is `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});

test('Strict Mode - Throws if all methods are not implemented', (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) { }
  const error = t.throws(() => new testStrictImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testStrictImpl must implement `method1` with the following signature: `method1()`.',
    'testStrictImpl must implement `method2` with the following signature: `method2()`.',
    'testStrictImpl must implement `method3WithParams` with the following signature: `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});

test('Strict Mode - Throws if all methods are implemented but with incorrect number of args', (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz, quiz) { }
  }

  const error = t.throws(() => new testStrictImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testStrictImpl implements `method3WithParams` with an incorrect number of arguments. The correct signature is `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});

test('Strict Mode - Throws if all methods are implemented but with incorrectly named args', (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, quiz) { }
  }

  const error = t.throws(() => new testStrictImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testStrictImpl implements `method3WithParams` with incorrectly named arguments. The correct signature is `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});

test(`Strict Mode - Doesn't throw if all methods are implemented with the correct args`, (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz) { }
  }

  const impl = new testStrictImpl();

  t.is(impl.constructor.name, 'testStrictImpl');
});

test('Strict Mode - Descendent classes can implement missing methods', (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) {}
  class testInheritStrictImpl extends testStrictImpl {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz) { }
  }

  const parentError = t.throws(() => new testStrictImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testStrictImpl must implement `method1` with the following signature: `method1()`.',
    'testStrictImpl must implement `method2` with the following signature: `method2()`.',
    'testStrictImpl must implement `method3WithParams` with the following signature: `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(parentError.message, ERROR_BASE);
  t.deepEqual(parentError.errors, errors);

  const impl = new testInheritStrictImpl();

  t.is(impl.constructor.name, 'testInheritStrictImpl');
});

test('Strict Mode - Descendent classes can break a functional interface', (t) => {
  class testStrictImpl extends Interface.StrictInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz) { }
  }
  class testInheritStrictImpl extends testStrictImpl {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz, quiz) { }
  }

  const impl = new testStrictImpl();
  t.is(impl.constructor.name, 'testStrictImpl');

  const error = t.throws(() => new testInheritStrictImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testInheritStrictImpl implements `method3WithParams` with an incorrect number of arguments. The correct signature is `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});
