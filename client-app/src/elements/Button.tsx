import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'disabled'
  | 'viewAll'
  | 'chipActive'
  | 'chipInactive'
  | 'variantActive'
  | 'variantInactive';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'px-4 py-2.5 rounded-xl font-label-md text-label-md inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm hover:opacity-95 active:scale-95 cursor-pointer',
    disabled:
      'px-4 py-2.5 rounded-xl font-label-md text-label-md inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all bg-surface-container-high text-outline cursor-not-allowed',
    viewAll:
      'inline-flex items-center gap-1.5 text-primary font-label-md text-label-md bg-primary-fixed/60 hover:bg-primary-fixed px-4 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0',
    chipActive:
      'inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all shrink-0 cursor-pointer bg-primary text-on-primary shadow-sm',
    chipInactive:
      'inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all shrink-0 cursor-pointer bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border border-outline-variant/25',
    variantActive:
      'px-2.5 py-1 rounded-md text-label-sm font-label-sm whitespace-nowrap transition-all cursor-pointer bg-primary text-on-primary shadow-xs',
    variantInactive:
      'px-2.5 py-1 rounded-md text-label-sm font-label-sm whitespace-nowrap transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
  };

  return (
    <button
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
