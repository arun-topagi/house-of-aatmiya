'use client';

import React, { useEffect, useState } from 'react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  onClear?: () => void;
  id?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 0,
  className = '',
  inputClassName = '',
  onClear,
  id,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!debounceMs || debounceMs <= 0) return;
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInternalValue(nextVal);
    if (!debounceMs || debounceMs <= 0) {
      onChange(nextVal);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
        search
      </span>
      <input
        id={id}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full h-9 pl-9 pr-8 rounded bg-surface text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest border border-slate-200 shadow-xs ${inputClassName}`}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface transition-colors p-0.5 rounded cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
