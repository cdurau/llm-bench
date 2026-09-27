import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/globals.css';

// Listen for toggle events from child components
window.addEventListener('pulseboard-toggle', () => {
  // React re-renders automatically when useActivitiesWithStatus reads updated data
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
