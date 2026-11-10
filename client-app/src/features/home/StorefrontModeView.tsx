"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Footer,
  Header,
  ProductCard,
  FloatingCartPill,
} from '@/components';
import {
  CatalogCategory,
  CatalogProduct,
  fetchCatalogByMode,
} from '@/services/api';
import {
  StorefrontMode,
  addToCart,
  useAppDispatch,
  useAppSelector,
} from '@/store';

interface StorefrontModeViewProps {
  forcedMode?: StorefrontMode;
}

export const StorefrontModeView: React.FC<StorefrontModeViewProps> = ({
  forcedMode,
}) => {
  const dispatch = useAppDispatch();
  const { activeMode, nextFoodBatchLabel } = useAppSelector((s) => s.app);
  const effectiveMode: StorefrontMode = forcedMode || activeMode;

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [hamperToast, setHamperToast] = useState(false);

  useEffect(() => {
    setSelectedCategorySlug('');
  }, [effectiveMode]);

  useEffect(() => {
    setLoading(true);
    fetchCatalogByMode(effectiveMode, selectedCategorySlug || undefined).then(
      ({ categories: cats, products: prods }) => {
        setCategories(cats);
        setProducts(prods);
        setLoading(false);
      },
    );
  }, [effectiveMode, selectedCategorySlug]);

  const handleQuickAddCustomHamper = () => {
    dispatch(
      addToCart({
        productId: 'prod-hm-01',
        variantId: 'var-hm-01-cl',
        sku: 'HOA-HM-01',
        productName:
          'The House of Aatmiya Signature Family & Festive Hamper (1 Cotton Stole + 2 Snacks)',
        categorySlug: 'hampers',
        sizePack: 'Classic Hamper (Stole + 2 Jars)',
        unitPrice: 1690,
        quantity: 1,
        imageUrl:
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
        isMadeToBatch: true,
      }),
    );
    setHamperToast(true);
    setTimeout(() => setHamperToast(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        {/* MODE-SPECIFIC HERO BANNER */}
        {effectiveMode === 'ALL' && (
          <section className="rounded-3xl bg-gradient-to-br from-[#1b2a4a] via-[#23355c] to-[#6b2d26] text-white p-6 sm:p-10 lg:p-12 shadow-lg relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold">
                <span>✦ Mode 1: Complete House of Aatmiya Showcase</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                Pure Cotton Clothing, Clean Small-Batch Foods & Thoughtful Gifting.
              </h1>
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
                Started by <strong>Arun & Snehal</strong>, made the way we make
                it for our daughters <strong>Saharsha & Sreeja</strong>. Browse
                our complete collection or switch into our focused Dress &
                Gifting Boutique or Pure Foods Pantry.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/boutique"
                  className="px-5 py-3 rounded-full bg-white text-[#1b2a4a] text-xs sm:text-sm font-bold shadow-xs hover:bg-amber-50 transition"
                >
                  Explore Dresses, Kurtas & Gifts →
                </Link>
                <Link
                  href="/foods"
                  className="px-5 py-3 rounded-full bg-[#234d36] text-white border border-white/25 text-xs sm:text-sm font-bold hover:bg-[#2e6647] transition"
                >
                  Explore Pure Foods & Kids&apos; Snacks →
                </Link>
              </div>
            </div>
          </section>
        )}

        {effectiveMode === 'DRESS_AND_GIFTS' && (
          <section className="rounded-3xl bg-gradient-to-r from-[#6b2d26] via-[#52211b] to-[#1b2a4a] text-white p-6 sm:p-10 lg:p-12 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold">
                  ✦ Mode 2: Pure Cotton Apparel & Festive Gifting Boutique
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  100% Pure Mulmul & Handblock Cotton for Adults + Signature Hampers
                </h1>
                <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
                  Featuring Adult Women&apos;s Pure Cotton Dresses (S–XL),
                  Kurta Co-ord Sets, Men&apos;s Slub Cotton Kurtas, Free-Size
                  Artisanal Stoles, and Diwali/Wedding Gift Hampers. Snehal
                  personally confirms your exact fit on call before dispatch.
                </p>
              </div>

              {/* Quick Hamper Card */}
              <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  ★ Hero Gifting Recommendation
                </div>
                <h3 className="font-serif text-xl font-bold">
                  The Aatmiya Family Hamper
                </h3>
                <p className="text-xs text-stone-200">
                  Combines 1 Free-Size Pure Cotton Stole + 2 Artisanal Food Jars
                  + Handwritten Family Note. Ideal for Diwali, Weddings &
                  Corporate orders (25–50 units).
                </p>
                <button
                  type="button"
                  onClick={handleQuickAddCustomHamper}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1b2a4a] font-bold text-xs cursor-pointer transition"
                >
                  {hamperToast
                    ? '✓ Added Signature Hamper to Bag!'
                    : '+ Add Signature Hamper (₹1,690)'}
                </button>
              </div>
            </div>
          </section>
        )}

        {effectiveMode === 'FOODS_ONLY' && (
          <section className="rounded-3xl bg-gradient-to-r from-[#234d36] via-[#1c3f2c] to-[#1b2a4a] text-white p-6 sm:p-10 lg:p-12 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold">
                  ✦ Mode 3: Pure Small-Batch Foods & Kids&apos; Clean Snacks
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Zero Maida. Zero Refined Sugar. Pure Cow Ghee & Organic Jaggery.
                </h1>
                <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
                  Prepared in small kitchen batches by Snehal for ages 3+ and
                  health-conscious families: Sprouted Ragi-Almond Drink Mix,
                  A2 Ghee Ragi Cookies, Soft Jaggery Chikki Bites, and
                  Ghee-Roasted Phool Makhana.
                </p>
              </div>

              <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  🥣 Fresh Batch Schedule
                </div>
                <div className="font-serif text-lg font-bold">
                  {nextFoodBatchLabel}
                </div>
                <p className="text-xs text-stone-200">
                  We never keep old stock on shelves. Every jar is roasted and
                  packed fresh after your WhatsApp order confirmation.
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="px-2.5 py-1 rounded-full bg-white/15">
                    Ages 3+ Safe
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/15">
                    FSSAI Registered Kitchen
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TRUST STRIP */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] flex items-start gap-3">
            <span className="text-xl">📞</span>
            <div>
              <div className="text-xs font-bold text-[#1b2a4a]">
                Personal Confirmation Call
              </div>
              <p className="text-[11px] text-[#57534e] mt-0.5">
                Snehal calls every buyer to confirm adult sizes, batch schedule &
                UPI advance.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] flex items-start gap-3">
            <span className="text-xl">🔐</span>
            <div>
              <div className="text-xs font-bold text-[#1b2a4a]">
                WhatsApp OTP Verified
              </div>
              <p className="text-[11px] text-[#57534e] mt-0.5">
                1-tap WhatsApp OTP login ensures genuine phone numbers & smooth
                updates.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <div className="text-xs font-bold text-[#1b2a4a]">
                GPS Pin & Society Drop
              </div>
              <p className="text-[11px] text-[#57534e] mt-0.5">
                Free hand-delivery in our housing society + mobile GPS location
                pinning.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5dccb] flex items-start gap-3">
            <span className="text-xl">✨</span>
            <div>
              <div className="text-xs font-bold text-[#1b2a4a]">
                Pure Ingredients & Weaves
              </div>
              <p className="text-[11px] text-[#57534e] mt-0.5">
                100% pure mulmul/cambric cotton & preservative-free homemade
                foods.
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER PILLS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b2a4a]">
                {effectiveMode === 'ALL' && 'Complete Curated Catalogue'}
                {effectiveMode === 'DRESS_AND_GIFTS' &&
                  "Adult Cotton Dresses, Kurtas, Stoles & Gift Hampers"}
                {effectiveMode === 'FOODS_ONLY' &&
                  "Kids' Clean Snacks & Small-Batch Pantry"}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534e]">
                Select your size or jar pack and add to your WhatsApp Concierge
                Bag.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategorySlug('')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  selectedCategorySlug === ''
                    ? 'bg-[#1b2a4a] text-white border-[#1b2a4a]'
                    : 'bg-white text-[#1c1917] border-[#e5dccb] hover:border-[#1b2a4a]'
                }`}
              >
                All Shown ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                    selectedCategorySlug === cat.slug
                      ? 'bg-[#6b2d26] text-white border-[#6b2d26]'
                      : 'bg-white text-[#1c1917] border-[#e5dccb] hover:border-[#6b2d26]'
                  }`}
                >
                  {cat.name.en}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-2xl bg-white/60 border border-[#e5dccb] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FloatingCartPill />
      <Footer />
    </div>
  );
};
