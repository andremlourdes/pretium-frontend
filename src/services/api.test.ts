import axios, { AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getApiErrorMessage } from './api';

describe('getApiErrorMessage', () => {
  it('returns a connection message when the API is unreachable', () => {
    expect(getApiErrorMessage(new Error('network failure'))).toBe(
      'Não foi possível concluir a operação.',
    );
  });

  it('maps common HTTP errors to user-friendly messages', () => {
    expect(getApiErrorMessage(axiosError(404))).toBe('Registro não encontrado.');
    expect(getApiErrorMessage(axiosError(500))).toBe('O servidor encontrou um erro. Tente novamente.');
  });

  it('uses a server message only when it is a string', () => {
    expect(getApiErrorMessage(axiosError(422, { message: 'Nome inválido' }))).toBe('Nome inválido');
    expect(getApiErrorMessage(axiosError(422, { message: { invalid: true } }), 'Fallback')).toBe('Fallback');
  });
});

function axiosError(status?: number, data?: unknown) {
  const error = new axios.AxiosError('request failed');
  error.response = {
    status: status ?? 400,
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
    statusText: '',
  };
  return error;
}

it('logs unexpected errors without exposing a success-shaped fallback', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(getApiErrorMessage(new Error('unexpected'), 'Fallback')).toBe('Fallback');
  expect(spy).toHaveBeenCalled();
});
