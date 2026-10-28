export interface DashboardSummary {
  totalProducts: number;
  totalStores: number;
  totalReceipts: number;
  totalSpent: number;
  generatedAt: string;
}

export interface Product {
  id?: number;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  weight?: number;
  description: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductFormValues = Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

