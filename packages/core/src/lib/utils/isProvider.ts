import { DIProvider } from '../interface/provider';
import { Token } from '../interface/token';

export const isProvider = <T extends DIProvider & { provide?: Token<any> }>(providerLike: T) =>
  providerLike.provide !== undefined;
