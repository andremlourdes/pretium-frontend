import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { logger } from '../utils/logger';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unhandled rendering error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">Ocorreu um erro inesperado</Typography>
          <Alert severity="error">
            Não foi possível renderizar esta página. Tente recarregar a aplicação.
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </Stack>
      </Box>
    );
  }
}
