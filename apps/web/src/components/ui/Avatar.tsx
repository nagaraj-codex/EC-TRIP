import React, { useState } from 'react';
import { Icons } from './Icons';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', className = '', ...props }) => {
  const [error, setError] = useState(false);

  const getInitials = (n: string) => {
    const parts = n.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center bg-[var(--qc-bg)] border border-[var(--qc-border)] overflow-hidden shrink-0 ${className}`}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={`${name} avatar`}
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[14px] font-semibold text-[var(--qc-ink-2)]" aria-label={name}>
          {name ? getInitials(name) : <Icons.User className="w-5 h-5" />}
        </span>
      )}
    </div>
  );
};
