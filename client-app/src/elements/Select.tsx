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
        className={`appearance-none bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md pl-3.5 pr-8 py-2 rounded-full border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors ${className}`}
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
