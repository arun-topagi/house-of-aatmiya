import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';
import { StorefrontMode } from './adminApi';

export type ProductType = 'FOOD' | 'APPAREL' | 'GIFT_HAMPER';

export interface AdminProductVariant {
  id: string;
  sizePack: string;
  costPrice: number;
  price: number;
  markupMultiple?: number;
  netMarginInr?: number;
  isBelowTargetMarkup?: boolean;
  stockQty: number;
  isMadeToBatch: boolean;
  isAvailable: boolean;
}

export interface AdminProduct {
  id: string;
  sku: string;
  productType?: ProductType;
  name: { en: string; subtitle?: string; badge?: string } | string;
  description?: { en: string } | string;
  usage?: { en: string } | string;
  images?: Array<string | { url: string; isPrimary?: boolean }>;
  isFeatured: boolean;
  isActive: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  totalStock?: number;
  category: {
    id?: string;
    slug: string;
    modeGroup: StorefrontMode;
    name: { en: string } | string;
  } | null;
  variants: AdminProductVariant[];
}

export interface StoreSettingsConfig {
  defaultMode: StorefrontMode;
  allowModeSwitching: boolean;
  nextFoodBatchLabel: string;
  upiVpa: string;
  whatsappPhone?: string;
}

export class AdminProductService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  async getProducts(): Promise<AdminProduct[]> {
    const res = await this.get('/admin/products');
    const list = this.unwrap<AdminProduct[]>(res);
    return Array.isArray(list) ? list : [];
  }

  async createProduct(payload: Record<string, unknown>): Promise<AdminProduct> {
    const res = await this.post('/admin/products', payload);
    return this.unwrap<AdminProduct>(res);
  }

  async updateProduct(
    productId: string,
    payload: Record<string, unknown>,
  ): Promise<AdminProduct> {
    const res = await this.put(`/admin/products/${productId}`, payload);
    return this.unwrap<AdminProduct>(res);
  }

  async toggleProductStatus(
    productId: string,
    isActive: boolean,
  ): Promise<AdminProduct> {
    const res = await this.patch(`/admin/products/${productId}/toggle`, {
      isActive,
    });
    return this.unwrap<AdminProduct>(res);
  }

  async toggleProductFeatured(
    productId: string,
    isFeatured: boolean,
  ): Promise<AdminProduct> {
    const res = await this.patch(`/admin/products/${productId}/featured`, {
      isFeatured,
    });
    return this.unwrap<AdminProduct>(res);
  }

  async updateVariant(variantId: string, payload: Record<string, unknown>) {
    const res = await this.patch(`/admin/variants/${variantId}`, payload);
    return this.unwrap(res);
  }

  async getStoreSettings(): Promise<StoreSettingsConfig> {
    const res = await this.get('/store-settings');
    return this.unwrap<StoreSettingsConfig>(res);
  }

  async updateStoreSettings(
    payload: Partial<StoreSettingsConfig>,
  ): Promise<StoreSettingsConfig> {
    const res = await this.patch('/admin/store-settings', payload);
    return this.unwrap<StoreSettingsConfig>(res);
  }
}

export const adminProductService = new AdminProductService();

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'StoreSettings'],
  endpoints: (builder) => ({
    getProducts: builder.query<AdminProduct[], void>({
      query: () => ({
        url: '/admin/products',
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),
    getStoreSettings: builder.query<StoreSettingsConfig, void>({
      query: () => ({
        url: '/store-settings',
        method: 'GET',
      }),
      providesTags: ['StoreSettings'],
    }),
    updateStoreSettings: builder.mutation<
      StoreSettingsConfig,
      Partial<StoreSettingsConfig>
    >({
      query: (data) => ({
        url: '/admin/store-settings',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['StoreSettings'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
} = productApi;
export default adminProductService;
