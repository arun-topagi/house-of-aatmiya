'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { Icon, BrandMark } from '@/elements';

export const Footer: React.FC = () => {
  const { whatsappPhone } = useAppSelector((s) => s.app);

  return (
    <footer className="bg-[#07080c] border-t border-white/[0.08] pt-12 pb-28 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <BrandMark size="sm" />
            <div>
              <span className="font-headline-md text-lg sm:text-xl text-on-surface font-bold block leading-none whitespace-nowrap">
                The House of Aatmiya
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.22em] text-primary font-semibold block mt-1 whitespace-nowrap">
                Crafted Like Family
              </span>
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-lg mb-5 leading-relaxed">
            Every jar of clean snacks is roasted fresh to weekly batch orders
            with organic jaggery and pure cow ghee, and every adult cotton
            garment is crafted from 100% pure breathable mulmul and cambric
            cotton.
          </p>
          <div className="flex flex-wrap gap-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.04em] sm:tracking-wider">
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#11131c] border border-white/[0.08] text-primary whitespace-nowrap">
              Zero Maida • Zero Refined Sugar
            </span>
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#11131c] border border-white/[0.08] text-secondary whitespace-nowrap">
              100% Pure Mulmul &amp; Cambric Cotton
            </span>
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#11131c] border border-white/[0.08] text-tertiary whitespace-nowrap">
              Free Housing Society Delivery
            </span>
          </div>
        </div>

        <div className="cred-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary block mb-1 whitespace-nowrap">
              Direct Concierge
            </span>
            <h4 className="font-headline-sm text-on-surface mb-2">
              Aatmiya WhatsApp Concierge
            </h4>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Have a question on adult cotton dress sizing (S–XL), custom festive
              gift hampers, or this week&apos;s fresh snack batch?
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
              'Namaste! I am browsing The House of Aatmiya and would love your help.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/35 text-[#4ade80] hover:bg-[#25D366]/25 font-label-md text-label-md transition-all active:scale-[0.98]"
          >
            <Icon name="chat" className="text-[18px]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
