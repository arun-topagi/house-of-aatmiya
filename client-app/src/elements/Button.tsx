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
      'px-4 py-2.5 rounded-xl font-label-md text-label-md inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_20px_rgba(229,194,128,0.2)] hover:brightness-105 active:scale-[0.98] cursor-pointer',
    disabled:
      'px-4 py-2.5 rounded-xl font-label-md text-label-md inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all bg-surface-container-high text-outline border border-white/[0.06] cursor-not-allowed',
    viewAll:
      'inline-flex items-center gap-1.5 text-primary font-label-md text-label-md bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.1] px-4 py-2 rounded-full whitespace-nowrap transition-all active:scale-[0.98] cursor-pointer shrink-0',
    chipActive:
      'inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all shrink-0 cursor-pointer bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_16px_rgba(229,194,128,0.25)] active:scale-[0.98]',
    chipInactive:
      'inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-label-md text-label-md whitespace-nowrap transition-all shrink-0 cursor-pointer bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98]',
    variantActive:
      'px-2.5 py-1 rounded-md text-label-sm font-label-sm font-mono whitespace-nowrap transition-all cursor-pointer bg-primary text-on-primary font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]',
    variantInactive:
      'px-2.5 py-1 rounded-md text-label-sm font-label-sm font-mono whitespace-nowrap transition-all cursor-pointer bg-surface-container text-on-surface-variant border border-white/[0.06] hover:border-white/[0.15] hover:text-on-surface',
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
