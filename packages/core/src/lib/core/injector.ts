import { Token } from '../interface/token';
import { DIProvider, GenericProvider, TypeProvider } from '../interface/provider';
import { fold, fromNullable } from 'fp-ts/Option';
import { isProvider } from '../utils/isProvider';
import { pipe } from 'fp-ts/function';
import { map } from 'fp-ts/Array';
import { mergeProviders } from '../utils/mergeProvider';
import type { Type } from './type';
import { getFlatProviderTree } from '../utils/getFlatProviderTree';
import { isDefined } from '../utils/isDefined';

/**
 * @internal
 */
let rootInjector: Injector;
/**
 * @internal
 */
const providers = new WeakMap<Injector, DIProvider[]>();

const lastOf = <T extends unknown>(arr: T[]) => arr.length > 0 ? arr[arr.length - 1] : null;
const findLast = (token: Token) => (providers: DIProvider[]) => lastOf<DIProvider>(
  providers.filter(p => p.provide === token)
);

export abstract class Injector {
  #instances: WeakMap<Token, unknown> = new WeakMap<Token, unknown>();
  parent?: Injector;

  abstract get<T>(token: Token<T>): T | null;

  static create(
    registry: DIProvider[],
    parent?: Injector
  ): Injector {
    const resolveProvider = <T>(p: DIProvider<T>): DIProvider => pipe(
      isProvider(p) ? true : null,
      fromNullable,
      fold(
        () => ({ provide: p as TypeProvider<T>, useClass: p } as DIProvider),
        () => p
      )
    );

    const parentInjector = (p: Injector | undefined) => pipe(
      p,
      fromNullable,
      fold(
        () => rootInjector,
        (p1) => p1
      )
    );

    const getInstance = (ps: DIProvider[]) => new StaticInjector(ps, parentInjector(parent));

    const instance = pipe(
      registry,
      map(resolveProvider),
      getInstance
    );

    if (!rootInjector) {
      rootInjector = instance;
    }

    return instance;
  }

  protected constructor(providers: DIProvider[] = [], parent?: Injector) {
    this.parent = parent;
    this.addProviders(providers);
  }

  addProviders(registry: DIProvider[]): () => void {
    const _providers = this.getProviders();
    providers.set(this, mergeProviders(_providers)(registry));
    registry.map(it => this.#instances.delete(it.provide as Token));
    return () => this.addProviders(_providers);
  }

  private getProviders(): DIProvider[] {
    return pipe(
      providers.get(this),
      fromNullable,
      fold(() => [], ps => [...ps])
    );
  }

  protected getAndCreateInstance = <T>(token: Token<T>) => {
    const instance = this.#instances.get(token) || this.instanceOf<T>(token);
    if (instance) {
      this.#instances.set(token, instance);
    }
    return instance as T;
  };

  private instanceOf<T>(token: Token<T>) {
    const instance = this.getInstanceFromRegistry(token) || this.getInstanceFromParents(token);
    if (!instance) {
      throw new Error(`Unable make instance of ${String(token)}`);
    }
    return instance;
  }


  private getInstanceFromRegistry = <T>(token: Token<T>, providers?: DIProvider[]): T | null | undefined => {
    const provider = findLast(token)(providers || this.getProviders());
    const deps = provider?.deps ? provider.deps?.map(this.getAndCreateInstance) : [];

    const makeWithFactory = (fn?: (...args: any[]) => T) => fn ? fn.apply(deps) : null;
    const makeWithClass = <T>(classType?: Type<T> | null): T | null => classType ? new classType(...deps) as T : null;

    if (provider) {
      if ((provider as GenericProvider<T>).useValue) {
        return (provider as GenericProvider<T>).useValue;
      }
      if ((provider as GenericProvider<T>).useClass) {
        return makeWithClass(
          (provider as GenericProvider<T>).useClass
        );
      }
      if ((provider as GenericProvider).useFactory) {
        return makeWithFactory(
          (provider as GenericProvider<T>).useFactory
        );
      }
    }
    return null;
  };

  private getInstanceFromParents<T>(token: Token<T>) {
    if (!this.parent) return undefined;

    const providers = mergeProviders(
      getFlatProviderTree(this)
    )(safeGetProvider(this));

    return this.getInstanceFromRegistry(token, providers);
  }

  reset() {
    if (this.parent) {
      this.#instances = new WeakMap<Token, unknown>();
    }
  }
}

export const safeGetProvider = (injector: Injector) => pipe(
  providers.get(injector),
  fromNullable,
  fold(() => [], v => v)
);

export class StaticInjector extends Injector {
  get<T>(token: Token<T>): T | null {
    const instance = this.getAndCreateInstance<T>(token);
    if (!instance) {
      return this.parent ? this.parent.get(token) : null;
    }
    return instance;
  }
}
