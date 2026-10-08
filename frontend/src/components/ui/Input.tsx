import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'modal';
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'default', rightElement, id, className = '', style, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const height = variant === 'modal' ? '40px' : '52px';
    const fontSize = variant === 'modal' ? '15px' : '17px';
    const borderRadius = variant === 'modal' ? '5px' : '6px';
    const padding = variant === 'modal' ? '0 11px' : '0 14px';

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '4px',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            style={{
              width: '100%',
              height,
              padding: rightElement ? `${padding.split(' ')[0]} 42px 0 ${padding.split(' ')[1]}` : padding,
              fontSize,
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-input)',
              border: error ? '1px solid var(--color-border-error)' : '1px solid var(--color-border-default)',
              boxShadow: error ? 'var(--shadow-input-error)' : 'none',
              borderRadius,
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
              ...style,
            }}
            onFocus={e => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--color-border-focus)';
                e.currentTarget.style.boxShadow = 'var(--shadow-input-focus)';
              }
              props.onFocus?.(e);
            }}
            onBlur={e => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }
              props.onBlur?.(e);
            }}
            onMouseEnter={e => {
              if (!error && document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
              }
            }}
            onMouseLeave={e => {
              if (!error && document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }
            }}
            className={className}
            {...props}
          />
          {rightElement && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span
            id={inputId ? `${inputId}-error` : undefined}
            role="alert"
            style={{
              fontSize: '13px',
              color: 'var(--color-border-error)',
              marginTop: '4px',
              textAlign: 'left',
              lineHeight: 1.25,
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
