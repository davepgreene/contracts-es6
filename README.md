# ES6 Contracts
[![Build Status](https://travis-ci.org/davepgreene/contracts-es6.svg?branch=master)](https://travis-ci.org/davepgreene/contracts-es6)
[![Coverage Status](https://coveralls.io/repos/github/davepgreene/contracts-es6/badge.svg?branch=master)](https://coveralls.io/github/davepgreene/contracts-es6?branch=master)

Have you ever wished that JavaScript implemented [interfaces][] like
[Java][], [C#][], or other statically typed languages?

ES6 Contracts provides interface validation for
ES6 classes. This project was developed against [Node.js][] v8
but is tested against Node.js >= 4. It should run just fine
in the browser as well.

## Usage

```javascript
const Interface = require('contracts-es6');

// Note the empty function bodies
class TestInterface {
  method1() { }
  method2() { }
  method3WithParams(foo, bar, baz) { }
}

// Alternatively, this can be implemented as
// class TestStrictImpl extends Interface(TestInterface, Interface.STRICT);
class TestStrictImpl extends Interface.StrictInterface(TestInterface) {
  constructor() {
    super(); // super call required
    console.log('Implemented!');
  }
  method1() {
    // Implementation here
  }
  method2() {
    // Implementation here
  }
  method3WithParams(foo, bar, baz) {
    // Implementation here
  }
}

const impl = new TestStrictImpl();
// output: 'Implemented!'
```

If you fail to satisfy the interface, an `ImplementationError`
will be thrown explaining the error.

You can access a list of all the implementation issues from
the `ImplementationError`.

```javascript
const Interface = require('contracts-es6');

class TestInterface {
  method1() { }
  method2() { }
}

class TestImpl extends Interface.StrictInterface(TestInterface) { }

try {
  new TestImpl();
} catch (err) {
  console.log(err.message);
  console.log(err.errors);
}

/*
output:
The provided implementation does not fully implement this interface.

[ 'TestImpl must implement `method1` with the following signature: `method1()`.',
  'TestImpl must implement `method2` with the following signature: `method2()`.' ]
*/
```

You can also validate that your implementation fulfills its 
contract before instantiation by using the `check` function.

```javascript
const Interface = require('contracts-es6');

class TestInterface {
  method1() { }
  method2() { }
}

class TestImpl extends Interface.StrictInterface(TestInterface) { }

class TestCompleteImpl extends Interface.StrictInterface(TestInterface) { 
  method1() { }
  method2() { }
}

console.log(`TestImpl: ${Interface.check(TestImpl)}`);
console.log(`TestCompleteImpl: ${Interface.check(TestCompleteImpl)}`);

/*
output: 
TestImpl: false
TestCompleteImpl: true
*/
``` 

The `interface` module exports two different interface types:
`Interface.StrictInterface` and `Interface.LooseInterface`.
See [Loose Mode](#loose-mode) for *Loose Mode* conventions. It
also exports the general `Interface` type which has the
`Interface(klass: interface-object, mode: integer)` signature.
The `Interface` type defaults to Strict mode if you don't specify
a `mode` argument. Currently there are two exported mode constants,
`Interface.STRICT` and `Interface.LOOSE` which
makes `Interface`'s declaration a bit more legible.

## Strict Mode

*Strict Mode* is the traditional interface pattern. *Impl* classes
must implement all of the methods specified in the interface.

## Loose Mode

*Loose Mode* bypasses argument checks for a given interface.
JavaScript developers tend to play fast and loose with
implementation method signatures, preferring to only specify
used arguments. ESLint includes a [rule (no-unused-vars)][no-unused-vars]
that enforces this concept. To use *Strict Mode* you'll need to
disable it and a few other rules (see [ESLint](#eslint).).

## Caveats

Because this is Javascript we're talking about, deriving
meaningful information about returned values is nearly 
impossible. Consequently, ES6 Contracts doesn't validate
return types, only method implementation and signature.  

## ESLint

Conventions in this library differ with some well-established
ESLint rules. To make sure that use of `Interface` passes ESLint
checks you should disable the following rules:

* [`class-methods-use-this`][class-methods-use-this]
* [`no-empty-function`][no-empty-function]
* [`no-unused-vars`][no-unused-vars] for `args` (only applies if using *Strict Mode*)

```javascript
/* eslint-disable-rule class-methods-use-this, no-empty-function, no-unused-vars */
```

or

```json
{
    "rules": {
        "class-methods-use-this": "off",
        "no-empty-function": "off",
        "no-unused-vars": ["error", { "args": "none" }],
    }
}
```

[interfaces]: https://en.wikipedia.org/wiki/Interface_(computing)#Software_interfaces_in_object-oriented_languages
[Java]: https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html
[C#]: https://msdn.microsoft.com/en-us/library/87d83y5b.aspx
[Node.js]: https://nodejs.org
[no-unused-vars]: http://eslint.org/docs/rules/no-unused-vars
[class-methods-use-this]: http://eslint.org/docs/rules/class-methods-use-this
[no-empty-function]: http://eslint.org/docs/rules/no-empty-function
