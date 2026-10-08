import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, error, style, ...props }, ref) => {
    return (
      <select
        ref={ref}
        style={{
          width: '100%',
          height: '36px',
          backgroundColor: 'var(--color-surface-white)',
          border: error ? '1px solid var(--color-border-error)' : '1px solid var(--color-border-default)',
          borderRadius: '4px',
          padding: '0 8px',
          fontSize: '15px',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={e => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-border-focus)';
          }
        }}
        onBlur={e => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
          }
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
