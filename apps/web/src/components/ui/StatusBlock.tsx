import React from 'react';
import { Icons } from './Icons';
import { Button } from './Button';

export interface StatusBlockProps {
  type: 'empty' | 'error' | 'offline';
  title: string;
  help: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const StatusBlock: React.FC<StatusBlockProps> = ({
  type,
  title,
  help,
  actionLabel,
  onAction,
  className = '',
}) => {
  const icons = {
    empty: <Icons.Info className="w-12 h-12 text-[var(--qc-muted)]" />,
    error: <Icons.AlertTriangle className="w-12 h-12 text-[var(--qc-danger)]" />,
    offline: <Icons.AlertTriangle className="w-12 h-12 text-[var(--qc-warn)]" />,
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-[var(--qc-surface)] border border-[var(--qc-border)] rounded-[var(--qc-radius-card)] ${className}`}>
      <div className="mb-4">
        {icons[type]}
      </div>
      <h3 className="text-[18px] font-semibold text-[var(--qc-ink)] mb-1">
        {title}
      </h3>
      <p className="text-[14px] text-[var(--qc-ink-2)] mb-6 max-w-sm">
        {help}
      </p>
      {actionLabel && onAction && (
        <Button variant={type === 'error' || type === 'offline' ? 'primary' : 'secondary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
