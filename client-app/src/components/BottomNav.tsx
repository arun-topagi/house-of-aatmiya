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
    'flex flex-col items-center justify-center px-2.5 sm:px-4 py-1 text-on-surface-variant hover:text-primary transition-colors';
  const activeTabStyle =
    'flex flex-col items-center justify-center bg-primary-fixed text-on-primary-fixed rounded-xl px-2.5 sm:px-4 py-1 transition-all scale-95';

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-16 bg-surface/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(27,42,74,0.06)] border-t border-outline-variant/25"
    >
      <Link
        href="/"
        onClick={() => dispatch(setStorefrontMode('ALL'))}
        className={isAllActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="home" filled={isAllActive} className="text-[22px]" />
        <span className="font-label-sm text-[11px] font-semibold mt-0.5">
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
        <span className="font-label-sm text-[11px] font-semibold mt-0.5">
          Boutique
        </span>
      </Link>

      <Link
        href="/foods"
        onClick={() => dispatch(setStorefrontMode('FOODS_ONLY'))}
        className={isFoodsActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="nutrition" filled={isFoodsActive} className="text-[22px]" />
        <span className="font-label-sm text-[11px] font-semibold mt-0.5">
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
        <span className="font-label-sm text-[11px] font-semibold mt-0.5">
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
          <span className="font-label-sm text-[11px] font-semibold mt-0.5">
            Orders
          </span>
        </Link>
      )}

      <Link
        href="/profile"
        className={isProfileActive ? activeTabStyle : baseTabStyle}
      >
        <Icon name="person" filled={isProfileActive} className="text-[22px]" />
        <span className="font-label-sm text-[11px] font-semibold mt-0.5">
          Profile
        </span>
      </Link>
    </nav>
  );
};
