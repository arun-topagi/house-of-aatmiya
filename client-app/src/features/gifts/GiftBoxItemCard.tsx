/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Icon } from '@/elements';
import { CatalogProduct, CatalogVariant, isFoodProduct } from '@/services';

export interface GiftBoxItemCardProps {
  product: CatalogProduct;
  getVariantQty: (variantId: string) => number;
  onUpdateQty: (
    product: CatalogProduct,
    variant: CatalogVariant,
    nextQty: number,
  ) => void;
}

export const GiftBoxItemCard: React.FC<GiftBoxItemCardProps> = ({
  product,
  getVariantQty,
  onUpdateQty,
}) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const activeVariant =
    product.variants[selectedVariantIdx] || product.variants[0];
  const isFood = isFoodProduct(product);

  if (!activeVariant) return null;

  const qtyInBox = getVariantQty(activeVariant.id);
  const totalProductQtyInBox = product.variants.reduce(
    (sum, v) => sum + getVariantQty(v.id),
    0,
  );
  const isAvailable =
    activeVariant.isAvailable &&
    (activeVariant.isMadeToBatch || activeVariant.stockQty > 0);

  return (
    <div className="cred-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-stretch hover:border-primary/35 transition-all">
      {/* Product Thumbnail */}
      <Link
        href={`/products/${product.id}`}
        className="relative w-full sm:w-32 h-44 sm:h-auto min-h-[128px] rounded-xl bg-[#090a0f] border border-white/[0.08] overflow-hidden shrink-0 group"
      >
        <img
          src={product.imageUrl}
          alt={product.name.en}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {totalProductQtyInBox > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-[#090a0f] font-mono text-[10px] font-bold shadow">
            {totalProductQtyInBox} in box
          </span>
        )}
      </Link>

      {/* Details + Variant Pills + Add to Box Action */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant={isFood ? 'inStock' : 'secondaryContainer'}>
              <Icon
                name={isFood ? 'nutrition' : 'styler'}
                className="text-xs"
              />
              <span>
                {isFood ? 'Pure Homemade Food' : 'Free-Size Cotton Stole'}
              </span>
            </Badge>
            {product.name.badge && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                • {product.name.badge}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="font-headline-sm text-base sm:text-lg text-on-surface hover:text-primary transition-colors block"
          >
            {product.name.en}
          </Link>

          {product.name.subtitle && (
            <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
              {product.name.subtitle}
            </p>
          )}
        </div>

        {/* Selectable Variant Pill Chips */}
        {product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((v, idx) => {
              const isSelected = idx === selectedVariantIdx;
              const vQty = getVariantQty(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                      : 'bg-[#090a0f] text-on-surface-variant border border-white/[0.08] hover:border-white/[0.2] hover:text-on-surface'
                  }`}
                >
                  <span>{v.sizePack}</span>
                  {vQty > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isSelected
                          ? 'bg-[#090a0f]/20 text-[#090a0f]'
                          : 'bg-primary/20 text-primary'
                      }`}
                    >
                      ×{vQty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Price + Single Crisp Add/Stepper CTA */}
        <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-lg sm:text-xl font-bold text-primary">
              ₹{activeVariant.price}
            </span>
            <span className="text-[11px] text-on-surface-variant ml-1.5">
              / {activeVariant.sizePack}
            </span>
          </div>

          {qtyInBox === 0 ? (
            <Button
              type="button"
              disabled={!isAvailable}
              onClick={() => onUpdateQty(product, activeVariant, 1)}
              variant={isAvailable ? 'primary' : 'disabled'}
              className="px-4 py-2 text-xs sm:text-sm"
            >
              <Icon name="add_circle" className="text-base shrink-0" />
              <span>{isAvailable ? 'Add to Box' : 'Sold Out'}</span>
            </Button>
          ) : (
            <div className="flex items-center bg-[#181b28] border border-primary/40 rounded-xl p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] shrink-0">
              <button
                type="button"
                onClick={() =>
                  onUpdateQty(product, activeVariant, qtyInBox - 1)
                }
                aria-label="Remove one from gift box"
                className="w-8 h-8 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon name="remove" className="text-base" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-on-surface">
                {qtyInBox}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateQty(product, activeVariant, qtyInBox + 1)
                }
                aria-label="Add one more to gift box"
                className="w-8 h-8 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icon name="add" className="text-base" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
