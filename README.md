

# TsDi
**Dependency Injection container written in Typescript and Fp-Ts.** 

--- 

This project is born only for **experimental purposes**, **it's not ready for production yet**.
It provides a set of Angular-like utilities to manage dependency injection resolving provided tokens.

[comment]: <> (## Table of contents)

[comment]: <> (1. [Usage]&#40;#usage&#41;)

## Usage

---

```ts
import { Injector, StaticInjector } from './injector';
import { InjectionToken } from './injectionToken';

interface MyConfig {
  name: string;
  enableDarkMode: boolean;
}

export const APP_CONFIG = InjectionToken.of<MyConfig>('appConfig');
const appConfiguration: MyConfig = {name: 'appName', enableDarkMode: false}

export const injector = StaticInjector.create([
  { provide: APP_CONFIG, useValue: appConfiguration }
]);

const config = injector.get(APP_CONFIG);
// return {name: 'appName', enableDarkMode: false}
```

