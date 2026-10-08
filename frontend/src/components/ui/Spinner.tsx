import React from 'react';

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 18,
  color = '#FFFFFF',
  className = '',
}) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(24, 119, 242, 0.2)'}`,
        borderTopColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        boxSizing: 'border-box',
      }}
      className={`animate-spin ${className}`}
    />
  );
};
