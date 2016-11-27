const test = require('ava');

const ImplementationError = require('../lib/error').ImplementationError;
const methods = require('../lib/utils/methods');

const getMethods = methods.getMethods;
const compareMethods = methods.compareMethods;

class TestInterface {
  method1() { }
  method2() { }
  method3() { }
}

class TestImpl {
  constructor() { }
  method1() { }
  method2() { }
  method3() { }
  _privateMethod1() { }
}

class TestExtendingImpl extends TestImpl {
  method3() { }
  method4() { }
  method5() { }
}

class SwappingClass {
  method6() { }
}

test('getMethods - Gets methods for a class', (t) => {
  const implMethods = getMethods(TestImpl.prototype, [], Object.prototype);
  t.deepEqual(implMethods, ['method1', 'method2', 'method3']);
});

test('getMethods - Gets methods for a class extending a class', (t) => {
  const implMethods = getMethods(TestExtendingImpl.prototype, [], Object.prototype);
  t.deepEqual(implMethods.sort(), ['method1', 'method2', 'method3', 'method4', 'method5']);
});

test('getMethods - Doesn\'t include `constructor` in list of methods', (t) => {
  const implMethods = getMethods(TestImpl.prototype, [], Object.prototype);
  t.is(implMethods.indexOf('constructor'), -1);
});

test('getMethods - Doesn\'t include "private" methods in list of methods', (t) => {
  const implMethods = getMethods(TestImpl.prototype, [], Object.prototype);
  t.is(implMethods.indexOf('_privateMethod1'), -1);
});

test('getMethods - Doesn\'t include methods from anything higher in the prototype chain than the terminator', (t) => {
  const implMethods = getMethods(
    TestExtendingImpl.prototype,
    [],
    Object.getPrototypeOf(TestExtendingImpl.prototype));
  t.deepEqual(implMethods, ['method3', 'method4', 'method5']);
});

test('getMethods - Filters out duplicate methods', (t) => {
  const implMethods = getMethods(TestExtendingImpl.prototype, [], Object.prototype);
  const dupes = implMethods.filter(i => i === 'method3');
  t.is(dupes.length, 1);
});

test('getMethods - Swaps one prototype for another in the prototype chain if swapper is specified', (t) => {
  const implMethods = getMethods(
    TestExtendingImpl.prototype,
    [],
    Object.prototype,
    [TestImpl.prototype, SwappingClass.prototype]);
  t.deepEqual(implMethods, ['method3', 'method4', 'method5', 'method6']);
});

test('compareMethods - Generates no errors if all methods match', (t) => {
  // Utils.compareMethods(
  // { object: obj, methods: implMethods },
  // { object: contract, methods: contractMethods })
  const compare = compareMethods(
    { object: TestImpl.prototype, methods: ['method1', 'method2', 'method3'] },
    { object: TestInterface.prototype, methods: ['method1', 'method2', 'method3'] });
  t.is(compare.size, 0);
});

test('compareMethods - Generates errors for each missing method', (t) => {
  const compare = compareMethods(
    { object: TestExtendingImpl.prototype, methods: ['method3', 'method4', 'method5'] },
    { object: TestInterface.prototype, methods: ['method1', 'method2', 'method3'] });

  t.true(compare.has('method1'));
  t.true(compare.has('method2'));
});

test('compareMethods - Generates an error with the correct signature for the missing method', (t) => {
  const compare = compareMethods(
    { object: TestExtendingImpl.prototype, methods: ['method3', 'method4', 'method5'] },
    { object: TestInterface.prototype, methods: ['method1', 'method2', 'method3'] });

  const err = compare.get('method1');
  t.is(err.signature, 'method1()');
});

test('compareMethods - Assigns the correct error type for methods that are missing', (t) => {
  const compare = compareMethods(
    { object: TestExtendingImpl.prototype, methods: ['method3', 'method4', 'method5'] },
    { object: TestInterface.prototype, methods: ['method1', 'method2', 'method3'] });

  const err = compare.get('method1');
  t.is(err.type, ImplementationError.METHOD_MISSING);
});

test('compareMethods - Assigns the correct strictness level for methods that are missing', (t) => {
  const compare = compareMethods(
    { object: TestExtendingImpl.prototype, methods: ['method3', 'method4', 'method5'] },
    { object: TestInterface.prototype, methods: ['method1', 'method2', 'method3'] });

  const err = compare.get('method1');
  t.false(err.strict);
});
