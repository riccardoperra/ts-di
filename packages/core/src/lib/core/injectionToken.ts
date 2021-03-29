/**
 * Creates an injection token that could be used in the DI Container.
 *
 * `Injection Token` has a generic T which is the type of object which will
 * be returned by the container injector.
 *
 * ``` typescript
 * type MyType = {...}
 * const myToken = injector.get(InjectionToken.of<MyType>('desc');
 *
 * ```
 */
export class InjectionToken<T> {
  protected constructor(private _desc: string) {}

  toString() {
    return `[ts-di/token] ${this._desc}`;
  }

  /**
   * @description
   * Create a new instance of InjectionToken with the given description
   * @param _desc
   */
  static create<T = unknown>(_desc: string) {
    return new InjectionToken<T>(_desc);
  }
}
