import { InjectionToken } from '@ts-di/core';

export const baseLogger = (...logs: string[]) => {
  console.group('App 1 Logger');
  console.log(...logs);
  console.groupEnd();
};

export const LOGGER = InjectionToken.create<(...logs: string[]) => void>('logger');
