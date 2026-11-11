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
import { CatalogProduct } from '@/services/api';
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
    <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between shadow-[0_6px_20px_rgba(27,42,74,0.05)] hover:shadow-[0_10px_28px_rgba(27,42,74,0.09)] transition-all duration-300 border border-outline-variant/25 group">
      <div>
        {/* Clickable Product Image + Title Area -> Opens Product Detail Page */}
        <Link
          href={`/products/${product.id}`}
          className="block cursor-pointer focus:outline-none"
        >
          <div className="relative h-48 rounded-lg bg-surface-container-low mb-4 overflow-hidden flex items-center justify-center p-2">
            <img
              src={product.imageUrl}
              alt={product.name.en}
              className="h-full w-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
            />

            {/* Stock / Batch Badge */}
            <div className="absolute top-2.5 left-2.5">
              {isAvailable ? (
                <Badge variant="inStock">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  {activeVariant?.isMadeToBatch
                    ? 'Fresh Weekly Batch'
                    : 'Ready Small Batch'}
                </Badge>
              ) : (
                <Badge variant="outOfStock">Sold Out</Badge>
              )}
            </div>

            {/* Size Pack Badge */}
            {activeVariant && (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="sizePack">{activeVariant.sizePack}</Badge>
              </div>
            )}
          </div>

          <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider block mb-1">
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

      <div className="pt-3 border-t border-outline-variant/25 flex items-center justify-between gap-3 mt-1">
        <div>
          <span className="text-body-sm text-on-surface-variant block text-[11px]">
            Price
          </span>
          <span className="font-headline-md text-headline-md text-on-surface font-mono font-bold">
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
              className="px-4 py-2"
            >
              <Icon name="add_shopping_cart" className="text-[18px]" />
              <span>Add to Bag</span>
            </Button>
          ) : (
            <div className="flex items-center bg-primary text-on-primary rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg hover:bg-primary-container flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              >
                <Icon name="remove" className="text-[18px]" />
              </button>
              <span className="w-8 text-center font-headline-sm text-sm font-bold font-mono select-none">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg hover:bg-primary-container flex items-center justify-center transition-colors cursor-pointer active:scale-95"
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
