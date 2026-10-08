import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Input } from '../ui/Input.js';
import { PasswordInput } from '../ui/PasswordInput.js';
import { Button } from '../ui/Button.js';
import { Divider } from '../ui/Divider.js';
import { Alert } from '../ui/Alert.js';
import { AuthCard } from './AuthCard.js';
import { SocialLoginButtons } from './SocialLoginButtons.js';
import { Building2, Sparkles } from 'lucide-react';

export interface LoginFormProps {
  onOpenRegisterModal: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onOpenRegisterModal }) => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [socialInfo, setSocialInfo] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const currentIdentifier = watch('identifier') || '';

  // Enterprise SSO Detection
  const isEnterpriseDomain = /@(company|acme|corp|enterprise|meta|google|microsoft)\.[a-z]{2,}$/i.test(
    currentIdentifier
  );

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSocialInfo(null);
    const result = await login(data.identifier, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setServerError(result.error || 'Incorrect email, phone number or password.');
    }
  };

  const handleSocialSelect = (provider: 'google' | 'apple') => {
    setSocialInfo(`Signing in via ${provider === 'google' ? 'Google' : 'Apple'}...`);
    // Pre-wire OAuth simulation: log in as demo user
    setTimeout(async () => {
      await login('alex.morgan@example.com', 'Password123!');
      navigate('/dashboard');
    }, 600);
  };

  const handleMagicLink = () => {
    if (!currentIdentifier.includes('@')) {
      setServerError('Please enter a valid email address first to receive a magic link.');
      return;
    }
    setServerError(null);
    setMagicLinkSent(true);
  };

  return (
    <AuthCard>
      {/* Social Login Buttons above the form */}
      <SocialLoginButtons onSelectProvider={handleSocialSelect} disabled={isLoading} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* ARIA Live Region for server and status alerts */}
        <div aria-live="polite" aria-atomic="true">
          {serverError && <Alert type="error" message={serverError} />}
          {socialInfo && <Alert type="info" message={socialInfo} />}
          {magicLinkSent && (
            <Alert
              type="success"
              title="Check your inbox"
              message={`We sent a secure magic link to ${currentIdentifier}. Click the link to log in instantly.`}
            />
          )}
        </div>

        {/* Enterprise SSO Detection Alert */}
        {isEnterpriseDomain && (
          <div
            className="animate-fade-in"
            style={{
              padding: '10px 12px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#1E40AF',
            }}
          >
            <Building2 size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Single Sign-On Detected</strong>
              <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                Your organization uses SSO. You can sign in with your corporate identity.
              </div>
            </div>
          </div>
        )}

        {/* Email or Phone Input */}
        <Input
          {...register('identifier')}
          placeholder={t.emailPlaceholder}
          autoComplete="username"
          error={errors.identifier?.message}
          disabled={isLoading}
        />

        {/* Password Input with standard show/hide toggle */}
        <PasswordInput
          {...register('password')}
          placeholder={t.passwordPlaceholder}
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={isLoading}
        />

        {/* Log In Button */}
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          isLoading={isLoading}
          loadingText="Logging in..."
          disabled={isLoading}
          style={{ marginTop: '4px', height: '48px', fontSize: '18px', fontWeight: 700 }}
        >
          {t.loginButton}
        </Button>

        {/* Forgot Password & Magic Link Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            fontSize: 'var(--font-size-small)',
          }}
        >
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--color-primary-blue)',
              textDecoration: 'none',
              fontWeight: 500,
              pointerEvents: isLoading ? 'none' : 'auto',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {t.lostPass}
          </Link>

          {/* Passwordless Magic Link Option */}
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-blue)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-primary-blue)')}
          >
            <Sparkles size={14} color="var(--color-primary-blue)" />
            <span>{t.magicPass}</span>
          </button>
        </div>

        {/* Divider */}
        <Divider margin="8px 0 4px 0" />

        {/* Create New Account Button Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0 6px',
            width: '100%',
          }}
        >
          <Button
            type="button"
            variant="success"
            disabled={isLoading}
            onClick={onOpenRegisterModal}
            style={{
              height: '46px',
              padding: '0 20px',
              fontSize: '17px',
              fontWeight: 700,
              borderRadius: '8px',
            }}
          >
            {t.newPass}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};
