import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { ProductDialog } from './ProductDialog';
import { theme } from '../theme';

function renderDialog(onSubmit = vi.fn()) {
  return {
    onSubmit,
    ...render(
      <ThemeProvider theme={theme}>
        <ProductDialog open onClose={vi.fn()} onSubmit={onSubmit} />
      </ThemeProvider>,
    ),
  };
}

describe('ProductDialog', () => {
  it('blocks submission when the product name is empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Informe o nome do produto.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims and submits a valid product name', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();
    await user.type(screen.getByRole('textbox', { name: /Nome/ }), '  Arroz  ');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Arroz' }));
  });
});
