import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'secondary' | 'outline' | 'link';
  size?: 'default' | 'large' | 'modal' | 'small';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}) => {
  // Height & Font Size determination
  let height = '48px';
  let fontSize = '17px';
  let padding = '0 16px';

  if (size === 'large') {
    height = '48px';
    fontSize = '20px';
  } else if (size === 'modal') {
    height = '40px';
    fontSize = '18px';
    padding = '0 32px';
  } else if (size === 'small') {
    height = '36px';
    fontSize = '14px';
    padding = '0 16px';
  }

  // Variant styles
  let bgColor = 'var(--color-primary-blue)';
  let textColor = '#FFFFFF';
  let hoverBg = 'var(--color-hover-blue)';
  let activeBg = 'var(--color-active-blue)';
  let disabledBg = 'var(--color-disabled-blue)';
  let border = 'none';

  if (variant === 'success') {
    bgColor = 'var(--color-success)';
    hoverBg = 'var(--color-success-hover)';
    activeBg = '#2B8319';
    disabledBg = '#A5E497';
  } else if (variant === 'secondary') {
    bgColor = 'var(--color-bg-disabled)';
    textColor = 'var(--color-text-primary)';
    hoverBg = '#D8DADF';
    activeBg = '#CCD0D5';
    disabledBg = '#F0F2F5';
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = 'var(--color-primary-blue)';
    border = '1px solid var(--color-border-default)';
    hoverBg = 'var(--color-bg-hover)';
    activeBg = 'var(--color-bg-disabled)';
  } else if (variant === 'link') {
    bgColor = 'transparent';
    textColor = 'var(--color-primary-blue)';
    hoverBg = 'transparent';
    activeBg = 'transparent';
    height = 'auto';
    padding = '0';
  }

  const isActuallyDisabled = disabled || isLoading;

  return (
    <button
      disabled={isActuallyDisabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height,
        padding,
        fontSize,
        fontWeight: 700,
        color: isActuallyDisabled && variant !== 'link' && variant !== 'secondary' ? '#FFFFFF' : textColor,
        backgroundColor: isActuallyDisabled ? disabledBg : bgColor,
        border,
        borderRadius: '6px',
        cursor: isActuallyDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 150ms ease, transform 100ms ease',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={e => {
        if (!isActuallyDisabled) {
          e.currentTarget.style.backgroundColor = hoverBg;
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        if (!isActuallyDisabled) {
          e.currentTarget.style.backgroundColor = bgColor;
          e.currentTarget.style.transform = 'scale(1)';
        }
        onMouseLeave?.(e);
      }}
      onMouseDown={e => {
        if (!isActuallyDisabled) {
          e.currentTarget.style.backgroundColor = activeBg;
          e.currentTarget.style.transform = 'scale(0.99)';
        }
        onMouseDown?.(e);
      }}
      onMouseUp={e => {
        if (!isActuallyDisabled) {
          e.currentTarget.style.backgroundColor = hoverBg;
          e.currentTarget.style.transform = 'scale(1)';
        }
        onMouseUp?.(e);
      }}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '18px',
            height: '18px',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            display: 'inline-block',
            boxSizing: 'border-box',
          }}
          className="animate-spin"
        />
      )}
      {isLoading ? loadingText || children : children}
    </button>
  );
};
