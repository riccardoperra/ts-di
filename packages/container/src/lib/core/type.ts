export const Type = Function;

export const isType = <T>(obj: T): boolean => typeof obj === 'function';

/**
 * Used internally to infer a function type with generics
 * @internal
 */
export interface Type<T> extends Function {
  new(...args: any[]): T
}
