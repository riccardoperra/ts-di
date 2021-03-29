import { DIProvider } from '@ts-di/core';
import { pipe } from 'fp-ts/function';
import { fold, fromNullable } from 'fp-ts/Option';
import { Injector, safeGetProvider } from '../core/injector';
import { mergeProviders } from './mergeProvider';

export const getFlatProviderTree = (c: Injector): DIProvider[] => pipe(
  fromNullable(c.parent),
  fold(
    () => safeGetProvider(c),
    parent => mergeProviders(safeGetProvider(c))(safeGetProvider(parent))
  )
);
