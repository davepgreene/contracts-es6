import Interface from '../lib/interface.js';

export class TestInterface {
  method1() { }
  method2() { }
  method3WithParams(foo, bar, baz) {}
}

export class TestStrictImpl extends Interface.StrictInterface(TestInterface) { }
export class TestLooseImpl extends Interface.LooseInterface(TestInterface) { }
export class TestInheritStrictImpl extends TestStrictImpl { }
export class TestInheritLooseImpl extends TestLooseImpl { }

export const reset = () => {
  ['method1', 'method2', 'method3WithParams', 'method4'].forEach((func) => {
    delete TestStrictImpl.prototype[func];
    delete TestLooseImpl.prototype[func];
    delete TestInheritStrictImpl.prototype[func];
    delete TestInheritLooseImpl.prototype[func];
  });
};

export const ERROR_BASE = 'The provided implementation does not fully implement this interface.';
