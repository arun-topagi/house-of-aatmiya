'use client';

import React, { useMemo, useState } from 'react';
import { AdminOrder } from '@/services';
import { Pagination } from '@/components/Pagination';

export interface OrdersTableProps {
  orders: AdminOrder[];
  orderIdSearch?: string;
  customerNameSearch?: string;
  phoneSearch?: string;
  status?: string;
  onEditOrder?: (order: AdminOrder) => void;
  className?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  orderIdSearch = '',
  customerNameSearch = '',
  phoneSearch = '',
  status = '',
  onEditOrder,
  className = '',
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filteredOrders = useMemo(() => {
    const idQ = orderIdSearch.trim().toLowerCase();
    const nameQ = customerNameSearch.trim().toLowerCase();
    const phoneQ = phoneSearch.trim().toLowerCase();

    return orders.filter((order) => {
      if (
        idQ &&
        !order.orderNumber.toLowerCase().includes(idQ) &&
        !order.id.toLowerCase().includes(idQ)
      ) {
        return false;
      }
      if (nameQ && !order.customer.name.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (phoneQ && !order.customer.phone.toLowerCase().includes(phoneQ)) {
        return false;
      }
      if (status && order.status !== status) {
        return false;
      }
      return true;
    });
  }, [orders, orderIdSearch, customerNameSearch, phoneSearch, status]);

  const totalCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, safePage, limit]);

  const renderStatusBadge = (orderStatus: AdminOrder['status']) => {
    if (orderStatus === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    }
    if (
      orderStatus === 'PAID_IN_PREP' ||
      orderStatus === 'READY_FOR_DISPATCH'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {orderStatus === 'PAID_IN_PREP'
            ? 'Paid (In Prep)'
            : 'Ready for Dispatch'}
        </span>
      );
    }
    if (orderStatus === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {orderStatus === 'PENDING_CALL'
          ? 'Pending Call'
          : 'Awaiting UPI'}
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className} relative`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Order ID &amp; Date
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Customer &amp; Location
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Phone Number
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[260px]"
              >
                Items &amp; Variants
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Order Value
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  No orders found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/75 transition-colors border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-semibold text-emerald-800">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">
                          {order.customer.name}
                        </span>
                        {order.address.isSocietyResident && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            Society
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {order.address.flatOrHouse},{' '}
                        {order.address.areaOrSociety}, {order.address.city}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-slate-900">
                        +91 {order.customer.phone}
                      </span>
                      {order.customer.isPhoneVerified && (
                        <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          WhatsApp OTP Verified
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs text-slate-700">
                          <span className="font-medium text-slate-900">
                            {item.productName}
                          </span>{' '}
                          <span className="text-slate-500">
                            ({item.sizePack})
                          </span>{' '}
                          <span className="font-mono font-semibold text-emerald-800">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                        Adv: ₹{Number(order.advancePaid).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle text-center">
                    {renderStatusBadge(order.status)}
                  </td>

                  <td className="px-6 py-4 align-middle text-right">
                    <button
                      type="button"
                      onClick={() => onEditOrder && onEditOrder(order)}
                      className="p-1.5 rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Edit Order"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        itemLabel="orders"
      />
    </div>
  );
};

export default OrdersTable;
