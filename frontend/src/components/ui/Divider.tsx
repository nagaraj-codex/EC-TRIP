import React from 'react';

export interface DividerProps {
  margin?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ margin = '8px 0 4px 0', className = '' }) => {
  return (
    <div
      role="separator"
      style={{
        width: '100%',
        height: '1px',
        backgroundColor: 'var(--color-border-divider)',
        margin,
      }}
      className={className}
    />
  );
};
