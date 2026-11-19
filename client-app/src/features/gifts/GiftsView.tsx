/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Header,
  AdvisoryStrip,
  ProductCard,
  FloatingCartPill,
  BottomNav,
  Footer,
} from '@/components';
import { Badge, Icon } from '@/elements';
import {
  CatalogProduct,
  CatalogVariant,
  catalogService,
  isFoodProduct,
} from '@/services';
import {
  addToCart,
  setGiftNote,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { GiftBoxItemCard } from './GiftBoxItemCard';
import {
  GiftBoxSummaryContent,
  SelectedBoxItem,
} from './GiftBoxSummaryContent';

type GiftsTab = 'curate' | 'hampers';
type GiftFilter = 'ALL' | 'STOLES' | 'FOODS';

export const GiftsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const existingGiftNote = useAppSelector((s) => s.cart.giftNote);

  const [activeTab, setActiveTab] = useState<GiftsTab>('curate');
  const [giftFilter, setGiftFilter] = useState<GiftFilter>('ALL');
  const [curatableProducts, setCuratableProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [readyHampers, setReadyHampers] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [boxSelections, setBoxSelections] = useState<
    Record<string, SelectedBoxItem>
  >({});
  const [customNote, setCustomNote] = useState(existingGiftNote || '');
  const [boxAddedToast, setBoxAddedToast] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    catalogService
      .getGiftingCatalog()
      .then(({ curatableProducts: curatable, readyHampers: hampers }) => {
        setCuratableProducts(curatable);
        setReadyHampers(hampers);
      })
      .catch(() => {
        setCuratableProducts([]);
        setReadyHampers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stoleProducts = useMemo(
    () => curatableProducts.filter((p) => !isFoodProduct(p)),
    [curatableProducts],
  );

  const foodProducts = useMemo(
    () => curatableProducts.filter((p) => isFoodProduct(p)),
    [curatableProducts],
  );

  const filteredCuratableProducts = useMemo(() => {
    if (giftFilter === 'STOLES') return stoleProducts;
    if (giftFilter === 'FOODS') return foodProducts;
    return curatableProducts;
  }, [giftFilter, stoleProducts, foodProducts, curatableProducts]);

  const selectedItemsList = useMemo(
    () => Object.values(boxSelections).filter((item) => item.quantity > 0),
    [boxSelections],
  );

  const totalBoxItems = useMemo(
    () => selectedItemsList.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItemsList],
  );

  const totalBoxPrice = useMemo(
    () =>
      selectedItemsList.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0,
      ),
    [selectedItemsList],
  );

  const isBoxReady = totalBoxItems >= 2;

  const getVariantQty = (variantId: string) =>
    boxSelections[variantId]?.quantity || 0;

  const handleUpdateBoxVariantQty = (
    product: CatalogProduct,
    variant: CatalogVariant,
    nextQty: number,
  ) => {
    setBoxAddedToast(false);
    setBoxSelections((prev) => {
      const updated = { ...prev };
      if (nextQty <= 0) {
        delete updated[variant.id];
      } else {
        updated[variant.id] = {
          product,
          variant,
          quantity: nextQty,
        };
      }
      return updated;
    });
  };

  const handleApplyStarterPreset = (preset: 'classic' | 'trio') => {
    setBoxAddedToast(false);
    const nextSelections: Record<string, SelectedBoxItem> = {};

    const stole = stoleProducts[0];
    if (stole && stole.variants[0]) {
      nextSelections[stole.variants[0].id] = {
        product: stole,
        variant: stole.variants[0],
        quantity: 1,
      };
    }

    if (preset === 'classic') {
      const laddu =
        foodProducts.find(
          (p) =>
            p.sku === 'HOA-FD-02' ||
            p.name.en.toLowerCase().includes('laddu'),
        ) || foodProducts[0];
      if (laddu && laddu.variants[0]) {
        nextSelections[laddu.variants[0].id] = {
          product: laddu,
          variant: laddu.variants[0],
          quantity: 1,
        };
      }
    } else {
      for (const food of foodProducts.slice(0, 2)) {
        if (food.variants[0]) {
          nextSelections[food.variants[0].id] = {
            product: food,
            variant: food.variants[0],
            quantity: 1,
          };
        }
      }
    }

    setBoxSelections(nextSelections);
  };

  const handleClearBox = () => {
    setBoxSelections({});
    setBoxAddedToast(false);
    setIsMobileDrawerOpen(false);
  };

  const commitCustomBoxToCart = () => {
    if (!isBoxReady) return;

    for (const { product, variant, quantity } of selectedItemsList) {
      dispatch(
        addToCart({
          productId: product.id,
          variantId: variant.id,
          sku: product.sku,
          productName: `${product.name.en} (Custom Gift Box)`,
          categorySlug: product.category?.slug || 'hampers',
          sizePack: variant.sizePack,
          unitPrice: variant.price,
          quantity,
          imageUrl: product.imageUrl,
          isMadeToBatch: variant.isMadeToBatch,
        }),
      );
    }

    const formattedNote = customNote.trim()
      ? `[Custom Curated Gift Box] ${customNote.trim()}`
      : '[Custom Curated Gift Box — Complimentary Keepsake Box]';
    dispatch(setGiftNote(formattedNote));
  };

  const handleAddCustomBoxToBag = () => {
    if (!isBoxReady) return;
    commitCustomBoxToCart();
    setBoxSelections({});
    setBoxAddedToast(true);
    setIsMobileDrawerOpen(false);
  };

  const handleProceedToCheckoutWithBox = () => {
    if (!isBoxReady) return;
    commitCustomBoxToCart();
    setIsMobileDrawerOpen(false);
    router.push('/checkout');
  };

  const showMobileGiftTray = activeTab === 'curate' && totalBoxItems > 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main
        className={`flex-1 pt-16 sm:pt-20 ${
          showMobileGiftTray ? 'pb-40 lg:pb-28' : 'pb-28'
        }`}
      >
        <AdvisoryStrip />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* Top Breadcrumb + View Bag */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Icon name="home" className="text-sm" />
                <span>Home</span>
              </Link>
              <Icon name="chevron_right" className="text-sm" />
              <span className="text-primary font-bold">Gifts</span>
            </div>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 text-label-md font-label-md text-primary hover:underline"
            >
              <Icon name="shopping_bag" className="text-base" />
              <span>View Bag</span>
            </Link>
          </div>

          {/* 2-Tab Switcher: Curate Your Own Box | Ready Hampers */}
          <div className="flex items-center bg-[#11131c] p-1.5 rounded-2xl border border-white/[0.08] max-w-md shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={() => setActiveTab('curate')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'curate'
                  ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="redeem" className="text-base sm:text-lg" />
              <span>Curate Your Box</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hampers')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'hampers'
                  ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="inventory_2" className="text-base sm:text-lg" />
              <span>Ready Hampers</span>
              {readyHampers.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === 'hampers'
                      ? 'bg-[#090a0f]/15 text-[#090a0f]'
                      : 'bg-white/[0.08] text-on-surface-variant'
                  }`}
                >
                  {readyHampers.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: CURATE YOUR OWN GIFT BOX */}
          {activeTab === 'curate' && (
            <section className="space-y-6">
              {/* Explainer Banner + 3 Visual Steps + 1-Tap Starter Presets */}
              <div className="cred-card rounded-3xl p-5 sm:p-7 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(229,194,128,0.14)_0%,transparent_70%)]"
                />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <Badge variant="secondaryContainer">
                      <Icon name="redeem" className="text-xs text-primary" />
                      <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold">
                        Zero-Size-Risk Custom Gift Box
                      </span>
                    </Badge>
                    <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface">
                      Curate Your Own Gift Box
                    </h1>
                    <p className="text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed">
                      Mix and match any <strong>2 or more items</strong> — pair
                      a <strong>Free-Size Cotton Stole</strong> with{' '}
                      <strong>Bilona A2 Ghee</strong> &amp;{' '}
                      <strong>Dry Fruits Laddus</strong>. Keepsake box &amp;
                      handwritten note included free.
                    </p>

                    {/* Quick 3-Step Visual Guide */}
                    <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
                      <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          1
                        </span>
                        <span className="text-[11px] font-medium text-on-surface leading-tight">
                          Pick 2+ Items
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-tertiary/15 text-tertiary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span className="text-[11px] font-medium text-on-surface leading-tight">
                          Free Gift Box
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span className="text-[11px] font-medium text-on-surface leading-tight">
                          Add Note
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Starter Presets */}
                  {!loading && curatableProducts.length > 0 && (
                    <div className="bg-[#090a0f] border border-white/[0.08] rounded-2xl p-4 space-y-2.5 lg:w-72 shrink-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold block">
                        Quick-Fill Starter Combos
                      </span>
                      <p className="text-xs text-on-surface-variant">
                        Not sure where to start? Pre-fill a box and customize it:
                      </p>
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyStarterPreset('classic')}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#141722] hover:bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                        >
                          <span>Try Classic Combo (Stole + Laddu)</span>
                          <Icon name="bolt" className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyStarterPreset('trio')}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#141722] hover:bg-tertiary/15 border border-tertiary/30 text-tertiary text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                        >
                          <span>Try Festive Trio (Stole + Ghee + Laddu)</span>
                          <Icon name="auto_awesome" className="text-base" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(
                  [
                    { id: 'ALL', label: 'All Giftables', icon: 'apps' },
                    { id: 'STOLES', label: 'Cotton Stoles', icon: 'styler' },
                    { id: 'FOODS', label: 'Pure Foods', icon: 'nutrition' },
                  ] as { id: GiftFilter; label: string; icon: string }[]
                ).map((pill) => {
                  const isSelected = giftFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setGiftFilter(pill.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                          : 'bg-[#11131c] text-on-surface-variant border border-white/[0.08] hover:text-on-surface'
                      }`}
                    >
                      <Icon name={pill.icon} className="text-base" />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-44 rounded-2xl cred-card animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="lg:col-span-4 hidden lg:block h-96 rounded-3xl cred-card animate-pulse" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left 8 Columns: Clean Gift Item Cards */}
                  <div className="lg:col-span-8 space-y-4">
                    {filteredCuratableProducts.map((product) => (
                      <GiftBoxItemCard
                        key={product.id}
                        product={product}
                        getVariantQty={getVariantQty}
                        onUpdateQty={handleUpdateBoxVariantQty}
                      />
                    ))}
                  </div>

                  {/* Right 4 Columns: Desktop Sticky Custom Gift Box Summary */}
                  <div className="hidden lg:block lg:col-span-4">
                    <aside className="cred-card rounded-3xl p-6 sticky top-24">
                      <GiftBoxSummaryContent
                        selectedItemsList={selectedItemsList}
                        totalBoxItems={totalBoxItems}
                        totalBoxPrice={totalBoxPrice}
                        isBoxReady={isBoxReady}
                        customNote={customNote}
                        onCustomNoteChange={setCustomNote}
                        onUpdateQty={handleUpdateBoxVariantQty}
                        onAddBoxToBag={handleAddCustomBoxToBag}
                        onProceedToCheckout={handleProceedToCheckoutWithBox}
                        onClearBox={handleClearBox}
                        boxAddedToast={boxAddedToast}
                      />
                    </aside>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 2: READY-TO-GIFT SIGNATURE HAMPERS */}
          {activeTab === 'hampers' && (
            <section className="space-y-6">
              <div className="cred-card rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.2em] text-primary block mb-1">
                    1-Tap Pre-Curated Keepsake Boxes
                  </span>
                  <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface">
                    Ready-to-Gift Signature Hampers
                  </h1>
                  <p className="text-body-sm sm:text-body-md text-on-surface-variant mt-1">
                    Thoughtfully pre-paired combinations of our Free-Size Pure
                    Cotton Stoles, Bilona A2 Cow Ghee, and Dry Fruits Laddus.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('curate')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#171a26] hover:bg-[#1e2232] text-primary border border-primary/30 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all"
                >
                  <Icon name="tune" className="text-base" />
                  <span>Curate Custom Box Instead</span>
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="h-96 rounded-2xl cred-card animate-pulse"
                    />
                  ))}
                </div>
              ) : readyHampers.length === 0 ? (
                <div className="cred-card rounded-2xl p-8 text-center text-body-md text-on-surface-variant">
                  No pre-curated hampers found. Switch to &quot;Curate Your
                  Box&quot; to build your own!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {readyHampers.map((hamper) => (
                    <ProductCard key={hamper.id} product={hamper} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* STICKY MOBILE GIFT BOX TRAY BAR (lg:hidden, sits cleanly above BottomNav) */}
      {showMobileGiftTray && (
        <div className="lg:hidden fixed bottom-16 left-0 w-full z-40 bg-[#11131c]/95 backdrop-blur-2xl border-t border-primary/30 shadow-[0_-12px_32px_rgba(0,0,0,0.8)] px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
            >
              <div className="flex -space-x-2 shrink-0">
                {selectedItemsList.slice(0, 3).map(({ product, variant }) => (
                  <img
                    key={variant.id}
                    src={product.imageUrl}
                    alt={product.name.en}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#11131c]"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-primary">
                    ₹{totalBoxPrice}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      isBoxReady
                        ? 'bg-tertiary/20 text-tertiary'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {isBoxReady
                      ? `${totalBoxItems} items • Ready`
                      : `${totalBoxItems}/2 Min`}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {isBoxReady
                    ? 'Free gift box unlocked • Tap to review'
                    : 'Add 1 more item to unlock box'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Review Box</span>
              <Icon name="expand_less" className="text-base" />
            </button>
          </div>
        </div>
      )}

      {/* EXPANDABLE MOBILE GIFT BOX DRAWER */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 bg-[#11131c] border-t border-white/[0.12] rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-[0_-20px_50px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto" />
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label="Close gift box drawer"
                className="p-1.5 rounded-full bg-[#171a26] text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            <GiftBoxSummaryContent
              selectedItemsList={selectedItemsList}
              totalBoxItems={totalBoxItems}
              totalBoxPrice={totalBoxPrice}
              isBoxReady={isBoxReady}
              customNote={customNote}
              onCustomNoteChange={setCustomNote}
              onUpdateQty={handleUpdateBoxVariantQty}
              onAddBoxToBag={handleAddCustomBoxToBag}
              onProceedToCheckout={handleProceedToCheckoutWithBox}
              onClearBox={handleClearBox}
              boxAddedToast={boxAddedToast}
            />
          </div>
        </div>
      )}

      <Footer />
      {!showMobileGiftTray && <FloatingCartPill />}
      <BottomNav />
    </div>
  );
};
