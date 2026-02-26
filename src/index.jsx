import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { I18nProvider } from './i18n';

ReactDOM.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
  document.getElementById('root')
);