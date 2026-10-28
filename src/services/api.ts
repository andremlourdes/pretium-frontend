import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    if (error.response.status === 404) return 'Registro não encontrado.';
    if (error.response.status >= 500) return 'O servidor encontrou um erro. Tente novamente.';
    return error.response.data?.message || fallback;
  }
  return fallback;
}

