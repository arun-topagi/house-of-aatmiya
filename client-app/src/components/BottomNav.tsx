'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector, setStorefrontMode } from '@/store';
import { Icon } from '@/elements';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { activeMode } = useAppSelector((s) => s.app);
  const { isAuthenticated } = useAppSelector((s) => s.userAuth);

  const isHomeRoute =
    pathname === '/' || pathname === '/boutique' || pathname === '/foods';
  const isAllActive = isHomeRoute && activeMode === 'ALL' && pathname === '/';
  const isBoutiqueActive =
    pathname === '/boutique' ||
    (isHomeRoute && activeMode === 'DRESS_AND_GIFTS');
  const isFoodsActive =
    pathname === '/foods' || (isHomeRoute && activeMode === 'FOODS_ONLY');
  const isCatalogActive = pathname?.startsWith('/products') ?? false;
  const isOrdersActive = pathname?.startsWith('/orders') ?? false;
  const isProfileActive = pathname?.startsWith('/profile') ?? false;

  const baseTabStyle =
    'flex flex-col items-center justify-center px-1.5 sm:px-4 py-1 text-on-surface-variant hover:text-on-surface transition-all';
  const activeTabStyle =
    'flex flex-col items-center justify-center bg-primary/15 text-primary border border-primary/25 rounded-xl px-1.5 sm:px-4 py-1 transition-all shadow-[inset_0_1px_0_rgba(229,194,128,0.15)]';

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-16 bg-[#090a0f]/90 backdrop-blur-2xl shadow-[0_-12px_32px_rgba(0,0,0,0.65)] border-t border-white/[0.08]"
    >
      <Link
        href="/"
        onClick={() => dispatch(setStorefrontMode('ALL'))}
        className={isAllActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="home" filled={isAllActive} className="text-[22px]" />
        <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
          All
        </span>
      </Link>

      <Link
        href="/boutique"
        onClick={() => dispatch(setStorefrontMode('DRESS_AND_GIFTS'))}
        className={isBoutiqueActive ? activeTabStyle : baseTabStyle}
      >
        <Icon
          name="checkroom"
          filled={isBoutiqueActive}
          className="text-[22px]"
        />
        <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
          Boutique
        </span>
      </Link>

      <Link
        href="/foods"
        onClick={() => dispatch(setStorefrontMode('FOODS_ONLY'))}
        className={isFoodsActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="nutrition" filled={isFoodsActive} className="text-[22px]" />
        <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
          Pure Foods
        </span>
      </Link>

      <Link
        href="/products"
        className={isCatalogActive ? activeTabStyle : baseTabStyle}
      >
        <Icon
          name="grid_view"
          filled={isCatalogActive}
          className="text-[22px]"
        />
        <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
          Catalog
        </span>
      </Link>

      {isAuthenticated && (
        <Link
          href="/orders"
          className={isOrdersActive ? activeTabStyle : baseTabStyle}
        >
          <Icon
            name="receipt_long"
            filled={isOrdersActive}
            className="text-[22px]"
          />
          <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
            Orders
          </span>
        </Link>
      )}

      <Link
        href="/profile"
        className={isProfileActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="person" filled={isProfileActive} className="text-[22px]" />
        <span className="font-label-sm text-[9px] sm:text-[10px] tracking-tight sm:tracking-wide font-semibold mt-0.5 whitespace-nowrap">
          Profile
        </span>
      </Link>
    </nav>
  );
};
