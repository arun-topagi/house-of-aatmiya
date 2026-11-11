import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';

export interface CreateOrderItemPayload {
  variantId: string;
  quantity: number;
}

export interface CreateOrderAddressPayload {
  fullName: string;
  phone: string;
  flatOrHouse: string;
  areaOrSociety: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isSocietyResident: boolean;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isMobileConfirmed?: boolean;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  address: CreateOrderAddressPayload;
  giftNote?: string;
}

export interface CreatedOrderResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  whatsappConciergeUrl: string;
  status?: string;
}

export interface CustomerOrderItem {
  id: string;
  productName: { en: string } | string;
  sizePack: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItem[];
}

export class OrderService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreatedOrderResponse> {
    const res = await this.post('/orders', payload);
    return this.unwrap<CreatedOrderResponse>(res);
  }

  async getMyOrders(): Promise<CustomerOrder[]> {
    const res = await this.get('/orders');
    const list = this.unwrap<CustomerOrder[]>(res);
    return Array.isArray(list) ? list : [];
  }

  async getOrderById(orderId: string): Promise<CustomerOrder> {
    const res = await this.get(`/orders/${orderId}`);
    return this.unwrap<CustomerOrder>(res);
  }
}

export const orderService = new OrderService();

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreatedOrderResponse, CreateOrderPayload>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Orders'],
    }),
    getMyOrders: builder.query<CustomerOrder[], void>({
      query: () => ({
        url: '/orders',
        method: 'GET',
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<CustomerOrder, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
} = orderApi;
export default orderService;
