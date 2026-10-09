import React from 'react';

export type BadgeVariant = 'estimate' | 'success' | 'muted' | 'warn' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant, className = '', ...props }, ref) => {
    const variants = {
      estimate: 'bg-(--qc-accent) text-white',
      success: 'bg-(--qc-success-bg) text-(--qc-success)',
      muted: 'bg-(--qc-bg) text-(--qc-muted)',
      warn: 'bg-(--qc-warn-bg) text-(--qc-warn)',
      danger: 'bg-(--qc-danger-bg) text-(--qc-danger)',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-xs text-[12px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
