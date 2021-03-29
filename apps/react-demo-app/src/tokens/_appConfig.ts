import { InjectionToken } from '@ts-di/core';

export interface AppConfig {
  appTitle: string;
  appBaseColor: string;
}

export const appConfig: AppConfig = {
  appTitle: 'Demo App - 1',
  appBaseColor: '#fff'
};

export const BASE_APP_CONFIG = InjectionToken.create('appToken');
