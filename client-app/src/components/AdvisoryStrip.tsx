'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { Icon } from '@/elements';

export const AdvisoryStrip: React.FC = () => {
  const { activeMode, nextFoodBatchLabel, whatsappPhone } = useAppSelector(
    (s) => s.app,
  );

  const bannerText =
    activeMode === 'DRESS_AND_GIFTS'
      ? "Adult Women's 100% Pure Mulmul Cotton Dresses (S–XL), Kurtas & Free-Size Stoles • Personal Fit Check on Call"
      : activeMode === 'FOODS_ONLY'
        ? `${nextFoodBatchLabel} • Ages 3+ • Zero Maida, Zero Refined Sugar, Pure A2 Ghee`
        : `${nextFoodBatchLabel} • Free Hand-Delivery inside our Housing Society`;

  const stripBg =
    activeMode === 'FOODS_ONLY'
      ? 'bg-tertiary-fixed/50 border-tertiary/15'
      : activeMode === 'DRESS_AND_GIFTS'
        ? 'bg-secondary-fixed/50 border-secondary/15'
        : 'bg-surface-container-low border-outline-variant/30';

  return (
    <div className={`${stripBg} border-y`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-body-sm">
        <div className="flex items-center gap-2 text-on-surface font-medium">
          <Icon name="verified" className="text-primary text-lg" filled />
          <span>{bannerText}</span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant text-label-sm">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Icon name="workspace_premium" className="text-sm text-secondary" />
            Small-Batch Quality
          </span>
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            <Icon name="chat" className="text-sm" />
            WhatsApp Concierge
          </a>
        </div>
      </div>
    </div>
  );
};
