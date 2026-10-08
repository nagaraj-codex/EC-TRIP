import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../schemas/authSchemas.js';
import { authService } from '../../services/authService.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setIsSearching(true);

    try {
      const res = await authService.findAccount(data.identifier);
      if (res.success && res.data) {
        // Navigate to account recovery screen with retrieved account metadata
        navigate('/recover-account', {
          state: {
            account: res.data,
          },
        });
      } else {
        setServerError(
          res.error || "We couldn't find an account matching that email or mobile number."
        );
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to search account.');
    } finally {
      setIsSearching(false);
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
          Find Your Account
        </h2>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ padding: '20px' }}>
          {serverError && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="error" message={serverError} />
            </div>
          )}

          <p
            style={{
              fontSize: '17px',
              color: 'var(--color-text-primary)',
              marginBottom: '20px',
              lineHeight: 1.35,
            }}
          >
            Please enter your email address or mobile number to search for your account.
          </p>

          <Input
            {...register('identifier')}
            placeholder="Mobile number or email"
            autoComplete="username"
            error={errors.identifier?.message}
            disabled={isSearching}
          />
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
            disabled={isSearching}
            onClick={() => navigate('/login')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="small"
            isLoading={isSearching}
            loadingText="Searching..."
            disabled={isSearching}
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};
