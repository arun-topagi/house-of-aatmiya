import HttpFactory from '@/utils/httpFactory';
import { authService } from './auth.service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const adminApi = new HttpFactory(API_BASE_URL);

export async function loginAdminApi(email: string, password: string) {
  return authService.login(email, password);
}

export type OrderStatus =
  | 'PENDING_CALL'
  | 'CONFIRMED_AWAITING_UPI'
  | 'PAID_IN_PREP'
  | 'READY_FOR_DISPATCH'
  | 'COMPLETED'
  | 'CANCELLED';

export type StorefrontMode = 'ALL' | 'DRESS_AND_GIFTS' | 'FOODS_ONLY';

export interface AdminOrderItem {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  categorySlug: string;
  sizePack: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  isMadeToBatch: boolean;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  recommendedAdvance: number;
  deliveryType: 'SOCIETY_HAND_DELIVERY' | 'COURIER_DELIVERY';
  giftNote?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  upiDeepLink: string;
  whatsappUpiRequestUrl: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    isPhoneVerified: boolean;
  };
  address: {
    flatOrHouse: string;
    areaOrSociety: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    isSocietyResident: boolean;
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string;
    isMobileConfirmed: boolean;
  };
  items: AdminOrderItem[];
}

export const FALLBACK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'HOA-1001',
    status: 'PENDING_CALL',
    totalAmount: 2240,
    advancePaid: 0,
    balanceDue: 2240,
    recommendedAdvance: 2240,
    deliveryType: 'SOCIETY_HAND_DELIVERY',
    giftNote: 'For my daughters — excited to try the fresh batch!',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    upiDeepLink:
      'upi://pay?pa=aatmiya%40okaxis&pn=The%20House%20of%20Aatmiya&am=2240&cu=INR&tn=Order%20HOA-1001',
    whatsappUpiRequestUrl:
      'https://wa.me/919823011223?text=Namaste%20Priya%20Kulkarni!%20Thank%20you%20for%20speaking%20with%20me%20regarding%20Order%20%23HOA-1001.%20Total%3A%20Rs.2240.%20UPI%3A%20aatmiya%40okaxis',
    customer: {
      id: 'cust-1',
      name: 'Priya Kulkarni',
      phone: '9823011223',
      isPhoneVerified: true,
    },
    address: {
      flatOrHouse: 'Tower B - Flat 402',
      areaOrSociety: 'Kalpataru Harmony Housing Society, Wakad',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      landmark: 'Near Clubhouse Gate',
      isSocietyResident: true,
      latitude: 18.5913,
      longitude: 73.7689,
      googleMapsUrl: 'https://maps.google.com/?q=18.5913,73.7689',
      isMobileConfirmed: true,
    },
    items: [
      {
        id: 'oi-1',
        variantId: 'var-ks-01-250',
        sku: 'HOA-KS-01',
        productName: 'Sprouted Ragi-Almond-Jaggery Health Drink Mix',
        categorySlug: 'kids-snacks',
        sizePack: '250g Glass Jar',
        quantity: 1,
        unitPrice: 390,
        costPrice: 165,
        isMadeToBatch: true,
      },
      {
        id: 'oi-2',
        variantId: 'var-dr-01-m',
        sku: 'HOA-DR-01',
        productName: 'Indigo Dabu Handblock Pure Cotton Tiered Midi Dress',
        categorySlug: 'dresses',
        sizePack: 'Size M (Bust 38")',
        quantity: 1,
        unitPrice: 1850,
        costPrice: 780,
        isMadeToBatch: false,
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'HOA-1002',
    status: 'PAID_IN_PREP',
    totalAmount: 2370,
    advancePaid: 2370,
    balanceDue: 0,
    recommendedAdvance: 2370,
    deliveryType: 'SOCIETY_HAND_DELIVERY',
    giftNote: 'Happy Diwali from the Deshmukh Family!',
    adminNotes: 'UPI Advance received via GPay',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    upiDeepLink:
      'upi://pay?pa=aatmiya%40okaxis&pn=The%20House%20of%20Aatmiya&am=2370&cu=INR&tn=Order%20HOA-1002',
    whatsappUpiRequestUrl: 'https://wa.me/919890122334',
    customer: {
      id: 'cust-2',
      name: 'Anjali Deshmukh',
      phone: '9890122334',
      isPhoneVerified: true,
    },
    address: {
      flatOrHouse: 'Tower A - Flat 904',
      areaOrSociety: 'Kalpataru Harmony Housing Society, Wakad',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      landmark: 'Main Podium',
      isSocietyResident: true,
      latitude: 18.5916,
      longitude: 73.7692,
      googleMapsUrl: 'https://maps.google.com/?q=18.5916,73.7692',
      isMobileConfirmed: true,
    },
    items: [
      {
        id: 'oi-3',
        variantId: 'var-hm-01-cl',
        sku: 'HOA-HM-01',
        productName: 'The House of Aatmiya Signature Family & Festive Hamper',
        categorySlug: 'hampers',
        sizePack: 'Classic Hamper (Stole + 2 Jars)',
        quantity: 1,
        unitPrice: 1690,
        costPrice: 680,
        isMadeToBatch: true,
      },
      {
        id: 'oi-4',
        variantId: 'var-ks-02-200',
        sku: 'HOA-KS-02',
        productName: 'Pure A2 Ghee Ragi & Jaggery Cookies',
        categorySlug: 'kids-snacks',
        sizePack: '200g Tin (14 Cookies)',
        quantity: 2,
        unitPrice: 340,
        costPrice: 140,
        isMadeToBatch: true,
      },
    ],
  },
];
