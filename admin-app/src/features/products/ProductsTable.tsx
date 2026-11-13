/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useState } from 'react';
import { AdminProduct, ProductType } from '@/services';
import { Pagination } from '@/components/Pagination';

export interface ProductsTableProps {
  products: AdminProduct[];
  nameSearch?: string;
  categorySearch?: string;
  stockStatus?: string;
  onEditProduct?: (product: AdminProduct) => void;
  onToggleStatus?: (product: AdminProduct) => void;
  onToggleFeatured?: (product: AdminProduct) => void;
  className?: string;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  nameSearch = '',
  categorySearch = '',
  stockStatus = '',
  onEditProduct,
  onToggleStatus,
  onToggleFeatured,
  className = '',
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const getProductName = (product: AdminProduct): string => {
    if (typeof product.name === 'string') return product.name;
    return product.name?.en || 'Unnamed Product';
  };

  const getCategoryName = (product: AdminProduct): string => {
    if (!product.category?.name) return 'Uncategorized';
    if (typeof product.category.name === 'string') return product.category.name;
    return product.category.name.en || 'Uncategorized';
  };

  const getProductTypeBadge = (
    product: AdminProduct,
  ): { label: string; badgeClass: string } => {
    const resolvedType: ProductType =
      product.productType ||
      (product.category?.slug === 'hampers'
        ? 'GIFT_HAMPER'
        : product.category?.modeGroup === 'DRESS_AND_GIFTS'
          ? 'APPAREL'
          : 'FOOD');

    if (resolvedType === 'APPAREL') {
      return {
        label: 'Apparel',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }
    if (resolvedType === 'GIFT_HAMPER') {
      return {
        label: 'Gift Hamper',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: 'Food',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  const getStockStatus = (
    product: AdminProduct,
  ): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
    if (product.stockStatus) return product.stockStatus;
    const total = (product.variants || []).reduce(
      (sum, v) => sum + (v.stockQty || 0),
      0,
    );
    const hasBatch = (product.variants || []).some((v) => v.isMadeToBatch);
    if (hasBatch || total > 10) return 'IN_STOCK';
    if (total > 0) return 'LOW_STOCK';
    return 'OUT_OF_STOCK';
  };

  const filteredProducts = useMemo(() => {
    const q = nameSearch.trim().toLowerCase();
    const catQ = categorySearch.trim().toLowerCase();

    return products.filter((product) => {
      const title = getProductName(product).toLowerCase();
      const sku = (product.sku || '').toLowerCase();
      if (q && !title.includes(q) && !sku.includes(q)) {
        return false;
      }
      if (catQ) {
        const catSlug = (product.category?.slug || '').toLowerCase();
        const catLabel = getCategoryName(product).toLowerCase();
        if (catSlug !== catQ && !catLabel.includes(catQ)) {
          return false;
        }
      }
      if (stockStatus && getStockStatus(product) !== stockStatus) {
        return false;
      }
      return true;
    });
  }, [products, nameSearch, categorySearch, stockStatus]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, safePage, limit]);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className} relative`}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Product Type
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Pack / Size Variants &amp; Margins
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Stock Status
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center"
              >
                Featured
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center"
              >
                Live Catalog
              </th>
              <th
                scope="col"
                className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  No products found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const firstImg =
                  Array.isArray(product.images) && product.images.length > 0
                    ? typeof product.images[0] === 'string'
                      ? product.images[0]
                      : product.images[0]?.url || ''
                    : '';
                const st = getStockStatus(product);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/75 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt={getProductName(product)}
                            className="w-10 h-10 rounded-md object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">
                              image
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900 line-clamp-1">
                            {getProductName(product)}
                          </div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {getCategoryName(product)}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-middle">
                      {(() => {
                        const typeBadge = getProductTypeBadge(product);
                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${typeBadge.badgeClass}`}
                          >
                            {typeBadge.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants && product.variants.length > 0 ? (
                          product.variants.map((v) => {
                            const multiple =
                              v.costPrice > 0
                                ? (v.price / v.costPrice).toFixed(1)
                                : '2.4';
                            return (
                              <span
                                key={v.id || v.sizePack}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <span>{v.sizePack}</span>
                                <span className="font-mono font-semibold text-emerald-800">
                                  • ₹{v.price}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  ({multiple}x)
                                </span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-400">
                            No variants
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle">
                      {st === 'IN_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          In Stock
                        </span>
                      ) : st === 'LOW_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured?.(product)}
                        className="inline-flex items-center justify-center p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title={
                          product.isFeatured
                            ? 'Remove from featured'
                            : 'Mark as featured'
                        }
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            product.isFeatured
                              ? 'text-amber-500'
                              : 'text-slate-300'
                          }`}
                          style={
                            product.isFeatured
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          star
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => onToggleStatus?.(product)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                          product.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={product.isActive}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-xs ${
                            product.isActive ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditProduct?.(product)}
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        itemLabel="products"
      />
    </div>
  );
};

export default ProductsTable;
