import React from 'react';
import { useToast } from './useToast';
import { Icons } from './Icons';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:right-4 md:left-auto md:translate-x-0 z-[400] flex flex-col gap-2 pointer-events-none w-[90%] max-w-[360px]"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-[var(--qc-radius-card)] shadow-[var(--qc-shadow-raised)] border
              transform transition-all duration-[var(--qc-duration-panel)]
              ${isError ? 'bg-[var(--qc-danger-bg)] border-[var(--qc-danger)] text-[var(--qc-danger)]' : ''}
              ${isSuccess ? 'bg-[var(--qc-success-bg)] border-[var(--qc-success)] text-[var(--qc-success)]' : ''}
              ${toast.type === 'info' ? 'bg-[var(--qc-surface)] border-[var(--qc-border)] text-[var(--qc-ink)]' : ''}
            `}
          >
            <div className="mt-0.5 shrink-0">
              {isError && <Icons.AlertTriangle className="w-5 h-5" />}
              {isSuccess && <Icons.CheckCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Icons.Info className="w-5 h-5" />}
            </div>
            <p className="flex-1 text-[14px] font-medium pt-0.5">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
              className="shrink-0 p-1 -mr-1 -mt-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qc-focus)]"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
