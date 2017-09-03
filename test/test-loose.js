import test from 'ava';

import { ImplementationError } from '../lib/error';
import { TestLooseImpl, TestInheritLooseImpl, ERROR_BASE, reset } from './_consts';

// Call this at the end of every test
test.afterEach.always(reset);

test('Loose Mode - Throws if all methods are not implemented', (t) => {
  const error = t.throws(() => new TestLooseImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestLooseImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(error.message, errString);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented', (t) => {
  TestLooseImpl.prototype.method1 = () => { };
  TestLooseImpl.prototype.method2 = () => { };
  TestLooseImpl.prototype.method3WithParams = (foo, bar, baz) => { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented but with incorrect number of args', (t) => {
  TestLooseImpl.prototype.method1 = () => { };
  TestLooseImpl.prototype.method2 = () => { };
  TestLooseImpl.prototype.method3WithParams = (foo, bar, baz, quiz) => { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Doesn\'t throw if all methods are implemented but with incorrectly named args', (t) => {
  TestLooseImpl.prototype.method1 = () => { };
  TestLooseImpl.prototype.method2 = () => { };
  TestLooseImpl.prototype.method3WithParams = (foo, bar, blarg) => { };

  const impl = new TestLooseImpl();
  t.deepEqual(impl.constructor.name, TestLooseImpl.prototype.constructor.name);
});

test('Loose Mode - Descendent classes can implement missing methods', (t) => {
  TestInheritLooseImpl.prototype.method1 = () => { };
  TestInheritLooseImpl.prototype.method2 = () => { };
  TestInheritLooseImpl.prototype.method3WithParams = (foo, bar, baz) => { };

  const parentError = t.throws(() => new TestLooseImpl(), ImplementationError);
  const errString = `${ERROR_BASE} TestLooseImpl must implement \`method1\` with the following signature: \`method1()\`.`;
  t.is(parentError.message, errString);

  const impl = new TestInheritLooseImpl();
  t.deepEqual(impl.constructor.name, TestInheritLooseImpl.prototype.constructor.name);
});
