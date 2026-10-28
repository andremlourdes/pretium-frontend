import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('render failure');
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a recovery message when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Ocorreu um erro inesperado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
  });
});
