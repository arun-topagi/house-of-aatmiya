"use client";

import React from 'react';
import {
  AdminTab,
  setActiveTab,
  useAppDispatch,
  useAppSelector,
} from '@/store';

export const AdminHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab, adminName } = useAppSelector((s) => s.admin);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'ORDERS', label: '1. Order Concierge & UPI' },
    { id: 'STOREFRONT_MODES', label: '2. Client 3-Mode Control' },
    { id: 'KITCHEN_PREP', label: '3. Kitchen Batch Prep' },
    { id: 'PRODUCTS_CMS', label: '4. Products & Margin CMS' },
    { id: 'REORDER_RADAR', label: '5. 25-Day Reorder Radar' },
  ];

  return (
    <header className="bg-[#1b2a4a] text-white border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-1 p-1.5 rounded-lg bg-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-sky-300" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-amber-300 font-semibold">
                The House of Aatmiya • Founder Console
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold">
                Snehal&apos;s Boutique & Kitchen Dashboard
              </span>
            </div>
          </div>

          <span className="md:hidden text-xs bg-white/15 px-2.5 py-1 rounded-full">
            {adminName}
          </span>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => dispatch(setActiveTab(t.id))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-400 text-[#1b2a4a] shadow-xs'
                  : 'bg-white/10 text-stone-200 hover:bg-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
