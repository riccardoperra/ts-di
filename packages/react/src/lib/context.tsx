import React, { createContext, FC, useContext, useLayoutEffect, useMemo } from 'react';
import { DIProvider, StaticInjector } from '@ts-di/core';

export const ContainerContext = createContext<StaticInjector | null>(
  StaticInjector.create([])
);

export const InjectorProvider: FC<{ providers: DIProvider[] }> = (props) => {
  const { providers, children } = props;
  const context = useContext(ContainerContext);

  const injector = useMemo(() => {
    if (providers) {
      return StaticInjector.create(providers, context ?? undefined);
    }
    return StaticInjector.create([]);
  }, [providers]);

  useLayoutEffect(() => {
  }, [providers]);

  return injector && (
    <ContainerContext.Provider value={injector}>
      {children}
    </ContainerContext.Provider>
  );
};
