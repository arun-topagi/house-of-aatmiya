'use client';

import React from 'react';
import { CatalogCategory } from '@/services/api';
import { Icon } from '@/elements';

export interface CatalogFilterSidebarProps {
  categories: CatalogCategory[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: (val: boolean) => void;
  totalMatching: number;
  onResetFilters: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'kids-snacks': 'cookie',
  dresses: 'woman',
  kurtas: 'apparel',
  stoles: 'styler',
  hampers: 'redeem',
};

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  inStockOnly,
  onToggleInStockOnly,
  totalMatching,
  onResetFilters,
}) => {
  const hasActiveFilters = selectedCategorySlug !== null || inStockOnly;

  return (
    <aside className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_6px_20px_rgba(27,42,74,0.04)] border border-outline-variant/25 sticky top-24">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/25">
        <div className="flex items-center gap-2">
          <Icon name="tune" className="text-primary text-xl" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-label-sm font-label-sm text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="mb-6">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
          Categories
        </p>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer ${
              selectedCategorySlug === null
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon name="apps" className="text-lg" />
              <span>All Categories</span>
            </span>
            {selectedCategorySlug === null && (
              <Icon name="check" className="text-base" />
            )}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const iconName = CATEGORY_ICONS[cat.slug] || 'category';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  onSelectCategory(isSelected ? null : cat.slug)
                }
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="flex items-center gap-2.5 text-left">
                  <Icon
                    name={iconName}
                    className={`text-lg ${
                      isSelected ? 'text-primary-fixed' : 'text-primary'
                    }`}
                  />
                  <span className="line-clamp-1">{cat.name.en}</span>
                </span>
                {isSelected && <Icon name="check" className="text-base" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="pt-4 border-t border-outline-variant/25">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
          Availability
        </p>

        <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <Icon name="verified" className="text-tertiary text-lg" filled />
            <span className="font-label-md text-label-md text-on-surface">
              Available / Active Batch Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Summary Footer */}
      <div className="mt-5 pt-4 border-t border-outline-variant/25 flex items-center justify-between text-body-sm text-on-surface-variant">
        <span>Matching Curations</span>
        <span className="font-label-md text-on-surface font-bold">
          {totalMatching}
        </span>
      </div>
    </aside>
  );
};
