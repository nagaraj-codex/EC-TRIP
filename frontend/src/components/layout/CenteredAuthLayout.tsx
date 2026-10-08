import React from 'react';
import { Link } from 'react-router-dom';
import { InteractiveCanvas } from '../interactive/InteractiveCanvas.js';

export interface CenteredAuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export const CenteredAuthLayout: React.FC<CenteredAuthLayoutProps> = ({
  children,
  maxWidth = '500px',
}) => {
  return (
    <div className="centered-auth-wrapper">
      <InteractiveCanvas />
      {/* Top Header Bar */}
      <header className="centered-auth-header">
        <div className="centered-auth-header-inner">
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <span className="centered-auth-brand">Connectly</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="centered-auth-main">
        <div className="centered-auth-card-container" style={{ maxWidth }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="centered-auth-footer">
        <p>© 2026 Connectly. Connect with friends and the world around you.</p>
      </footer>

      <style>{`
        .centered-auth-wrapper {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .centered-auth-header {
          width: 100%;
          height: 56px;
          background-color: var(--color-surface-white);
          border-bottom: 1px solid var(--color-border-light);
          display: flex;
          align-items: center;
          padding: 0 16px;
          box-sizing: border-box;
        }

        .centered-auth-header-inner {
          max-width: var(--container-max-width);
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .centered-auth-brand {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary-blue);
          letter-spacing: -1.2px;
          user-select: none;
        }

        .centered-auth-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          box-sizing: border-box;
        }

        .centered-auth-card-container {
          width: 100%;
          background-color: var(--color-surface-white);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card-recovery);
          overflow: hidden;
          box-sizing: border-box;
        }

        .centered-auth-footer {
          padding: 24px 16px;
          text-align: center;
          font-size: var(--font-size-fine);
          color: var(--color-text-muted);
          border-top: 1px solid var(--color-border-light);
          background-color: var(--color-surface-white);
        }

        @media (max-width: 767px) {
          .centered-auth-main {
            padding: 20px 16px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
