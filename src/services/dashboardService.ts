import { api } from './api';
import type { DashboardSummary } from '../types/api';

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>('/api/dashboard/summary');
  return data;
}

