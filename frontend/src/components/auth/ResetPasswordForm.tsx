import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordSchema, ResetPasswordFormData } from '../../schemas/authSchemas.js';
import { usePasswordStrength } from '../../hooks/usePasswordStrength.js';
import { authService } from '../../services/authService.js';
import { PasswordInput } from '../ui/PasswordInput.js';
import { PasswordStrength } from './PasswordStrength.js';
import { Button } from '../ui/Button.js';
import { Alert } from '../ui/Alert.js';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = (location.state as { resetToken?: string })?.resetToken || '';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('newPassword');
  const strength = usePasswordStrength(currentPassword);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      setServerError('Reset token missing or expired. Please restart the recovery flow.');
      return;
    }

    setServerError(null);
    setIsUpdating(true);

    try {
      const res = await authService.resetPassword(
        resetToken,
        data.newPassword,
        data.confirmPassword
      );

      if (res.success) {
        navigate('/reset-success');
      } else {
        setServerError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error updating password.');
    } finally {
      setIsUpdating(false);
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
          Create a new password
        </h2>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {serverError && <Alert type="error" message={serverError} />}

          <p
            style={{
              fontSize: '17px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            Create a strong password that you haven&apos;t used before.
          </p>

          <div>
            <PasswordInput
              {...register('newPassword')}
              placeholder="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              disabled={isUpdating}
            />
            <PasswordStrength strength={strength} />
          </div>

          <PasswordInput
            {...register('confirmPassword')}
            placeholder="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            disabled={isUpdating}
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
            disabled={isUpdating}
            onClick={() => navigate('/login')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="small"
            isLoading={isUpdating}
            loadingText="Updating password..."
            disabled={isUpdating || strength.level === 'weak' || strength.level === 'empty'}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};
