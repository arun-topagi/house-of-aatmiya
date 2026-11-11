'use client';

import React, { useEffect, useState } from 'react';
import { AdminOrder, OrderStatus } from '@/services';

export interface OrderFlyoutProps {
  isOpen: boolean;
  order: AdminOrder | null;
  onClose: () => void;
  onSaveOrder: (
    orderId: string,
    nextStatus: OrderStatus,
    advancePaid: number,
    adminNotes: string,
  ) => Promise<void>;
}

export const OrderFlyout: React.FC<OrderFlyoutProps> = ({
  isOpen,
  order,
  onClose,
  onSaveOrder,
}) => {
  const [localStatus, setLocalStatus] = useState<OrderStatus>('PENDING_CALL');
  const [localAdvancePaid, setLocalAdvancePaid] = useState<string>('0');
  const [localAdminNotes, setLocalAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setLocalStatus(order.status);
      setLocalAdvancePaid(String(order.advancePaid ?? 0));
      setLocalAdminNotes(order.adminNotes || '');
    }
  }, [order]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !order) {
    return null;
  }

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onSaveOrder(
        order.id,
        localStatus,
        Number(localAdvancePaid) || 0,
        localAdminNotes,
      );
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const isProcessingStage =
    localStatus === 'PENDING_CALL' ||
    localStatus === 'CONFIRMED_AWAITING_UPI';
  const isPrepStage =
    localStatus === 'PAID_IN_PREP' || localStatus === 'READY_FOR_DISPATCH';
  const isCompletedStage = localStatus === 'COMPLETED';
  const isCancelledStage = localStatus === 'CANCELLED';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out translate-x-0">
        {/* Drawer Header */}
        <div className="h-16 px-6 bg-slate-50 flex items-center justify-between shadow-xs shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <h2 className="font-headline-sm text-lg font-semibold text-emerald-800 tracking-tight font-mono">
              #{order.orderNumber}
            </h2>
            {order.status === 'COMPLETED' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                Completed
              </span>
            ) : order.status === 'CANCELLED' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 tracking-wide uppercase">
                Cancelled
              </span>
            ) : order.status === 'PAID_IN_PREP' ||
              order.status === 'READY_FOR_DISPATCH' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                Paid (In Prep)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 tracking-wide uppercase">
                {order.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-slate-50/50">
          {/* Live Status Lifecycle Stepper */}
          <div className="bg-slate-100 p-4 rounded-xl flex flex-col gap-2.5 border border-slate-200">
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
              Fulfillment Lifecycle
            </span>
            <div className="grid grid-cols-4 gap-2 text-center pt-1 text-xs">
              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] mb-1 font-bold shadow-xs ${
                    isProcessingStage || isPrepStage || isCompletedStage
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    call
                  </span>
                </span>
                <span
                  className={
                    isProcessingStage
                      ? 'text-amber-800 font-bold'
                      : 'text-slate-500 font-medium'
                  }
                >
                  Call &amp; UPI
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] mb-1 font-bold shadow-xs ${
                    isPrepStage || isCompletedStage
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    soup_kitchen
                  </span>
                </span>
                <span
                  className={
                    isPrepStage
                      ? 'text-emerald-800 font-bold'
                      : 'text-slate-500 font-medium'
                  }
                >
                  Kitchen Prep
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] mb-1 font-bold shadow-xs ${
                    isCompletedStage
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                </span>
                <span
                  className={
                    isCompletedStage
                      ? 'text-emerald-800 font-bold'
                      : 'text-slate-500 font-medium'
                  }
                >
                  Completed
                </span>
              </div>

              <div
                className={`flex flex-col items-center ${
                  isCancelledStage ? '' : 'opacity-40'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] mb-1 font-bold shadow-xs ${
                    isCancelledStage
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    cancel
                  </span>
                </span>
                <span
                  className={
                    isCancelledStage
                      ? 'text-rose-800 font-bold'
                      : 'text-slate-500 font-medium'
                  }
                >
                  Cancelled
                </span>
              </div>
            </div>
          </div>

          {/* Operational Status & Advance Transition Form */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col gap-3.5">
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
              Operational Status Transition
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Update Fulfillment Stage
              </label>
              <div className="relative">
                <select
                  value={localStatus}
                  onChange={(e) => {
                    const next = e.target.value as OrderStatus;
                    setLocalStatus(next);
                    if (
                      next === 'PAID_IN_PREP' ||
                      next === 'READY_FOR_DISPATCH' ||
                      next === 'COMPLETED'
                    ) {
                      setLocalAdvancePaid(String(order.totalAmount));
                    }
                  }}
                  disabled={isUpdating}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium appearance-none cursor-pointer"
                >
                  <option value="PENDING_CALL">
                    Pending Call (Confirm Size &amp; Batch)
                  </option>
                  <option value="CONFIRMED_AWAITING_UPI">
                    Confirmed (Awaiting UPI Advance)
                  </option>
                  <option value="PAID_IN_PREP">
                    UPI Paid — In Kitchen Batch Prep
                  </option>
                  <option value="READY_FOR_DISPATCH">
                    Ready for Society / Courier Dispatch
                  </option>
                  <option value="COMPLETED">Completed (Delivered)</option>
                  <option value="CANCELLED">Cancelled / Refunded</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    UPI Advance Paid (₹)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalAdvancePaid(String(order.totalAmount))
                    }
                    className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Mark 100% Paid
                  </button>
                </div>
                <input
                  type="number"
                  value={localAdvancePaid}
                  onChange={(e) => setLocalAdvancePaid(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin / Fit Notes
                </label>
                <input
                  type="text"
                  value={localAdminNotes}
                  onChange={(e) => setLocalAdminNotes(e.target.value)}
                  placeholder="e.g. UPI received via GPay"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Customer, GPS & Concierge Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Customer &amp; Delivery Coordination
            </h3>
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  person
                </span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-sm text-slate-900">
                  {order.customer.name}
                </span>
                <span className="text-slate-600 font-mono mt-0.5">
                  +91 {order.customer.phone}
                </span>
                <span className="text-slate-600 mt-1">
                  {order.address.flatOrHouse}, {order.address.areaOrSociety},{' '}
                  {order.address.city} - {order.address.pincode}
                </span>
                {order.giftNote && (
                  <span className="text-emerald-800 font-medium mt-1">
                    Gift Note: &ldquo;{order.giftNote}&rdquo;
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:+91${order.customer.phone}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">
                  call
                </span>
                <span>Call Customer</span>
              </a>

              {order.address.googleMapsUrl && (
                <a
                  href={order.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-700">
                    my_location
                  </span>
                  <span>Open GPS Pin</span>
                </a>
              )}

              <a
                href={order.whatsappUpiRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">
                  send
                </span>
                <span>Send UPI Link (₹{order.recommendedAdvance})</span>
              </a>
            </div>
          </div>

          {/* Order Items & Billing Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Consignment Items ({order.items.length} SKUs)
              </span>
              <span className="font-mono text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        inventory_2
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-slate-900">
                        {item.productName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.sizePack} • ₹
                        {Number(item.unitPrice).toLocaleString('en-IN')} ×{' '}
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-xs text-slate-900">
                    ₹
                    {(Number(item.unitPrice) * item.quantity).toLocaleString(
                      'en-IN',
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Billing Summary */}
            <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-1.5 mt-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Order Total</span>
                <span className="font-mono">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Advance Paid</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ₹{Number(localAdvancePaid || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Mode</span>
                <span className="font-semibold text-emerald-700">
                  {order.address.isSocietyResident
                    ? 'FREE (Society Hand-Delivery)'
                    : 'Courier Delivery'}
                </span>
              </div>
              <div className="pt-2 flex justify-between text-slate-900 text-sm border-t border-slate-200 mt-1">
                <span className="font-bold">Balance Due</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹
                  {Math.max(
                    0,
                    Number(order.totalAmount) - Number(localAdvancePaid || 0),
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Action Footer */}
        <div className="p-4 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-slate-200 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isUpdating ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
            )}
            <span>{isUpdating ? 'Saving...' : 'Save Order'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default OrderFlyout;
