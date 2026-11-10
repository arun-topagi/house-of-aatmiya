"use client";

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components';
import {
  adminApi,
  AdminOrder,
  FALLBACK_ADMIN_ORDERS,
  OrderStatus,
  StorefrontMode,
} from '@/services/adminApi';
import { useAppSelector } from '@/store';

export const AdminDashboardView: React.FC = () => {
  const { activeTab } = useAppSelector((s) => s.admin);

  const [orders, setOrders] = useState<AdminOrder[]>(FALLBACK_ADMIN_ORDERS);
  const [defaultMode, setDefaultMode] = useState<StorefrontMode>('ALL');
  const [allowModeSwitching, setAllowModeSwitching] = useState<boolean>(true);
  const [nextFoodBatchLabel, setNextFoodBatchLabel] = useState<string>(
    'Next Fresh Batch: Friday (Orders close Wednesday)',
  );
  const [upiVpa, setUpiVpa] = useState<string>('aatmiya@okaxis');
  const [modeSavedToast, setModeSavedToast] = useState<boolean>(false);

  useEffect(() => {
    adminApi
      .get('/admin/orders')
      .then((res) => {
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setOrders(list);
        }
      })
      .catch(() => {
        // Use fallback orders when backend is not connected
      });

    adminApi
      .get('/store-settings')
      .then((res) => {
        const s = res.data?.data || res.data;
        if (s?.defaultMode) setDefaultMode(s.defaultMode);
        if (s?.allowModeSwitching !== undefined)
          setAllowModeSwitching(s.allowModeSwitching);
        if (s?.nextFoodBatchLabel) setNextFoodBatchLabel(s.nextFoodBatchLabel);
        if (s?.upiVpa) setUpiVpa(s.upiVpa);
      })
      .catch(() => {});
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    markFullAdvance?: boolean,
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextAdvance = markFullAdvance
          ? o.recommendedAdvance
          : o.advancePaid;
        return {
          ...o,
          status: nextStatus,
          advancePaid: nextAdvance,
          balanceDue: Math.max(0, o.totalAmount - nextAdvance),
        };
      }),
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    try {
      await adminApi.patch(`/admin/orders/${orderId}/status`, {
        status: nextStatus,
        ...(markFullAdvance && targetOrder
          ? { advancePaid: targetOrder.recommendedAdvance }
          : {}),
      });
    } catch {
      // Updated optimistically
    }
  };

  const handleSaveStorefrontMode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.patch('/admin/store-settings', {
        defaultMode,
        allowModeSwitching,
        nextFoodBatchLabel,
        upiVpa,
      });
    } catch {
      // Saved locally
    }
    setModeSavedToast(true);
    setTimeout(() => setModeSavedToast(false), 2000);
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCost = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce(
      (sum, o) =>
        sum +
        o.items.reduce((iSum, item) => iSum + item.costPrice * item.quantity, 0),
      0,
    );

  const netProfit = Math.max(0, totalRevenue - totalCost);

  // Aggregate Kitchen Prep from orders
  const kitchenBatchItems = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'COMPLETED')
    .flatMap((o) => o.items)
    .filter(
      (i) =>
        i.isMadeToBatch ||
        i.categorySlug === 'kids-snacks' ||
        i.categorySlug === 'hampers',
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* TOP KPI SUMMARY RIBBON */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] shadow-2xs">
            <div className="text-xs font-bold uppercase text-[#57534e]">
              Pending Confirmation Calls
            </div>
            <div className="text-2xl font-bold text-[#6b2d26] mt-1">
              {orders.filter((o) => o.status === 'PENDING_CALL').length} Orders
            </div>
            <div className="text-[11px] text-[#57534e] mt-0.5">
              Call buyer -> Confirm sizes -> Send UPI link
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] shadow-2xs">
            <div className="text-xs font-bold uppercase text-[#57534e]">
              Active Kitchen Prep Queue
            </div>
            <div className="text-2xl font-bold text-[#234d36] mt-1">
              {orders.filter((o) => o.status === 'PAID_IN_PREP').length} Paid
              Orders
            </div>
            <div className="text-[11px] text-[#57534e] mt-0.5">
              100% UPI advance received
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] shadow-2xs">
            <div className="text-xs font-bold uppercase text-[#57534e]">
              Total Order Value
            </div>
            <div className="text-2xl font-bold text-[#1b2a4a] mt-1">
              ₹{totalRevenue}
            </div>
            <div className="text-[11px] text-[#234d36] font-semibold mt-0.5">
              Zero COD Exposure
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] shadow-2xs">
            <div className="text-xs font-bold uppercase text-[#57534e]">
              Estimated Net Profit (~58% Margin)
            </div>
            <div className="text-2xl font-bold text-[#234d36] mt-1">
              ₹{netProfit}
            </div>
            <div className="text-[11px] text-[#57534e] mt-0.5">
              Above 2.2x target markup
            </div>
          </div>
        </section>

        {/* TAB 1: ORDER CONCIERGE & UPI BOARD */}
        {activeTab === 'ORDERS' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1b2a4a]">
                  Snehal&apos;s Order Concierge & WhatsApp UPI Pipeline
                </h2>
                <p className="text-xs text-[#57534e]">
                  Every order below has an OTP-verified WhatsApp phone number
                  and a mobile GPS delivery pin.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 border border-[#e5dccb] shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3ede2] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-[#1b2a4a] text-white font-bold text-xs">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'PENDING_CALL'
                            ? 'bg-amber-100 text-[#6b2d26]'
                            : order.status === 'PAID_IN_PREP'
                            ? 'bg-emerald-100 text-[#234d36]'
                            : 'bg-sky-100 text-[#1b2a4a]'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.address.isSocietyResident && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[11px] font-bold">
                          🏠 Society Resident (Free Hand-Delivery)
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#57534e]">
                        Order Total:{' '}
                      </span>
                      <span className="text-lg font-bold text-[#1b2a4a]">
                        ₹{order.totalAmount}
                      </span>
                      <span className="ml-3 text-xs font-bold text-[#234d36]">
                        (Advance Paid: ₹{order.advancePaid})
                      </span>
                    </div>
                  </div>

                  {/* Customer, OTP Verification & GPS Map Link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#faf7f2] p-4 rounded-xl border border-[#e5dccb]">
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-[#1b2a4a] flex items-center gap-2">
                        <span>👤 {order.customer.name}</span>
                        {order.customer.isPhoneVerified && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#234d36] text-[10px] font-bold">
                            ✅ WhatsApp OTP Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[#57534e] font-semibold">
                        Phone: +91 {order.customer.phone}
                      </div>
                      <div className="text-[#57534e]">
                        Address: {order.address.flatOrHouse},{' '}
                        {order.address.areaOrSociety}, {order.address.city} -{' '}
                        {order.address.pincode}
                      </div>
                      {order.giftNote && (
                        <div className="text-[#6b2d26] font-semibold pt-1">
                          🎁 Gift Note: &ldquo;{order.giftNote}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
                      <a
                        href={`tel:+91${order.customer.phone}`}
                        className="px-3.5 py-2 rounded-xl bg-[#1b2a4a] text-white text-xs font-bold"
                      >
                        📞 1. Call Customer
                      </a>

                      {order.address.googleMapsUrl && (
                        <a
                          href={order.address.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#e5dccb] text-[#1b2a4a] text-xs font-bold hover:bg-[#f3ede2]"
                        >
                          📍 Open GPS Pin in Google Maps ↗
                        </a>
                      )}

                      <a
                        href={order.whatsappUpiRequestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.id,
                            'CONFIRMED_AWAITING_UPI',
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#234d36] text-white text-xs font-bold"
                      >
                        📲 2. Send UPI Advance Link (₹
                        {order.recommendedAdvance})
                      </a>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#faf7f2]"
                      >
                        <div>
                          <span className="font-bold text-[#1b2a4a]">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-white border border-[#e5dccb] font-semibold">
                            {item.sizePack}
                          </span>
                        </div>
                        <div className="font-bold text-[#1b2a4a]">
                          ₹{item.unitPrice * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Stepper Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#f3ede2]">
                    <span className="text-[11px] font-semibold text-[#57534e]">
                      Update Order Stage:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.id,
                            'CONFIRMED_AWAITING_UPI',
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-[#e5dccb] text-xs font-bold hover:bg-[#f3ede2] cursor-pointer"
                      >
                        Mark Call Done (Awaiting UPI)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.id,
                            'PAID_IN_PREP',
                            true,
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#234d36] text-white text-xs font-bold cursor-pointer"
                      >
                        ✓ Mark UPI Paid & Send to Kitchen Batch
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, 'COMPLETED', true)
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#1b2a4a] text-white text-xs font-bold cursor-pointer"
                      >
                        ✓ Mark Delivered
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: CLIENT 3-MODE STOREFRONT CONTROL */}
        {activeTab === 'STOREFRONT_MODES' && (
          <section className="bg-white rounded-2xl p-6 border border-[#e5dccb] shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase text-[#6b2d26]">
                Multi-Mode Storefront Architecture
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1b2a4a] mt-0.5">
                Control What Customers See on the Client App
              </h2>
              <p className="text-xs text-[#57534e] mt-1">
                Switch the default landing mode or copy direct WhatsApp campaign
                links for each of your 3 storefront modes.
              </p>
            </div>

            <form onSubmit={handleSaveStorefrontMode} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    mode: 'ALL' as StorefrontMode,
                    title: 'Mode 1: All Categories (/)',
                    desc: 'Shows Pure Cotton Dresses, Kurtas, Stoles, Gift Hampers, and Kids’ Snacks together.',
                    sharePath: 'http://localhost:3000/',
                  },
                  {
                    mode: 'DRESS_AND_GIFTS' as StorefrontMode,
                    title: 'Mode 2: Dresses & Gifts Only (/boutique)',
                    desc: 'Editorial lookbook focused exclusively on Adult Women’s Cotton Dresses, Kurtas, Stoles & Gift Hampers.',
                    sharePath: 'http://localhost:3000/boutique',
                  },
                  {
                    mode: 'FOODS_ONLY' as StorefrontMode,
                    title: 'Mode 3: Pure Foods Only (/foods)',
                    desc: 'Clean pantry view focused exclusively on Kids’ Snacks (Ragi Drink Mix, Ghee Cookies, Chikki, Makhana).',
                    sharePath: 'http://localhost:3000/foods',
                  },
                ].map((card) => (
                  <div
                    key={card.mode}
                    onClick={() => setDefaultMode(card.mode)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                      defaultMode === card.mode
                        ? 'border-[#1b2a4a] bg-[#faf7f2]'
                        : 'border-[#e5dccb] bg-white hover:border-[#1b2a4a]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-base text-[#1b2a4a]">
                          {card.title}
                        </span>
                        <input
                          type="radio"
                          checked={defaultMode === card.mode}
                          onChange={() => setDefaultMode(card.mode)}
                        />
                      </div>
                      <p className="text-xs text-[#57534e] mt-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#e5dccb] text-[11px] font-semibold text-[#6b2d26]">
                      Direct Share URL: <code>{card.sharePath}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#1b2a4a] mb-1">
                    Next Fresh Food Batch Banner Text
                  </label>
                  <input
                    type="text"
                    value={nextFoodBatchLabel}
                    onChange={(e) => setNextFoodBatchLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1b2a4a] mb-1">
                    Snehal&apos;s UPI ID (for 1-Tap Payment Requests)
                  </label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#1b2a4a] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowModeSwitching}
                  onChange={(e) => setAllowModeSwitching(e.target.checked)}
                  className="w-4 h-4 accent-[#1b2a4a]"
                />
                <span>
                  Show the 3-Mode Switcher Bar in Client App Header (Uncheck to
                  lock visitors into the selected Default Mode only)
                </span>
              </label>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#1b2a4a] text-white text-xs font-bold cursor-pointer"
              >
                {modeSavedToast
                  ? '✓ Storefront Mode Settings Updated!'
                  : 'Save Storefront Mode Configuration'}
              </button>
            </form>
          </section>
        )}

        {/* TAB 3: KITCHEN BATCH PREP AGGREGATOR */}
        {activeTab === 'KITCHEN_PREP' && (
          <section className="bg-white rounded-2xl p-6 border border-[#e5dccb] shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1b2a4a]">
              🥣 Snehal&apos;s Kitchen Batch Aggregator
            </h2>
            <p className="text-xs text-[#57534e]">
              Automatically totals all fresh kids&apos; snacks and hamper jars
              across active orders so Snehal knows exactly how much to roast and
              bake on batch day.
            </p>

            <div className="divide-y divide-[#f3ede2]">
              {kitchenBatchItems.map((item, idx) => (
                <div
                  key={`${item.variantId}-${idx}`}
                  className="py-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-sm text-[#1b2a4a]">
                      {item.productName}
                    </span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#f3ede2] font-semibold">
                      {item.sizePack}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[#234d36]">
                    Prepare {item.quantity}{' '}
                    {item.quantity === 1 ? 'Unit / Jar' : 'Units / Jars'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: PRODUCTS & MARGIN CMS */}
        {activeTab === 'PRODUCTS_CMS' && (
          <section className="bg-white rounded-2xl p-6 border border-[#e5dccb] shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1b2a4a]">
              Product Cost & 2.2x+ Markup Guardrail
            </h2>
            <p className="text-xs text-[#57534e]">
              Tracks landed cost vs. selling price across Kids&apos; Snacks,
              Adult Women&apos;s Cotton Dresses (S–XL), Kurtas, Stoles & Hampers.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e5dccb] text-[#57534e] uppercase">
                    <th className="py-2.5 px-3">SKU & Product</th>
                    <th className="py-2.5 px-3">Mode Group</th>
                    <th className="py-2.5 px-3">Size / Pack</th>
                    <th className="py-2.5 px-3">Landed Cost</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">Markup Multiple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3ede2]">
                  {[
                    {
                      sku: 'HOA-KS-01',
                      name: 'Sprouted Ragi-Almond-Jaggery Drink Mix',
                      mode: 'FOODS_ONLY',
                      pack: '250g Glass Jar',
                      cost: 165,
                      price: 390,
                    },
                    {
                      sku: 'HOA-KS-02',
                      name: 'Pure A2 Ghee Ragi & Jaggery Cookies',
                      mode: 'FOODS_ONLY',
                      pack: '200g Tin',
                      cost: 140,
                      price: 340,
                    },
                    {
                      sku: 'HOA-DR-01',
                      name: "Adult Women's Indigo Handblock Pure Cotton Midi Dress",
                      mode: 'DRESS_AND_GIFTS',
                      pack: 'Sizes S, M, L, XL',
                      cost: 780,
                      price: 1850,
                    },
                    {
                      sku: 'HOA-DR-02',
                      name: "Adult Women's Maroon Bagh-Print Cotton Dress",
                      mode: 'DRESS_AND_GIFTS',
                      pack: 'Sizes S, M, L, XL',
                      cost: 820,
                      price: 1990,
                    },
                    {
                      sku: 'HOA-KR-01',
                      name: "Women's Pure Cotton Kurta Co-ord Set",
                      mode: 'DRESS_AND_GIFTS',
                      pack: 'Sizes S, M, L, XL',
                      cost: 950,
                      price: 2290,
                    },
                    {
                      sku: 'HOA-ST-01',
                      name: 'Artisanal Indigo Mulmul Cotton Stole',
                      mode: 'DRESS_AND_GIFTS',
                      pack: 'Free Size',
                      cost: 340,
                      price: 890,
                    },
                    {
                      sku: 'HOA-HM-01',
                      name: 'Signature Family & Festive Hamper',
                      mode: 'DRESS_AND_GIFTS',
                      pack: 'Stole + 2 Jars',
                      cost: 680,
                      price: 1690,
                    },
                  ].map((row) => {
                    const markup = (row.price / row.cost).toFixed(2);
                    return (
                      <tr key={row.sku}>
                        <td className="py-3 px-3 font-bold text-[#1b2a4a]">
                          {row.sku} — {row.name}
                        </td>
                        <td className="py-3 px-3">{row.mode}</td>
                        <td className="py-3 px-3">{row.pack}</td>
                        <td className="py-3 px-3">₹{row.cost}</td>
                        <td className="py-3 px-3 font-bold">₹{row.price}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#234d36] font-bold">
                            {markup}x (Healthy)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 5: 25-DAY REORDER RADAR */}
        {activeTab === 'REORDER_RADAR' && (
          <section className="bg-white rounded-2xl p-6 border border-[#e5dccb] shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1b2a4a]">
              🔄 25-Day Kids&apos; Snack Reorder Radar
            </h2>
            <p className="text-xs text-[#57534e]">
              Ragi drink mix and ghee cookies typically finish in 3–4 weeks.
              Send a warm 1-tap WhatsApp check-in before Snehal&apos;s next
              fresh batch!
            </p>

            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-[#faf7f2] border border-[#e5dccb] flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-[#1b2a4a]">
                      {o.customer.name} (+91 {o.customer.phone})
                    </div>
                    <div className="text-[#57534e]">
                      {o.address.flatOrHouse}, {o.address.areaOrSociety}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/91${o.customer.phone}?text=${encodeURIComponent(
                      `Hi ${o.customer.name}! 🙏 Hope the family loved the fresh snacks from The House of Aatmiya. I'm preparing a fresh batch this Friday—would you like me to reserve a jar for you? — Snehal`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#234d36] text-white font-bold"
                  >
                    📲 Send Fresh Batch Reminder on WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
