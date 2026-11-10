"use client";

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store';

export const FloatingCartPill: React.FC = () => {
  const items = useAppSelector((s) => s.cart.items);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href="/checkout"
        className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#1b2a4a] hover:bg-[#283d6b] text-white shadow-xl border border-white/15 transition-transform hover:scale-105"
      >
        <div className="text-left">
          <div className="text-[11px] uppercase tracking-wider text-amber-200 font-semibold">
            {totalCount} {totalCount === 1 ? 'Item' : 'Items'} • ₹{totalAmount}
          </div>
          <div className="text-xs sm:text-sm font-bold">
            Proceed to WhatsApp OTP Checkout →
          </div>
        </div>
      </Link>
    </div>
  );
};
