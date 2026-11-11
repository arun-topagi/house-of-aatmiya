'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useAppDispatch,
  useAppSelector,
  setStorefrontMode,
  StorefrontMode,
  selectCartTotalItems,
} from '@/store';
import { Icon, Badge } from '@/elements';

export interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const MODE_OPTIONS: {
  id: StorefrontMode;
  label: string;
  shortLabel: string;
  href: string;
  icon: string;
}[] = [
  {
    id: 'ALL',
    label: 'All Curations',
    shortLabel: 'All',
    href: '/',
    icon: 'auto_awesome',
  },
  {
    id: 'DRESS_AND_GIFTS',
    label: 'Dresses & Gifts',
    shortLabel: 'Boutique',
    href: '/boutique',
    icon: 'checkroom',
  },
  {
    id: 'FOODS_ONLY',
    label: 'Pure Foods',
    shortLabel: 'Foods',
    href: '/foods',
    icon: 'nutrition',
  },
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { activeMode, allowModeSwitching } = useAppSelector((s) => s.app);
  const totalCartItems = useAppSelector(selectCartTotalItems);
  const { isAuthenticated, user } = useAppSelector((s) => s.userAuth);
  const [localSearch, setLocalSearch] = React.useState(searchQuery ?? '');

  React.useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSearchChange && localSearch.trim()) {
      router.push(`/products?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleModeSelect = (mode: StorefrontMode, href: string) => {
    dispatch(setStorefrontMode(mode));
    if (
      pathname === '/checkout' ||
      pathname === '/orders' ||
      pathname === '/profile' ||
      pathname?.startsWith('/products/')
    ) {
      router.push(href);
    } else if (
      pathname === '/' ||
      pathname === '/boutique' ||
      pathname === '/foods'
    ) {
      router.push(href);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-sm border-b border-outline-variant/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 sm:h-20 gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => dispatch(setStorefrontMode('ALL'))}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex flex-col items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FAF7F2]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
              </div>
            </div>
            <div>
              <span className="font-headline-md text-lg sm:text-xl font-bold text-primary tracking-tight block leading-none">
                The House of Aatmiya
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-secondary font-semibold block mt-1">
                Crafted Like Family
              </span>
            </div>
          </Link>
        </div>

        {/* Center: 3-Mode Storefront Switcher Pills (Desktop) + Search */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center justify-center gap-3">
          {allowModeSwitching && (
            <nav
              aria-label="Storefront Experience Modes"
              className="flex items-center bg-surface-container-low p-1 rounded-full border border-outline-variant/30 shrink-0"
            >
              {MODE_OPTIONS.map((m) => {
                const isSelected = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeSelect(m.id, m.href)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? m.id === 'FOODS_ONLY'
                          ? 'bg-tertiary text-on-tertiary shadow-xs'
                          : m.id === 'DRESS_AND_GIFTS'
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon name={m.icon} className="text-[16px]" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
            <Icon
              name="search"
              className="text-on-surface-variant text-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search cotton dresses, ragi cookies..."
              className="w-full bg-surface-container-low hover:bg-surface-container focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-sm text-body-sm pl-10 pr-8 py-2 rounded-full border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => handleSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="Clear search"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}
          </form>
        </div>

        {/* Right: Catalog Link + Cart + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/products"
            className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-label-md font-label-md transition-colors ${
              pathname === '/products'
                ? 'bg-primary-fixed text-on-primary-fixed'
                : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
            }`}
          >
            <Icon name="grid_view" className="text-[18px]" />
            <span>Catalog</span>
          </Link>

          <Link
            href="/checkout"
            aria-label="Shopping Bag"
            className="relative p-2.5 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <Icon name="shopping_bag" className="text-primary" />
            {totalCartItems > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px]"
              >
                {totalCartItems}
              </Badge>
            )}
          </Link>

          <Link
            href="/profile"
            aria-label={
              isAuthenticated
                ? `Profile (${user.name || user.phone})`
                : 'Sign In / Profile'
            }
            title={
              isAuthenticated
                ? `${user.name || 'Verified Member'} (+91 ${user.phone})`
                : 'WhatsApp OTP Login'
            }
            className={`relative p-2.5 rounded-full transition-colors flex items-center justify-center ${
              isAuthenticated
                ? 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim'
                : 'bg-surface-container-low hover:bg-surface-container text-primary'
            }`}
          >
            <Icon
              name={isAuthenticated ? 'verified_user' : 'person'}
              className="text-primary"
              filled={isAuthenticated}
            />
            {isAuthenticated && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-surface absolute bottom-0 right-0" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
