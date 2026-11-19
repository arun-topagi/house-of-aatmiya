/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, Button, Icon } from '@/elements';
import { CatalogProduct, CatalogVariant } from '@/services';

export interface SelectedBoxItem {
  product: CatalogProduct;
  variant: CatalogVariant;
  quantity: number;
}

export interface GiftBoxSummaryContentProps {
  selectedItemsList: SelectedBoxItem[];
  totalBoxItems: number;
  totalBoxPrice: number;
  isBoxReady: boolean;
  customNote: string;
  onCustomNoteChange: (note: string) => void;
  onUpdateQty: (
    product: CatalogProduct,
    variant: CatalogVariant,
    nextQty: number,
  ) => void;
  onAddBoxToBag: () => void;
  onProceedToCheckout: () => void;
  onClearBox: () => void;
  boxAddedToast: boolean;
}

export const GiftBoxSummaryContent: React.FC<GiftBoxSummaryContentProps> = ({
  selectedItemsList,
  totalBoxItems,
  totalBoxPrice,
  isBoxReady,
  customNote,
  onCustomNoteChange,
  onUpdateQty,
  onAddBoxToBag,
  onProceedToCheckout,
  onClearBox,
  boxAddedToast,
}) => {
  const missingSlots = Math.max(0, 2 - totalBoxItems);
  const progressPercent = Math.min(100, Math.round((totalBoxItems / 2) * 100));

  return (
    <div className="space-y-4">
      {/* Header + Progress Bar */}
      <div className="space-y-2.5 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="redeem" className="text-primary text-xl shrink-0" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
              Inside Your Gift Box
            </h3>
          </div>
          <Badge variant={isBoxReady ? 'inStock' : 'sizePack'}>
            {isBoxReady ? `Ready (${totalBoxItems} items)` : `${totalBoxItems}/2 Min`}
          </Badge>
        </div>

        {/* Visual Progress Meter */}
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-[#090a0f] overflow-hidden border border-white/[0.06]">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isBoxReady
                  ? 'bg-tertiary'
                  : 'bg-gradient-to-r from-[#cfa355] to-[#f0d399]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {isBoxReady
              ? 'Your box qualifies for complimentary keepsake packaging!'
              : `Add ${missingSlots} more ${missingSlots === 1 ? 'item' : 'items'} to unlock free gift box packaging.`}
          </p>
        </div>
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

      {/* Visual Gift Box Slots */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {selectedItemsList.map(({ product, variant, quantity }) => (
          <div
            key={variant.id}
            className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] flex items-center gap-2.5"
          >
            <img
              src={product.imageUrl}
              alt={product.name.en}
              className="w-11 h-11 rounded-lg object-cover border border-white/[0.08] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">
                {product.name.en}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {variant.sizePack} • ₹{variant.price}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-[#141722] rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => onUpdateQty(product, variant, quantity - 1)}
                  aria-label="Decrease box item quantity"
                  className="w-6 h-6 text-primary hover:bg-primary/15 rounded-l-lg flex items-center justify-center cursor-pointer"
                >
                  <Icon name="remove" className="text-xs" />
                </button>
                <span className="w-5 text-center font-mono text-[11px] font-bold text-on-surface">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(product, variant, quantity + 1)}
                  aria-label="Increase box item quantity"
                  className="w-6 h-6 text-primary hover:bg-primary/15 rounded-r-lg flex items-center justify-center cursor-pointer"
                >
                  <Icon name="add" className="text-xs" />
                </button>
              </div>
              <span className="font-mono text-xs font-bold text-primary w-12 text-right">
                ₹{variant.price * quantity}
              </span>
            </div>
          </div>
        ))}

        {/* Dashed Empty Slot Placeholders until 2+ items are added */}
        {Array.from({ length: missingSlots }).map((_, idx) => {
          const slotNumber = totalBoxItems + idx + 1;
          return (
            <div
              key={`empty-slot-${slotNumber}`}
              className="p-3 rounded-xl border border-dashed border-white/[0.15] bg-[#090a0f]/50 flex items-center gap-3 text-on-surface-variant"
            >
              <div className="w-9 h-9 rounded-lg bg-[#141722] border border-white/[0.06] flex items-center justify-center shrink-0">
                <Icon name="add" className="text-base text-primary/70" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-on-surface/80">
                  Gift Box Slot {slotNumber}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {slotNumber === 1
                    ? 'Pick a Cotton Stole or Pure Food'
                    : 'Add 1 more item to complete box'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Personalized Gift Note */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
          Personalized Family / Festive Gift Note
        </label>
        <input
          type="text"
          value={customNote}
          onChange={(e) => onCustomNoteChange(e.target.value)}
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
          <span className="font-mono font-semibold text-tertiary">FREE</span>
        </div>
        <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
          <span className="font-label-lg text-on-surface">Custom Box Total</span>
          <span className="font-headline-md text-2xl font-mono font-bold text-primary">
            ₹{totalBoxPrice}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <Button
          type="button"
          disabled={!isBoxReady}
          onClick={onAddBoxToBag}
          variant={isBoxReady ? 'primary' : 'disabled'}
          className="w-full py-3 text-sm"
        >
          <Icon name="redeem" className="text-lg shrink-0" />
          <span>Add Custom Gift Box to Bag</span>
        </Button>

        {isBoxReady && (
          <button
            type="button"
            onClick={onProceedToCheckout}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171a26] hover:bg-[#1e2232] text-primary border border-primary/30 font-label-md text-label-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Curate &amp; Proceed to Checkout</span>
            <Icon name="arrow_forward" className="text-base" />
          </button>
        )}

        {selectedItemsList.length > 0 && (
          <button
            type="button"
            onClick={onClearBox}
            className="w-full text-center text-xs text-on-surface-variant hover:text-on-surface cursor-pointer pt-1"
          >
            Reset Custom Box
          </button>
        )}
      </div>
    </div>
  );
};
