// furreco da sorte
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ErrorProvider } from './context/ErrorContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
);
