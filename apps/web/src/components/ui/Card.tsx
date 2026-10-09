import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'md' | 'lg';
  as?: 'div' | 'a' | 'button';
  href?: string;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ children, padding = 'lg', as = 'div', className = '', ...props }, ref) => {
    const Component = as as any;
    const isInteractive = as === 'a' || as === 'button';
    
    const baseStyles = 'bg-[var(--qc-surface)] border border-[var(--qc-border)] rounded-[var(--qc-radius-card)] shadow-[var(--qc-shadow-card)] transition-[transform,box-shadow] duration-[var(--qc-duration-fast)] text-left block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--qc-focus)] focus-visible:ring-offset-[var(--qc-bg)]';
    const paddingStyles = {
      none: '',
      md: 'p-4',
      lg: 'p-4 md:p-5',
    };
    
    const interactiveStyles = isInteractive ? 'hover:shadow-[var(--qc-shadow-raised)] hover:-translate-y-1 cursor-pointer' : '';

    return (
      <Component
        ref={ref}
        className={`${baseStyles} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
