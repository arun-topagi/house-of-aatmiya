/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useAppDispatch,
  useAppSelector,
  addToCart,
  updateQuantity,
  removeFromCart,
  selectCartItems,
  selectCartTotalItems,
} from '@/store';
import {
  CatalogProduct,
  catalogService,
  FALLBACK_PRODUCTS,
  isFoodProduct,
} from '@/services';
import { Header, AdvisoryStrip, BottomNav, Footer } from '@/components';
import { Badge, Button, Icon } from '@/elements';

export interface ProductDetailViewProps {
  productId: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
}) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalCartItems = useAppSelector(selectCartTotalItems);
  const { whatsappPhone } = useAppSelector((s) => s.app);

  const [products, setProducts] = useState<CatalogProduct[]>(FALLBACK_PRODUCTS);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  useEffect(() => {
    catalogService.getCatalogByMode('ALL').then((data) => {
      if (data.products.length > 0) {
        setProducts(data.products);
      }
    });
  }, []);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <main className="flex-1 pt-24 pb-24 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/25 shadow-sm max-w-md w-full">
            <Icon
              name="inventory_2"
              className="text-5xl text-outline mb-3 block"
            />
            <h1 className="font-headline-lg text-on-surface mb-2">
              Creation Not Found
            </h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              The item you are looking for may have been moved or is unavailable.
            </p>
            <Link href="/products" className="inline-block">
              <Button type="button" variant="primary" className="px-6 py-3">
                <Icon name="arrow_back" className="text-base" />
                <span>Back to Catalog</span>
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

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

  const handleAddToCart = () => {
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

  const isFood = isFoodProduct(product);
  const benefits = isFood
    ? [
        '100% Zero Maida, Zero Refined White Sugar & Zero Preservatives',
        'Prepared fresh in our weekly batch with Pure Cow Ghee & Organic Jaggery',
        'Safe & wholesome for children (Ages 3+) and the entire family',
      ]
    : [
        '100% Pure Breathable Mulmul / 60x60 Cambric Cotton (Zero Synthetic Lining)',
        'Personal sizing & fit verification on WhatsApp before dispatch',
        'Handcrafted by skilled Indian block-print artisans in small batches',
      ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 pt-16 sm:pt-20 pb-36">
        <AdvisoryStrip />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant min-w-0">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon name="home" className="text-sm" />
                <span>Home</span>
              </Link>
              <Icon name="chevron_right" className="text-sm shrink-0" />
              <Link
                href="/products"
                className="hover:text-primary transition-colors shrink-0"
              >
                Catalog
              </Link>
              <Icon name="chevron_right" className="text-sm shrink-0" />
              <span className="text-primary font-bold truncate">
                {product.name.en}
              </span>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-label-md font-label-md text-primary hover:underline shrink-0"
            >
              <Icon name="arrow_back" className="text-base" />
              <span>All Products</span>
            </Link>
          </div>

          {/* 12-Column Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Gallery Showcase Card */}
            <div className="lg:col-span-5 cred-card rounded-3xl p-6">
              <div className="relative h-80 sm:h-96 rounded-2xl bg-[#090a0f] border border-white/[0.06] overflow-hidden flex items-center justify-center p-3">
                <img
                  src={product.imageUrl}
                  alt={product.name.en}
                  className="w-full h-full object-cover rounded-xl"
                />

                {(isFood || !isAvailable) && (
                  <div className="absolute top-3 left-3">
                    {isAvailable ? (
                      <Badge variant="inStock">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {activeVariant?.isMadeToBatch
                          ? 'Weekly Fresh Batch'
                          : 'Ready Small Batch'}
                      </Badge>
                    ) : (
                      <Badge variant="outOfStock">Sold Out</Badge>
                    )}
                  </div>
                )}

                {activeVariant && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="sizePack">{activeVariant.sizePack}</Badge>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between px-2 pt-3 border-t border-white/[0.08] text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Icon
                    name="verified"
                    className="text-primary text-lg"
                    filled
                  />
                  <span>Crafted Like Family</span>
                </span>
                <span className="font-mono text-xs text-outline">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Right 7 Cols: Details, Honest Price, Variants & Purchase Action */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="cred-card rounded-3xl p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.05] border border-primary/25 text-primary text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.08em] sm:tracking-[0.18em] mb-3 whitespace-nowrap">
                  <Icon
                    name={isFood ? 'cookie' : 'checkroom'}
                    className="text-sm"
                  />
                  <span>{product.category.name.en}</span>
                </div>

                <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface mb-2">
                  {product.name.en}
                </h1>

                {product.name.subtitle && (
                  <p className="text-body-md text-secondary font-medium mb-4">
                    {product.name.subtitle}
                  </p>
                )}

                <p className="text-body-lg text-on-surface-variant mb-6">
                  {product.description.en}
                </p>

                {/* Honest Pricing Card */}
                <div className="bg-[#090a0f] rounded-2xl p-4 mb-6 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display-lg text-3xl text-primary font-bold font-mono">
                      ₹{activeVariant?.price ?? 0}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      ({activeVariant?.sizePack})
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      `Namaste! I have a question about ${product.name.en} (${activeVariant?.sizePack}).`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.1] px-4 py-2.5 rounded-xl text-label-sm font-label-sm whitespace-nowrap transition-all shrink-0"
                  >
                    <Icon name="chat" className="text-base" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>

                {/* Variant Selector Grid */}
                <div className="mb-6">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface-variant mb-2.5">
                    Select {isFood ? 'Pack Weight / Jar' : 'Adult Size / Variant'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants.map((v, idx) => {
                      const isSelected = idx === selectedVariantIdx;
                      const variantInCart = cartItems.find(
                        (i) => i.variantId === v.id,
                      );
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantIdx(idx)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative active:scale-[0.98] ${
                            isSelected
                              ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-[inset_0_1px_0_rgba(229,194,128,0.2)]'
                              : 'border-white/[0.08] bg-[#090a0f] hover:border-white/[0.18]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-label-md text-label-md text-on-surface font-bold">
                              {v.sizePack}
                            </span>
                            {isSelected && (
                              <Icon
                                name="check_circle"
                                className="text-primary text-base"
                                filled
                              />
                            )}
                          </div>
                          <p className="font-mono text-base text-primary font-bold">
                            ₹{v.price}
                          </p>
                          <span
                            className={`text-[11px] block mt-1 ${
                              v.isAvailable
                                ? 'text-tertiary font-medium'
                                : 'text-error'
                            }`}
                          >
                            {v.isMadeToBatch
                              ? isFood
                                ? 'Fresh Weekly Batch'
                                : 'Crafted to Order'
                              : v.stockQty > 0
                                ? `Ready (${v.stockQty} left)`
                                : 'Out of Stock'}
                          </span>
                          {variantInCart && (
                            <span className="mt-1.5 inline-block bg-primary text-on-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                              {variantInCart.quantity} in bag
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Purchase Action Bar right inside the card (Price only on left, no text above price) */}
                <div className="mb-6 p-4 rounded-2xl bg-[#090a0f] border border-white/[0.08] flex items-center justify-between gap-4">
                  <span className="font-headline-lg text-2xl text-on-surface font-mono font-bold">
                    ₹{activeVariant?.price ?? 0}
                  </span>

                  <div className="flex items-center gap-3 shrink-0">
                    {quantityInCart === 0 ? (
                      <Button
                        type="button"
                        disabled={!isAvailable}
                        onClick={handleAddToCart}
                        variant={isAvailable ? 'primary' : 'disabled'}
                        className="min-w-[180px] px-7 py-3.5 text-base"
                      >
                        <Icon name="add_shopping_cart" className="text-xl" />
                        <span>Add to Bag</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#181b28] text-on-surface border border-primary/35 rounded-xl p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] shrink-0">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Icon name="remove" />
                          </button>
                          <span className="w-10 text-center text-base font-bold font-mono select-none">
                            {quantityInCart}
                          </span>
                          <button
                            type="button"
                            onClick={handleIncrement}
                            aria-label="Increase quantity"
                            className="w-9 h-9 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Icon name="add" />
                          </button>
                        </div>

                        <Link
                          href="/checkout"
                          className="bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold text-label-md px-5 py-3 rounded-xl inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-105 transition-all"
                        >
                          <Icon name="shopping_bag" className="text-lg" />
                          <span>View Bag ({totalCartItems})</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fabric / Ingredient Details */}
                {product.usage?.en && (
                  <div className="p-4 rounded-xl bg-[#090a0f] border border-white/[0.08] mb-6">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-primary mb-1.5">
                      {isFood ? 'Ingredients & Shelf Life' : 'Fabric & Care'}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {product.usage.en}
                    </p>
                  </div>
                )}

                {/* Purity & Benefits List */}
                <div className="pt-5 border-t border-white/[0.08]">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
                    <Icon name="verified" className="text-primary" />
                    <span>The House of Aatmiya Promise</span>
                  </h2>
                  <ul className="space-y-2.5">
                    {benefits.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-body-md text-on-surface-variant"
                      >
                        <Icon
                          name="task_alt"
                          className="text-tertiary text-lg shrink-0 mt-0.5"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Purchase & Quantity Bar (Price only on left, no text above price) */}
      <div className="fixed bottom-16 left-0 w-full z-40 bg-[#090a0f]/90 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-12px_32px_rgba(0,0,0,0.65)] py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <p className="font-headline-md text-xl sm:text-2xl text-on-surface font-mono font-bold whitespace-nowrap">
            ₹{activeVariant?.price ?? 0}
          </p>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {quantityInCart === 0 ? (
              <Button
                type="button"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                variant={isAvailable ? 'primary' : 'disabled'}
                className="min-w-[135px] sm:min-w-[170px] px-4 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base whitespace-nowrap"
              >
                <Icon name="add_shopping_cart" className="text-lg sm:text-xl" />
                <span>Add to Bag</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center bg-[#181b28] text-on-surface border border-primary/35 rounded-xl p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] shrink-0">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon name="remove" />
                  </button>
                  <span className="w-8 sm:w-9 text-center text-sm sm:text-base font-bold font-mono select-none">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon name="add" />
                  </button>
                </div>

                <Link
                  href="/checkout"
                  className="bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold text-xs sm:text-label-md px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-105 transition-all"
                >
                  <Icon name="shopping_bag" className="text-base sm:text-lg" />
                  <span>Checkout ({totalCartItems})</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};
