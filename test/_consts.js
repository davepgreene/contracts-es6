const Interface = require('../lib/interface');

class TestInterface {
  method1() { }
  method2() { }
  method3WithParams(foo, bar, baz) {}
}

class TestStrictImpl extends Interface.StrictInterface(TestInterface) { }
class TestLooseImpl extends Interface.LooseInterface(TestInterface) { }
class TestInheritStrictImpl extends TestStrictImpl { }
class TestInheritLooseImpl extends TestLooseImpl { }

module.exports = {
  TestInterface,
  TestStrictImpl,
  TestLooseImpl,
  TestInheritStrictImpl,
  TestInheritLooseImpl,
  reset: () => {
    ['method1', 'method2', 'method3WithParams', 'method4'].forEach((func) => {
      delete TestStrictImpl.prototype[func];
      delete TestLooseImpl.prototype[func];
      delete TestInheritStrictImpl.prototype[func];
      delete TestInheritLooseImpl.prototype[func];
    });
  },
  ERROR_BASE: 'The prototype chain does not fully implement this interface.',
};