# TsDi

**Dependency Injection container written in Typescript and Fp-Ts.**

--- 

This project is born only for **experimental purposes**, **it's not ready for production yet**. It provides a set of
Angular-like utilities to manage dependency injection resolving provided tokens.

[comment]: <> (## Table of contents)

[comment]: <> (1. [Usage]&#40;#usage&#41;)

## Usage

---

### 1. Providing a Class Type

All classes provided into the injector will share the instance with a behavior like singletons.

```ts
import { StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

interface IMyClass {
  get(): string
}

class MyClass implements IMyClass {
  constructor() {
  }

  get(): string {
    return this.constructor.name;
  }
}

export const injector = StaticInjector.create([
  { provide: MyClass, useClass: MyClass }
]);

const myClass1 = injector.get(MyClass);
const myClass2 = injector.get(MyClass);

assert.strictEqual(myClass, myClass2); // true
```

#### Use the TypeProvider shorthand
Like Angular, it's possible to pass directly the class constructor instead of using `{provide: AnyClass, useClass: AnyClass}`.
The behavior will be the same as it's the default case.

```ts
import { StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

class MyClass {
  constructor() {
  }
}

export const injector = StaticInjector.create([
  MyClass // { provide: MyClass, useClass: MyClass },
]);

const myClass = injector.get(MyClass);
assertTrue(myClass instanceof MyClass); // true
````

#### Nested Injection providing dependency

You can decide to also inject all constructor arguments of a class providing all dependencies in
`deps` Provider property, but you have to declare all providers for every argument you pass inside.

```ts
import { StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

interface IMyClass {
  get(): string
}

class MyClass implements IMyClass {
  constructor(public readonly myClass2: MyClass2) {
  }

  get(): string {
    return `${this.constructor.name} - Class`
  }
}

class MyClass2 implements IMyClass {
  get(): string {
    return `${this.constructor.name} - Class 2`
  }
}

export const injector = StaticInjector.create([
  { provide: MyClass, useClass: MyClass, deps: [MyClass2] },
  MyClass2, // shorthand
]);

const myClass = injector.get(MyClass);

assert.strictEqual(myClass.myClass2.get(), `MyClass2 - Class 2`); // true
```

---

### 2. Providing a Factory function

Providing a factory function consist of passing a function that will be invoked every time the injector resolve that
dependency. Actually it does not support functions that return a promise or an observable, so right now you have to
handle this manually.

```ts
import { StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

export const TOKEN = InjectionToken.of('factoryFn1');

export const injector = StaticInjector.create([
  {
    provide: TOKEN, useFactory: () => {
      console.log('factory call');
      return 'any';
    }
  }
]);

const value = injector.get(TOKEN);
// console.log('factory call');
// value = 'any';
const value2 = injector.get(TOKEN);
// console.log('factory call');
// value2 = 'any';

assert.strictEqual(value, 'any'); // true
assert.strictEqual(value2, 'any'); // true
```

---

### 3. Providing a static value

```ts
import { StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

export const TOKEN = InjectionToken.of('value1');

export const injector = StaticInjector.create([
  { provide: TOKEN, useValue: { key1: 'value' } }
]);

const value = injector.get(TOKEN);

assert.strictEqual(value, { key1: 'value' }); // true
```
