/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { AdminProduct, StorefrontMode } from '@/services';

export interface ProductFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  onSaveProduct: (
    payload: {
      id?: string;
      sku: string;
      categorySlug: string;
      name: { en: string; subtitle?: string; badge?: string };
      description: { en: string };
      usage: { en: string };
      images: string[];
      variants: Array<{
        id?: string;
        sizePack: string;
        costPrice: number;
        price: number;
        stockQty: number;
        isMadeToBatch: boolean;
        isAvailable: boolean;
      }>;
      isFeatured: boolean;
      isActive: boolean;
    },
    isEdit: boolean,
  ) => Promise<void>;
}

const CATEGORY_PRESETS: Array<{
  slug: string;
  label: string;
  modeGroup: StorefrontMode;
}> = [
  {
    slug: 'kids-snacks',
    label: "Kids' Clean Snacks & Pantry",
    modeGroup: 'FOODS_ONLY',
  },
  {
    slug: 'dresses',
    label: "Women's Pure Cotton Dresses",
    modeGroup: 'DRESS_AND_GIFTS',
  },
  {
    slug: 'kurtas',
    label: 'Pure Cotton Kurtas & Co-ords',
    modeGroup: 'DRESS_AND_GIFTS',
  },
  {
    slug: 'stoles',
    label: 'Handcrafted Cotton Stoles',
    modeGroup: 'DRESS_AND_GIFTS',
  },
  {
    slug: 'hampers',
    label: 'Signature Gift Hampers',
    modeGroup: 'DRESS_AND_GIFTS',
  },
];

interface EditableVariant {
  id?: string;
  sizePack: string;
  costPrice: string;
  price: string;
  stockQty: string;
  isMadeToBatch: boolean;
}

export const ProductFlyout: React.FC<ProductFlyoutProps> = ({
  isOpen,
  onClose,
  product,
  onSaveProduct,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [sku, setSku] = useState('');
  const [categorySlug, setCategorySlug] = useState('kids-snacks');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [badgeEn, setBadgeEn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [usageEn, setUsageEn] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [variants, setVariants] = useState<EditableVariant[]>([
    {
      sizePack: '',
      costPrice: '',
      price: '',
      stockQty: '20',
      isMadeToBatch: false,
    },
  ]);

  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const extractField = (
      val: unknown,
      key: 'en' | 'subtitle' | 'badge' = 'en',
    ): string => {
      if (!val) return '';
      if (typeof val === 'string') return key === 'en' ? val : '';
      const rec = val as Record<string, unknown>;
      return typeof rec[key] === 'string' ? (rec[key] as string) : '';
    };

    setFormError(null);
    setNewImageUrl('');

    if (product) {
      setSku(product.sku || '');
      setCategorySlug(product.category?.slug || 'kids-snacks');
      setTitleEn(extractField(product.name, 'en'));
      setSubtitleEn(extractField(product.name, 'subtitle'));
      setBadgeEn(extractField(product.name, 'badge'));
      setDescEn(extractField(product.description, 'en'));
      setUsageEn(extractField(product.usage, 'en'));

      if (Array.isArray(product.images) && product.images.length > 0) {
        setImages(
          product.images.map((img) =>
            typeof img === 'string' ? img : img.url || '',
          ),
        );
      } else {
        setImages([]);
      }

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            id: v.id,
            sizePack: v.sizePack,
            costPrice: String(v.costPrice ?? ''),
            price: String(v.price ?? ''),
            stockQty: String(v.stockQty ?? 15),
            isMadeToBatch: Boolean(v.isMadeToBatch),
          })),
        );
      } else {
        setVariants([
          {
            sizePack: '',
            costPrice: '',
            price: '',
            stockQty: '20',
            isMadeToBatch: false,
          },
        ]);
      }

      setIsFeatured(product.isFeatured ?? false);
      setIsActive(product.isActive ?? true);
    } else {
      setSku(`HOA-${Math.floor(100 + Math.random() * 900)}`);
      setCategorySlug('kids-snacks');
      setTitleEn('');
      setSubtitleEn('');
      setBadgeEn('');
      setDescEn('');
      setUsageEn('');
      setImages([]);
      setVariants([
        {
          sizePack: '',
          costPrice: '',
          price: '',
          stockQty: '20',
          isMadeToBatch: true,
        },
      ]);
      setIsFeatured(false);
      setIsActive(true);
    }
  }, [product, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  const handleSave = async () => {
    setFormError(null);
    if (!titleEn.trim()) {
      setFormError('Please enter the Product Title.');
      return;
    }

    const validVariants = variants.filter(
      (v) => v.sizePack.trim() && Number(v.price) > 0,
    );
    if (validVariants.length === 0) {
      setFormError(
        'Please add at least one Size/Pack Variant with a valid selling price.',
      );
      return;
    }

    setIsLoading(true);
    try {
      await onSaveProduct(
        {
          id: product?.id,
          sku: sku.trim() || `HOA-${Math.floor(100 + Math.random() * 900)}`,
          categorySlug,
          name: {
            en: titleEn.trim(),
            subtitle: subtitleEn.trim() || undefined,
            badge: badgeEn.trim() || undefined,
          },
          description: { en: descEn.trim() },
          usage: { en: usageEn.trim() },
          images:
            images.length > 0
              ? images
              : [
                  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
                ],
          variants: validVariants.map((v) => {
            const p = Number(v.price) || 0;
            const c =
              Number(v.costPrice) > 0
                ? Number(v.costPrice)
                : Math.round(p * 0.42);
            return {
              id: v.id,
              sizePack: v.sizePack.trim(),
              costPrice: c,
              price: p,
              stockQty: Number(v.stockQty) || 15,
              isMadeToBatch: v.isMadeToBatch,
              isAvailable: true,
            };
          }),
          isFeatured,
          isActive,
        },
        Boolean(product?.id),
      );
      onClose();
    } catch {
      setFormError('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-inverse-surface/40 z-50 backdrop-blur-[2px] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      id="flyout-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-[540px] bg-surface-container-lowest shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="flyout-panel"
      >
        {/* Flyout Header */}
        <div className="p-6 bg-surface-container flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant text-xs uppercase font-bold">
                Catalog SKU
              </span>
              <span className="font-mono text-xs text-on-surface-variant font-semibold">
                {product ? product.sku : 'NEW'}
              </span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mt-1">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="Close Panel (Esc)"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Flyout Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: Product Content & Category */}
          <div className="bg-surface rounded-lg p-4 shadow-xs space-y-4">
            <label className="text-xs text-on-surface uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">
                edit_note
              </span>
              1. Product Identity &amp; Content
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1">
                  SKU Code *
                </label>
                <input
                  className="w-full h-10 px-3 rounded bg-surface-container-lowest text-on-surface font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                  type="text"
                  placeholder="HOA-KS-05"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1">
                  Category *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full h-10 px-3 rounded bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200 cursor-pointer"
                >
                  {CATEGORY_PRESETS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant font-medium mb-1">
                Product Title *
              </label>
              <input
                className="w-full h-10 px-3 rounded bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                type="text"
                placeholder="Enter product title"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1">
                  Subtitle / Benefit Tagline
                </label>
                <input
                  className="w-full h-9 px-3 rounded bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                  type="text"
                  placeholder="e.g. Zero Maida • Pure Cow Ghee"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1">
                  Highlight Badge
                </label>
                <input
                  className="w-full h-9 px-3 rounded bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                  type="text"
                  placeholder="e.g. Fresh Weekly Batch"
                  value={badgeEn}
                  onChange={(e) => setBadgeEn(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant font-medium mb-1">
                Product Description
              </label>
              <textarea
                className="w-full p-3 rounded bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                rows={3}
                placeholder="Describe fabric, craftsmanship, or wholesome ingredients..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant font-medium mb-1">
                Ingredients &amp; Shelf Life / Fabric &amp; Care
              </label>
              <input
                className="w-full h-9 px-3 rounded bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                type="text"
                placeholder="e.g. 100% Pure Mulmul Cotton or Sprouted Ragi & Jaggery"
                value={usageEn}
                onChange={(e) => setUsageEn(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 2: Media Drag-and-Drop Zone */}
          <div className="bg-surface rounded-lg p-4 shadow-xs space-y-3">
            <label className="text-xs text-on-surface uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">
                photo_library
              </span>
              2. Product Media &amp; Packaging Proofs
            </label>

            <div
              className="p-6 rounded-lg bg-surface-container-lowest flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors border-2 border-dashed border-outline-variant"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => {
                const fileInput = document.getElementById(
                  'product-flyout-file-input',
                );
                if (fileInput) fileInput.click();
              }}
            >
              <input
                id="product-flyout-file-input"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  handleFileUpload(e.target.files);
                  e.target.value = '';
                }}
              />
              <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-[26px]">
                  cloud_upload
                </span>
              </div>
              <p className="text-xs text-on-surface font-bold">
                Drag and drop product photos here, or{' '}
                <span className="text-primary underline">browse files</span>
              </p>
              <span className="text-[11px] text-on-surface-variant mt-1">
                JPEG/PNG/WEBP, max 4 MB per photo
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 h-9 px-3 rounded bg-surface-container-lowest text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 h-9 rounded bg-primary-container text-white text-xs font-semibold cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative group rounded-lg overflow-hidden bg-surface-container shadow-xs aspect-square border border-slate-200"
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={url}
                      alt={`preview-${idx}`}
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] uppercase font-bold tracking-wider">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/60 text-white hover:bg-error transition-colors cursor-pointer"
                      title="Delete photo"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        delete
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Inline Dynamic Variants Section */}
          <div className="bg-surface rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-on-surface uppercase tracking-wider font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  view_in_ar
                </span>
                3. Pack / Size Variants &amp; Pricing (INR)
              </label>
              <button
                className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 cursor-pointer"
                type="button"
                onClick={() =>
                  setVariants([
                    ...variants,
                    {
                      sizePack: '',
                      costPrice: '',
                      price: '',
                      stockQty: '20',
                      isMadeToBatch: categorySlug === 'kids-snacks',
                    },
                  ])
                }
              >
                <span className="material-symbols-outlined text-[16px]">
                  add_circle
                </span>
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, i) => {
                const costNum = Number(v.costPrice) || 0;
                const priceNum = Number(v.price) || 0;
                const multiple =
                  costNum > 0 && priceNum > 0
                    ? (priceNum / costNum).toFixed(2)
                    : null;

                return (
                  <div
                    key={v.id || i}
                    className="variant-item bg-surface-container-lowest p-2.5 rounded-lg border border-slate-200 flex flex-wrap sm:flex-nowrap items-center gap-2 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      drag_indicator
                    </span>
                    <div className="flex-1 min-w-[130px]">
                      <input
                        className="w-full h-8 px-2 rounded bg-surface text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                        placeholder="Size / Pack (e.g. 250g Jar or Size M)"
                        type="text"
                        value={v.sizePack}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], sizePack: e.target.value };
                          setVariants(next);
                        }}
                      />
                    </div>
                    <div className="w-24 relative">
                      <span className="absolute left-2 top-1.5 text-on-surface-variant font-mono text-[11px]">
                        Cost ₹
                      </span>
                      <input
                        className="w-full h-8 pl-12 pr-1.5 rounded bg-surface text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                        placeholder="165"
                        type="number"
                        value={v.costPrice}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], costPrice: e.target.value };
                          setVariants(next);
                        }}
                      />
                    </div>
                    <div className="w-24 relative">
                      <span className="absolute left-2 top-1.5 text-on-surface-variant font-mono text-[11px]">
                        MRP ₹
                      </span>
                      <input
                        className="w-full h-8 pl-11 pr-1.5 rounded bg-surface text-on-surface font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary border border-slate-200"
                        placeholder="390"
                        type="number"
                        value={v.price}
                        onChange={(e) => {
                          const next = [...variants];
                          next[i] = { ...next[i], price: e.target.value };
                          setVariants(next);
                        }}
                      />
                    </div>
                    {multiple && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          Number(multiple) >= 2.0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {multiple}x
                      </span>
                    )}
                    <button
                      className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Delete Variant"
                      type="button"
                      onClick={() => {
                        if (variants.length > 1) {
                          setVariants(variants.filter((_, idx) => idx !== i));
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Visibility & Promotion Toggles */}
          <div className="bg-surface rounded-lg p-4 shadow-xs space-y-3">
            <label className="text-xs text-on-surface uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">
                visibility
              </span>
              4. Catalog Configuration &amp; Merchandising
            </label>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-slate-200/70">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-bold flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[18px] text-amber-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  Mark as Featured Product
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Highlights this item in the featured storefront showcase
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#166534]" />
              </label>
            </div>

            {/* Active Catalog Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-slate-200/70">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    storefront
                  </span>
                  Direct Instant Listing Active
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Makes this item visible and orderable on the Client Storefront
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#166534]" />
              </label>
            </div>
          </div>
        </div>

        {/* Flyout Sticky Footer */}
        <div className="p-5 bg-surface-container shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded bg-surface hover:bg-surface-container-highest text-on-surface-variant text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            Discard Changes
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              type="button"
            >
              {isLoading ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
              )}
              <span>{isLoading ? 'Saving...' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFlyout;
