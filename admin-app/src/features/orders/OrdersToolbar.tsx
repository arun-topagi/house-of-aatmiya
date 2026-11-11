'use client';

import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { DropdownFilter, DropdownOption } from '@/components/DropdownFilter';

export interface OrdersToolbarProps {
  orderIdSearch: string;
  onOrderIdSearchChange: (value: string) => void;
  customerNameSearch: string;
  onCustomerNameSearchChange: (value: string) => void;
  phoneSearch: string;
  onPhoneSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statusOptions?: DropdownOption[];
  statusPlaceholder?: string;
  className?: string;
}

export const DEFAULT_ORDER_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'PENDING_CALL', label: 'Pending Call' },
  { value: 'CONFIRMED_AWAITING_UPI', label: 'Confirmed (Awaiting UPI)' },
  { value: 'PAID_IN_PREP', label: 'Paid (In Kitchen Prep)' },
  { value: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  orderIdSearch,
  onOrderIdSearchChange,
  customerNameSearch,
  onCustomerNameSearchChange,
  phoneSearch,
  onPhoneSearchChange,
  status,
  onStatusChange,
  statusOptions = DEFAULT_ORDER_STATUS_OPTIONS,
  statusPlaceholder = 'All Statuses',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col xl:flex-row items-stretch xl:items-center gap-3 ${className}`}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={orderIdSearch}
          onChange={onOrderIdSearchChange}
          placeholder="Search Order ID..."
          debounceMs={200}
        />

        <SearchBar
          value={customerNameSearch}
          onChange={onCustomerNameSearchChange}
          placeholder="Search Customer Name..."
          debounceMs={200}
        />

        <SearchBar
          value={phoneSearch}
          onChange={onPhoneSearchChange}
          placeholder="Search Phone..."
          debounceMs={200}
        />
      </div>

      <DropdownFilter
        value={status}
        onChange={onStatusChange}
        options={statusOptions}
        placeholder={statusPlaceholder}
        ariaLabel="Filter by Status"
        className="min-w-[180px]"
      />
    </div>
  );
};

export default OrdersToolbar;
