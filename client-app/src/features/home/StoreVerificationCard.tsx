'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { Icon } from '@/elements';

export const StoreVerificationCard: React.FC = () => {
  const { activeMode, whatsappPhone } = useAppSelector((s) => s.app);

  const guaranteeLine =
    activeMode === 'DRESS_AND_GIFTS'
      ? '100% Pure Mulmul & Cambric Cotton (Adults S–XL) • Zero Synthetic Lining'
      : activeMode === 'FOODS_ONLY'
        ? '100% Zero Maida • Organic Jaggery • Pure Cow Ghee Weekly Batches'
        : '100% Pure Mulmul Cotton (Adults S–XL) • Zero-Maida Jaggery Snacks';

  return (
    <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column 1: Purity Verification */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="verified" className="text-2xl" filled />
            </div>
            <div>
              <span className="text-label-sm font-label-sm text-primary uppercase tracking-wider block">
                The Aatmiya Guarantee
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                The House of Aatmiya
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Crafted Like Family • Small-Batch Boutique &amp; Clean Pantry
              </p>
              <p className="text-body-sm text-on-surface mt-1 font-medium">
                {guaranteeLine}
              </p>
            </div>
          </div>

          {/* Column 2: Batch Schedule & Direct Concierge */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 border-y lg:border-y-0 lg:border-x border-outline-variant/30 py-4 lg:py-0 lg:px-6">
            <div className="flex items-center gap-3">
              <Icon name="schedule" className="text-secondary" />
              <div>
                <p className="text-label-sm font-label-sm text-on-surface">
                  Batch &amp; Boutique Schedule
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Orders close Wed • Prepared Thu • Dispatched Fri
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="call" className="text-primary" />
              <div>
                <p className="text-label-sm font-label-sm text-on-surface">
                  Personal WhatsApp Concierge
                </p>
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-sm text-primary font-semibold hover:underline"
                >
                  +{whatsappPhone} (Fit Check &amp; Custom Hampers)
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Society Hand-Delivery & GPS Pin */}
          <div className="relative h-36 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center p-5">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#1b2a4a_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative z-10 bg-surface/95 backdrop-blur-md px-5 py-3.5 rounded-xl shadow-sm flex items-center gap-3 border border-outline-variant/25">
              <Icon name="my_location" className="text-secondary text-2xl" />
              <div className="text-left">
                <p className="font-label-md text-label-md text-on-surface">
                  1-Tap GPS &amp; Society Delivery
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Free doorstep drop inside our Housing Society
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
