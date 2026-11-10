import axios from 'axios';
import { StorefrontMode } from '@/store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface CatalogCategory {
  id: string;
  slug: string;
  modeGroup: StorefrontMode;
  name: { en: string; tagline?: string };
  description?: { en: string };
}

export const FALLBACK_CATEGORIES: CatalogCategory[] = [
  {
    id: 'cat-snacks',
    slug: 'kids-snacks',
    modeGroup: 'FOODS_ONLY',
    name: {
      en: "Kids' Clean Snacks & Pantry",
      tagline: 'Ages 3+ • Zero Maida • Organic Jaggery • Pure Ghee',
    },
    description: {
      en: 'Small-batch homemade foods made by Snehal the way we make them for Saharsha & Sreeja.',
    },
  },
  {
    id: 'cat-dresses',
    slug: 'dresses',
    modeGroup: 'DRESS_AND_GIFTS',
    name: {
      en: "Women's Pure Cotton Dresses",
      tagline: '100% Breathable Mulmul & Handblock Cotton (Sizes S–XL)',
    },
    description: {
      en: 'Effortless pure cotton midi and tiered dresses for adult women.',
    },
  },
  {
    id: 'cat-kurtas',
    slug: 'kurtas',
    modeGroup: 'DRESS_AND_GIFTS',
    name: {
      en: 'Pure Cotton Kurtas & Co-ords',
      tagline: "Women's Kurta Sets & Classic Men's Kurtas",
    },
  },
  {
    id: 'cat-stoles',
    slug: 'stoles',
    modeGroup: 'DRESS_AND_GIFTS',
    name: {
      en: 'Handcrafted Cotton Stoles',
      tagline: 'Free-Size Artisanal Mulmul & Indigo Weaves',
    },
  },
  {
    id: 'cat-hampers',
    slug: 'hampers',
    modeGroup: 'DRESS_AND_GIFTS',
    name: {
      en: 'Signature Gift Hampers',
      tagline: 'Diwali, Wedding & Corporate Gifting Curations',
    },
  },
];

export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-ks-01',
    sku: 'HOA-KS-01',
    category: FALLBACK_CATEGORIES[0],
    name: {
      en: 'Sprouted Ragi-Almond-Jaggery Health Drink Mix',
      subtitle: 'Ages 3+ • Zero Refined Sugar • Rich in Calcium & Iron',
      badge: 'Fresh Weekly Batch',
    },
    description: {
      en: 'Slow-roasted sprouted ragi, California almonds, cashews, cardamom, and organic jaggery powder. Gently sweetened and easy to digest for growing kids and mothers.',
    },
    usage: {
      en: 'Ingredients: Sprouted Ragi (60%), Almonds (20%), Organic Jaggery (15%), Cardamom & Nutmeg. Shelf life: 90 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      {
        id: 'var-ks-01-250',
        sizePack: '250g Glass Jar',
        price: 390,
        stockQty: 25,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-ks-01-500',
        sizePack: '500g Family Jar',
        price: 720,
        stockQty: 15,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-ks-02',
    sku: 'HOA-KS-02',
    category: FALLBACK_CATEGORIES[0],
    name: {
      en: 'Pure A2 Ghee Ragi & Jaggery Cookies',
      subtitle: '100% Zero Maida • Baked with Cultured Ghee',
      badge: 'Society Bestseller',
    },
    description: {
      en: 'Melt-in-the-mouth millet cookies baked in small batches using pure cow ghee, whole ragi flour, and organic jaggery. Zero baking soda, maida, or palm oil.',
    },
    usage: {
      en: 'Ingredients: Whole Ragi Flour, Pure Cow Ghee, Organic Jaggery, Crushed Almonds, Cardamom. Shelf life: 45 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      {
        id: 'var-ks-02-200',
        sizePack: '200g Tin (14 Cookies)',
        price: 340,
        stockQty: 30,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-ks-02-400',
        sizePack: '400g Value Tin',
        price: 620,
        stockQty: 15,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-ks-03',
    sku: 'HOA-KS-03',
    category: FALLBACK_CATEGORIES[0],
    name: {
      en: 'Soft Jaggery & Roasted Peanut Chikki Bites',
      subtitle: 'Bite-Sized • No Liquid Glucose • Ages 3+',
      badge: 'Kids Tiffin Favourite',
    },
    description: {
      en: 'Soft, easy-to-bite squares crafted using aged organic Kolhapur jaggery, roasted peanuts, and a touch of pure cow ghee.',
    },
    usage: {
      en: 'Ingredients: Roasted Peanuts, Organic Kolhapur Jaggery, Pure Ghee, Dry Ginger Powder. Shelf life: 60 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
    variants: [
      {
        id: 'var-ks-03-200',
        sizePack: '200g Jar (20 Bites)',
        price: 280,
        stockQty: 30,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-ks-04',
    sku: 'HOA-KS-04',
    category: FALLBACK_CATEGORIES[0],
    name: {
      en: "Kids' Mild Ghee-Roasted Phool Makhana",
      subtitle: 'Hand-Roasted in Pure Ghee with Pink Salt & Turmeric',
      badge: 'Crunchy & Clean',
    },
    description: {
      en: 'Export-grade jumbo lotus seeds slow-roasted in pure cow ghee and lightly dusted with rock salt and organic turmeric.',
    },
    usage: {
      en: 'Ingredients: Jumbo Phool Makhana, Pure Cow Ghee, Sendha Namak, Organic Haldi. Shelf life: 60 days.',
    },
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      {
        id: 'var-ks-04-100',
        sizePack: '100g Airtight Jar',
        price: 290,
        stockQty: 25,
        isMadeToBatch: true,
        isAvailable: true,
      },
      {
        id: 'var-ks-04-200',
        sizePack: '200g Family Pack',
        price: 540,
        stockQty: 15,
        isMadeToBatch: true,
        isAvailable: true,
      },
    ],
  },
  {
    id: 'prod-dr-01',
    sku: 'HOA-DR-01',
    category: FALLBACK_CATEGORIES[1],
    name: {
      en: 'Indigo Dabu Handblock Pure Cotton Tiered Midi Dress',
      subtitle: "Adult Women's 100% Mulmul Cotton • Breathable Everyday Luxury",
      badge: 'Signature Indigo',
    },
    description: {
      en: 'Crafted from 100% pure 60x60 cambric and mulmul cotton in natural indigo handblock prints. Designed for adult women with concealed side pockets and zero synthetic lining.',
    },
    usage: {
      en: 'Fabric: 100% Pure Handblock Cotton (Pre-washed). Care: Gentle cold hand wash; dry in shade.',
    },
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      { id: 'var-dr-01-s', sizePack: 'Size S (Bust 36")', price: 1850, stockQty: 5, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-01-m', sizePack: 'Size M (Bust 38")', price: 1850, stockQty: 8, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-01-l', sizePack: 'Size L (Bust 40")', price: 1850, stockQty: 8, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-01-xl', sizePack: 'Size XL (Bust 42")', price: 1950, stockQty: 5, isMadeToBatch: false, isAvailable: true },
    ],
  },
  {
    id: 'prod-dr-02',
    sku: 'HOA-DR-02',
    category: FALLBACK_CATEGORIES[1],
    name: {
      en: 'Earthy Maroon & Ivory Bagh-Print Pure Cotton A-Line Dress',
      subtitle: "Adult Women's Relaxed Fit • With Concealed Pockets",
      badge: 'New Capsule Drop',
    },
    description: {
      en: 'An heirloom-inspired maroon and off-white pure cotton dress for adult women with delicate kantha-stitch detailing on the yoke.',
    },
    usage: {
      en: 'Fabric: 100% Pure Softened Mulmul Cotton. Fit confirmed personally by Snehal on your confirmation call.',
    },
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      { id: 'var-dr-02-s', sizePack: 'Size S (Bust 36")', price: 1990, stockQty: 4, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-02-m', sizePack: 'Size M (Bust 38")', price: 1990, stockQty: 6, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-02-l', sizePack: 'Size L (Bust 40")', price: 1990, stockQty: 6, isMadeToBatch: false, isAvailable: true },
      { id: 'var-dr-02-xl', sizePack: 'Size XL (Bust 42")', price: 2090, stockQty: 4, isMadeToBatch: false, isAvailable: true },
    ],
  },
  {
    id: 'prod-kr-01',
    sku: 'HOA-KR-01',
    category: FALLBACK_CATEGORIES[2],
    name: {
      en: "Women's Ivory & Forest Green Pure Cotton Kurta Co-ord Set",
      subtitle: '2-Piece Pure Cotton Kurta & Straight Trouser Set',
      badge: 'Pure 60s Cotton',
    },
    description: {
      en: 'Tailored from breathable 100% Jaipur pure cotton with botanical motifs, paired with comfortable elasticated-back cotton trousers.',
    },
    usage: {
      en: 'Fabric: 100% Pure 60x60 Cambric Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      { id: 'var-kr-01-s', sizePack: 'Size S (36")', price: 2290, stockQty: 5, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-01-m', sizePack: 'Size M (38")', price: 2290, stockQty: 8, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-01-l', sizePack: 'Size L (40")', price: 2290, stockQty: 8, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-01-xl', sizePack: 'Size XL (42")', price: 2390, stockQty: 5, isMadeToBatch: false, isAvailable: true },
    ],
  },
  {
    id: 'prod-kr-02',
    sku: 'HOA-KR-02',
    category: FALLBACK_CATEGORIES[2],
    name: {
      en: "Men's Classic Off-White & Indigo Slub Cotton Straight Kurta",
      subtitle: '100% Pure Handloom-Textured Cotton for Festive & Casual Wear',
      badge: "Men's Classic",
    },
    description: {
      en: 'Crafted in breathable unbleached off-white and deep indigo slub cotton with wooden buttons and a clean mandarin collar.',
    },
    usage: {
      en: 'Fabric: 100% Pure Handloom Slub Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
    isFeatured: false,
    variants: [
      { id: 'var-kr-02-m', sizePack: 'Size M (Chest 40")', price: 1590, stockQty: 6, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-02-l', sizePack: 'Size L (Chest 42")', price: 1590, stockQty: 8, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-02-xl', sizePack: 'Size XL (Chest 44")', price: 1590, stockQty: 6, isMadeToBatch: false, isAvailable: true },
      { id: 'var-kr-02-xxl', sizePack: 'Size XXL (Chest 46")', price: 1690, stockQty: 4, isMadeToBatch: false, isAvailable: true },
    ],
  },
  {
    id: 'prod-st-01',
    sku: 'HOA-ST-01',
    category: FALLBACK_CATEGORIES[3],
    name: {
      en: 'Artisanal Indigo & Ajrakh Pure Mulmul Cotton Stole',
      subtitle: 'Free Size (2.2m × 0.7m) • Featherlight & Hand-Tasselled',
      badge: 'Zero-Size-Risk Gift',
    },
    description: {
      en: 'Hand-block printed with natural indigo dyes on cloud-soft pure mulmul cotton. Pairs effortlessly with kurtas, dresses, or denim.',
    },
    usage: {
      en: 'Dimensions: 220 cm × 70 cm (Free Size). 100% Pure Mulmul Cotton.',
    },
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      { id: 'var-st-01-in', sizePack: 'Free Size (Indigo Motif)', price: 890, stockQty: 20, isMadeToBatch: false, isAvailable: true },
      { id: 'var-st-01-mr', sizePack: 'Free Size (Maroon & Ivory)', price: 890, stockQty: 15, isMadeToBatch: false, isAvailable: true },
    ],
  },
  {
    id: 'prod-hm-01',
    sku: 'HOA-HM-01',
    category: FALLBACK_CATEGORIES[4],
    name: {
      en: 'The House of Aatmiya Signature Family & Festive Hamper',
      subtitle: '1 Pure Cotton Stole + 2 Artisanal Foods + Personalized Note',
      badge: 'Hero Gift Box',
    },
    description: {
      en: 'Our signature keepsake box bringing together 1 Handblock Pure Mulmul Cotton Stole, 1 Jar of Pure Ghee Ragi Cookies (200g), 1 Jar of Ghee-Roasted Makhana (100g), and a wax-sealed family note from Arun & Snehal.',
    },
    usage: {
      en: 'Available for individual festive gifting and bulk wedding/corporate orders (25–50+ boxes).',
    },
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    isFeatured: true,
    variants: [
      { id: 'var-hm-01-cl', sizePack: 'Classic Hamper (Stole + 2 Jars)', price: 1690, stockQty: 20, isMadeToBatch: true, isAvailable: true },
      { id: 'var-hm-01-gr', sizePack: 'Grand Royal Box (Stole + All 4 Foods)', price: 2490, stockQty: 10, isMadeToBatch: true, isAvailable: true },
    ],
  },
];

export async function fetchStoreSettings() {
  try {
    const res = await apiClient.get('/store-settings');
    return res.data?.data || res.data;
  } catch {
    return {
      defaultMode: 'ALL' as StorefrontMode,
      allowModeSwitching: true,
      nextFoodBatchLabel: 'Next Fresh Batch: Friday (Orders close Wednesday)',
      whatsappPhone: '919876543210',
    };
  }
}

export async function fetchCatalogByMode(
  mode: StorefrontMode,
  categorySlug?: string,
) {
  try {
    const [catRes, prodRes] = await Promise.all([
      apiClient.get('/categories', { params: { mode } }),
      apiClient.get('/products', { params: { mode, categorySlug } }),
    ]);

    const categories: CatalogCategory[] = catRes.data?.data || catRes.data;
    const productsData = prodRes.data?.data || prodRes.data;
    return {
      categories,
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
