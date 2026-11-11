'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  setStorefrontMode,
  syncStoreSettings,
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
  FloatingCartPill,
  BottomNav,
  Footer,
} from '@/components';
import { HeroBanner } from './HeroBanner';
import { CategoryCarousel } from './CategoryCarousel';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import { StoreVerificationCard } from './StoreVerificationCard';

export interface HomeViewProps {
  forcedMode?: StorefrontMode;
}

export const HomeView: React.FC<HomeViewProps> = ({ forcedMode }) => {
  const dispatch = useAppDispatch();
  const { activeMode } = useAppSelector((s) => s.app);
  const effectiveMode = forcedMode || activeMode;

  const [categories, setCategories] = useState<CatalogCategory[]>(
    FALLBACK_CATEGORIES,
  );
  const [products, setProducts] = useState<CatalogProduct[]>(FALLBACK_PRODUCTS);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (forcedMode) {
      dispatch(setStorefrontMode(forcedMode));
    } else {
      catalogService.getStoreSettings().then((settings) => {
        dispatch(syncStoreSettings(settings));
      });
    }
  }, [forcedMode, dispatch]);

  useEffect(() => {
    setSelectedCategorySlug(null);
    catalogService.getCatalogByMode(effectiveMode).then((data) => {
      setCategories(data.categories);
      setProducts(data.products);
    });
  }, [effectiveMode]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        !selectedCategorySlug || p.category.slug === selectedCategorySlug;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.en.toLowerCase().includes(q) ||
        (p.name.subtitle || '').toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q) ||
        p.category.name.en.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategorySlug, searchQuery]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategorySlug) {
      if (effectiveMode === 'DRESS_AND_GIFTS') {
        return 'Pure Cotton Dresses, Kurtas, Stoles & Gift Hampers';
      }
      if (effectiveMode === 'FOODS_ONLY') {
        return "Weekly Fresh Batch: Kids' Clean Snacks & Family Pantry";
      }
      return undefined;
    }
    return categories.find((c) => c.slug === selectedCategorySlug)?.name.en;
  }, [categories, selectedCategorySlug, effectiveMode]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 pt-16 sm:pt-20 pb-24">
        <AdvisoryStrip />
        <HeroBanner onExploreClick={scrollToCatalog} />
        <CategoryCarousel
          categories={categories}
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={setSelectedCategorySlug}
        />
        <FeaturedProductsSection
          products={filteredProducts}
          selectedCategoryName={selectedCategoryName}
        />
        <StoreVerificationCard />
      </main>

      <Footer />
      <FloatingCartPill />
      <BottomNav />
    </div>
  );
};

export const StorefrontModeView = HomeView;

