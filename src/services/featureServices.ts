import { api } from './api';
import type { Location, Store, Receipt, PurchaseItem, PriceAnalytics, PriceComparison, PriceForecast, PriceAlert, OcrResult } from '../types/features';

export const getLocations = async () => (await api.get<Location[]>('/api/locations')).data;
export const createLocation = async (location: Location) => (await api.post<Location>('/api/locations', location)).data;
export const getStores = async () => (await api.get<Store[]>('/api/stores')).data;
export const createStore = async (locationId: number, store: Omit<Store, 'id' | 'location'>) => (await api.post<Store>(`/api/stores/${locationId}`, store)).data;
export const deleteStore = async (id: number) => { await api.delete(`/api/stores/${id}`); };

export const getReceipts = async () => (await api.get<Receipt[]>('/api/receipts')).data;
export const createReceipt = async (params: { storeId: number; receiptNumber: string; purchaseDate: string; totalAmount: number }) => (await api.post<Receipt>('/api/receipts', null, { params })).data;
export const getReceiptItems = async (id: number) => (await api.get<PurchaseItem[]>(`/api/receipts/${id}/items`)).data;
export const addReceiptItem = async (receiptId: number, params: { productId: number; quantity: number; unitPrice: number }) => (await api.post<PurchaseItem>(`/api/receipts/${receiptId}/items`, null, { params })).data;
export const cancelReceipt = async (id: number) => (await api.put<Receipt>(`/api/receipts/${id}/cancel`)).data;
export async function downloadReceiptPdf(id: number) {
  const response = await api.get<Blob>(`/api/reports/receipt/${id}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cupom-${id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export const getPriceAnalytics = async (productId: number) => (await api.get<PriceAnalytics>(`/api/prices/analysis/${productId}`)).data;
export const getPriceHistory = async (productId: number, startDate: string, endDate: string) => (await api.get<PriceComparison[]>(`/api/prices/history/${productId}`, { params: { startDate, endDate } })).data;
export const getForecast = async (productId: number) => (await api.get<PriceForecast>(`/api/predictions/${productId}`)).data;

export const getAlerts = async () => (await api.get<PriceAlert[]>('/api/alerts')).data;
export const createAlert = async (params: { productId: number; targetPrice: number; conditionType: string }) => (await api.post<PriceAlert>('/api/alerts', null, { params })).data;
export const deleteAlert = async (id: number) => { await api.delete(`/api/alerts/${id}`); };

export async function uploadReceiptOcr(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return (await api.post<OcrResult>('/api/ocr/receipt', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
}

