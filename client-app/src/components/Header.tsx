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
    <header className="fixed top-0 w-full z-50 bg-[#090a0f]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 sm:h-20 gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => dispatch(setStorefrontMode('ALL'))}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1a1d2b] to-[#0e1018] border border-white/[0.12] flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_18px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f5f5f7]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c280]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d96b78]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>
            </div>
            <div>
              <span className="font-headline-md text-base sm:text-xl font-bold text-on-surface tracking-tight block leading-none whitespace-nowrap">
                The House of Aatmiya
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.22em] text-primary font-semibold block mt-1 whitespace-nowrap">
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
              className="flex items-center bg-[#11131c] p-1 rounded-full border border-white/[0.08] shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] shrink-0"
            >
              {MODE_OPTIONS.map((m) => {
                const isSelected = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeSelect(m.id, m.href)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? m.id === 'FOODS_ONLY'
                          ? 'bg-tertiary text-on-tertiary shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                          : m.id === 'DRESS_AND_GIFTS'
                            ? 'bg-secondary text-on-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                            : 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
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
              className="w-full bg-[#11131c] hover:bg-[#151824] focus:bg-[#171a27] text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-10 pr-8 py-2 rounded-full border border-white/[0.08] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
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
            className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-label-md font-label-md border transition-all ${
              pathname === '/products'
                ? 'bg-primary/15 text-primary border-primary/35'
                : 'bg-[#11131c] hover:bg-[#181b28] text-on-surface border-white/[0.08]'
            }`}
          >
            <Icon name="grid_view" className="text-[18px]" />
            <span>Catalog</span>
          </Link>

          <Link
            href="/checkout"
            aria-label="Shopping Bag"
            className="relative p-2.5 rounded-full bg-[#11131c] hover:bg-[#181b28] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all flex items-center justify-center active:scale-95"
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
            className={`relative p-2.5 rounded-full border transition-all flex items-center justify-center active:scale-95 ${
              isAuthenticated
                ? 'bg-primary/15 text-primary border-primary/35 hover:bg-primary/25'
                : 'bg-[#11131c] hover:bg-[#181b28] text-primary border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
            }`}
          >
            <Icon
              name={isAuthenticated ? 'verified_user' : 'person'}
              className="text-primary"
              filled={isAuthenticated}
            />
            {isAuthenticated && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090a0f] absolute bottom-0 right-0" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
