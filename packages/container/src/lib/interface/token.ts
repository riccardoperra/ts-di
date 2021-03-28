import { Type } from '../core/type';
import { InjectionToken } from '../core/injectionToken';

export type Token<T = unknown> =
  | String
  | Type<T>
  | InjectionToken<T>
