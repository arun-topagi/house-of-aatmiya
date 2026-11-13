'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useAppSelector,
  selectCartTotalItems,
  selectCartTotalPrice,
  selectLastAddedTimestamp,
} from '@/store';
import { Icon } from '@/elements';

export const FloatingCartPill: React.FC = () => {
  const totalItems = useAppSelector(selectCartTotalItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);
  const lastAdded = useAppSelector(selectLastAddedTimestamp);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (lastAdded) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [lastAdded]);

  if (totalItems === 0) return null;

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md transition-transform duration-300 ${
        isBouncing ? 'scale-105' : 'scale-100'
      }`}
    >
      <div className="bg-[#11131c]/90 backdrop-blur-2xl text-on-surface rounded-2xl p-3 sm:p-3.5 px-3.5 sm:px-5 shadow-[0_24px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] flex items-center justify-between border border-white/[0.12]">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1a1d2b] border border-white/[0.08] flex items-center justify-center relative shadow-inner shrink-0">
            <Icon name="shopping_bag" className="text-primary" />
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] sm:text-[10px] font-mono font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.06em] sm:tracking-[0.16em] text-on-surface-variant whitespace-nowrap">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in Bag
            </p>
            <p className="font-mono text-sm sm:text-base font-bold text-on-surface whitespace-nowrap">
              ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <Link
          href="/checkout"
          className="bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] hover:brightness-105 font-label-md text-xs sm:text-label-md font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_18px_rgba(229,194,128,0.22)] transition-all active:scale-95 whitespace-nowrap"
        >
          <span>View Bag</span>
          <Icon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
    </div>
  );
};
