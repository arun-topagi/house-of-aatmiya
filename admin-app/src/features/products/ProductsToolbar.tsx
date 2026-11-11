'use client';

import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { DropdownFilter, DropdownOption } from '@/components/DropdownFilter';

export interface ProductsToolbarProps {
  nameSearch: string;
  onNameSearchChange: (value: string) => void;
  categorySearch: string;
  onCategorySearchChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  categoryOptions?: DropdownOption[];
  stockStatusOptions?: DropdownOption[];
  stockStatusPlaceholder?: string;
  className?: string;
}

export const DEFAULT_CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'kids-snacks', label: "Kids' Clean Snacks" },
  { value: 'dresses', label: "Women's Cotton Dresses" },
  { value: 'kurtas', label: 'Cotton Kurtas & Co-ords' },
  { value: 'stoles', label: 'Mulmul Cotton Stoles' },
  { value: 'hampers', label: 'Signature Gift Hampers' },
];

export const DEFAULT_STOCK_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'IN_STOCK', label: 'In Stock (>10 units / Batch)' },
  { value: 'LOW_STOCK', label: 'Low Stock (<10 units)' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock (0 units)' },
];

export const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
  nameSearch,
  onNameSearchChange,
  categorySearch,
  onCategorySearchChange,
  stockStatus,
  onStockStatusChange,
  categoryOptions = DEFAULT_CATEGORY_OPTIONS,
  stockStatusOptions = DEFAULT_STOCK_STATUS_OPTIONS,
  stockStatusPlaceholder = 'All Stock Statuses',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col xl:flex-row items-stretch xl:items-center gap-3 ${className}`}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={nameSearch}
          onChange={onNameSearchChange}
          placeholder="Search Product Name or SKU..."
          debounceMs={200}
        />

        <DropdownFilter
          value={categorySearch}
          onChange={onCategorySearchChange}
          options={categoryOptions}
          placeholder="All Categories"
          ariaLabel="Filter by Category"
          className="min-w-[200px]"
        />
      </div>

      <DropdownFilter
        value={stockStatus}
        onChange={onStockStatusChange}
        options={stockStatusOptions}
        placeholder={stockStatusPlaceholder}
        ariaLabel="Filter by Stock Status"
        className="min-w-[180px]"
      />
    </div>
  );
};

export default ProductsToolbar;
