import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1b2a4a] text-[#faf7f2] mt-16 border-t border-[#e5dccb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-semibold">
            The House of
          </div>
          <div className="font-serif text-2xl font-bold text-white mt-0.5">
            Aatmiya
          </div>
          <p className="text-xs text-stone-300 mt-2 leading-relaxed">
            Crafted like family. Founded by Arun & Snehal, inspired by our
            daughters Saharsha & Sreeja. Pure 100% cotton clothing for adults,
            clean small-batch kids&apos; snacks, and bespoke gift hampers.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
            Storefront Modes
          </h4>
          <ul className="space-y-2 text-xs text-stone-200">
            <li>
              <Link href="/" className="hover:underline">
                1. Complete Collection (All Categories)
              </Link>
            </li>
            <li>
              <Link href="/boutique" className="hover:underline">
                2. Cotton Dresses, Kurtas, Stoles & Gift Hampers
              </Link>
            </li>
            <li>
              <Link href="/foods" className="hover:underline">
                3. Pure Foods & Kids&apos; Clean Snacks
              </Link>
            </li>
            <li>
              <Link href="/confirm-address" className="hover:underline">
                📍 Confirm Mobile GPS Delivery Address
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
            Our Family Promise
          </h4>
          <ul className="space-y-1.5 text-xs text-stone-300">
            <li>✓ Personal WhatsApp & phone confirmation by Snehal</li>
            <li>✓ Zero Maida, Zero Refined Sugar & Pure Ghee in Foods</li>
            <li>✓ 100% Breathable Mulmul & Handblock Cotton Apparel</li>
            <li>✓ UPI Advance after personal size & batch confirmation</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
