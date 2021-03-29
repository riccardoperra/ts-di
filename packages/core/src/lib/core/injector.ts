import { Token } from '../interface/token';
import { DIProvider, TypeProvider } from '../interface/provider';
import { isProvider } from '../utils/isProvider';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import { map } from 'fp-ts/Array';
import { mergeProviders } from '../utils/mergeProvider';
import { getFlatProviderTree } from '../utils/getFlatProviderTree';
import * as O from 'fp-ts/Option';
import { fromNullable } from 'fp-ts/Option';
import { mapGenericToProvider } from '../utils/mapGenericToProvider';
import { mapToGenericProvider } from '../utils/mapToGenericProvider';

/**
 * @internal
 */
let rootInjector: Injector;
/**
 * @internal
 */
const providers = new WeakMap<Injector, DIProvider[]>();

export abstract class Injector {
  #instances: WeakMap<Token, unknown> = new WeakMap<Token, unknown>();
  parent?: Injector;

  abstract get<T>(token: Token<T>): T | null;

  static create(registry: DIProvider[], parent?: Injector): StaticInjector {
    const resolveProvider = <T>(p: DIProvider<T>): DIProvider =>
      pipe(
        isProvider(p) ? true : null,
        O.fromNullable,
        O.fold(
          () => ({ provide: p as TypeProvider<T>, useClass: p } as DIProvider),
          () => p
        )
      );

    const parentInjector = (p: Injector | undefined) =>
      pipe(
        p,
        O.fromNullable,
        O.fold(
          () => rootInjector,
          p1 => p1
        )
      );

    const getInstance = (ps: DIProvider[]) => new StaticInjector(ps, parentInjector(parent));

    const instance = pipe(registry, map(resolveProvider), getInstance);

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
      O.fromNullable,
      O.fold(
        () => [],
        ps => [...ps]
      )
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
    const provider = pipe(
      providers,
      fromNullable,
      O.fold(
        () => this.getProviders(),
        p => p
      ),
      A.findLast<DIProvider>(p => p.provide === token)
    );

    const deps = pipe(
      provider,
      O.fold(
        () => [],
        p =>
          A.map(this.getAndCreateInstance)(
            pipe(
              p.deps,
              O.fromNullable,
              O.fold(
                () => [],
                deps => deps
              )
            )
          )
      )
    );

    return pipe(
      provider,
      O.fold(
        () => null,
        _ => mapGenericToProvider<T>(mapToGenericProvider<T>(_))(deps)
      )
    );
  };

  private getInstanceFromParents<T>(token: Token<T>) {
    if (!this.parent) return undefined;

    const providers = mergeProviders(getFlatProviderTree(this))(safeGetProvider(this));

    return this.getInstanceFromRegistry(token, providers);
  }

  reset() {
    if (this.parent) {
      this.#instances = new WeakMap<Token, unknown>();
    }
  }
}

export const safeGetProvider = (injector: Injector) =>
  pipe(
    providers.get(injector),
    O.fromNullable,
    O.fold(
      () => [],
      v => v
    )
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
