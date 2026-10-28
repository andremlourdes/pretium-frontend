export interface Location { id?: number; country: string; state: string; city: string; zipCode: string; latitude?: number; longitude?: number; }
export interface Store { id?: number; name: string; description: string; phone: string; website: string; location: Location; status?: string; }
export interface Receipt { id?: number; storeId: number; storeName?: string; receiptNumber: string; purchaseDate: string; totalAmount: number; notes?: string; status?: string; items?: PurchaseItem[]; }
export interface PurchaseItem { id?: number; receiptId?: number; productId: number; productName?: string; quantity: number; unitPrice: number; totalPrice?: number; }
export interface PriceComparison { productId: number; productName: string; storeId?: number; storeName?: string; city?: string; state?: string; country?: string; price?: number; discountedPrice?: number; priceType?: string; recordedDate?: string; priceChange?: number; priceChangePercentage?: number; }
export interface PriceAnalytics { productId: number; productName: string; category?: string; minPrice?: number; maxPrice?: number; averagePrice?: number; medianPrice?: number; totalStores?: number; totalRecords?: number; cheapestStore?: string; mostExpensiveStore?: string; priceRange?: number; pricesByStore?: PriceComparison[]; }
export interface PriceForecast { productId: number; productName: string; currentPrice?: number; predictedPrice?: number; trend?: 'UP' | 'DOWN' | 'STABLE'; recordsUsed?: number; generatedAt?: string; }
export interface PriceAlert { id?: number; productId: number; productName?: string; targetPrice: number; conditionType: 'BELOW' | 'ABOVE' | 'EQUAL'; active?: boolean; createdAt?: string; lastNotifiedAt?: string; }
export interface OcrResult { filename: string; text: string; status: string; }

