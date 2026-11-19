import HttpFactory from '@/utils/httpFactory';
import { StorefrontMode } from '@/store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = new HttpFactory(API_BASE_URL);

export type ProductType = 'FOOD' | 'APPAREL' | 'GIFT_HAMPER';

export interface CatalogVariant {
  id: string;
  sizePack: string;
  price: number;
  stockQty: number;
  isMadeToBatch: boolean;
  isAvailable: boolean;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  productType?: ProductType;
  category: {
    id: string;
    slug: string;
    modeGroup: StorefrontMode;
    name: { en: string; tagline?: string };
  };
  name: {
    en: string;
    subtitle?: string;
    badge?: string;
  };
  description: { en: string };
  usage?: { en: string };
  images: string[];
  imageUrl: string;
  isFeatured: boolean;
  variants: CatalogVariant[];
}

export function isFoodProduct(
  product: Pick<CatalogProduct, 'productType' | 'category'>,
): boolean {
  if (product.productType) {
    return product.productType === 'FOOD';
  }
  return product.category?.modeGroup === 'FOODS_ONLY';
}

export interface CatalogCategory {
  id: string;
  slug: string;
  modeGroup: StorefrontMode;
  name: { en: string; tagline?: string };
  description?: { en: string };
}

export async function fetchStoreSettings() {
  const res = await apiClient.get('/store-settings');
  return res?.data || res;
}

export async function fetchCatalogByMode(
  mode: StorefrontMode,
  categorySlug?: string,
) {
  const effectiveMode: StorefrontMode =
    mode === 'ALL' ? 'DRESS_AND_GIFTS' : mode;
  const [catRes, prodRes] = await Promise.all([
    apiClient.get('/categories', { params: { mode: effectiveMode } }),
    apiClient.get('/products', {
      params: { mode: effectiveMode, categorySlug },
    }),
  ]);

  const categories: CatalogCategory[] = catRes?.data || catRes || [];
  const productsData = prodRes?.data || prodRes;
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
