import { DIProvider } from '@ts-di/core';
import { appConfig, BASE_APP_CONFIG } from './_appConfig';
import { baseLogger, LOGGER } from './_logger';

export const rootProviders: DIProvider[] = [
  {
    provide: BASE_APP_CONFIG,
    useValue: appConfig,
  },
  {
    provide: LOGGER,
    useValue: baseLogger,
  },
];
