import React from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        className={`appearance-none bg-[#11131c] hover:bg-[#171a26] text-on-surface font-label-md text-label-md pl-3.5 pr-8 py-2 rounded-full border border-white/[0.08] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 cursor-pointer transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="text-on-surface-variant text-base absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
};
