import { Token } from '@ts-di/core';
import { useContext, useMemo } from 'react';
import { ContainerContext } from './context';

export const useInject = <T>(token: Token<T>): T | null => {
  const injector = useContext(ContainerContext);
  if (!injector) {
    throw new Error('You must define a root InjectorProvider');
  }
  return useMemo(() => injector.get<T>(token), [injector]);
}
