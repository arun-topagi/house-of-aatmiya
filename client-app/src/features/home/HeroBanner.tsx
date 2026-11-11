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
    pill: 'Pure Cotton Apparel & Bespoke Gifting',
    title: 'Breathable Pure Cotton Dresses, Kurtas & Gift Hampers.',
    subtitle:
      'Crafted exclusively for adults in 100% handblock mulmul and 60x60 cambric cotton (Sizes S–XL), paired with zero-size-risk artisanal stoles and festive keepsake boxes.',
    ctaPrimary: 'Browse Boutique Collection',
    imageUrl:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
    overlayBadge: "Adult Women's S–XL & Free-Size Stoles",
    overlayTitle: 'Handblock Indigo & Bagh-Print Cotton Collection',
    overlaySub: 'Zero synthetic lining • Pre-washed • Concealed pockets',
    stats: [
      {
        value: '100% Pure Cotton',
        label: 'Handblock Mulmul & 60s Cambric',
        colorClass: 'text-primary',
      },
      {
        value: 'Adult S–XL',
        label: "Women's Dresses & Kurta Sets",
        colorClass: 'text-secondary',
      },
      {
        value: 'Free-Size Stoles',
        label: 'Artisanal Weaves & Gift Boxes',
        colorClass: 'text-primary',
      },
    ],
  },
  FOODS_ONLY: {
    pill: "Clean Kids' & Family Pantry (Ages 3+)",
    title: 'Wholesome Millet, A2 Ghee & Organic Jaggery Snacks.',
    subtitle:
      'Prepared in small weekly batches with sprouted ragi, almonds, and pure cow ghee—zero maida, zero refined white sugar, and zero palm oil.',
    ctaPrimary: 'Reserve Fresh Batch Jars',
    imageUrl:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=85',
    overlayBadge: 'Weekly Fresh Batch',
    overlayTitle: 'Pure A2 Ghee Ragi Cookies & Sprouted Ragi Drink Mix',
    overlaySub: 'Orders close Wednesday • Roasted Thursday • Delivered Friday',
    stats: [
      {
        value: 'Zero Maida',
        label: '100% Sprouted Ragi & Millet',
        colorClass: 'text-tertiary',
      },
      {
        value: 'Organic Jaggery',
        label: 'Zero Refined White Sugar',
        colorClass: 'text-secondary',
      },
      {
        value: 'Pure A2 Ghee',
        label: 'Fresh Weekly Small Batches',
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
        <div className="lg:col-span-7 z-10 flex flex-col justify-center bg-surface-container-lowest p-6 sm:p-10 rounded-2xl shadow-[0_8px_24px_rgba(27,42,74,0.05)] border border-outline-variant/25">
          <Badge variant="secondaryContainer">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">
              {content.pill}
            </span>
          </Badge>

          <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-[42px] text-on-surface mb-4 leading-[1.15]">
            {content.title}
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-7 max-w-xl">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onExploreClick}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-label-lg text-label-lg px-6 py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{content.ctaPrimary}</span>
              <Icon name="arrow_downward" className="text-base" />
            </button>

            <Link
              href="/products"
              className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 border border-outline-variant/30"
            >
              <Icon name="grid_view" className="text-primary text-lg" />
              <span>Full Catalog</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-outline-variant/25">
            {content.stats.map((stat, idx) => (
              <div key={idx}>
                <p
                  className={`font-headline-md text-xl ${stat.colorClass} font-bold`}
                >
                  {stat.value}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Showcase Image Card */}
        <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-auto min-h-[320px] rounded-2xl overflow-hidden shadow-lg border border-outline-variant/25">
          <img
            src={content.imageUrl}
            alt={content.overlayTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6">
            <div className="bg-surface/95 backdrop-blur-md p-4 rounded-xl border border-outline-variant/25">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="heroOverlay">{content.overlayBadge}</Badge>
                <span className="text-label-sm text-secondary font-bold">
                  Crafted Like Family
                </span>
              </div>
              <p className="font-headline-sm text-on-surface mt-1">
                {content.overlayTitle}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {content.overlaySub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
