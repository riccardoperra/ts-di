import { DIProviderType, GenericProvider } from '../interface/provider';
import { makeWithClass } from './makeWithClass';
import { makeWithFactory } from './mapWithFactory';

export const mapGenericToProvider = <T>(p: GenericProvider<T>) => (deps: any[]): T | null => {
  switch (p._type) {
    case DIProviderType.CLASS:
      return makeWithClass(p.useClass)(deps);
    case DIProviderType.FACTORY:
      return makeWithFactory(p.useFactory)(deps);
    case DIProviderType.VALUE:
      return p.useValue;
    default:
      return null;
  }
};
