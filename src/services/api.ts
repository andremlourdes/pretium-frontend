import axios from 'axios';
import { logger } from '../utils/logger';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  logger.info('API request', {
    method: config.method?.toUpperCase(),
    url: config.url,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      logger.error('API request failed', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
      });
    } else {
      logger.error('Unexpected API error', { error });
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    if (error.response.status === 404) return 'Registro não encontrado.';
    if (error.response.status >= 500) return 'O servidor encontrou um erro. Tente novamente.';
    const message = error.response.data?.message;
    return typeof message === 'string' ? message : fallback;
  }
  logger.error('Unexpected application error', { error });
  return fallback;
}
