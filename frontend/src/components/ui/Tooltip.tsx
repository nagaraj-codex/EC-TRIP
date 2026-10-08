import React, { useState, useId } from 'react';
import { HelpCircle } from 'lucide-react';

export interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        aria-describedby={isVisible ? tooltipId : undefined}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--color-text-secondary)',
          borderRadius: '50%',
        }}
      >
        {children || <HelpCircle size={14} />}
      </button>

      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1C1E21',
            color: '#FFFFFF',
            fontSize: '12px',
            lineHeight: 1.35,
            padding: '6px 10px',
            borderRadius: '4px',
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1100,
            pointerEvents: 'none',
          }}
          className="animate-fade-in"
        >
          {content}
        </span>
      )}
    </span>
  );
};
