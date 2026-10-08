import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { OTPInput } from '../components/auth/OTPInput.js';
import { Button } from '../components/ui/Button.js';
import { Alert } from '../components/ui/Alert.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { authService } from '../services/authService.js';

export const VerifyCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as {
    userId?: string;
    destination?: string;
    method?: 'email' | 'phone';
    previewCode?: string;
  }) || {};

  const userId = state.userId || 'usr_demo_connectly_01';
  const destination = state.destination || 'your email address or mobile number';
  const method = state.method || 'email';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>(state.previewCode);

  const { formattedTime, isExpired, reset } = useCountdown(45);

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits of the confirmation code.');
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const res = await authService.verifyOtp(userId, codeToVerify);
      if (res.success && res.resetToken) {
        navigate('/reset-password', {
          state: {
            resetToken: res.resetToken,
          },
        });
      } else {
        setError(res.error || 'Invalid confirmation code. Please check and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verifying code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!isExpired || isResending) return;
    setError(null);
    setIsResending(true);

    try {
      const res = await authService.sendOtp(userId, method);
      if (res.success) {
        reset(45);
        if (res.data?.previewCode) {
          setDevCode(res.data.previewCode);
        }
      } else {
        setError(res.error || 'Failed to resend confirmation code.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resending code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <CenteredAuthLayout maxWidth="500px">
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
            Enter confirmation code
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {error && (
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <Alert type="error" message={error} />
            </div>
          )}

          {devCode && (
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <Alert
                type="info"
                title="Development Preview Code"
                message={`Your confirmation code is: ${devCode}`}
              />
            </div>
          )}

          <p
            style={{
              fontSize: '17px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.35,
              width: '100%',
              margin: 0,
              textAlign: 'left',
            }}
          >
            Please check your {method === 'email' ? 'email' : 'phone'} for a message with your code. Your code is 6 numbers long.
          </p>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginTop: '6px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            We sent your code to: <strong>{destination}</strong>
          </p>

          {/* 6-box OTP Input */}
          <OTPInput
            value={code}
            onChange={setCode}
            onComplete={handleVerify}
            disabled={isVerifying}
            hasError={!!error}
          />

          {/* Timer & Resend */}
          <div
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginTop: '8px',
            }}
          >
            {!isExpired ? (
              <span>Resend code in {formattedTime}</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-blue)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                {isResending ? 'Sending...' : "Didn't get a code? Resend code"}
              </button>
            )}
          </div>
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
            disabled={isVerifying}
            onClick={() => navigate('/login')}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            isLoading={isVerifying}
            loadingText="Verifying..."
            disabled={isVerifying || code.length !== 6}
            onClick={() => handleVerify(code)}
          >
            Continue
          </Button>
        </div>
      </div>
    </CenteredAuthLayout>
  );
};
