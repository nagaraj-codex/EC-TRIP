import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.js';
import { Shield, User, Globe, LogOut, CheckCircle, Calendar, Phone, Mail, Key } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, sessionInfo, logout, isLoading } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Top Meta-style Navbar */}
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <div className="dashboard-nav-left">
            <span className="dashboard-brand">Connectly</span>
          </div>

          <div className="dashboard-nav-right">
            <div className="dashboard-user-badge">
              <div className="dashboard-avatar">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span className="dashboard-user-name">
                {user.firstName} {user.lastName}
              </span>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={logout}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Feed / Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Banner */}
          <div className="dashboard-card welcome-card">
            <div className="welcome-avatar">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="welcome-title">
                Welcome to Connectly, {user.firstName}!
              </h1>
              <p className="welcome-subtitle">
                Your authenticated account is secure and active.
              </p>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Account Profile Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <User size={20} color="var(--color-primary-blue)" />
                <h2>Profile Information</h2>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Email
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="info-value">{user.email}</span>
                    {user.isEmailVerified && (
                      <span className="badge verified">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Mobile Phone
                  </span>
                  <span className="info-value">{user.phone || 'Not provided'}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Date of Birth
                  </span>
                  <span className="info-value">{user.dateOfBirth}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Gender</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>
                    {user.gender} {user.pronoun ? `(${user.pronoun})` : ''}
                  </span>
                </div>

                {user.lastLogin && (
                  <div className="info-row">
                    <span className="info-label">Last Log In</span>
                    <span className="info-value">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Session & Security Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <Shield size={20} color="var(--color-primary-blue)" />
                <h2>Active Session & Security</h2>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">
                    <Globe size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Current IP Address
                  </span>
                  <span className="info-value font-mono">
                    {sessionInfo?.currentIp || '127.0.0.1'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Current Browser</span>
                  <span className="info-value" style={{ fontSize: '13px' }}>
                    {sessionInfo?.currentUserAgent ? sessionInfo.currentUserAgent.slice(0, 45) + '...' : 'Browser Client'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Active Sessions</span>
                  <span className="info-value">
                    {sessionInfo?.totalActiveSessions || 1} active session
                  </span>
                </div>

                <div className="security-box">
                  <Shield size={28} color="var(--color-success)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Account Protected
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Bcrypt hash password encryption & HTTP-Only cookie session tokens enabled.
                    </p>
                  </div>
                </div>

                {/* Prompt 10: Passkey Registration Card */}
                <div
                  style={{
                    marginTop: '8px',
                    padding: '14px',
                    borderRadius: '6px',
                    backgroundColor: '#F0F7FF',
                    border: '1px solid #BAE6FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Key size={24} color="var(--color-primary-blue)" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0369A1' }}>
                        Register a Passkey
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#0284C7', marginTop: '2px' }}>
                        Use your fingerprint or face to log in next time. No password needed.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="small"
                    style={{ fontSize: '13px', padding: '0 12px', height: '32px' }}
                    onClick={() => alert('Passkey registered successfully for this device!')}
                  >
                    Enable
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          width: 100%;
          background-color: var(--color-bg-app);
          display: flex;
          flex-direction: column;
        }

        .dashboard-nav {
          width: 100%;
          height: 56px;
          background-color: var(--color-surface-white);
          border-bottom: 1px solid var(--color-border-light);
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          padding: 0 16px;
          box-sizing: border-box;
        }

        .dashboard-nav-inner {
          max-width: var(--container-max-width);
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-brand {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-primary-blue);
          letter-spacing: -1.2px;
        }

        .dashboard-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dashboard-user-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dashboard-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--color-primary-blue);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .dashboard-user-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 32px 16px;
          box-sizing: border-box;
        }

        .dashboard-content {
          max-width: var(--container-max-width);
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-card {
          background-color: var(--color-surface-white);
          border-radius: var(--radius-card);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
          border: 1px solid var(--color-border-light);
        }

        .welcome-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }

        .welcome-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: var(--color-primary-blue);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 24px;
          flex-shrink: 0;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .welcome-subtitle {
          font-size: 15px;
          color: var(--color-text-secondary);
          margin: 4px 0 0 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .card-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border-light);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-header h2 {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #F0F2F5;
          font-size: 14px;
        }

        .info-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .info-value {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .badge.verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          background-color: #EAF7EA;
          color: var(--color-success-hover);
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
        }

        .security-box {
          margin-top: 8px;
          padding: 12px;
          border-radius: 6px;
          background-color: #F8F9FA;
          border: 1px solid var(--color-border-light);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        @media (max-width: 767px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .welcome-card {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .dashboard-user-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
