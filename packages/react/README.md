# @ts-di/react

This source provides some react based bindings
for [@ts-di/core](https://github.com/riccardoperra/ts-di/main/packages/core) package using context and custom hooks. Be
careful this is not a replacement for state management, and it should be used only to retrieve global variables safely
with the possibility to override values based on the current context.

## Usage

---

### 1. Create the providers array

All classes provided into the injector will share the instance with a behavior like singletons.

```ts
// tokens.ts

type Logger = <T extends any[]>(...args: T) => void;

const baseLogger: Logger = (...logs: string[]) => {
  console.group('Logger Group');
  console.log(...logs);
  console.groupEnd();
};

export const LOGGER = InjectionToken.create<Logger>('logger');

export const rootProviders: DIProvider[] = [
  {
    provide: LOGGER,
    useValue: baseLogger,
  },
];
```

### 2. Pass the providers to the context

```tsx
// main.tsx

ReactDOM.render(
  <React.StrictMode>
    <InjectorProvider providers={rootProviders}>
      <App />
    </InjectorProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

### 3. Inject the provided instances with useInject hook

```tsx
// LoggerButton.tsx

type LoggerButtonProps = {
  onClick: () => void;
}

export const LoggerButton: FC<LoggerButtonProps> = props => {
  const logger = useInject(LOGGER);
  const onClick = evt => props.onClick();
  return <Button onClick={onClick}>{props.children}</Button>;
};
```

```tsx
// App.tsx

export const App = () => {
  const clickFn = () => {
  };
  return (
    <div>
      <LoggerButton onClick={clickFn}>Button</LoggerButton>
    </div>
  );
}
```

#### Override providers

```ts
// feature1.tokens.ts
import { Logger, LOGGER } from './tokens';

const feature1Logger: Logger = (...logs: string[]) => {
  console.log('Feature Logger', logs);
};

export const feature1Providers: DIProvider[] = [
  {
    provide: LOGGER,
    useValue: feature1Logger,
  },
];
```

```tsx
// App.tsx

import { InjectorProvider } from '@ts-di/react';
import { feature1Providers } from './feature1.tokens.ts';

export const App = () => {
  const clickFn = () => {
  };
  return (
    <div>
      <div>
        // RootInjector scope
        <LoggerButton onClick={clickFn}>Button</LoggerButton>
        // console.group('Logger Group');
        // console.log(...logs);
        // console.groupEnd();
      </div>
      <InjectorProvider providers={feature1Providers}>
        // In this context when LoggerButton will retrieve the instance of LOGGER token
        // it will provide to LoggerButton the value of feature1Logger
        <div>
          <LoggerButton onClick={clickFn}>Feature Button</LoggerButton>
          // console.log('Feature logger', logs)
        </div>
      </InjectorProvider>
    </div>
  )
}
```
