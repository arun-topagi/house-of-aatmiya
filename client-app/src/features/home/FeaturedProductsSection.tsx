'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogProduct } from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { Button, Icon } from '@/elements';

export interface FeaturedProductsSectionProps {
  products: CatalogProduct[];
  selectedCategoryName?: string;
}

export const FeaturedProductsSection: React.FC<
  FeaturedProductsSectionProps
> = ({ products, selectedCategoryName }) => {
  return (
    <section
      id="catalog-section"
      className="py-6 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary block mb-1 whitespace-nowrap">
            Limited Small-Batch Drops
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {selectedCategoryName || 'Signature Curations'}
          </h2>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            Showing <span className="font-mono text-on-surface">{products.length}</span>{' '}
            {products.length === 1 ? 'creation' : 'creations'} • Honest small-batch
            pricing
          </p>
        </div>

        <Link
          href="/products"
          className="flex items-center gap-1.5 text-primary font-label-md text-label-md bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.1] px-4 py-2.5 rounded-full transition-all active:scale-[0.98] shrink-0 w-fit"
        >
          <span>Open Full Filterable Catalog</span>
          <Icon name="arrow_forward" className="text-base" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="cred-card rounded-2xl p-12 text-center">
          <Icon
            name="inventory_2"
            className="text-4xl text-outline mb-2 block"
          />
          <p className="font-headline-sm text-on-surface mb-1">
            No matching items found
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Try switching the storefront mode or clearing your search filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/products">
              <Button type="button" variant="viewAll" className="px-6 py-3">
                <span>View All Products &amp; Filters</span>
                <Icon name="arrow_forward" className="text-base" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};
