'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAppDispatch,
  setStorefrontMode,
} from '@/store';
import {
  CatalogCategory,
  CatalogProduct,
  catalogService,
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

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    dispatch(setStorefrontMode('DRESS_AND_GIFTS'));
    catalogService
      .getCatalogByMode('DRESS_AND_GIFTS')
      .then((data) => {
        setCategories(data.categories);
        setProducts(data.products);
      })
      .catch(() => {
        setCategories([]);
        setProducts([]);
      });
  }, [dispatch]);

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

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 pt-16 sm:pt-20 pb-24">
        <AdvisoryStrip />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* Top Breadcrumb & Compact Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Icon name="home" className="text-sm" />
                <span>Home</span>
              </Link>
              <Icon name="chevron_right" className="text-sm" />
              <span className="text-primary font-bold">Catalog</span>
              {selectedCategorySlug && (
                <>
                  <Icon name="chevron_right" className="text-sm" />
                  <span className="text-on-surface font-medium truncate">
                    {selectedCategoryName}
                  </span>
                </>
              )}
            </div>

            <div className="relative w-full sm:w-64 md:w-72">
              <Icon
                name="search"
                className="text-on-surface-variant text-base absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cotton top, pant, stole..."
                className="w-full bg-[#11131c] focus:bg-[#151824] text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm pl-9 pr-8 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  aria-label="Clear search"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              )}
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
