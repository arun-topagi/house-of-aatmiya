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
      <div className="cred-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(229,194,128,0.08)_0%,transparent_70%)]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
          {/* Column 1: Purity Verification */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_18px_rgba(229,194,128,0.2)]">
              <Icon name="verified" className="text-2xl" filled />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-mono text-primary uppercase tracking-[0.1em] sm:tracking-[0.2em] block whitespace-nowrap">
                The Aatmiya Guarantee
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                The House of Aatmiya
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Crafted Like Family • Small-Batch Boutique &amp; Clean Pantry
              </p>
              <p className="text-body-sm text-on-surface mt-1.5 font-medium">
                {guaranteeLine}
              </p>
            </div>
          </div>

          {/* Column 2: Batch Schedule & Direct Concierge */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 border-y lg:border-y-0 lg:border-x border-white/[0.08] py-4 lg:py-0 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#171a26] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Icon name="schedule" className="text-secondary text-lg" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-on-surface">
                  Batch &amp; Boutique Schedule
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Orders close Wed • Prepared Thu • Dispatched Fri
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#171a26] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Icon name="call" className="text-primary text-lg" />
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-on-surface">
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
          <div className="relative h-36 rounded-2xl overflow-hidden bg-[#090a0f] border border-white/[0.08] flex items-center justify-center p-5">
            <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#e5c280_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="relative z-10 bg-[#11131c]/90 backdrop-blur-xl px-5 py-3.5 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-3 border border-white/[0.1]">
              <Icon name="my_location" className="text-primary text-2xl" />
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
