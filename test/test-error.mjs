import test from 'ava';

import { ImplementationError } from '../lib/error.js';
import Mode from '../lib/utils/mode.js';

const errObj = {
  type: ImplementationError.METHOD_MISSING,
  mode: [Mode.STRICT, Mode.LOOSE],
  signature: 'method1(foo, bar, baz)',
};

test('Generates an appropriate error string for a missing method', (t) => {
  const str = ImplementationError.generateErrorString('TestImpl', 'method1', errObj);

  t.is(str, 'TestImpl must implement `method1` with the following signature: `method1(foo, bar, baz)`.');
});

test('Generates an appropriate error string for a method with the incorrect number of arguments', (t) => {
  errObj.type = ImplementationError.INCORRECT_ARGUMENT_NUMBER;
  errObj.strict = true;
  const str = ImplementationError.generateErrorString('TestImpl', 'method1', errObj);

  t.is(str, 'TestImpl implements `method1` with an incorrect number of arguments. ' +
    'The correct signature is `method1(foo, bar, baz)`.');
});

test('Generates an appropriate error string for a method with incorrectly named arguments', (t) => {
  errObj.type = ImplementationError.INCORRECT_ARGUMENT_NAMES;
  errObj.str = true;

  const str = ImplementationError.generateErrorString('TestImpl', 'method1', errObj);

  t.is(str, 'TestImpl implements `method1` with incorrectly named arguments. ' +
    'The correct signature is `method1(foo, bar, baz)`.');
});

test('Throws is given an error type it doesn\'t understand', (t) => {
  errObj.type = 5;
  const error = t.throws(() => {
    ImplementationError.generateErrorString('TestImpl', 'method1', errObj);
  }, {instanceOf: TypeError});

  t.is(error.message, 'Unknown error.');
});
