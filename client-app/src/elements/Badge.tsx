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
      'bg-tertiary-fixed/95 backdrop-blur-sm text-on-tertiary-fixed px-2.5 py-1 rounded-full text-label-sm font-label-sm shadow-sm flex items-center gap-1',
    outOfStock:
      'bg-error-container/95 backdrop-blur-sm text-on-error-container px-2.5 py-1 rounded-full text-label-sm font-label-sm shadow-sm',
    sizePack:
      'bg-surface/95 backdrop-blur-sm text-on-surface px-2.5 py-1 rounded-full text-label-sm font-label-sm shadow-sm border border-outline-variant/30',
    secondary:
      'bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full',
    secondaryContainer:
      'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container w-fit mb-6',
    heroOverlay:
      'bg-primary text-on-primary text-label-sm font-label-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider',
  };

  return (
    <span className={`${variantStyles[variant]} ${className}`}>{children}</span>
  );
};
