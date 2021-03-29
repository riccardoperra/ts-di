 --import { InjectionToken } from './injectionToken';
import { StaticInjector } from '@ts-di/core';

describe('StaticInjector', () => {
  let parent: StaticInjector;
  let injector: StaticInjector;
  let MSG_TOKEN: InjectionToken<string>;

  describe('with useClass', () => {
    beforeEach(() => {
      const [injectorA, tokenA] = makeTestInjector();

      injector = injectorA;
      MSG_TOKEN = tokenA;
    })

    it('should inject A which has InjectionToken dependencies', () => {
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("Hello Thomas");
    });

    it('should inject B which has A dependencies', () => {
      const instB: B = injector.get(B);

      expect(instB.title).toBe("B");
      expect(instB.a.title).toBe("A");
    });

    it('should inject D which has B + C dependencies', () => {
      const instD: D = injector.get(D);

      expect(instD.title).toBe("D");
      expect(instD.b.title).toBe("B");
      expect(instD.c.title).toBe("C");
    });

    it('should support mock injection B', () => {
      injector.addProviders([ {provide: B, useClass: MockB } ]);

      const instB: B = injector.get(B);
      expect(instB.title).toBe("MockB");
      expect(instB.a.title).toBe("MockA");

      const instD: D = injector.get(D);
      expect(instD.b.title).toBe("MockB");
    });

    it('should allow A deps overrides with useFactory', () => {
      injector.addProviders([ { provide: MSG_TOKEN, useFactory: () => "windy" } ])
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");
    });

    it('should undo changes after addProviders()', () => {
      const undoChanges: () => void = injector.addProviders([
        { provide: MSG_TOKEN, useFactory: () => "windy" }
      ]);

      let instA: A = injector.get(A);
      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");

      undoChanges();
      instA = injector.get(A);

      expect(instA.msg).toBe("Hello Thomas");
    });

    it('build a Facade with shared Store', () => {
      const [injectorF, tokenF] = makeFacadeInjector();
      const instF: Facade = injectorF.get(Facade);

      expect(instF).toBeDefined();
      expect(instF.store === instF.query.store).toBeTruthy();
    });

  });

  describe('with parent injector', () => {
    beforeEach(() => {
      const [parentA, tokenA] = makeTestInjector();

      parent = parentA;
      injector = StaticInjector.create([
        { provide: E, useClass: E, deps:[D] },
        { provide: F, useClass: F, deps:[E, A] },
      ], parent);

      MSG_TOKEN = tokenA;
    })

    it('should inject A which has InjectionToken dependencies', () => {
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("Hello Thomas");
    });

    it('should inject B which has A dependencies', () => {
      const instB: B = injector.get(B);

      expect(instB.title).toBe("B");
      expect(instB.a.title).toBe("A");
    });

    it('should inject D which has B + C dependencies', () => {
      const instD: D = injector.get(D);

      expect(instD.title).toBe("D");
      expect(instD.b.title).toBe("B");
      expect(instD.c.title).toBe("C");
    });

    it('should support mock injection B', () => {
      injector.addProviders([ {provide: B, useClass: MockB } ]);

      const instB: B = injector.get(B);
      expect(instB.title).toBe("MockB");
      expect(instB.a.title).toBe("MockA");

      const instD: D = injector.get(D);
      expect(instD.b.title).toBe("MockB");
    });

    it('should allow A deps overrides with useFactory', () => {
      injector.addProviders([ { provide: MSG_TOKEN, useFactory: () => "windy" } ])
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");
    });

    it('should undo changes after addProviders()', () => {
      const undoChanges: () => void = parent.addProviders([
        { provide: MSG_TOKEN, useFactory: () => "windy" }
      ]);

      let instA: A = injector.get(A);
      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");

      undoChanges();
      injector.reset();

      instA = injector.get(A);

      expect(instA.msg).toBe("Hello Thomas");
    });

  });

  describe('with root injector', () => {
    beforeEach(() => {
      const [root, tokenA] = makeTestInjector();

      injector = StaticInjector.create([
        { provide: E, useClass: E, deps:[D]    },
        { provide: F, useClass: F, deps:[E, A] },
        { provide: H, useClass: H, deps:[G]    },
        J
      ]);

      MSG_TOKEN = tokenA;
    })

    it('should use instantiate A which auto-linked root injector', () => {
      const instF: F = injector.get(F);
      expect(instF.a.title).toBe("A");
      expect(instF.e.d.title).toBe("D");
    });

    it('should use instantiate a token registered with short Provider form', () => {
      const instJ: J = injector.get(J);
      expect(instJ.title).toBe("J");
    });


    it('should fail Token instantiation if the token`s dependencies have not been registered', () => {
      let h: H, error;
      try {
        h = injector.get(H)
        h.g.title = "testing";
      } catch(e) { error = e; }

      expect(error).toBeTruthy();
      expect(h).toBeFalsy();
    });

  });
});


function makeTestInjector(): [ StaticInjector, InjectionToken<string> ] {
  const token = InjectionToken.of("injector.spec.ts - msg");
  const injector = StaticInjector.create([
    { provide: token, useValue: "Hello Thomas"},
    { provide: A, useClass: A, deps:[token]},
    { provide: B, useClass: B, deps:[A]},
    { provide: C, useClass: C, deps:[A]},
    { provide: D, useClass: D, deps:[B, C]},
  ]);
  return [injector, token];
}

class A { constructor(public msg: string, public title = "A"){} }
class B { constructor(public a: A, public title="B"){ }}
class C { constructor(public a: A, public title="C"){ }}
class D { constructor(public b: B, public c: C, public title="D"){ }}
class E { constructor(public d: D, public title="E"){ }}
class F { constructor(public e: E, public a:A){ }}
class G { constructor(public b: B, public title = "G"){}}
class H { constructor(public g: G){}}
class J { constructor(public title="J"){} }


function makeFacadeInjector(): [ StaticInjector, InjectionToken<string> ] {
  const token = InjectionToken.of("injector.spec.ts - facade");
  const injector = StaticInjector.create([
    Store,
    { provide: Query, useClass: Query, deps:[Store]},
    { provide: Facade, useClass: Facade, deps:[Store, Query]},
  ]);
  return [injector, token];
}

class Store  { };
class Query  { constructor(public store: Store){} };
class Facade { constructor(public store: Store, public query: Query){} };

class MockB {
  a = { title: "MockA" };
  constructor(public msg: string, public title = "MockB"){}
}
