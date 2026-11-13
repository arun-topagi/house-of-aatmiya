import React from 'react';

export type BadgeVariant =
  | 'inStock'
  | 'outOfStock'
  | 'sizePack'
  | 'secondary'
  | 'secondaryContainer'
  | 'heroOverlay';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'inStock',
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    inStock:
      'bg-[#0c291f]/90 backdrop-blur-md text-[#6ee7b7] border border-emerald-500/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.04em] sm:tracking-wider whitespace-nowrap shadow-sm flex items-center gap-1.5',
    outOfStock:
      'bg-error-container/90 backdrop-blur-md text-on-error-container border border-red-400/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.04em] sm:tracking-wider whitespace-nowrap shadow-sm',
    sizePack:
      'bg-[#090a0f]/80 backdrop-blur-md text-white/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8.5px] sm:text-[10px] font-mono tracking-[0.04em] sm:tracking-wider whitespace-nowrap shadow-sm border border-white/15',
    secondary:
      'bg-primary text-on-primary text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
    secondaryContainer:
      'inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/[0.05] border border-primary/25 text-primary w-fit mb-6 whitespace-nowrap',
    heroOverlay:
      'bg-primary text-on-primary text-[8px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-[0.04em] sm:tracking-widest whitespace-nowrap',
  };

  return (
    <span className={`${variantStyles[variant]} ${className}`}>{children}</span>
  );
};
