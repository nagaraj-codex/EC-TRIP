import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface AuthSuccessProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onContinue?: () => void;
}

export const AuthSuccess: React.FC<AuthSuccessProps> = ({
  title = 'Password changed',
  message = 'Your password has been changed successfully.',
  buttonText = 'Continue to Login',
  onContinue,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
      className="animate-fade-in"
    >
      {/* 64px Circular Green Check Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-success)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Check size={38} strokeWidth={3} />
      </div>

      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: '16px',
          color: 'var(--color-text-secondary)',
          marginBottom: '28px',
          maxWidth: '360px',
          lineHeight: 1.4,
        }}
      >
        {message}
      </p>

      <Button
        type="button"
        variant="primary"
        size="default"
        onClick={handleAction}
        style={{ minWidth: '200px' }}
      >
        {buttonText}
      </Button>
    </div>
  );
};
