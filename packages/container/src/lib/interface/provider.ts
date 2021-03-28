import type { Type } from '../core/type';
import { Token } from './token';
import { Observable } from './observable';

export interface GenericProvider<T = any> {
  provide: Token<T>;
  useValue?: T;
  useClass?: Type<T>;
  useFactory?: (...args: any[]) => T;
  deps?: []
}
/**
 * Define a provider that will be resolved returning the `useValue` property value.
 * @internal
 */
export interface ValueProvider<T> {
  /**
   * The injection token. It should be the instance of InjectionToken or a string that will
   * be used during the injection process to resolve the value by the injector.
   */
  provide: Token<T>;
  /**
   * The value to inject.
   */
  useValue: T;

  deps?: any[]
}
/**
 * Define a provider that will be resolved invoking a `useFactory` function.
 * The provider will support the case if the factory function return a promise or
 * a generic observable. In this last case, the observable must complete.
 */
export interface FactoryProvider<T> {
  useFactory: (...args: any[]) => T | Promise<T> | Observable<T>;
  provide: Token<T>;
  deps?: any[]
}

/**
 * Define a provider that will be resolved invoking the `new` operator using
 * the given deps as constructor arguments if provided.
 * @internal
 */
export interface TypeProvider<T> extends Type<T> {
  deps?: any[];
  provide?: Token<T>;
}

/**
 * Define a provider that will be resolved invoking `useClass`.
 * It will return the context instance of given useClass param
 * @internal
 */
export interface ClassProvider<T> {
  /**
   * The injection token. It should be the instance of InjectionToken or a string that will
   * be used during the injection process to resolve the value by the injector.
   */
  provide: Token<T>;

  /**
   * The class to instantiate by the injector
   */
  useClass: T;

  /**
   * List of tokens that will be resolved by the injector. This list will be used
   * as the arguments of useClass param constructor. All params must be defined
   * in orders
   * @internal
   */
  deps?: any[]
}

/**
 * Define the provider configuration type that will be used by the injector
 * @publicApi
 */
export type DIProvider<T = any> =
  | TypeProvider<T>
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>;
