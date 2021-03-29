import { Type } from '../core/type';

export const makeWithFactory = <T>(fn?: (...args: any[]) => T) => (deps: any[]) =>
  fn ? fn.apply(deps) : null;
