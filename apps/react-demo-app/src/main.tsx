import React, { Provider } from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { InjectorProvider } from '@ts-di/react';
import { rootProviders } from './tokens/rootProviders';



ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <InjectorProvider providers={rootProviders}>
        <App />
      </InjectorProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
