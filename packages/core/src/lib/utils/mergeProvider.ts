import { flow, pipe } from 'fp-ts/function';
import { DIProvider } from '../interface/provider';
import { Token } from '../interface/token';
import { filter, map } from 'fp-ts/Array';

export const mergeProviders = (p1: DIProvider[]) => (p2: DIProvider[]): DIProvider[] => {
  const findByToken = (ps: DIProvider[]) => (t: Token) => ps.find(({ provide: pr }) => pr === t);
  const arrayToSet = <T>(arr: T[]) => new Set<T>([...arr]);
  const setToArray = <T>(set: Set<T>) => Array.from<T>(set);
  const distinctArray = <T>(arr: T[]): T[] => pipe(arr, arrayToSet, setToArray);
  const mapToTokens = <T extends DIProvider[]>(arr: T) =>
    pipe(
      arr,
      filter(val => !!val.provide),
      map<DIProvider, Token>(val => val.provide! as Token)
    );
  return pipe([...p2, ...p1], providers =>
    map(findByToken(providers))(pipe(providers, mapToTokens, distinctArray))
  ) as DIProvider[];
};
