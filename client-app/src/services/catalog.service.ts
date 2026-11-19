import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';
import { StorefrontMode } from '@/store';
import { CatalogCategory, CatalogProduct } from './api';

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
    const res = await this.get('/store-settings');
    return this.unwrap<StoreSettingsResponse>(res);
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

  async getProductById(id: string): Promise<CatalogProduct> {
    const res = await this.get(`/products/${id}`);
    return this.unwrap<CatalogProduct>(res);
  }

  async getCatalogByMode(
    mode: StorefrontMode,
    categorySlug?: string,
  ): Promise<{ categories: CatalogCategory[]; products: CatalogProduct[] }> {
    const effectiveMode: StorefrontMode =
      mode === 'ALL' ? 'DRESS_AND_GIFTS' : mode;
    const [categories, productsData] = await Promise.all([
      this.getCategories(effectiveMode),
      this.getProducts({ mode: effectiveMode, categorySlug }),
    ]);

    const rawCategories = Array.isArray(categories) ? categories : [];
    const rawProducts = (productsData?.items || []) as CatalogProduct[];

    return {
      categories: rawCategories.filter((c) => c.slug !== 'hampers'),
      products: rawProducts.filter(
        (p) =>
          p.category?.slug !== 'hampers' && p.productType !== 'GIFT_HAMPER',
      ),
    };
  }

  async getGiftingCatalog(): Promise<{
    curatableProducts: CatalogProduct[];
    readyHampers: CatalogProduct[];
  }> {
    const productsData = await this.getProducts();
    const allProducts = (productsData?.items || []) as CatalogProduct[];

    const curatableProducts = allProducts.filter(
      (p) =>
        p.category?.slug === 'stoles' ||
        p.category?.modeGroup === 'FOODS_ONLY' ||
        p.productType === 'FOOD',
    );

    const readyHampers = allProducts.filter(
      (p) =>
        p.category?.slug === 'hampers' || p.productType === 'GIFT_HAMPER',
    );

    return { curatableProducts, readyHampers };
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
