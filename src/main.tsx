import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { theme } from './theme';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { logger } from './utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

window.addEventListener('error', (event) => {
  logger.error('Unhandled browser error', { message: event.message, filename: event.filename });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', { reason: event.reason });
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      logger.error('Não foi possível registrar o service worker', { error });
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
