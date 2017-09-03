import test from 'ava';

import { ImplementationError } from '../lib/error';
import { getArguments, compareArguments, getFunctionArguments } from '../lib/utils/arguments';
import Mode from '../lib/utils/mode';

class TestImpl {
  method1(foo) { }
  method2(bar) { }
  method3(baz, quiz) { }
}

test('getFunctionArguments - Correctly parses a function signature', (t) => {
  const func = (foo, bar, baz) => { };
  const funcSignature = getFunctionArguments(func);

  t.deepEqual(funcSignature, ['foo', 'bar', 'baz']);
});

test('getFunctionArguments - Parses an arrow function signature', (t) => {
  const func = (baz, bar, foo) => { };
  const funcSignature = getFunctionArguments(func);

  t.deepEqual(funcSignature, ['baz', 'bar', 'foo']);
});

test('getArguments - Generates a map of method -> arguments for a class', (t) => {
  const obj = new TestImpl();
  const methods = ['method1', 'method2', 'method3'];

  const args = getArguments(methods, obj);

  const m = new Map();
  m.set('method1', ['foo']);
  m.set('method2', ['bar']);
  m.set('method3', ['baz', 'quiz']);

  t.deepEqual(Array.from(args), Array.from(m));
});

test('compareArguments - Generates no errors for correctly matching sets of arguments', (t) => {
  const m = new Map();
  m.set('method1', ['foo']);
  m.set('method2', ['bar']);
  m.set('method3', ['baz', 'quiz']);

  const compared = compareArguments(m, m);
  t.is(compared.size, 0);
});

test('compareArguments - Generates an error if an implementation method has too many arguments', (t) => {
  const m = new Map();
  m.set('method1', ['foo']);
  m.set('method2', ['bar']);
  m.set('method3', ['baz', 'quiz', 'buzz', 'qux']);

  const n = new Map();
  n.set('method1', ['foo']);
  n.set('method2', ['bar']);
  n.set('method3', ['baz', 'quiz', 'buzz']);

  const out = new Map();
  out.set('method3', {
    type: ImplementationError.INCORRECT_ARGUMENT_NUMBER,
    mode: [Mode.STRICT],
    signature: 'method3(baz, quiz, buzz)',
  });

  const compared = compareArguments(m, n);

  t.deepEqual(Array.from(compared), Array.from(out));
});

test('compareArguments - Generates an error if an implementation method has too few arguments', (t) => {
  const m = new Map();
  m.set('method1', ['foo']);
  m.set('method2', ['bar']);
  m.set('method3', ['baz', 'quiz']);

  const n = new Map();
  n.set('method1', ['foo']);
  n.set('method2', ['bar']);
  n.set('method3', ['baz', 'quiz', 'buzz']);

  const out = new Map();
  out.set('method3', {
    type: ImplementationError.INCORRECT_ARGUMENT_NUMBER,
    mode: [Mode.STRICT],
    signature: 'method3(baz, quiz, buzz)',
  });

  const compared = compareArguments(m, n);

  t.deepEqual(Array.from(compared), Array.from(out));
});

test('compareArguments - Methods with no arguments don\'t generate errors', (t) => {
  const m = new Map();
  m.set('method1', []);

  const n = new Map();
  n.set('method1', []);

  const compared = compareArguments(m, n);

  t.is(compared.size, 0);
});

test('compareArguments - Generates an error if an implementation method has an incorrectly named argument', (t) => {
  const m = new Map();
  m.set('method1', ['foo']);
  m.set('method2', ['bar']);
  m.set('method3', ['baz', 'quiz']);

  const n = new Map();
  n.set('method1', ['foo']);
  n.set('method2', ['bar']);
  n.set('method3', ['baz', 'buzz']);

  const out = new Map();
  out.set('method3', {
    type: ImplementationError.INCORRECT_ARGUMENT_NAMES,
    mode: [Mode.STRICT],
    signature: 'method3(baz, buzz)',
  });

  const compared = compareArguments(m, n);

  t.deepEqual(Array.from(compared), Array.from(out));
});

