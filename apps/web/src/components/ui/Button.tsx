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
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-(--qc-radius-button) transition-[background,transform,box-shadow] duration-(--qc-duration-fast) ease-(--qc-ease-out) select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--qc-focus) focus-visible:ring-offset-(--qc-surface)';
    
    const sizeStyles = size === 'lg' ? 'h-[48px] px-6 text-[16px]' : 'h-[44px] px-4 text-[16px]';
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]';

    const variants = {
      primary: 'bg-(--qc-primary) text-white hover:bg-(--qc-primary-h) active:bg-(--qc-primary-a)',
      secondary: 'bg-(--qc-surface) text-(--qc-ink) border border-(--qc-border) hover:bg-(--qc-bg) active:bg-(--qc-border)',
      ghost: 'bg-transparent text-(--qc-primary) hover:bg-(--qc-primary-bg) active:bg-brand-100',
      danger: 'bg-(--qc-danger) text-white hover:bg-crowd-extreme active:bg-[#7f1d1d]',
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
