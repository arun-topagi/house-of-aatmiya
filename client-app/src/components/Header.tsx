"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  StorefrontMode,
  setStorefrontMode,
  syncStoreSettings,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { fetchStoreSettings } from '@/services/api';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { activeMode, allowModeSwitching, nextFoodBatchLabel } = useAppSelector(
    (s) => s.app,
  );
  const cartItems = useAppSelector((s) => s.cart.items);
  const { isAuthenticated, user } = useAppSelector((s) => s.userAuth);

  const totalBagCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetchStoreSettings().then((settings) => {
      if (settings) {
        dispatch(syncStoreSettings(settings));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (pathname === '/boutique') {
      dispatch(setStorefrontMode('DRESS_AND_GIFTS'));
    } else if (pathname === '/foods') {
      dispatch(setStorefrontMode('FOODS_ONLY'));
    } else if (pathname === '/') {
      dispatch(setStorefrontMode('ALL'));
    }
  }, [pathname, dispatch]);

  const handleSelectMode = (mode: StorefrontMode, route: string) => {
    dispatch(setStorefrontMode(mode));
    router.push(route);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e5dccb]">
      {/* Top announcement & Fresh Batch bar */}
      <div className="bg-[#1b2a4a] text-[#faf7f2] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium tracking-wide">
            ✦ Crafted like family by Arun & Snehal • Inspired by Saharsha & Sreeja
          </span>
          <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            🥣 {nextFoodBatchLabel}
          </span>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo + Four-Dot Family Motif */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            {/* Four-Dot Motif for Family of Four */}
            <div
              className="grid grid-cols-2 gap-1 p-1.5 rounded-lg bg-[#1b2a4a]/5 border border-[#1b2a4a]/15"
              title="Four-dot motif representing Arun, Snehal, Saharsha & Sreeja"
            >
              <span className="w-2 h-2 rounded-full bg-[#1b2a4a]" />
              <span className="w-2 h-2 rounded-full bg-[#6b2d26]" />
              <span className="w-2 h-2 rounded-full bg-[#234d36]" />
              <span className="w-2 h-2 rounded-full bg-[#b8860b]" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.26em] text-[#6b2d26] font-semibold">
                The House of
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2a4a]">
                Aatmiya
              </span>
            </div>
          </Link>

          {/* Mobile Cart & Verified Phone Pill */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/checkout"
              className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1b2a4a] text-white text-xs font-semibold shadow-xs"
            >
              <span>Bag ({totalBagCount})</span>
            </Link>
          </div>
        </div>

        {/* 3-Mode Storefront Switcher */}
        {allowModeSwitching && (
          <nav
            aria-label="Storefront Experience Modes"
            className="flex items-center bg-[#f3ede2] p-1 rounded-full border border-[#e5dccb] self-start md:self-auto overflow-x-auto max-w-full"
          >
            <button
              type="button"
              onClick={() => handleSelectMode('ALL', '/')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === 'ALL' && pathname === '/'
                  ? 'bg-[#1b2a4a] text-white shadow-xs'
                  : 'text-[#57534e] hover:text-[#1b2a4a]'
              }`}
            >
              1. All Categories
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('DRESS_AND_GIFTS', '/boutique')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === 'DRESS_AND_GIFTS' || pathname === '/boutique'
                  ? 'bg-[#6b2d26] text-white shadow-xs'
                  : 'text-[#57534e] hover:text-[#6b2d26]'
              }`}
            >
              2. Dresses & Gifts
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode('FOODS_ONLY', '/foods')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMode === 'FOODS_ONLY' || pathname === '/foods'
                  ? 'bg-[#234d36] text-white shadow-xs'
                  : 'text-[#57534e] hover:text-[#234d36]'
              }`}
            >
              3. Pure Foods Only
            </button>
          </nav>
        )}

        {/* Right Actions: Verified Status + Mobile Confirm Link + Checkout Bag */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="px-3 py-1.5 rounded-full bg-[#234d36]/10 border border-[#234d36]/25 text-[#234d36] text-xs font-semibold flex items-center gap-1.5">
              <span>✅ +91 {user.phone}</span>
            </div>
          ) : (
            <Link
              href="/checkout"
              className="text-xs font-semibold text-[#1b2a4a] hover:underline"
            >
              WhatsApp OTP Login
            </Link>
          )}

          <Link
            href="/confirm-address"
            className="px-3 py-1.5 rounded-full border border-[#e5dccb] bg-white text-[#1b2a4a] text-xs font-semibold hover:bg-[#f3ede2] transition"
          >
            📍 Confirm GPS Address
          </Link>

          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b2a4a] hover:bg-[#283d6b] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <span>Concierge Bag</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {totalBagCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
