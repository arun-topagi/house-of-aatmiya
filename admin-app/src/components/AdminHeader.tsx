'use client';

import React from 'react';
import {
  AdminTab,
  logoutAdmin,
  setActiveTab,
  useAppDispatch,
  useAppSelector,
} from '@/store';

const CORE_TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'ORDERS', label: 'Orders & Concierge', icon: 'receipt_long' },
  { id: 'KITCHEN_PREP', label: 'Kitchen Batch Prep', icon: 'soup_kitchen' },
  { id: 'PRODUCTS_CMS', label: 'Products & Margins', icon: 'inventory_2' },
  {
    id: 'STOREFRONT_MODES',
    label: '3-Mode Storefront',
    icon: 'tune',
  },
];

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((s) => s.admin);

  return (
    <aside
      aria-label="Admin Navigation"
      className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_4px_rgba(20,27,43,0.06)] z-50 flex-col justify-between select-none"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="pt-5 pb-4 px-5 flex items-center gap-2.5 border-b border-outline-variant/20">
          <div className="w-8 h-8 rounded-lg bg-[#166534] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-white text-xl leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
          <div>
            <span className="font-headline-sm text-[17px] font-bold text-[#166534] leading-tight block">
              House of Aatmiya
            </span>
            <span className="text-[10px] font-semibold text-outline uppercase tracking-wider block">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Core Navigation */}
        <div className="px-3 pt-4 pb-1">
          <span className="px-2.5 text-[11px] font-semibold text-outline uppercase tracking-wider block mb-2">
            CORE NAVIGATION
          </span>
          <nav className="flex flex-col gap-1">
            {CORE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => dispatch(setActiveTab(tab.id))}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 font-medium rounded-lg transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">
                      {tab.icon}
                    </span>
                    <span className="text-[14px]">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Storefront Link & Logout */}
      <div className="p-3 bg-slate-50/60 border-t border-outline-variant/30 space-y-1.5">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-[#166534] hover:bg-emerald-50 transition-all text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            <span>Open Client Storefront</span>
          </span>
          <span className="material-symbols-outlined text-[16px]">
            open_in_new
          </span>
        </a>

        <button
          type="button"
          onClick={() => dispatch(logoutAdmin())}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-error hover:bg-error-container/20 transition-all cursor-pointer text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const AdminHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab, adminName, adminEmail } = useAppSelector((s) => s.admin);

  const activeTabObj =
    CORE_TABS.find((t) => t.id === activeTab) || CORE_TABS[0];

  return (
    <>
      <Sidebar />

      <header
        role="banner"
        className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-md shadow-[0_1px_4px_rgba(20,27,43,0.04)] border-b border-outline-variant/25 z-40 flex items-center justify-between px-4 sm:px-6 select-none"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-on-surface-variant text-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-[#166534]">
              home
            </span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold">
              {activeTabObj.label}
            </span>
          </nav>
        </div>

        {/* Admin Profile Cluster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
            <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
              {(adminName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-on-surface block leading-none">
                {adminName}
              </span>
              <span className="text-[10px] text-[#166534] font-semibold block mt-0.5">
                {adminEmail}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(logoutAdmin())}
            title="Sign Out"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Strip (Below Header on <lg screens) */}
      <div className="lg:hidden pt-16 bg-surface-container-lowest border-b border-outline-variant/25 px-4 py-2 flex gap-2 overflow-x-auto">
        {CORE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#166534] text-white'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
