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
    <aside className="cred-card rounded-2xl p-5 sticky top-24">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
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
            className="text-[10px] font-mono uppercase tracking-wider text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="mb-6">
        <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-[0.2em] mb-3">
          Categories
        </p>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer active:scale-[0.98] ${
              selectedCategorySlug === null
                ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05]'
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05]'
                }`}
              >
                <span className="flex items-center gap-2.5 text-left">
                  <Icon
                    name={iconName}
                    className={`text-lg ${
                      isSelected ? 'text-[#090a0f]' : 'text-primary'
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
      <div className="pt-4 border-t border-white/[0.08]">
        <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-[0.2em] mb-3">
          Availability
        </p>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#090a0f] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
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
      <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-body-sm text-on-surface-variant">
        <span>Matching Curations</span>
        <span className="font-mono text-on-surface font-bold">
          {totalMatching}
        </span>
      </div>
    </aside>
  );
};
