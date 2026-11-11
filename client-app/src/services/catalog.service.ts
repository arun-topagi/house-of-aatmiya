import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';
import { StorefrontMode } from '@/store';
import {
  CatalogCategory,
  CatalogProduct,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
} from './api';

export interface StoreSettingsResponse {
  defaultMode: StorefrontMode;
  allowModeSwitching: boolean;
  nextFoodBatchLabel: string;
  whatsappPhone: string;
  upiVpa?: string;
}

export class CatalogService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  async getStoreSettings(): Promise<StoreSettingsResponse> {
    try {
      const res = await this.get('/store-settings');
      return this.unwrap<StoreSettingsResponse>(res);
    } catch {
      return {
        defaultMode: 'ALL',
        allowModeSwitching: true,
        nextFoodBatchLabel:
          'Next Fresh Batch: Friday (Orders close Wednesday)',
        whatsappPhone: '919876543210',
      };
    }
  }

  async getCategories(mode?: StorefrontMode): Promise<CatalogCategory[]> {
    const res = await this.get('/categories', {
      params: mode ? { mode } : undefined,
    });
    return this.unwrap<CatalogCategory[]>(res);
  }

  async getProducts(params?: {
    mode?: StorefrontMode;
    categorySlug?: string;
  }): Promise<{ items: CatalogProduct[] }> {
    const res = await this.get('/products', { params });
    return this.unwrap<{ items: CatalogProduct[] }>(res);
  }

  async getCatalogByMode(
    mode: StorefrontMode,
    categorySlug?: string,
  ): Promise<{ categories: CatalogCategory[]; products: CatalogProduct[] }> {
    try {
      const [categories, productsData] = await Promise.all([
        this.getCategories(mode),
        this.getProducts({ mode, categorySlug }),
      ]);

      return {
        categories: Array.isArray(categories) ? categories : [],
        products: (productsData?.items || []) as CatalogProduct[],
      };
    } catch {
      const categories = FALLBACK_CATEGORIES.filter(
        (c) => mode === 'ALL' || c.modeGroup === mode,
      );
      const products = FALLBACK_PRODUCTS.filter((p) => {
        const modeMatches = mode === 'ALL' || p.category.modeGroup === mode;
        const catMatches = !categorySlug || p.category.slug === categorySlug;
        return modeMatches && catMatches;
      });
      return { categories, products };
    }
  }
}

export const catalogService = new CatalogService();

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Category', 'Product', 'StoreSettings'],
  endpoints: (builder) => ({
    getStoreSettings: builder.query<StoreSettingsResponse, void>({
      query: () => ({
        url: '/store-settings',
        method: 'GET',
      }),
      providesTags: ['StoreSettings'],
    }),
    getCategories: builder.query<CatalogCategory[], StorefrontMode | void>({
      query: (mode) => ({
        url: '/categories',
        method: 'GET',
        params: mode ? { mode } : undefined,
      }),
      providesTags: ['Category'],
    }),
    getProducts: builder.query<
      { items: CatalogProduct[] },
      { mode?: StorefrontMode; categorySlug?: string } | void
    >({
      query: (params) => ({
        url: '/products',
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetStoreSettingsQuery,
  useGetCategoriesQuery,
  useGetProductsQuery,
} = catalogApi;
export default catalogService;
