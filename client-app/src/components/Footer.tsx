'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { Icon } from '@/elements';

export const Footer: React.FC = () => {
  const { whatsappPhone } = useAppSelector((s) => s.app);

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 pt-12 pb-28 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FAF7F2]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" />
              </div>
            </div>
            <div>
              <span className="font-headline-md text-xl text-primary font-bold block leading-none">
                The House of Aatmiya
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-secondary font-semibold block mt-1">
                Crafted Like Family
              </span>
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-lg mb-4">
            Every jar of clean snacks is roasted fresh to weekly batch orders
            with organic jaggery and pure cow ghee, and every adult cotton
            garment is crafted from 100% pure breathable mulmul and cambric
            cotton.
          </p>
          <div className="flex flex-wrap gap-2 text-label-sm">
            <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-primary">
              Zero Maida • Zero Refined Sugar
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-secondary">
              100% Pure Mulmul &amp; Cambric Cotton
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-tertiary">
              Free Housing Society Delivery
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-label-lg text-label-lg text-on-surface mb-3">
            Aatmiya WhatsApp Concierge
          </h4>
          <p className="text-body-sm text-on-surface-variant mb-4">
            Have a question on adult cotton dress sizing (S–XL), custom festive
            gift hampers, or this week&apos;s fresh snack batch?
          </p>
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
              'Namaste! I am browsing The House of Aatmiya and would love your help.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-label-md text-label-md shadow-sm hover:opacity-95 transition-opacity"
          >
            <Icon name="chat" className="text-[18px]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
