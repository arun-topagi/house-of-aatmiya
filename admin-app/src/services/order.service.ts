import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';
import { AdminOrder, OrderStatus } from './adminApi';

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  advancePaid?: number;
  adminNotes?: string;
}

export class AdminOrderService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  async getOrders(): Promise<AdminOrder[]> {
    const res = await this.get('/admin/orders');
    const list = this.unwrap<AdminOrder[]>(res);
    return Array.isArray(list) ? list : [];
  }

  async getOrderMetrics() {
    const res = await this.get('/admin/orders/metrics');
    return this.unwrap(res);
  }

  async getKitchenBatchPrep() {
    const res = await this.get('/admin/orders/kitchen-batch');
    return this.unwrap(res);
  }

  async updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<AdminOrder> {
    const res = await this.patch(`/admin/orders/${orderId}/status`, payload);
    return this.unwrap<AdminOrder>(res);
  }
}

export const adminOrderService = new AdminOrderService();

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<AdminOrder[], void>({
      query: () => ({
        url: '/admin/orders',
        method: 'GET',
      }),
      providesTags: (result) => {
        if (!Array.isArray(result)) return [{ type: 'Order', id: 'LIST' }];
        return [
          ...result.map((item) => ({ type: 'Order' as const, id: item.id })),
          { type: 'Order', id: 'LIST' },
        ];
      },
    }),
    updateOrderStatus: builder.mutation<
      AdminOrder,
      { id: string } & UpdateOrderStatusPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetOrdersQuery, useUpdateOrderStatusMutation } = orderApi;
export default adminOrderService;
