import React from 'react';

export interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandMarkProps['size']>, string> = {
  sm: 'w-9 h-9 rounded-xl',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-2xl',
};

/**
 * Luxury metallic champagne-gold monogram & lotus crest for The House of Aatmiya.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  className = '',
}) => {
  const gradId = React.useId();

  return (
    <div
      className={`${SIZE_CLASSES[size]} bg-gradient-to-b from-[#1a1d2b] to-[#0b0d14] border border-[#e5c280]/30 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_18px_rgba(0,0,0,0.55)] ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="6"
            y1="4"
            x2="34"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F5DFB0" />
            <stop offset="50%" stopColor="#E5C280" />
            <stop offset="100%" stopColor="#B8893A" />
          </linearGradient>
        </defs>

        {/* Subtle arched heritage frame */}
        <path
          d="M20 3.5C28.5 3.5 34.5 9.2 34.5 18.5V28.5C34.5 31.8 31.8 34.5 28.5 34.5H11.5C8.2 34.5 5.5 31.8 5.5 28.5V18.5C5.5 9.2 11.5 3.5 20 3.5Z"
          stroke={`url(#${gradId})`}
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />

        {/* Delicate lotus / botanical crown */}
        <path
          d="M20 7.2C21.3 9.1 21.3 11.1 20 12.6C18.7 11.1 18.7 9.1 20 7.2Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M15.4 9.6C17.2 10.1 18.4 11.3 18.7 12.8C17.1 12.5 15.8 11.3 15.4 9.6Z"
          fill={`url(#${gradId})`}
          fillOpacity="0.8"
        />
        <path
          d="M24.6 9.6C24.2 11.3 22.9 12.5 21.3 12.8C21.6 11.3 22.8 10.1 24.6 9.6Z"
          fill={`url(#${gradId})`}
          fillOpacity="0.8"
        />

        {/* Interlocking Aatmiya "A" monogram */}
        <path
          d="M12.2 29.5L20 13.8L27.8 29.5"
          stroke={`url(#${gradId})`}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.2 24.2C17.1 22.7 22.9 22.7 24.8 24.2"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Grounding base accents */}
        <circle cx="12.2" cy="29.5" r="1.25" fill={`url(#${gradId})`} />
        <circle cx="27.8" cy="29.5" r="1.25" fill={`url(#${gradId})`} />
      </svg>
    </div>
  );
};
