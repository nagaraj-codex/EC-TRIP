import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: 'sm' | 'md' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '24px',
  radius = 'md',
  ...props 
}) => {
  const radiuses = {
    sm: 'rounded-xs',
    md: 'rounded-(--qc-radius-input)',
    full: 'rounded-full',
  };

  return (
    <div
      className={`bg-(--qc-border) motion-safe:animate-pulse ${radiuses[radius]} ${className}`}
      style={{ width, height, ...props.style }}
      aria-hidden="true"
      {...props}
    />
  );
};
