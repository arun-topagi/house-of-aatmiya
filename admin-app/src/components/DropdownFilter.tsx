'use client';

import React from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  id?: string;
  ariaLabel?: string;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  selectClassName = '',
  id,
  ariaLabel,
}) => {
  return (
    <div className={`relative min-w-[160px] ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel || placeholder || 'Filter dropdown'}
        className={`w-full h-9 px-3 appearance-none rounded bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer border border-slate-200 shadow-xs pr-8 ${selectClassName}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
        expand_more
      </span>
    </div>
  );
};

export default DropdownFilter;
