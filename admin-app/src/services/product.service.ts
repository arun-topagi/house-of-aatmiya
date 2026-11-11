import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';
import { StorefrontMode } from './adminApi';

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

export const FALLBACK_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-ks-01',
    sku: 'HOA-KS-01',
    name: {
      en: 'Sprouted Ragi-Almond-Jaggery Health Drink Mix',
      subtitle: 'Ages 3+ • Zero Refined Sugar • Rich in Calcium & Iron',
      badge: 'Fresh Weekly Batch',
    },
    description: {
      en: 'Slow-roasted sprouted ragi, California almonds, cashews, cardamom, and organic jaggery powder.',
    },
    usage: {
      en: 'Ingredients: Sprouted Ragi (60%), Almonds (20%), Organic Jaggery (15%), Cardamom & Nutmeg. Shelf life: 90 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 40,
    category: {
      id: 'cat-snacks',
      slug: 'kids-snacks',
      modeGroup: 'FOODS_ONLY',
      name: { en: "Kids' Clean Snacks & Pantry" },
    },
    variants: [
      {
        id: 'var-ks-01-250',
        sizePack: '250g Glass Jar',
        costPrice: 165,
        price: 390,
        markupMultiple: 2.36,
        stockQty: 25,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-ks-01-500',
        sizePack: '500g Family Jar',
        costPrice: 300,
        price: 720,
        markupMultiple: 2.4,
        stockQty: 15,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-ks-02',
    sku: 'HOA-KS-02',
    name: {
      en: 'Pure A2 Ghee Ragi & Jaggery Cookies',
      subtitle: '100% Zero Maida • Baked with Cultured Ghee',
      badge: 'Society Bestseller',
    },
    description: {
      en: 'Melt-in-the-mouth millet cookies baked in small batches using pure cow ghee, whole ragi flour, and organic jaggery.',
    },
    usage: {
      en: 'Ingredients: Whole Ragi Flour, Pure Cow Ghee, Organic Jaggery, Crushed Almonds, Cardamom. Shelf life: 45 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 45,
    category: {
      id: 'cat-snacks',
      slug: 'kids-snacks',
      modeGroup: 'FOODS_ONLY',
      name: { en: "Kids' Clean Snacks & Pantry" },
    },
    variants: [
      {
        id: 'var-ks-02-200',
        sizePack: '200g Tin (14 Cookies)',
        costPrice: 140,
        price: 340,
        markupMultiple: 2.43,
        stockQty: 30,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-ks-02-400',
        sizePack: '400g Value Tin',
        costPrice: 260,
        price: 620,
        markupMultiple: 2.38,
        stockQty: 15,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-dr-01',
    sku: 'HOA-DR-01',
    name: {
      en: 'Indigo Dabu Handblock Pure Cotton Tiered Midi Dress',
      subtitle: "Adult Women's 100% Mulmul Cotton • Breathable Everyday Luxury",
      badge: 'Signature Indigo',
    },
    description: {
      en: 'Crafted from 100% pure 60x60 cambric and mulmul cotton in natural indigo handblock prints.',
    },
    usage: {
      en: 'Fabric: 100% Pure Handblock Cotton (Pre-washed). Care: Gentle cold hand wash.',
    },
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 26,
    category: {
      id: 'cat-dresses',
      slug: 'dresses',
      modeGroup: 'DRESS_AND_GIFTS',
      name: { en: "Women's Pure Cotton Dresses" },
    },
    variants: [
      {
        id: 'var-dr-01-s',
        sizePack: 'Size S (Bust 36")',
        costPrice: 780,
        price: 1850,
        markupMultiple: 2.37,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-01-m',
        sizePack: 'Size M (Bust 38")',
        costPrice: 780,
        price: 1850,
        markupMultiple: 2.37,
        stockQty: 8,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-01-l',
        sizePack: 'Size L (Bust 40")',
        costPrice: 780,
        price: 1850,
        markupMultiple: 2.37,
        stockQty: 8,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-01-xl',
        sizePack: 'Size XL (Bust 42")',
        costPrice: 820,
        price: 1950,
        markupMultiple: 2.38,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-dr-02',
    sku: 'HOA-DR-02',
    name: {
      en: 'Earthy Maroon & Ivory Bagh-Print Pure Cotton A-Line Dress',
      subtitle: "Adult Women's Relaxed Fit • With Concealed Pockets",
      badge: 'New Capsule Drop',
    },
    description: {
      en: 'An heirloom-inspired maroon and off-white pure cotton dress for adult women with delicate kantha-stitch detailing.',
    },
    usage: {
      en: 'Fabric: 100% Pure Softened Mulmul Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 20,
    category: {
      id: 'cat-dresses',
      slug: 'dresses',
      modeGroup: 'DRESS_AND_GIFTS',
      name: { en: "Women's Pure Cotton Dresses" },
    },
    variants: [
      {
        id: 'var-dr-02-s',
        sizePack: 'Size S (Bust 36")',
        costPrice: 820,
        price: 1990,
        markupMultiple: 2.43,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-02-m',
        sizePack: 'Size M (Bust 38")',
        costPrice: 820,
        price: 1990,
        markupMultiple: 2.43,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-02-l',
        sizePack: 'Size L (Bust 40")',
        costPrice: 820,
        price: 1990,
        markupMultiple: 2.43,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-dr-02-xl',
        sizePack: 'Size XL (Bust 42")',
        costPrice: 850,
        price: 2090,
        markupMultiple: 2.46,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-kr-01',
    sku: 'HOA-KR-01',
    name: {
      en: "Women's Ivory & Forest Green Pure Cotton Kurta Co-ord Set",
      subtitle: '2-Piece Pure Cotton Kurta & Straight Trouser Set',
      badge: 'Pure 60s Cotton',
    },
    description: {
      en: 'Tailored from breathable 100% Jaipur pure cotton with botanical motifs.',
    },
    usage: {
      en: 'Fabric: 100% Pure 60x60 Cambric Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 26,
    category: {
      id: 'cat-kurtas',
      slug: 'kurtas',
      modeGroup: 'DRESS_AND_GIFTS',
      name: { en: 'Pure Cotton Kurtas & Co-ords' },
    },
    variants: [
      {
        id: 'var-kr-01-s',
        sizePack: 'Size S (36")',
        costPrice: 950,
        price: 2290,
        markupMultiple: 2.41,
        stockQty: 5,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-kr-01-m',
        sizePack: 'Size M (38")',
        costPrice: 950,
        price: 2290,
        markupMultiple: 2.41,
        stockQty: 8,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-kr-01-l',
        sizePack: 'Size L (40")',
        costPrice: 950,
        price: 2290,
        markupMultiple: 2.41,
        stockQty: 8,
        isMadeToBatch: false,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-st-01',
    sku: 'HOA-ST-01',
    name: {
      en: 'Artisanal Indigo & Ajrakh Pure Mulmul Cotton Stole',
      subtitle: 'Free Size (2.2m × 0.7m) • Featherlight & Hand-Tasselled',
      badge: 'Zero-Size-Risk Gift',
    },
    description: {
      en: 'Hand-block printed with natural indigo dyes on cloud-soft pure mulmul cotton.',
    },
    usage: {
      en: 'Dimensions: 220 cm × 70 cm (Free Size). 100% Pure Mulmul Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 35,
    category: {
      id: 'cat-stoles',
      slug: 'stoles',
      modeGroup: 'DRESS_AND_GIFTS',
      name: { en: 'Handcrafted Cotton Stoles' },
    },
    variants: [
      {
        id: 'var-st-01-in',
        sizePack: 'Free Size (Indigo Motif)',
        costPrice: 340,
        price: 890,
        markupMultiple: 2.62,
        stockQty: 20,
        isMadeToBatch: false,
        isAvailable: true,
      },
      {
        id: 'var-st-01-mr',
        sizePack: 'Free Size (Maroon & Ivory)',
        costPrice: 340,
        price: 890,
        markupMultiple: 2.62,
        stockQty: 15,
        isMadeToBatch: false,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-hm-01',
    sku: 'HOA-HM-01',
    name: {
      en: 'The House of Aatmiya Signature Family & Festive Hamper',
      subtitle: '1 Pure Cotton Stole + 2 Artisanal Foods + Personalized Note',
      badge: 'Hero Gift Box',
    },
    description: {
      en: 'Our signature keepsake box bringing together 1 Handblock Pure Mulmul Cotton Stole and 2 fresh artisanal food jars.',
    },
    usage: {
      en: 'Available for individual festive gifting and bulk wedding/corporate orders.',
    },
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    ],
    isFeatured: true,
    isActive: true,
    stockStatus: 'IN_STOCK',
    totalStock: 30,
    category: {
      id: 'cat-hampers',
      slug: 'hampers',
      modeGroup: 'DRESS_AND_GIFTS',
      name: { en: 'Signature Gift Hampers' },
    },
    variants: [
      {
        id: 'var-hm-01-cl',
        sizePack: 'Classic Hamper (Stole + 2 Jars)',
        costPrice: 680,
        price: 1690,
        markupMultiple: 2.49,
        stockQty: 20,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-hm-01-gr',
        sizePack: 'Grand Royal Box (Stole + All 4 Foods)',
        costPrice: 1020,
        price: 2490,
        markupMultiple: 2.44,
        stockQty: 10,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
];

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
