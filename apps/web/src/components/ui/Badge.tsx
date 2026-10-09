import React from 'react';

export type BadgeVariant = 'estimate' | 'success' | 'muted' | 'warn' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant, className = '', ...props }, ref) => {
    const variants = {
      estimate: 'bg-[var(--qc-accent)] text-white',
      success: 'bg-[var(--qc-success-bg)] text-[var(--qc-success)]',
      muted: 'bg-[var(--qc-bg)] text-[var(--qc-muted)]',
      warn: 'bg-[var(--qc-warn-bg)] text-[var(--qc-warn)]',
      danger: 'bg-[var(--qc-danger-bg)] text-[var(--qc-danger)]',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-sm text-[12px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
