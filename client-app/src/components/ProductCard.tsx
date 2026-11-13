/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useAppDispatch,
  useAppSelector,
  addToCart,
  updateQuantity,
  removeFromCart,
  selectCartItems,
} from '@/store';
import { CatalogProduct, isFoodProduct } from '@/services/api';
import { Badge, Button, Icon } from '@/elements';

export interface ProductCardProps {
  product: CatalogProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const activeVariant =
    product.variants[selectedVariantIdx] || product.variants[0];
  const isFood = isFoodProduct(product);
  const isAvailable = activeVariant
    ? activeVariant.isAvailable &&
      (activeVariant.isMadeToBatch || activeVariant.stockQty > 0)
    : false;

  const cartItem = activeVariant
    ? cartItems.find((item) => item.variantId === activeVariant.id)
    : undefined;
  const quantityInCart = cartItem?.quantity ?? 0;

  const handleAddFirst = () => {
    if (!activeVariant || !isAvailable) return;
    dispatch(
      addToCart({
        productId: product.id,
        variantId: activeVariant.id,
        sku: product.sku,
        productName: product.name.en,
        categorySlug: product.category.slug,
        sizePack: activeVariant.sizePack,
        unitPrice: activeVariant.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        isMadeToBatch: activeVariant.isMadeToBatch,
      }),
    );
  };

  const handleIncrement = () => {
    if (!activeVariant) return;
    dispatch(
      updateQuantity({
        variantId: activeVariant.id,
        quantity: quantityInCart + 1,
      }),
    );
  };

  const handleDecrement = () => {
    if (!activeVariant) return;
    if (quantityInCart <= 1) {
      dispatch(removeFromCart(activeVariant.id));
    } else {
      dispatch(
        updateQuantity({
          variantId: activeVariant.id,
          quantity: quantityInCart - 1,
        }),
      );
    }
  };

  return (
    <div className="bg-[#11131c] rounded-2xl p-4 flex flex-col justify-between border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.45)] hover:border-primary/35 hover:shadow-[inset_0_1px_0_0_rgba(229,194,128,0.16),0_18px_42px_rgba(0,0,0,0.65)] transition-all duration-300 group">
      <div>
        {/* Clickable Product Image + Title Area -> Opens Product Detail Page */}
        <Link
          href={`/products/${product.id}`}
          className="block cursor-pointer focus:outline-none"
        >
          <div className="relative h-48 rounded-xl bg-[#090a0f] border border-white/[0.06] mb-4 overflow-hidden flex items-center justify-center p-1.5">
            <img
              src={product.imageUrl}
              alt={product.name.en}
              className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
            />

            {/* Stock / Batch Badge (Batch label for Pure Foods only; Sold Out for any unavailable item) */}
            {(isFood || !isAvailable) && (
              <div className="absolute top-2.5 left-2.5">
                {isAvailable ? (
                  <Badge variant="inStock">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeVariant?.isMadeToBatch
                      ? 'Fresh Weekly Batch'
                      : 'Ready Small Batch'}
                  </Badge>
                ) : (
                  <Badge variant="outOfStock">Sold Out</Badge>
                )}
              </div>
            )}

            {/* Size Pack Badge */}
            {activeVariant && (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="sizePack">{activeVariant.sizePack}</Badge>
              </div>
            )}
          </div>

          <span className="text-[9px] sm:text-[10px] font-mono text-primary uppercase tracking-[0.08em] sm:tracking-[0.18em] block mb-1.5 whitespace-nowrap">
            {product.category.name.en}
          </span>

          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {product.name.en}
          </h3>

          <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">
            {product.name.subtitle || product.description.en}
          </p>
        </Link>

        {/* Variant Switcher Pills */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v, idx) => (
              <Button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantIdx(idx)}
                variant={
                  idx === selectedVariantIdx
                    ? 'variantActive'
                    : 'variantInactive'
                }
              >
                {v.sizePack}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3.5 border-t border-white/[0.07] flex items-center justify-between gap-3 mt-1">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.08em] sm:tracking-[0.16em] text-on-surface-variant block whitespace-nowrap">
            Price
          </span>
          <span className="font-mono text-lg sm:text-xl text-on-surface font-bold tracking-tight whitespace-nowrap">
            ₹{activeVariant?.price ?? 0}
          </span>
        </div>

        <div className="flex items-center">
          {quantityInCart === 0 ? (
            <Button
              type="button"
              disabled={!isAvailable}
              onClick={handleAddFirst}
              variant={isAvailable ? 'primary' : 'disabled'}
              className="px-3 sm:px-4 py-2 text-xs sm:text-label-md whitespace-nowrap"
            >
              <Icon name="add_shopping_cart" className="text-[18px]" />
              <span>Add to Bag</span>
            </Button>
          ) : (
            <div className="flex items-center bg-[#181b28] text-on-surface border border-primary/35 rounded-xl p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              >
                <Icon name="remove" className="text-[18px]" />
              </button>
              <span className="w-8 text-center text-sm font-bold font-mono text-on-surface select-none">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              >
                <Icon name="add" className="text-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
