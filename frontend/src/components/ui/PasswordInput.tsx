import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from './Input.js';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightElement'> {
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, variant = 'default', ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const height = variant === 'modal' ? '40px' : '52px';

    const toggleButton = showToggle ? (
      <button
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        tabIndex={0}
        onClick={() => setIsVisible(prev => !prev)}
        style={{
          width: '40px',
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          padding: 0,
          borderRadius: '4px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        {isVisible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        variant={variant}
        rightElement={toggleButton}
        autoComplete={props.autoComplete || 'current-password'}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
