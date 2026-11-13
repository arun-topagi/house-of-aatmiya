'use client';

import React from 'react';
import { CatalogCategory } from '@/services/api';
import { Button, Icon } from '@/elements';

export interface CategoryCarouselProps {
  categories: CatalogCategory[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'kids-snacks': 'cookie',
  dresses: 'woman',
  kurtas: 'apparel',
  stoles: 'styler',
  hampers: 'redeem',
};

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  return (
    <section className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary block mb-1 whitespace-nowrap">
            Curated Collections
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Browse by Category
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Select a curation to filter items below
          </p>
        </div>
        {selectedCategorySlug && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-primary font-mono text-xs uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Show All</span>
            <Icon name="close" className="text-sm" />
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <Button
          type="button"
          onClick={() => onSelectCategory(null)}
          variant={
            selectedCategorySlug === null ? 'chipActive' : 'chipInactive'
          }
        >
          <Icon name="apps" className="text-xl" />
          <span>All Curations</span>
        </Button>

        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          const iconName = CATEGORY_ICONS[cat.slug] || 'category';

          return (
            <Button
              key={cat.id}
              type="button"
              onClick={() =>
                onSelectCategory(isSelected ? null : cat.slug)
              }
              variant={isSelected ? 'chipActive' : 'chipInactive'}
            >
              <Icon
                name={iconName}
                className={`text-xl ${
                  isSelected ? 'text-[#090a0f]' : 'text-primary'
                }`}
              />
              <span>{cat.name.en}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
};
