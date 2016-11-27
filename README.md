# ES6 Contracts
[![Build Status](https://travis-ci.org/davepgreene/contracts-es6.svg?branch=master)](https://travis-ci.org/davepgreene/contracts-es6)
[![Coverage Status](https://coveralls.io/repos/github/davepgreene/contracts-es6/badge.svg?branch=master)](https://coveralls.io/github/davepgreene/contracts-es6?branch=master)

Have you ever wished that JavaScript implemented [interfaces][] like
[Java][], [C#][], or other statically typed languages?

ES6 Contracts provides instantiation-time interface validation for
ES6 classes. This project was developed against [Node.js][] v7
but is tested against Node.js >= 4. It should run just fine
in the browser as well.

## Usage
```javascript
const Interface = require('./lib/interface');

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
will be thrown explaining the error when the implementation is
instantiated.

The `interface` module exports two different interface types:
`Interface.StrictInterface` and `Interface.LooseInterface`.
See [Loose Mode](#loose-mode) for *Loose Mode* conventions. It
also exports the general `Interface` type which has the
`Interface(klass: interface-object, strict: boolean)` signature.
The `Interface` type defaults to Strict mode if you don't specify
a `mode` argument. There are two exported constants, `Interface.STRICT`
and `Interface.LOOSE` which makes `Interface`'s declaration a
bit more legible.

## Loose Mode
*Loose Mode* bypasses argument checks for a given interface.
JavaScript developers tend to play fast and loose with
implementation method signatures, preferring to only specify
used arguments. ESLint includes a [rule (no-unused-vars)][no-unused-vars]
that enforces this concept. To use *Strict Mode* you'll need to
disable it and a few other rules (see [ESLint](#eslint).).

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
