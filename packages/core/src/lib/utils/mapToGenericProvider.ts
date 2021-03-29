import { DIProvider } from '@ts-di/core';
import {
  ClassProvider,
  DIProviderType,
  FactoryProvider,
  GenericProvider,
  ValueProvider,
} from '../interface/provider';
import { Type } from '../core/type';

export const mapToGenericProvider = <T>(p: DIProvider): GenericProvider<T> => {
  if ((p as { useClass?: Type<T> }).useClass) {
    return { ...(p as ClassProvider<Type<T>>), _type: DIProviderType.CLASS };
  } else if ((p as { useFactory?: Function }).useFactory) {
    return { ...(p as FactoryProvider<T>), _type: DIProviderType.FACTORY };
  } else if ((p as { useValue?: Function }).useValue) {
    return { ...(p as ValueProvider<T>), _type: DIProviderType.VALUE };
  }
  return { ...(p as ClassProvider<Type<T>>), _type: DIProviderType.CLASS, useClass: p.provide as Type<T> };
};
