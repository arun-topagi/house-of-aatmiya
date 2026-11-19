/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector, StorefrontMode } from '@/store';
import { Badge, Icon } from '@/elements';

export interface HeroBannerProps {
  onExploreClick?: () => void;
}

const HERO_CONTENT: Record<
  StorefrontMode,
  {
    pill: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    imageUrl: string;
    overlayBadge: string;
    overlayTitle: string;
    overlaySub: string;
    stats: {
      value: string;
      label: string;
      colorClass: string;
    }[];
  }
> = {
  ALL: {
    pill: 'The House of Aatmiya • Crafted Like Family',
    title: 'Pure Cotton Elegance & Clean Homemade Foods.',
    subtitle:
      'Small-batch 100% pure mulmul cotton dresses & kurtas for adults, artisanal free-size stoles, and zero-maida, jaggery-sweetened snacks roasted fresh every week.',
    ctaPrimary: 'Explore Curations',
    imageUrl:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
    overlayBadge: 'Signature Boutique & Pantry',
    overlayTitle: '100% Pure Mulmul Cotton & Fresh Weekly Jars',
    overlaySub: 'Personal sizing & gift curation via WhatsApp Concierge',
    stats: [
      {
        value: '100% Pure',
        label: 'Mulmul Cotton & A2 Ghee',
        colorClass: 'text-primary',
      },
      {
        value: 'Adult S–XL',
        label: "Women's Dresses & Kurtas",
        colorClass: 'text-secondary',
      },
      {
        value: 'Zero Maida',
        label: 'Jaggery Clean Snacks (3+)',
        colorClass: 'text-tertiary',
      },
    ],
  },
  DRESS_AND_GIFTS: {
    pill: 'Pure Cotton Apparel Boutique • Crafted Like Family',
    title: 'Pure Cotton Tops, Shirts, Straight Pants & Free-Size Stoles.',
    subtitle:
      "Crafted in 100% breathable mulmul, cambric, and handloom slub cotton—featuring women's tops & pants, men's cotton shirts & trousers, and artisanal free-size stoles.",
    ctaPrimary: 'Explore Cotton Collection',
    imageUrl:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
    overlayBadge: '100% Pure Cotton & Free-Size Stoles',
    overlayTitle: "Women's & Men's Pure Cotton Wear + Handcrafted Stoles",
    overlaySub: 'Zero synthetic lining • Pre-washed • Personal fit confirmation',
    stats: [
      {
        value: '100% Pure Cotton',
        label: 'Mulmul, Cambric & Handloom Slub',
        colorClass: 'text-primary',
      },
      {
        value: 'Women & Men',
        label: 'Tops, Shirts & Straight Pants',
        colorClass: 'text-secondary',
      },
      {
        value: 'Free-Size Stoles',
        label: 'Artisanal Handblock Cotton Stoles',
        colorClass: 'text-primary',
      },
    ],
  },
  FOODS_ONLY: {
    pill: 'Pure Homemade Foods • Small-Batch Kitchen',
    title: 'Pure Bilona A2 Cow Ghee & Organic Jaggery Dry Fruits Laddu.',
    subtitle:
      'Prepared in small weekly batches using traditional curd-churned Gir cow A2 ghee, crunchy dry fruits, dates, and organic jaggery—zero refined sugar or preservatives.',
    ctaPrimary: 'Reserve Fresh Batch Jars',
    imageUrl:
      'https://images.unsplash.com/photo-1605197584547-c93aa1cd8d6b?auto=format&fit=crop&w=1000&q=85',
    overlayBadge: 'Weekly Fresh Batch',
    overlayTitle: 'Bilona A2 Cultured Cow Ghee & Dry Fruits Laddu',
    overlaySub: 'Orders close Wednesday • Prepared Thursday • Delivered Friday',
    stats: [
      {
        value: 'Bilona A2 Ghee',
        label: 'Traditional Curd-Churned Gir Cow',
        colorClass: 'text-tertiary',
      },
      {
        value: 'Organic Jaggery',
        label: 'Zero Refined White Sugar',
        colorClass: 'text-secondary',
      },
      {
        value: 'Rich Dry Fruits',
        label: 'Almonds, Cashews, Pistachios & Dates',
        colorClass: 'text-primary',
      },
    ],
  },
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  const { activeMode } = useAppSelector((s) => s.app);
  const content = HERO_CONTENT[activeMode];

  return (
    <section className="relative overflow-hidden pt-6 pb-8 md:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Editorial Headline */}
        <div className="lg:col-span-7 relative overflow-hidden z-10 flex flex-col justify-center bg-[#11131c] p-6 sm:p-10 rounded-3xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),0_20px_50px_rgba(0,0,0,0.55)]">
          {/* Subtle Ambient Radial Champagne Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(229,194,128,0.14)_0%,transparent_70%)]"
          />

          <Badge variant="secondaryContainer">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="font-mono text-[8.5px] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.2em] font-semibold whitespace-nowrap">
              {content.pill}
            </span>
          </Badge>

          <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-[-0.03em] bg-gradient-to-br from-white via-white to-white/65 bg-clip-text text-transparent mb-4">
            {content.title}
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-7 max-w-xl leading-relaxed">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onExploreClick}
              className="bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-label-lg text-label-lg font-bold px-6 py-3.5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_28px_rgba(229,194,128,0.22)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{content.ctaPrimary}</span>
              <Icon name="arrow_downward" className="text-base" />
            </button>

            <Link
              href="/products"
              className="bg-[#171a26] hover:bg-[#1e2232] text-on-surface font-label-lg text-label-lg px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98]"
            >
              <Icon name="grid_view" className="text-primary text-lg" />
              <span>Full Catalog</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-8 pt-6 border-t border-white/[0.08]">
            {content.stats.map((stat, idx) => (
              <div
                key={idx}
                className={idx > 0 ? 'pl-2.5 sm:pl-3 border-l border-white/[0.06]' : ''}
              >
                <p
                  className={`font-headline-md text-[13px] sm:text-xl ${stat.colorClass} font-bold tracking-tight whitespace-nowrap`}
                >
                  {stat.value}
                </p>
                <p className="text-[9.5px] sm:text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Showcase Image Card */}
        <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-auto min-h-[320px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/[0.09]">
          <img
            src={content.imageUrl}
            alt={content.overlayTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f]/95 via-[#090a0f]/35 to-transparent flex flex-col justify-end p-3 sm:p-6">
            <div className="bg-[#090a0f]/85 backdrop-blur-2xl p-3 sm:p-4 rounded-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5">
                <Badge variant="heroOverlay">{content.overlayBadge}</Badge>
                <span className="text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.04em] sm:tracking-[0.16em] text-primary font-bold whitespace-nowrap">
                  Crafted Like Family
                </span>
              </div>
              <p className="font-headline-sm text-[12.5px] sm:text-base text-on-surface mt-1 whitespace-nowrap">
                {content.overlayTitle}
              </p>
              <p className="text-[10.5px] sm:text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                {content.overlaySub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
