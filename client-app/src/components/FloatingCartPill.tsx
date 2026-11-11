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
      <div className="bg-primary text-on-primary rounded-2xl p-3.5 px-5 shadow-xl flex items-center justify-between border border-primary-fixed/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center relative">
            <Icon name="shopping_bag" className="text-primary-fixed" />
            <span className="absolute -top-1.5 -right-1.5 bg-secondary text-on-secondary text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          </div>
          <div>
            <p className="text-label-sm font-label-sm text-primary-fixed/85">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in Bag
            </p>
            <p className="font-headline-sm text-base font-bold text-on-primary font-mono">
              ₹{totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <Link
          href="/checkout"
          className="bg-secondary-container text-on-secondary-container hover:opacity-95 font-label-md text-label-md px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <span>View Bag</span>
          <Icon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
    </div>
  );
};
