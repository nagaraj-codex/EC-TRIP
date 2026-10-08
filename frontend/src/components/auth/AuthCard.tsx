import React from 'react';

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`connectly-auth-card ${className}`} style={style}>
      {children}
      <style>{`
        .connectly-auth-card {
          width: 420px;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 14px;
          padding: 24px 22px;
          box-shadow: 0 20px 42px -12px rgba(0, 0, 0, 0.12),
                      0 4px 16px rgba(0, 0, 0, 0.04),
                      0 0 0 1px rgba(255, 255, 255, 0.9) inset;
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-sizing: border-box;
          transition: box-shadow var(--transition-normal);
        }

        @media (max-width: 767px) {
          .connectly-auth-card {
            width: 100%;
            max-width: 420px;
            background-color: #FFFFFF;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            padding: 20px 16px;
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
};
