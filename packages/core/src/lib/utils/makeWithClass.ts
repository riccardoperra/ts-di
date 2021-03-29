import { Type } from '../core/type';

export const makeWithClass = <T>(classType?: Type<T> | null) => (deps: any[]): T | null =>
  classType ? (new classType(...deps) as T) : null;
