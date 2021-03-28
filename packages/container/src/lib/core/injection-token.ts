export class InjectionToken<T> {
  protected constructor(private _desc: string) {
  }

  toString() {
    return `[ts-di/token] ${this._desc}`;
  }

  static of<T = unknown>(_desc: string) {
    return new InjectionToken<T>(_desc);
  }
}
