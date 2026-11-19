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
import { Badge, Button, Icon } from '@/elements';
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

interface SelectedBoxItem {
  product: CatalogProduct;
  variant: CatalogVariant;
  quantity: number;
}

export const GiftsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const existingGiftNote = useAppSelector((s) => s.cart.giftNote);

  const [curatableProducts, setCuratableProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [readyHampers, setReadyHampers] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Map of variantId -> SelectedBoxItem for the Custom Gift Box Builder
  const [boxSelections, setBoxSelections] = useState<
    Record<string, SelectedBoxItem>
  >({});
  const [customNote, setCustomNote] = useState(existingGiftNote || '');
  const [boxAddedToast, setBoxAddedToast] = useState(false);

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

  const handleClearBox = () => {
    setBoxSelections({});
    setBoxAddedToast(false);
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
  };

  const handleProceedToCheckoutWithBox = () => {
    if (!isBoxReady) return;
    commitCustomBoxToCart();
    router.push('/checkout');
  };

  const renderCuratableProductCard = (product: CatalogProduct) => {
    const isFood = isFoodProduct(product);
    return (
      <div
        key={product.id}
        className="cred-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start"
      >
        <img
          src={product.imageUrl}
          alt={product.name.en}
          className="w-full sm:w-28 h-40 sm:h-28 rounded-xl object-cover border border-white/[0.08] shrink-0"
        />

        <div className="flex-1 min-w-0 w-full space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
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
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                {product.name.subtitle}
              </p>
            )}
          </div>

          {/* Variants list for picking into Custom Gift Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {product.variants.map((variant) => {
              const selectedQty = boxSelections[variant.id]?.quantity || 0;
              return (
                <div
                  key={variant.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    selectedQty > 0
                      ? 'bg-primary/10 border-primary/50 shadow-[inset_0_1px_0_rgba(229,194,128,0.2)]'
                      : 'bg-[#090a0f] border-white/[0.08]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-label-md text-xs text-on-surface block truncate">
                      {variant.sizePack}
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">
                      ₹{variant.price}
                    </span>
                  </div>

                  {selectedQty === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateBoxVariantQty(product, variant, 1)
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#171a26] hover:bg-primary hover:text-[#090a0f] text-primary border border-primary/30 font-label-sm text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#090a0f] rounded-lg p-0.5 border border-primary/40 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateBoxVariantQty(
                            product,
                            variant,
                            selectedQty - 1,
                          )
                        }
                        aria-label="Remove one from gift box"
                        className="w-7 h-7 rounded-md hover:bg-primary/15 text-primary flex items-center justify-center cursor-pointer"
                      >
                        <Icon name="remove" className="text-sm" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-on-surface">
                        {selectedQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateBoxVariantQty(
                            product,
                            variant,
                            selectedQty + 1,
                          )
                        }
                        aria-label="Add one more to gift box"
                        className="w-7 h-7 rounded-md hover:bg-primary/15 text-primary flex items-center justify-center cursor-pointer"
                      >
                        <Icon name="add" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 pt-16 sm:pt-20 pb-28">
        <AdvisoryStrip />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
          {/* Top Breadcrumb */}
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

          {/* SECTION 1: CURATE YOUR OWN GIFT BOX BUILDER */}
          <section className="space-y-6">
            <div className="cred-card rounded-3xl p-5 sm:p-7 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(229,194,128,0.14)_0%,transparent_70%)]"
              />
              <div className="relative z-10 max-w-3xl space-y-2">
                <Badge variant="secondaryContainer">
                  <Icon name="redeem" className="text-xs text-primary" />
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold">
                    Zero-Size-Risk Custom Gift Box Builder
                  </span>
                </Badge>
                <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface">
                  Curate Your Own Gift Box
                </h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Select any <strong>2 or more items</strong> below — combine a{' '}
                  <strong>Free-Size Handcrafted Pure Cotton Stole</strong>{' '}
                  with <strong>Pure Bilona A2 Cow Ghee</strong> and{' '}
                  <strong>Dry Fruits Laddus</strong>. Complimentary keepsake box
                  packaging &amp; handwritten family note included at ₹0 extra.
                </p>
              </div>
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
                <div className="lg:col-span-4 h-80 rounded-3xl cred-card animate-pulse" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 8 Columns: Curatable Items (Stoles + Pure Foods) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Step 1: Free-Size Cotton Stoles */}
                  {stoleProducts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/35 text-primary font-mono text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <h2 className="font-headline-sm text-lg text-on-surface">
                          Add Free-Size Pure Cotton Stoles
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {stoleProducts.map(renderCuratableProductCard)}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Pure Homemade Foods (A2 Ghee & Dry Fruits Laddu) */}
                  {foodProducts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-tertiary/15 border border-tertiary/35 text-tertiary font-mono text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <h2 className="font-headline-sm text-lg text-on-surface">
                          Add Pure Homemade Foods (A2 Ghee &amp; Dry Fruits Laddu)
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {foodProducts.map(renderCuratableProductCard)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right 4 Columns: Sticky Custom Gift Box Summary */}
                <div className="lg:col-span-4">
                  <aside className="cred-card rounded-3xl p-5 sm:p-6 sticky top-24 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          name="redeem"
                          className="text-primary text-xl shrink-0"
                        />
                        <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                          Your Custom Gift Box
                        </h3>
                      </div>

                      <Badge variant={isBoxReady ? 'inStock' : 'sizePack'}>
                        {isBoxReady
                          ? `Ready (${totalBoxItems} items)`
                          : `${totalBoxItems}/2 Min`}
                      </Badge>
                    </div>

                    {boxAddedToast && (
                      <div className="p-3.5 rounded-xl bg-tertiary-fixed/80 border border-tertiary/30 text-on-tertiary-fixed text-body-sm space-y-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <Icon name="check_circle" className="text-base" />
                          <span>Custom Gift Box added to your bag!</span>
                        </div>
                        <Link
                          href="/checkout"
                          className="inline-flex items-center gap-1 text-xs font-bold underline"
                        >
                          <span>Proceed to Checkout</span>
                          <Icon name="arrow_forward" className="text-xs" />
                        </Link>
                      </div>
                    )}

                    {selectedItemsList.length === 0 ? (
                      <div className="py-6 text-center space-y-2 bg-[#090a0f] rounded-2xl border border-white/[0.06] px-4">
                        <Icon
                          name="volunteer_activism"
                          className="text-3xl text-primary block mx-auto"
                        />
                        <p className="text-body-sm text-on-surface font-medium">
                          Your custom gift box is empty
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Add at least 2 items from the Cotton Stoles and Pure
                          Foods list to curate your box.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {selectedItemsList.map(
                          ({ product, variant, quantity }) => (
                            <div
                              key={variant.id}
                              className="p-3 rounded-xl bg-[#090a0f] border border-white/[0.08] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-on-surface truncate">
                                  {product.name.en}
                                </p>
                                <p className="text-[11px] text-on-surface-variant">
                                  {variant.sizePack} • {quantity} × ₹
                                  {variant.price}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-xs font-bold text-primary">
                                  ₹{variant.price * quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateBoxVariantQty(
                                      product,
                                      variant,
                                      0,
                                    )
                                  }
                                  className="text-on-surface-variant hover:text-error cursor-pointer"
                                  aria-label="Remove item"
                                >
                                  <Icon name="close" className="text-sm" />
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Personalized Gift Note */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                        Personalized Family / Festive Gift Note
                      </label>
                      <input
                        type="text"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="e.g., Warm festive wishes from our family!"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-white/[0.08] text-body-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Selected Items ({totalBoxItems})</span>
                        <span className="font-mono font-semibold text-on-surface">
                          ₹{totalBoxPrice}
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Keepsake Box &amp; Handwritten Note</span>
                        <span className="font-mono font-semibold text-tertiary">
                          FREE
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
                        <span className="font-label-lg text-on-surface">
                          Custom Box Total
                        </span>
                        <span className="font-headline-md text-2xl font-mono font-bold text-primary">
                          ₹{totalBoxPrice}
                        </span>
                      </div>
                    </div>

                    {!isBoxReady && totalBoxItems > 0 && (
                      <p className="text-xs text-secondary font-medium text-center">
                        Please add {2 - totalBoxItems} more{' '}
                        {2 - totalBoxItems === 1 ? 'item' : 'items'} to complete
                        your custom gift box.
                      </p>
                    )}

                    <div className="space-y-2.5 pt-1">
                      <Button
                        type="button"
                        disabled={!isBoxReady}
                        onClick={handleAddCustomBoxToBag}
                        variant={isBoxReady ? 'primary' : 'disabled'}
                        className="w-full py-3 text-sm"
                      >
                        <Icon name="redeem" className="text-lg shrink-0" />
                        <span>Add Custom Gift Box to Bag</span>
                      </Button>

                      {isBoxReady && (
                        <button
                          type="button"
                          onClick={handleProceedToCheckoutWithBox}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#171a26] hover:bg-[#1e2232] text-primary border border-primary/30 font-label-md text-label-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Curate &amp; Proceed to Checkout</span>
                          <Icon name="arrow_forward" className="text-base" />
                        </button>
                      )}

                      {selectedItemsList.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearBox}
                          className="w-full text-center text-xs text-on-surface-variant hover:text-on-surface cursor-pointer pt-1"
                        >
                          Reset Custom Box
                        </button>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: READY-TO-GIFT SIGNATURE HAMPERS */}
          <section className="pt-6 border-t border-white/[0.08] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.2em] text-primary block mb-1">
                  1-Tap Pre-Curated Keepsake Boxes
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface">
                  Ready-to-Gift Signature Hampers
                </h2>
                <p className="text-body-md text-on-surface-variant mt-0.5">
                  Thoughtfully pre-paired combinations of our Free-Size Pure
                  Cotton Stoles, Bilona A2 Cow Ghee, and Dry Fruits Laddus
                </p>
              </div>
            </div>

            {readyHampers.length === 0 && !loading ? (
              <div className="cred-card rounded-2xl p-8 text-center text-body-md text-on-surface-variant">
                No pre-curated hampers found. Use the Custom Gift Box Builder
                above to create your own!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {readyHampers.map((hamper) => (
                  <ProductCard key={hamper.id} product={hamper} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <FloatingCartPill />
      <BottomNav />
    </div>
  );
};
