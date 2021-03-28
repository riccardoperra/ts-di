# TsDi

**Dependency Injection container written in Typescript and Fp-Ts.**

--- 

This project is born only for **experimental purposes**, **it's not ready for production yet**. It provides a set of
Angular-like utilities to manage dependency injection resolving provided tokens.

[comment]: <> (## Table of contents)

[comment]: <> (1. [Usage]&#40;#usage&#41;)

## Usage

---

### 1. Provide a Class Type

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
