import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ children, active = false, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={`
          inline-flex items-center justify-center h-[32px] px-4 rounded-[var(--qc-radius-pill)] text-[14px] font-medium
          transition-colors duration-[var(--qc-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qc-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--qc-surface)]
          ${active 
            ? 'bg-[var(--qc-primary-bg)] text-[var(--qc-primary)] border border-[var(--qc-primary-bg)]' 
            : 'bg-[var(--qc-surface)] text-[var(--qc-ink-2)] border border-[var(--qc-border)] hover:bg-[var(--qc-bg)]'
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Chip.displayName = 'Chip';
