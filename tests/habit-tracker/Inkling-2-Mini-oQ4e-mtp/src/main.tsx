import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { applyTheme, getStoredTheme } from './lib/theme';

// Apply the saved/system theme before first paint to avoid a flash.
applyTheme(getStoredTheme());

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
