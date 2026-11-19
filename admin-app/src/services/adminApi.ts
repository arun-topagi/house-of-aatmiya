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
