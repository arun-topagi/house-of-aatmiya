'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  useAppDispatch,
  setStorefrontMode,
  syncStoreSettings,
  StorefrontMode,
} from '@/store';
import {
  CatalogCategory,
  CatalogProduct,
  catalogService,
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
  const effectiveMode: StorefrontMode = forcedMode || 'DRESS_AND_GIFTS';

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(setStorefrontMode(effectiveMode));
    catalogService
      .getStoreSettings()
      .then((settings) => {
        dispatch(
          syncStoreSettings({
            ...settings,
            defaultMode: effectiveMode,
          }),
        );
      })
      .catch(() => {});
  }, [effectiveMode, dispatch]);

  useEffect(() => {
    setSelectedCategorySlug(null);
    catalogService
      .getCatalogByMode(effectiveMode)
      .then((data) => {
        setCategories(data.categories);
        setProducts(data.products);
      })
      .catch(() => {
        setCategories([]);
        setProducts([]);
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
        return "Women's & Men's Pure Cotton Wear & Free-Size Stoles";
      }
      if (effectiveMode === 'FOODS_ONLY') {
        return 'Pure Bilona A2 Cow Ghee & Dry Fruits Laddu';
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

