import { api } from './api';
import type { Product, ProductFormValues } from '../types/api';

export async function getProducts() {
  const { data } = await api.get<Product[]>('/api/products');
  return data;
}

export async function createProduct(product: ProductFormValues) {
  const { data } = await api.post<Product>('/api/products', product);
  return data;
}

export async function updateProduct(id: number, product: ProductFormValues) {
  const { data } = await api.put<Product>(`/api/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: number) {
  await api.delete(`/api/products/${id}`);
}

