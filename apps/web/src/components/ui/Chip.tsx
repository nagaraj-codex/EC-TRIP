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
          inline-flex items-center justify-center h-[32px] px-4 rounded-(--qc-radius-pill) text-[14px] font-medium
          transition-colors duration-(--qc-duration-fast) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--qc-surface)
          ${active 
            ? 'bg-(--qc-primary-bg) text-(--qc-primary) border border-(--qc-primary-bg)' 
            : 'bg-(--qc-surface) text-(--qc-ink-2) border border-(--qc-border) hover:bg-(--qc-bg)'
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
