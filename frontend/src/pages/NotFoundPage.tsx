import React from 'react';
import { CenteredAuthLayout } from '../components/layout/CenteredAuthLayout.js';
import { Button } from '../components/ui/Button.js';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CenteredAuthLayout maxWidth="480px">
      <div
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: 'var(--color-primary-blue)',
            marginBottom: '8px',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '10px',
          }}
        >
          This Page Isn&apos;t Available
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.4,
          }}
        >
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate('/login')}
          style={{ minWidth: '160px' }}
        >
          Go to Connectly
        </Button>
      </div>
    </CenteredAuthLayout>
  );
};
