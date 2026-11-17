import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { I18nProvider } from './lib/i18n';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const root = document.getElementById('root');

if (!root) {
  throw new Error('应用根节点缺失');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
