import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';
import { Mail, Phone, UserCheck } from 'lucide-react';

interface AccountData {
  userId: string;
  name: string;
  maskedEmail: string;
  maskedPhone: string;
}

export const RecoverAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve passed account data or fall back to demo user
  const account: AccountData = (location.state as { account?: AccountData })?.account || {
    userId: 'usr_demo_connectly_01',
    name: 'Alex Morgan',
    maskedEmail: 'a****n@example.com',
    maskedPhone: '******0199',
  };

  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.sendOtp(account.userId, selectedMethod);
      if (res.success) {
        navigate('/verify-code', {
          state: {
            userId: account.userId,
            destination: selectedMethod === 'email' ? account.maskedEmail : account.maskedPhone,
            method: selectedMethod,
            previewCode: res.data?.previewCode,
          },
        });
      } else {
        setError(res.error || 'Failed to send confirmation code.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending confirmation code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--color-border-light)',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Reset Your Password
        </h2>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="error" message={error} />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: 'var(--color-bg-hover)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-blue)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            <UserCheck size={24} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {account.name}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Connectly user
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-text-primary)',
            marginBottom: '16px',
            lineHeight: 1.35,
          }}
        >
          How would you like to receive your confirmation code?
        </p>

        {/* Option: Email */}
        <label
          htmlFor="recovery-email"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border:
              selectedMethod === 'email'
                ? '1px solid var(--color-primary-blue)'
                : '1px solid var(--color-border-light)',
            backgroundColor:
              selectedMethod === 'email' ? 'rgba(24, 119, 242, 0.04)' : 'var(--color-surface-white)',
            borderRadius: '6px',
            padding: '14px',
            marginBottom: '10px',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, border-color 150ms ease',
          }}
        >
          <input
            type="radio"
            id="recovery-email"
            name="recoveryMethod"
            value="email"
            checked={selectedMethod === 'email'}
            onChange={() => setSelectedMethod('email')}
            style={{
              accentColor: 'var(--color-primary-blue)',
              width: '18px',
              height: '18px',
              cursor: 'pointer',
            }}
          />
          <Mail size={20} color="var(--color-text-secondary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Send code via email
            </span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {account.maskedEmail}
            </span>
          </div>
        </label>

        {/* Option: Phone */}
        <label
          htmlFor="recovery-phone"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border:
              selectedMethod === 'phone'
                ? '1px solid var(--color-primary-blue)'
                : '1px solid var(--color-border-light)',
            backgroundColor:
              selectedMethod === 'phone' ? 'rgba(24, 119, 242, 0.04)' : 'var(--color-surface-white)',
            borderRadius: '6px',
            padding: '14px',
            marginBottom: '10px',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, border-color 150ms ease',
          }}
        >
          <input
            type="radio"
            id="recovery-phone"
            name="recoveryMethod"
            value="phone"
            checked={selectedMethod === 'phone'}
            onChange={() => setSelectedMethod('phone')}
            style={{
              accentColor: 'var(--color-primary-blue)',
              width: '18px',
              height: '18px',
              cursor: 'pointer',
            }}
          />
          <Phone size={20} color="var(--color-text-secondary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Send code via SMS
            </span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {account.maskedPhone}
            </span>
          </div>
        </label>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '16px 20px',
          backgroundColor: 'var(--color-bg-hover)',
          borderTop: '1px solid var(--color-border-light)',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isLoading}
          onClick={() => navigate('/forgot-password')}
        >
          Not You?
        </Button>

        <Button
          type="button"
          variant="primary"
          size="small"
          isLoading={isLoading}
          loadingText="Sending code..."
          disabled={isLoading}
          onClick={handleSendCode}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
