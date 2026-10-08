import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InteractiveCanvas } from '../interactive/InteractiveCanvas.js';
import { useLanguage, LanguageCode } from '../../context/LanguageContext.js';
import { LanguageSelectModal } from '../layout/LanguageSelectModal.js';
import { LegalModal, LegalTab } from '../layout/LegalModal.js';
import { Globe, Check } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, bottomContent }) => {
  const { currentLanguage, setLanguage, t, switchNotification } = useLanguage();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);

  const primaryLanguages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English (US)' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français (France)' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português (Brasil)' },
    { code: 'ja', label: '日本語' },
  ];

  return (
    <div className="auth-page-root">
      {/* 60fps Interactive Liquid Jelly Canvas Surface */}
      <InteractiveCanvas />

      <div className="auth-main-container">
        {/* Left Brand Showcase Column: Just the name and 2-line fun quote */}
        <div className="auth-brand-section">
          <Link to="/login" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <h1 className="auth-brand-logo">Connectly</h1>
          </Link>

          <h2 className="auth-brand-desc">
            {t.quoteLine1}<br />
            {t.quoteLine2}
          </h2>
        </div>

        {/* Right Authentication Column */}
        <div className="auth-card-column">
          {children}
          {bottomContent && <div className="auth-bottom-content">{bottomContent}</div>}
        </div>
      </div>

      {/* Global Interactive Workable Footer */}
      <footer className="auth-global-footer">
        {/* Language Selection Row */}
        <div className="footer-links">
          {primaryLanguages.map(lang => {
            const isActive = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`footer-btn ${isActive ? 'active' : ''}`}
                aria-label={`Switch language to ${lang.label}`}
              >
                <span>{lang.label}</span>
                {isActive && <span className="active-dot">•</span>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsLangModalOpen(true)}
            className="footer-btn more-lang-btn"
            aria-label="View more languages"
          >
            <Globe size={13} />
            <span>More languages...</span>
          </button>
        </div>

        <div className="footer-divider" />

        {/* Meta & Legal Policies Row */}
        <div className="footer-meta">
          <span className="copyright-tag">Connectly © 2026</span>
          <button
            type="button"
            onClick={() => setLegalModalTab('privacy')}
            className="footer-meta-btn"
          >
            {t.privacy}
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('terms')}
            className="footer-meta-btn"
          >
            {t.terms}
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('cookies')}
            className="footer-meta-btn"
          >
            {t.cookies}
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('security')}
            className="footer-meta-btn"
          >
            {t.security}
          </button>
        </div>
      </footer>

      {/* Floating Language Switched Toast */}
      {switchNotification && (
        <div className="lang-toast-bubble" role="status">
          <Check size={15} color="#16A34A" />
          <span>{switchNotification}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <LanguageSelectModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />

      <LegalModal
        isOpen={!!legalModalTab}
        initialTab={legalModalTab || 'privacy'}
        onClose={() => setLegalModalTab(null)}
      />

      <style>{`
        .auth-page-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .auth-main-container {
          max-width: 1160px;
          width: calc(100% - 64px);
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          margin: 0 auto;
          padding: 40px 0 60px 0;
          position: relative;
          z-index: 1;
          box-sizing: border-box;
        }

        .auth-brand-section {
          flex: 1 1 54%;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-bottom: 40px;
        }

        .auth-brand-logo {
          font-size: 58px;
          font-weight: 800;
          color: var(--color-primary-blue);
          letter-spacing: -2px;
          line-height: 1.05;
          margin-bottom: 16px;
          user-select: none;
        }

        .auth-brand-desc {
          font-size: 28px;
          font-weight: 400;
          line-height: 1.34;
          color: #1C1E21;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .auth-card-column {
          flex: 0 0 440px;
          width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .auth-bottom-content {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: #334155;
          line-height: 1.4;
        }

        /* Footer */
        .auth-global-footer {
          width: 100%;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(226, 232, 240, 0.85);
          padding: 18px 24px;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

        .footer-links {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          font-size: 12px;
        }

        .footer-btn {
          background: none;
          border: none;
          color: #64748B;
          font-size: 12px;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 120ms ease;
          font-family: inherit;
        }
        .footer-btn:hover {
          color: var(--color-primary-blue);
          background: rgba(24, 119, 242, 0.06);
          text-decoration: underline;
        }
        .footer-btn.active {
          color: #0F172A;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.04);
        }
        .active-dot {
          color: var(--color-primary-blue);
          font-weight: 900;
          font-size: 14px;
        }

        .more-lang-btn {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          padding: 3px 8px;
          font-weight: 600;
          color: #475569;
        }
        .more-lang-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
          text-decoration: none;
        }

        .footer-divider {
          max-width: 1160px;
          height: 1px;
          background-color: #E2E8F0;
          margin: 10px auto;
        }

        .footer-meta {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          font-size: 11px;
        }

        .copyright-tag {
          color: #94A3B8;
        }

        .footer-meta-btn {
          background: none;
          border: none;
          color: #64748B;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: color 120ms ease;
          font-family: inherit;
        }
        .footer-meta-btn:hover {
          color: var(--color-primary-blue);
          text-decoration: underline;
        }

        /* Language switched toast bubble */
        .lang-toast-bubble {
          position: fixed;
          bottom: 74px;
          left: 50%;
          transform: translateX(-50%);
          background: #0F172A;
          color: #FFFFFF;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          z-index: 999;
          animation: toastPop 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        @keyframes toastPop {
          from { opacity: 0; transform: translate(-50%, 10px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        /* Tablet Breakpoint: 768px - 1024px */
        @media (max-width: 1024px) {
          .auth-main-container {
            gap: 36px;
            padding: 30px 16px;
          }

          .auth-brand-logo {
            font-size: 46px;
          }

          .auth-brand-desc {
            font-size: 24px;
          }
        }

        /* Mobile Breakpoint: <= 767px */
        @media (max-width: 767px) {
          .auth-main-container {
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 24px 16px 40px;
          }

          .auth-brand-section {
            width: 100%;
            max-width: 440px;
            align-items: center;
            text-align: center;
            padding-bottom: 0;
          }

          .auth-brand-logo {
            font-size: 42px;
            margin-bottom: 8px;
          }

          .auth-brand-desc {
            font-size: 18px;
          }

          .auth-card-column {
            width: 100%;
            max-width: 440px;
          }

          .footer-links {
            gap: 8px;
          }
          .footer-meta {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};
