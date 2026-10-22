import React, { useState, useId } from 'react';
import { Icons } from './Icons';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, type = 'text', className = '', id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const hasError = !!error;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label htmlFor={inputId} className="text-[14px] font-medium text-(--qc-ink)">
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={hasError}
            aria-describedby={`${hasError ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined}
            className={`
              w-full h-12 px-3 bg-(--qc-surface) text-(--qc-ink) placeholder-(--qc-muted)
              border border-(--qc-border) rounded-(--qc-radius-input)
              transition-[border-color,box-shadow] duration-(--qc-duration-fast) ease-(--qc-ease-out)
              focus-visible:outline-hidden focus-visible:border-(--qc-primary) focus-visible:ring-2 focus-visible:ring-(--qc-focus) focus-visible:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError ? 'border-(--qc-danger) focus-visible:border-(--qc-danger) focus-visible:ring-(--qc-danger)' : ''}
              ${isPassword ? 'pr-10' : ''}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-(--qc-muted) hover:text-(--qc-ink) transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-xs"
            >
              {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {hasError && (
          <p id={errorId} role="alert" className="text-[12px] text-(--qc-danger) mt-1">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={helperId} className="text-[12px] text-(--qc-muted) mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
