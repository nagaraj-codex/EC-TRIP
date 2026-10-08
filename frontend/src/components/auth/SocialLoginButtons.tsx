import React from 'react';

export interface SocialLoginButtonsProps {
  onSelectProvider?: (provider: 'google' | 'apple') => void;
  disabled?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSelectProvider,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Continue with Google */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectProvider?.('google')}
        aria-label="Continue with Google"
        style={{
          width: '100%',
          height: '42px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border-default)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 150ms ease, border-color 150ms ease',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }}
        onMouseLeave={e => {
          if (!disabled) e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Sign in with Apple */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectProvider?.('apple')}
        aria-label="Sign in with Apple"
        style={{
          width: '100%',
          height: '42px',
          backgroundColor: '#000000',
          border: 'none',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#FFFFFF',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 150ms ease',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          if (!disabled) e.currentTarget.style.backgroundColor = '#1A1A1A';
        }}
        onMouseLeave={e => {
          if (!disabled) e.currentTarget.style.backgroundColor = '#000000';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 170 170" fill="white">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.73-7.92-12.12-14.52-6.19-9.35-10.8-19.86-13.84-31.54-3.04-11.68-4.56-22.75-4.56-33.2 0-14.15 3.73-25.75 11.2-34.8 7.47-9.05 16.94-13.68 28.4-13.89 4.35 0 9.28 1.16 14.79 3.49 5.51 2.33 9.4 3.55 11.66 3.66 2.05 0 6.06-1.3 12.04-3.88 5.98-2.58 11.09-3.76 15.34-3.55 11.45.65 20.73 4.96 27.84 12.92-9.98 6.05-14.86 14.52-14.65 25.41.21 8.52 3.51 15.65 9.9 21.39 6.39 5.74 14.12 9.02 23.2 9.83-2.22 6.83-4.87 13.68-7.96 20.55zM119.22 33.17c-.12-4.04 1.25-8.23 4.12-12.56 2.87-4.33 6.64-7.79 11.31-10.37-4.22-3.83-8.87-6.28-13.95-7.36-5.08-1.08-10.15-.98-15.21.3-1.07 4.13-.67 8.35 1.2 12.66 1.87 4.31 4.77 7.9 8.7 10.77 2.11 1.54 4.31 2.76 6.6 3.66 2.29.9 4.88 1.47 7.78 1.7-.22.4-.37.79-.45 1.2z" />
        </svg>
        <span>Sign in with Apple</span>
      </button>

      {/* Or Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '6px 0',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          textTransform: 'lowercase',
          userSelect: 'none',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
        <span>or</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
      </div>
    </div>
  );
};
