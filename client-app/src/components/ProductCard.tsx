"use client";

import React, { useState } from 'react';
import { CatalogProduct } from '@/services/api';
import { addToCart, useAppDispatch } from '@/store';

interface ProductCardProps {
  product: CatalogProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  const activeVariant =
    product.variants[selectedVariantIdx] || product.variants[0];

  const isFood = product.category?.slug === 'kids-snacks';

  const handleAdd = () => {
    if (!activeVariant) return;
    dispatch(
      addToCart({
        productId: product.id,
        variantId: activeVariant.id,
        sku: product.sku,
        productName: product.name.en,
        categorySlug: product.category?.slug || 'general',
        sizePack: activeVariant.sizePack,
        unitPrice: activeVariant.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        isMadeToBatch: activeVariant.isMadeToBatch,
      }),
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1600);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#e5dccb] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Product Image & Purity Badges */}
        <div className="relative h-60 w-full bg-[#f3ede2] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name.en}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.name.badge && (
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs ${
                isFood
                  ? 'bg-[#234d36] text-white'
                  : 'bg-[#6b2d26] text-white'
              }`}
            >
              {product.name.badge}
            </span>
          )}
          <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#1b2a4a]">
            {isFood ? '🥣 Fresh Small-Batch' : '🌿 100% Pure Cotton'}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b2d26] mb-1">
            {product.category?.name?.en}
          </div>
          <h3 className="font-serif text-lg font-bold text-[#1b2a4a] leading-snug">
            {product.name.en}
          </h3>
          {product.name.subtitle && (
            <p className="text-xs font-semibold text-[#234d36] mt-1">
              {product.name.subtitle}
            </p>
          )}
          <p className="text-xs text-[#57534e] mt-2 line-clamp-2 leading-relaxed">
            {product.description.en}
          </p>

          {product.usage?.en && (
            <div className="mt-2.5 p-2 rounded-lg bg-[#faf7f2] border border-[#e5dccb]/70 text-[11px] text-[#57534e]">
              {product.usage.en}
            </div>
          )}

          {/* Size / Pack Selector */}
          <div className="mt-3.5">
            <label className="block text-[11px] font-semibold text-[#57534e] mb-1.5">
              Select {isFood ? 'Pack Size' : 'Adult Size / Option'}:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    idx === selectedVariantIdx
                      ? 'bg-[#1b2a4a] text-white border-[#1b2a4a]'
                      : 'bg-[#faf7f2] text-[#1c1917] border-[#e5dccb] hover:border-[#1b2a4a]'
                  }`}
                >
                  {v.sizePack}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price & Add to Concierge Bag */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#f3ede2] flex items-center justify-between">
        <div>
          <span className="text-xs text-[#57534e] block">Price</span>
          <span className="text-xl font-bold text-[#1b2a4a]">
            ₹{activeVariant?.price ?? 0}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            addedToast
              ? 'bg-[#234d36] text-white'
              : 'bg-[#1b2a4a] hover:bg-[#283d6b] text-white'
          }`}
        >
          {addedToast ? '✓ Added to Bag' : '+ Add to Bag'}
        </button>
      </div>
    </div>
  );
};
