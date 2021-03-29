import React from 'react';

import { LoggerButton } from './components/logger-button';
import { InjectorProvider } from '@ts-di/react';
import { DIProvider } from '@ts-di/core';
import { LOGGER } from '../tokens/_logger';

const innerProviders: DIProvider[] = [
  {
    provide: LOGGER,
    useValue: (...args: any[]) => {
      console.log('inner log', ...args);
    }
  }
]

export function App() {
  const clickFn = () => {
  };

  return (
    <div>
      <div>
        <LoggerButton onClick={clickFn}>
          Button with root context
        </LoggerButton>
      </div>
      <InjectorProvider providers={innerProviders}>
        <div>
          <LoggerButton onClick={clickFn}>
            Button with inner context
          </LoggerButton>
        </div>
      </InjectorProvider>


    </div>

  );
}

export default App;
