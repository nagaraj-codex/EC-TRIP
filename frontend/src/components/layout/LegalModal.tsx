import React, { useState } from 'react';
import { X, Shield, FileText, Cookie, Lock, Check, Save } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'cookies' | 'security';

export interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Cookie toggles state with localStorage persistence
  const [cookieSettings, setCookieSettings] = useState(() => {
    const saved = localStorage.getItem('connectly_cookies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return {
      essential: true, // locked
      functional: true,
      analytics: false,
      personalized: false,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveCookies = () => {
    localStorage.setItem('connectly_cookies', JSON.stringify(cookieSettings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAcceptAllCookies = () => {
    const all = {
      essential: true,
      functional: true,
      analytics: true,
      personalized: true,
    };
    setCookieSettings(all);
    localStorage.setItem('connectly_cookies', JSON.stringify(all));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="legal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="legal-modal-card" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="legal-modal-header">
          <div className="legal-tabs-nav">
            <button
              type="button"
              className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={16} />
              <span>Privacy</span>
            </button>
            <button
              type="button"
              className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <FileText size={16} />
              <span>Terms</span>
            </button>
            <button
              type="button"
              className={`legal-tab-btn ${activeTab === 'cookies' ? 'active' : ''}`}
              onClick={() => setActiveTab('cookies')}
            >
              <Cookie size={16} />
              <span>Cookies</span>
            </button>
            <button
              type="button"
              className={`legal-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={16} />
              <span>Security</span>
            </button>
          </div>

          <button type="button" onClick={onClose} className="legal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="legal-modal-body">
          {/* ===================================================
              1. PRIVACY TAB
              =================================================== */}
          {activeTab === 'privacy' && (
            <div className="legal-content-section">
              <h2 className="legal-section-title">Connectly Privacy Policy</h2>
              <p className="legal-updated">Last Updated: September 2026 • Version 3.4</p>

              <div className="legal-callout">
                <strong>Your Privacy First:</strong> Connectly does not sell your personal information or credentials. All interactions, passwords, and sessions are encrypted end-to-end.
              </div>

              <h3>1. Data We Collect</h3>
              <p>
                We collect your name, email address or mobile number, date of birth (for age verification and park ride height compliance), and encrypted password hash. We never store plain-text passwords.
              </p>

              <h3>2. Zero-Knowledge Credential Handling</h3>
              <p>
                Your passwords are encrypted using one-way adaptive Bcrypt hashing (cost factor 10) before ever reaching our persistent store. Neither our administrators nor automated pipelines can read your original password.
              </p>

              <h3>3. Your Global Rights (GDPR & CCPA)</h3>
              <p>
                You have the right to request a complete export of your personal data, update your account telemetry, or permanently delete your account at any time via your security dashboard.
              </p>

              <h3>4. Contact Our Data Protection Officer</h3>
              <p>
                For inquiries regarding privacy, data processing, or GDPR compliance, contact our privacy team at{' '}
                <a href="mailto:privacy@connectly.internal">privacy@connectly.internal</a>.
              </p>
            </div>
          )}

          {/* ===================================================
              2. TERMS TAB
              =================================================== */}
          {activeTab === 'terms' && (
            <div className="legal-content-section">
              <h2 className="legal-section-title">Connectly Terms of Service</h2>
              <p className="legal-updated">Effective: 2026 • Connectly Global Network</p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing Connectly and creating an account or admission pass, you agree to abide by these Terms of Service, our Community Guidelines, and applicable safety laws.
              </p>

              <h3>2. Account Responsibility & Pass Conduct</h3>
              <p>
                You are responsible for maintaining the confidentiality of your credentials. You agree not to share your admission pass or access credentials with unauthorized parties.
              </p>

              <h3>3. Acceptable Use</h3>
              <p>
                Users may not deploy automated bots, attempt credential stuffing, reverse engineer platform physics engines, or harass other members of the Connectly community.
              </p>

              <h3>4. Termination & Pass Suspension</h3>
              <p>
                Connectly reserves the right to suspend or terminate accounts that violate community safety rules, commit identity fraud, or engage in abusive behavior.
              </p>
            </div>
          )}

          {/* ===================================================
              3. COOKIES TAB (INTERACTIVE MANAGER)
              =================================================== */}
          {activeTab === 'cookies' && (
            <div className="legal-content-section">
              <h2 className="legal-section-title">Cookie Preferences Manager</h2>
              <p className="legal-updated">Manage your privacy and data collection preferences</p>

              <div className="cookie-group-card">
                <div className="cookie-header-row">
                  <div>
                    <h4 className="cookie-title">Strictly Necessary Cookies</h4>
                    <p className="cookie-desc">
                      Required for secure authentication, CSRF token validation, and session management. Cannot be disabled.
                    </p>
                  </div>
                  <span className="cookie-locked-badge">Always Active</span>
                </div>
              </div>

              <div className="cookie-group-card">
                <div className="cookie-header-row">
                  <div>
                    <h4 className="cookie-title">Functional Preferences</h4>
                    <p className="cookie-desc">
                      Saves your selected language, mascot animations, and squishy physics states across visits.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={cookieSettings.functional}
                      onChange={e =>
                        setCookieSettings({ ...cookieSettings, functional: e.target.checked })
                      }
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>

              <div className="cookie-group-card">
                <div className="cookie-header-row">
                  <div>
                    <h4 className="cookie-title">Analytics & Performance</h4>
                    <p className="cookie-desc">
                      Helps us measure page load times, 60fps canvas performance, and improve server response speed.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={cookieSettings.analytics}
                      onChange={e =>
                        setCookieSettings({ ...cookieSettings, analytics: e.target.checked })
                      }
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>

              <div className="cookie-group-card">
                <div className="cookie-header-row">
                  <div>
                    <h4 className="cookie-title">Personalized Features</h4>
                    <p className="cookie-desc">
                      Delivers personalized park wait times, event alerts, and VIP admission promotions.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={cookieSettings.personalized}
                      onChange={e =>
                        setCookieSettings({ ...cookieSettings, personalized: e.target.checked })
                      }
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="cookie-actions-bar">
                {savedSuccess && (
                  <span className="cookie-saved-toast">
                    <Check size={14} color="#16A34A" />
                    <span>Preferences saved!</span>
                  </span>
                )}
                <button type="button" onClick={handleAcceptAllCookies} className="btn-secondary">
                  Accept All
                </button>
                <button type="button" onClick={handleSaveCookies} className="btn-primary">
                  <Save size={14} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              4. SECURITY TAB
              =================================================== */}
          {activeTab === 'security' && (
            <div className="legal-content-section">
              <h2 className="legal-section-title">Security & Encryption Architecture</h2>
              <p className="legal-updated">Bank-grade defenses protecting all Connectly accounts</p>

              <div className="security-grid">
                <div className="sec-item">
                  <div className="sec-icon green">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4>Bcrypt Adaptive Password Hashing</h4>
                    <p>
                      Passwords are salted and hashed using 10 rounds of Bcrypt. Plaintext credentials never touch disk or memory logs.
                    </p>
                  </div>
                </div>

                <div className="sec-item">
                  <div className="sec-icon blue">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4>HttpOnly & SameSite Session Tokens</h4>
                    <p>
                      JWT tokens are sealed inside `HttpOnly; SameSite=Lax` cookies, rendering them immune to cross-site scripting (XSS).
                    </p>
                  </div>
                </div>

                <div className="sec-item">
                  <div className="sec-icon orange">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4>Automated Rate Limiting</h4>
                    <p>
                      Protects against brute-force attacks by strictly throttling failed logins (max 10 per 15 minutes) and OTP code attempts.
                    </p>
                  </div>
                </div>

                <div className="sec-item">
                  <div className="sec-icon purple">
                    <Check size={18} />
                  </div>
                  <div>
                    <h4>Time-Locked 6-Box OTP Verification</h4>
                    <p>
                      Account recovery verification codes expire strictly in 5 minutes with single-use invalidation upon verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .legal-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .legal-modal-card {
          width: 100%;
          max-width: 620px;
          max-height: 82vh;
          background: #FFFFFF;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: legalModalIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes legalModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .legal-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
          background: #F8FAFC;
        }

        .legal-tabs-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .legal-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: none;
          font-size: 13px;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          transition: all 140ms ease;
        }
        .legal-tab-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
        }
        .legal-tab-btn.active {
          background: #FFFFFF;
          color: var(--color-primary-blue);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .legal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748B;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease, color 150ms ease;
        }
        .legal-close-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        .legal-modal-body {
          overflow-y: auto;
          padding: 24px;
          color: #334155;
          line-height: 1.6;
        }

        .legal-section-title {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 4px 0;
        }

        .legal-updated {
          font-size: 12px;
          color: #94A3B8;
          margin: 0 0 16px 0;
        }

        .legal-callout {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          color: #1E40AF;
          margin-bottom: 20px;
        }

        .legal-content-section h3 {
          font-size: 15px;
          font-weight: 700;
          color: #1E293B;
          margin: 16px 0 6px 0;
        }

        .legal-content-section p {
          font-size: 13px;
          color: #475569;
          margin: 0 0 10px 0;
        }

        .cookie-group-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 12px;
        }

        .cookie-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .cookie-title {
          font-size: 14px;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 2px 0;
        }

        .cookie-desc {
          font-size: 12px;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
        }

        .cookie-locked-badge {
          background: #E2E8F0;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .cookie-actions-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid #E2E8F0;
        }

        .cookie-saved-toast {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #16A34A;
          margin-right: auto;
        }

        .btn-primary {
          background: var(--color-primary-blue);
          color: #FFFFFF;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 150ms ease;
        }
        .btn-primary:hover {
          background: var(--color-hover-blue);
        }

        .btn-secondary {
          background: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .btn-secondary:hover {
          background: #E2E8F0;
        }

        /* Switch toggle */
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #CBD5E1;
          transition: .2s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
        }
        input:checked + .slider {
          background-color: var(--color-primary-blue);
        }
        input:checked + .slider:before {
          transform: translateX(18px);
        }
        .slider.round {
          border-radius: 22px;
        }
        .slider.round:before {
          border-radius: 50%;
        }

        .security-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .sec-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px;
        }
        .sec-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sec-icon.green { background: #DCFCE7; color: #16A34A; }
        .sec-icon.blue { background: #DBEAFE; color: #2563EB; }
        .sec-icon.orange { background: #FFEDD5; color: #EA580C; }
        .sec-icon.purple { background: #F3E8FF; color: #9333EA; }

        .sec-item h4 {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 3px 0;
        }
        .sec-item p {
          font-size: 12px;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
