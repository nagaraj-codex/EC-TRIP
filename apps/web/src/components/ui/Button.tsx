import React from 'react';
import { Icons } from './Icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, fullWidth = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[var(--qc-radius-button)] transition-[background,transform,box-shadow] duration-[var(--qc-duration-fast)] ease-[var(--qc-ease-out)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--qc-focus)] focus-visible:ring-offset-[var(--qc-surface)]';
    
    const sizeStyles = size === 'lg' ? 'h-[48px] px-6 text-[16px]' : 'h-[44px] px-4 text-[16px]';
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]';

    const variants = {
      primary: 'bg-[var(--qc-primary)] text-white hover:bg-[var(--qc-primary-h)] active:bg-[var(--qc-primary-a)]',
      secondary: 'bg-[var(--qc-surface)] text-[var(--qc-ink)] border border-[var(--qc-border)] hover:bg-[var(--qc-bg)] active:bg-[var(--qc-border)]',
      ghost: 'bg-transparent text-[var(--qc-primary)] hover:bg-[var(--qc-primary-bg)] active:bg-[#e0e7ff]',
      danger: 'bg-[var(--qc-danger)] text-white hover:bg-[#991b1b] active:bg-[#7f1d1d]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${sizeStyles} ${widthStyles} ${variants[variant]} ${disabledStyles} ${className}`}
        {...props}
      >
        <span className="flex items-center justify-center gap-2 relative">
          {isLoading ? (
            <Icons.Spinner className="w-5 h-5 shrink-0" />
          ) : leftIcon ? (
            <span className="w-5 h-5 flex items-center justify-center shrink-0">{leftIcon}</span>
          ) : null}
          <span>{children}</span>
          {rightIcon && !isLoading && <span className="w-5 h-5 flex items-center justify-center shrink-0">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
