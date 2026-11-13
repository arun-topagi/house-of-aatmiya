'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAppDispatch,
  useAppSelector,
  setStorefrontMode,
  StorefrontMode,
} from '@/store';
import {
  CatalogCategory,
  CatalogProduct,
  catalogService,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
} from '@/services';
import {
  Header,
  AdvisoryStrip,
  ProductCard,
  FloatingCartPill,
  BottomNav,
  Footer,
} from '@/components';
import { Button, Icon, Select } from '@/elements';
import { CatalogFilterSidebar } from './CatalogFilterSidebar';

export type SortOption = 'featured' | 'price_asc' | 'price_desc';

export const ProductsCatalogView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeMode } = useAppSelector((s) => s.app);

  const [categories, setCategories] = useState<CatalogCategory[]>(
    FALLBACK_CATEGORIES,
  );
  const [products, setProducts] = useState<CatalogProduct[]>(FALLBACK_PRODUCTS);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    catalogService.getCatalogByMode(activeMode).then((data) => {
      setCategories(data.categories);
      setProducts(data.products);
    });
  }, [activeMode]);

  const sortOptions = [
    { value: 'featured', label: 'Sort: Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        !selectedCategorySlug ||
        product.category.slug === selectedCategorySlug;

      const matchesSearch =
        !query ||
        product.name.en.toLowerCase().includes(query) ||
        (product.name.subtitle || '').toLowerCase().includes(query) ||
        product.description.en.toLowerCase().includes(query) ||
        product.category.name.en.toLowerCase().includes(query);

      const hasAvailableVariant = product.variants.some(
        (v) => v.isAvailable && (v.isMadeToBatch || v.stockQty > 0),
      );
      const matchesStock = !inStockOnly || hasAvailableVariant;

      return matchesCategory && matchesSearch && matchesStock;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0);
      }
      if (sortBy === 'price_desc') {
        return (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0);
      }
      return Number(b.isFeatured) - Number(a.isFeatured);
    });
  }, [products, selectedCategorySlug, searchQuery, inStockOnly, sortBy]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategorySlug) return 'All Curations';
    return (
      categories.find((c) => c.slug === selectedCategorySlug)?.name.en ||
      'All Curations'
    );
  }, [categories, selectedCategorySlug]);

  const handleResetFilters = () => {
    setSelectedCategorySlug(null);
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const handleModeSwitch = (mode: StorefrontMode) => {
    setSelectedCategorySlug(null);
    dispatch(setStorefrontMode(mode));
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 pt-16 sm:pt-20 pb-24">
        <AdvisoryStrip />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* Breadcrumb & Mode Header */}
          <div className="cred-card rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.08em] sm:tracking-[0.16em] text-on-surface-variant mb-2 whitespace-nowrap">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Icon name="home" className="text-sm" />
                <span>Home</span>
              </Link>
              <Icon name="chevron_right" className="text-sm" />
              <span className="text-primary font-bold">Catalog</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {selectedCategoryName}
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Adult pure cotton dresses &amp; kurtas (S–XL), free-size mulmul
                  stoles, festive hampers, and weekly fresh kids&apos; snacks
                </p>
              </div>

              {/* Search Input on Catalog Page */}
              <div className="relative w-full md:w-80">
                <Icon
                  name="search"
                  className="text-on-surface-variant text-lg absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by dress, ragi, stole..."
                  className="w-full bg-[#090a0f] focus:bg-[#0d0f16] text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md pl-10 pr-9 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  >
                    <Icon name="close" className="text-base" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Mode Filter Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleModeSwitch('ALL')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                  activeMode === 'ALL'
                    ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                    : 'bg-[#090a0f] text-on-surface-variant border border-white/[0.08] hover:text-on-surface'
                }`}
              >
                <Icon name="auto_awesome" className="text-sm" />
                <span>All Modes</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('DRESS_AND_GIFTS')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                  activeMode === 'DRESS_AND_GIFTS'
                    ? 'bg-secondary text-on-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                    : 'bg-[#090a0f] text-on-surface-variant border border-white/[0.08] hover:text-on-surface'
                }`}
              >
                <Icon name="checkroom" className="text-sm" />
                <span>Dresses &amp; Gifts Focus</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('FOODS_ONLY')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] ${
                  activeMode === 'FOODS_ONLY'
                    ? 'bg-tertiary text-on-tertiary shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'bg-[#090a0f] text-on-surface-variant border border-white/[0.08] hover:text-on-surface'
                }`}
              >
                <Icon name="nutrition" className="text-sm" />
                <span>Pure Foods Focus</span>
              </button>
            </div>
          </div>

          {/* Mobile Horizontal Category Chips */}
          <div className="flex lg:hidden gap-2.5 overflow-x-auto pb-4 mb-2">
            <Button
              type="button"
              onClick={() => setSelectedCategorySlug(null)}
              variant={
                selectedCategorySlug === null ? 'chipActive' : 'chipInactive'
              }
            >
              <Icon name="apps" className="text-lg" />
              <span>All</span>
            </Button>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategorySlug(isSelected ? null : cat.slug)
                  }
                  variant={isSelected ? 'chipActive' : 'chipInactive'}
                >
                  <span>{cat.name.en}</span>
                </Button>
              );
            })}
          </div>

          {/* Main 2-Column Catalog Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Desktop Left Filter Sidebar (3 cols) */}
            <div className="hidden lg:block lg:col-span-3">
              <CatalogFilterSidebar
                categories={categories}
                selectedCategorySlug={selectedCategorySlug}
                onSelectCategory={setSelectedCategorySlug}
                inStockOnly={inStockOnly}
                onToggleInStockOnly={setInStockOnly}
                totalMatching={filteredProducts.length}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Right Product Grid Area (9 cols) */}
            <div className="lg:col-span-9">
              {/* Toolbar */}
              <div className="cred-card rounded-xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-body-sm text-on-surface-variant">
                  Showing{' '}
                  <span className="font-mono font-bold text-on-surface">
                    {filteredProducts.length}
                  </span>{' '}
                  {filteredProducts.length === 1 ? 'item' : 'items'}
                </p>

                <div className="flex items-center gap-3">
                  <label className="flex lg:hidden items-center gap-1.5 text-label-sm text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="accent-primary rounded"
                    />
                    <span>Available Only</span>
                  </label>

                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    options={sortOptions}
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="cred-card rounded-2xl p-12 text-center">
                  <Icon
                    name="search_off"
                    className="text-5xl text-outline mb-3 block"
                  />
                  <h3 className="font-headline-md text-on-surface mb-1">
                    No matching creations found
                  </h3>
                  <p className="text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
                    We couldn&apos;t find any items matching your active filters.
                  </p>
                  <Button
                    type="button"
                    onClick={handleResetFilters}
                    variant="primary"
                    className="mx-auto px-5 py-2.5"
                  >
                    <Icon name="restart_alt" className="text-lg" />
                    <span>Clear All Filters</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingCartPill />
      <BottomNav />
    </div>
  );
};
