import test from 'ava';

import Interface from '../lib/interface';
import { TestStrictImpl, TestInheritStrictImpl, TestLooseImpl, TestInheritLooseImpl, reset } from './_consts';

class TestInheritMoreStrictImpl extends TestInheritStrictImpl { }
class TestInheritMoreLooseImpl extends TestInheritLooseImpl { }

// Call this at the end of every test
test.afterEach.always(reset);

test('Strict Mode - Returns false if all methods are not implemented', (t) => {
  const valid = Interface.check(TestStrictImpl);
  t.is(valid, false);
});

test('Loose Mode - Returns false if all methods are not implemented', (t) => {
  const valid = Interface.check(TestLooseImpl);
  t.is(valid, false);
});

test('Strict Mode - Returns false if all methods are not implemented in the prototype chain', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  const valid = Interface.check(TestInheritStrictImpl);
  t.is(valid, false);
});

test('Strict Mode - Returns true if all methods are implemented in the prototype chain', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestInheritStrictImpl.prototype.method3WithParams = (foo, bar, baz) => { };
  TestInheritMoreStrictImpl.prototype.method2 = () => { };

  const valid = Interface.check(TestInheritMoreStrictImpl);
  t.is(valid, true);
});

test('Loose Mode - Returns false if all methods are not implemented in the prototype chain', (t) => {
  TestLooseImpl.prototype.method1 = () => { };
  const valid = Interface.check(TestInheritLooseImpl);
  t.is(valid, false);
});

test('Strict Mode - Returns true if all methods are implemented correctly', (t) => {
  TestStrictImpl.prototype.method1 = () => { };
  TestStrictImpl.prototype.method2 = () => { };
  TestStrictImpl.prototype.method3WithParams = (foo, bar, baz) => { };

  const valid = Interface.check(TestStrictImpl);
  t.is(valid, true);
});

test('Loose Mode - Returns true if all methods are implemented', (t) => {
  TestLooseImpl.prototype.method1 = () => { };
  TestLooseImpl.prototype.method2 = () => { };
  TestLooseImpl.prototype.method3WithParams = (foo) => { };

  const valid = Interface.check(TestLooseImpl);
  t.is(valid, true);
});
