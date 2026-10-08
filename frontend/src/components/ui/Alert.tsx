import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  title,
  message,
  className = '',
}) => {
  let bgColor = '#FFEBE8';
  let borderColor = '#F02849';
  let textColor = '#C4183C';
  let IconComponent = AlertCircle;

  if (type === 'success') {
    bgColor = '#EAF7EA';
    borderColor = '#42B72A';
    textColor = '#2B8319';
    IconComponent = CheckCircle2;
  } else if (type === 'info') {
    bgColor = '#EBF5FF';
    borderColor = '#1877F2';
    textColor = '#0A58CA';
    IconComponent = Info;
  } else if (type === 'warning') {
    bgColor = '#FFF8E6';
    borderColor = '#F7B928';
    textColor = '#B27B00';
    IconComponent = AlertTriangle;
  }

  return (
    <div
      role="alert"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        fontSize: '14px',
        color: textColor,
        lineHeight: 1.35,
        width: '100%',
        boxSizing: 'border-box',
      }}
      className={`animate-fade-in ${className}`}
    >
      <IconComponent size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
        {title && <span style={{ fontWeight: 700, fontSize: '14px' }}>{title}</span>}
        <span>{message}</span>
      </div>
    </div>
  );
};
