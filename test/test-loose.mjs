import test from 'ava';

import { ImplementationError } from '../lib/error.js';
import { TestInterface, ERROR_BASE, reset } from './_consts.mjs';
import Interface from '../lib/interface.js';

// Call this at the end of every test
test.afterEach.always(reset);

test('Loose Mode - Throws if all methods are not implemented', (t) => {
  class testLooseImpl extends Interface.LooseInterface(TestInterface) { }

  const error = t.throws(() => new testLooseImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testLooseImpl must implement `method1` with the following signature: `method1()`.',
    'testLooseImpl must implement `method2` with the following signature: `method2()`.',
    'testLooseImpl must implement `method3WithParams` with the following signature: `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(error.message, ERROR_BASE);
  t.deepEqual(error.errors, errors);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented', (t) => {
  class testLooseImpl extends Interface.LooseInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz) { }
  }

  const impl = new testLooseImpl();
  t.deepEqual(impl.constructor.name, testLooseImpl.prototype.constructor.name);
});

test(`Loose Mode - Doesn't throw if all methods are implemented but with incorrect number of args`, (t) => {
  class testLooseImpl extends Interface.LooseInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz, quiz) { }
  }

  const impl = new testLooseImpl();
  t.deepEqual(impl.constructor.name, testLooseImpl.prototype.constructor.name);
});

test(`Loose Mode - Doesn't throw if all methods are implemented but with incorrectly named args`, (t) => {
  class testLooseImpl extends Interface.LooseInterface(TestInterface) {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, blarg) { }
  }

  const impl = new testLooseImpl();
  t.deepEqual(impl.constructor.name, testLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Descendent classes can implement missing methods', (t) => {
  class testLooseImpl extends Interface.LooseInterface(TestInterface) { }
  class testInheritLooseImpl extends testLooseImpl {
    method1() { }
    method2() { }
    method3WithParams(foo, bar, baz) { }
  }

  const parentError = t.throws(() => new testLooseImpl(), {instanceOf: ImplementationError});
  const errors = [
    'testLooseImpl must implement `method1` with the following signature: `method1()`.',
    'testLooseImpl must implement `method2` with the following signature: `method2()`.',
    'testLooseImpl must implement `method3WithParams` with the following signature: `method3WithParams(foo, bar, baz)`.',
  ];

  t.is(parentError.message, ERROR_BASE);
  t.deepEqual(parentError.errors, errors);

  const impl = new testInheritLooseImpl();
  t.deepEqual(impl.constructor.name, testInheritLooseImpl.prototype.constructor.name);
});
