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

  const dotColor =
    activeMode === 'FOODS_ONLY'
      ? 'bg-emerald-400'
      : activeMode === 'DRESS_AND_GIFTS'
        ? 'bg-secondary'
        : 'bg-primary';

  return (
    <div className="bg-[#0e1017] border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-body-sm">
        <div className="flex items-center gap-2.5 text-on-surface/90 font-medium">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}
            />
          </span>
          <span className="text-[10.5px] sm:text-xs tracking-normal sm:tracking-wide">{bannerText}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-on-surface-variant text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.06em] sm:tracking-[0.16em] whitespace-nowrap">
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <Icon name="workspace_premium" className="text-sm text-primary" />
            Small-Batch Quality
          </span>
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
          >
            <Icon name="chat" className="text-sm" />
            WhatsApp Concierge
          </a>
        </div>
      </div>
    </div>
  );
};
