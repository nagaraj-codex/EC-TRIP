import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  loginSchema,
  LoginFormData,
  registerSchema,
  RegisterFormData,
} from '../../schemas/authSchemas.js';
import { useAuth } from '../../hooks/useAuth.js';
import { usePasswordStrength } from '../../hooks/usePasswordStrength.js';
import { Input } from '../ui/Input.js';
import { PasswordInput } from '../ui/PasswordInput.js';
import { Select } from '../ui/Select.js';
import { RadioCard } from '../ui/RadioCard.js';
import { Button } from '../ui/Button.js';
import { Divider } from '../ui/Divider.js';
import { Alert } from '../ui/Alert.js';
import { Tooltip } from '../ui/Tooltip.js';
import { PeekABooMascot } from './PeekABooMascot.js';
import { InteractiveButton } from './InteractiveButton.js';
import { RollerCoasterTracker } from '../amusement/RollerCoasterTracker.js';
import { useLanguage } from '../../context/LanguageContext.js';
import {
  Sparkles,
  Building2,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  MoveDown,
  Ticket,
} from 'lucide-react';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = [
  { value: '1', label: 'Jan' },
  { value: '2', label: 'Feb' },
  { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' },
  { value: '5', label: 'May' },
  { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' },
  { value: '8', label: 'Aug' },
  { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export const FlipAuthCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Turnstile Ticket Punch state
  const [isPunched, setIsPunched] = useState(false);

  // Squishy rubber drag physics state
  const [isDraggingSquish, setIsDraggingSquish] = useState(false);
  const [squishOffset, setSquishOffset] = useState({ x: 0, y: 0 });
  const [isSpringBouncing, setIsSpringBouncing] = useState(false);

  // Liquid Pop Social Login state
  const [liquidPopping, setLiquidPopping] = useState<string | null>(null);

  const { login, register: registerUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Login Form Hook
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    watch: loginWatch,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // Sign Up Form Hook
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    watch: signupWatch,
    control: signupControl,
    formState: { errors: signupErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      emailOrPhone: '',
      password: '',
      birthDay: '15',
      birthMonth: '6',
      birthYear: '2000',
      gender: 'female',
      pronoun: '',
      customGender: '',
    },
  });

  const loginIdentifier = loginWatch('identifier') || '';
  const loginPassword = loginWatch('password') || '';
  const signupPassword = signupWatch('password') || '';
  const signupGender = signupWatch('gender');
  const signupStrength = usePasswordStrength(signupPassword);

  const isEnterprise = /@(company|acme|corp|enterprise|meta|google|microsoft)\.[a-z]{2,}$/i.test(
    loginIdentifier
  );

  // Squishy rubber card drag listeners
  const handleSquishPointerDown = (_e: React.PointerEvent) => {
    setIsDraggingSquish(true);
    setIsSpringBouncing(false);
  };

  useEffect(() => {
    if (!isDraggingSquish) return;

    let startY = 0;
    let startX = 0;
    let initialized = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (!initialized) {
        startY = e.clientY;
        startX = e.clientX;
        initialized = true;
        return;
      }
      const dy = Math.max(-20, Math.min(110, e.clientY - startY));
      const dx = Math.max(-60, Math.min(60, (e.clientX - startX) * 0.4));
      setSquishOffset({ x: dx, y: dy });
    };

    const handlePointerUp = () => {
      setIsDraggingSquish(false);
      setIsSpringBouncing(true);
      setSquishOffset({ x: 0, y: 0 });
      setTimeout(() => setIsSpringBouncing(false), 600);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSquish]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSocialNotice(null);
    setIsPunched(true); // Trigger park admission ticket punch turnstile scan effect!

    const res = await login(data.identifier, data.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setIsPunched(false);
      setServerError(res.error || 'Incorrect email, phone number or password.');
    }
  };

  const onSignupSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsPunched(true);
    const dob = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    const res = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      emailOrPhone: data.emailOrPhone,
      password: data.password,
      dateOfBirth: dob,
      gender: data.gender,
      pronoun: data.gender === 'custom' ? data.pronoun : undefined,
      customGender: data.gender === 'custom' ? data.customGender : undefined,
    });
    if (res.success) {
      navigate('/dashboard');
    } else {
      setIsPunched(false);
      setServerError(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    setLiquidPopping(provider);
    setSocialNotice(`Connecting via ${provider === 'google' ? 'Google' : 'Apple'}...`);
    setIsPunched(true);
    setTimeout(async () => {
      await login('alex.morgan@example.com', 'Password123!');
      navigate('/dashboard');
    }, 650);
  };

  const handleMagicLink = () => {
    if (!loginIdentifier.includes('@')) {
      setServerError('Enter an email address to receive your magic link.');
      return;
    }
    setServerError(null);
    setMagicLinkSent(true);
  };

  // Squish transform matrix
  const squishTransform = isDraggingSquish
    ? `translateY(${squishOffset.y * 0.4}px) scaleX(${1 - Math.abs(squishOffset.y) * 0.001}) scaleY(${1 + Math.abs(squishOffset.y) * 0.0018}) rotate(${squishOffset.x * 0.04}deg)`
    : 'none';

  return (
    <div className="flip-card-perspective">
      {/* Peek-a-Boo Mascot sitting on top of the card */}
      <PeekABooMascot
        isPasswordFocused={isPasswordFocused}
        isEmailFocused={isEmailFocused}
        isSubmitting={isLoading}
        inputLength={loginIdentifier.length}
      />

      <div
        className={`flip-card-inner ${isFlipped ? 'flipped' : ''} ${isSpringBouncing ? 'squish-spring-bounce' : ''}`}
        style={{ transform: isFlipped ? undefined : squishTransform }}
      >
        {/* ========================================================
            FRONT SIDE: PARK TICKET LOGIN EXPERIENCE
            ======================================================== */}
        <div className={`flip-card-face flip-card-front ${isPunched ? 'ticket-punched' : ''}`}>
          {/* Ticket Punch Cutouts (Left and Right Notches) */}
          <div className="ticket-notch ticket-notch-left" />
          <div className="ticket-notch ticket-notch-right" />

          {/* Turnstile Ticket Stamp on Submit */}
          {isPunched && (
            <div className="ticket-punch-stamp">
              <span>ADMITTED ✓</span>
              <div className="punch-sparks">✦ ✦ ✦</div>
            </div>
          )}

          {/* Squishy Rubber Pull Handle */}
          <div
            className="squishy-drag-handle"
            onPointerDown={handleSquishPointerDown}
            title="Drag down to bend and stretch like rubber"
          >
            <div className="squishy-drag-pill">
              <MoveDown size={11} />
              <span>Squishy Ticket • Pull to stretch</span>
            </div>
          </div>

          {/* Admission Ticket Header Stub */}
          <div className="park-ticket-header">
            <div className="ticket-badge">
              <Ticket size={14} color="#D97706" />
              <span>QUEUE CUT • EXPRESS ADMISSION</span>
            </div>
            <span className="ticket-serial">PASS #QC-8821 • VIP</span>
          </div>

          <div className="ticket-perforated-line" />

          {/* Liquid Pop Social Login Buttons */}
          <div className="liquid-pop-container">
            <div className="liquid-pop-bubbles">
              {/* Google Bubble Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialAuth('google')}
                className={`liquid-bubble-btn google-bubble ${liquidPopping === 'google' ? 'bubble-pop-active' : ''}`}
                aria-label="Continue with Google"
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
                <span>{t.googlePass}</span>
              </button>

              {/* Apple Bubble Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialAuth('apple')}
                className={`liquid-bubble-btn apple-bubble ${liquidPopping === 'apple' ? 'bubble-pop-active' : ''}`}
                aria-label="Sign in with Apple"
              >
                <svg width="18" height="18" viewBox="0 0 170 170" fill="white">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.73-7.92-12.12-14.52-6.19-9.35-10.8-19.86-13.84-31.54-3.04-11.68-4.56-22.75-4.56-33.2 0-14.15 3.73-25.75 11.2-34.8 7.47-9.05 16.94-13.68 28.4-13.89 4.35 0 9.28 1.16 14.79 3.49 5.51 2.33 9.4 3.55 11.66 3.66 2.05 0 6.06-1.3 12.04-3.88 5.98-2.58 11.09-3.76 15.34-3.55 11.45.65 20.73 4.96 27.84 12.92-9.98 6.05-14.86 14.52-14.65 25.41.21 8.52 3.51 15.65 9.9 21.39 6.39 5.74 14.12 9.02 23.2 9.83-2.22 6.83-4.87 13.68-7.96 20.55zM119.22 33.17c-.12-4.04 1.25-8.23 4.12-12.56 2.87-4.33 6.64-7.79 11.31-10.37-4.22-3.83-8.87-6.28-13.95-7.36-5.08-1.08-10.15-.98-15.21.3-1.07 4.13-.67 8.35 1.2 12.66 1.87 4.31 4.77 7.9 8.7 10.77 2.11 1.54 4.31 2.76 6.6 3.66 2.29.9 4.88 1.47 7.78 1.7-.22.4-.37.79-.45 1.2z" />
                </svg>
                <span>{t.applePass}</span>
              </button>
            </div>

            <div className="liquid-or-divider">
              <span className="liquid-divider-line" />
              <span className="liquid-divider-text">or with ticket email</span>
              <span className="liquid-divider-line" />
            </div>
          </div>

          {/* ARIA Alert Box */}
          <div aria-live="polite">
            {serverError && <Alert type="error" message={serverError} />}
            {socialNotice && <Alert type="info" message={socialNotice} />}
            {magicLinkSent && (
              <Alert
                type="success"
                title="Magic ticket sent"
                message={`Check ${loginIdentifier} for your instant login pass.`}
              />
            )}
          </div>

          {/* Enterprise SSO notice */}
          {isEnterprise && (
            <div className="enterprise-badge">
              <Building2 size={16} />
              <span>Corporate Park Pass detected. Direct gate access active.</span>
            </div>
          )}

          {/* Form with Roller Coaster typing tracker and Ferris Wheel password toggle */}
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {/* The Roller Coaster Tracker riding on top of text typing! */}
            <RollerCoasterTracker inputLength={loginIdentifier.length} />

            <div className="squishy-input-wrapper">
              <Input
                {...loginRegister('identifier')}
                placeholder={t.emailPlaceholder}
                autoComplete="username"
                error={loginErrors.identifier?.message}
                disabled={isLoading}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </div>

            <div className="squishy-input-wrapper">
              <PasswordInput
                {...loginRegister('password')}
                placeholder={t.passwordPlaceholder}
                autoComplete="current-password"
                error={loginErrors.password?.message}
                disabled={isLoading}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
            </div>

            {/* Interactive Magnetic & Slingshot Turnstile Login CTA */}
            <InteractiveButton
              variant="primary"
              isLoading={isLoading}
              loadingText="Punching ticket..."
              isEmptyFields={!loginIdentifier.trim() || !loginPassword.trim()}
              onSlingshotLaunch={() => {
                handleLoginSubmit(onLoginSubmit)();
              }}
            >
              {t.loginButton}
            </InteractiveButton>

            {/* Quick Links */}
            <div className="login-quick-actions">
              <Link to="/forgot-password" className="action-link">
                {t.lostPass}
              </Link>
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={isLoading}
                className="action-link magic-link-btn"
              >
                <Sparkles size={13} color="var(--color-primary-blue)" />
                <span>{t.magicPass}</span>
              </button>
            </div>

            <Divider margin="8px 0 6px 0" />

            {/* 3D Card Flip to Sign Up */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setIsFlipped(true);
                }}
                disabled={isLoading}
                className="create-account-flip-btn"
              >
                <UserPlus size={18} />
                <span>{t.newPass}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
            BACK SIDE: PARK PASS REGISTRATION
            ======================================================== */}
        <div className="flip-card-face flip-card-back">
          <div className="ticket-notch ticket-notch-left" />
          <div className="ticket-notch ticket-notch-right" />

          <div className="signup-header">
            <div>
              <h3 className="signup-title">New Park Member</h3>
              <p className="signup-subtitle">Instant fast pass & ride wait time alerts.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setIsFlipped(false);
              }}
              className="back-to-login-btn"
              aria-label="Back to gate pass"
            >
              <ArrowLeft size={16} />
              <span>Back to Gate</span>
            </button>
          </div>

          <div aria-live="polite">
            {serverError && <Alert type="error" message={serverError} />}
          </div>

          <form
            onSubmit={handleSignupSubmit(onSignupSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                {...signupRegister('firstName')}
                variant="modal"
                placeholder="First name"
                error={signupErrors.firstName?.message}
                disabled={isLoading}
              />
              <Input
                {...signupRegister('lastName')}
                variant="modal"
                placeholder="Surname"
                error={signupErrors.lastName?.message}
                disabled={isLoading}
              />
            </div>

            <Input
              {...signupRegister('emailOrPhone')}
              variant="modal"
              placeholder="Mobile number or email address"
              error={signupErrors.emailOrPhone?.message}
              disabled={isLoading}
            />

            <div>
              <PasswordInput
                {...signupRegister('password')}
                variant="modal"
                placeholder="New password"
                error={signupErrors.password?.message}
                disabled={isLoading}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              {/* Interactive Password Rules Checklist */}
              <div className="rules-compact">
                {[
                  { label: '8+ chars', met: signupStrength.hasLength },
                  { label: 'Uppercase', met: signupStrength.hasUpper },
                  { label: 'Number', met: signupStrength.hasNumber },
                  { label: 'Symbol', met: signupStrength.hasSpecial },
                ].map((r, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: r.met ? 'var(--color-success)' : 'var(--color-text-muted)',
                      transition: 'color 150ms ease',
                    }}
                  >
                    <CheckCircle size={11} color={r.met ? 'var(--color-success)' : '#CCD0D5'} />
                    {r.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>Date of birth (Ride height & safety compliance)</span>
                <Tooltip content="Required for ride height categorization and safety." />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.3fr 1.1fr',
                  gap: '6px',
                  marginTop: '2px',
                }}
              >
                <Select
                  {...signupRegister('birthDay')}
                  disabled={isLoading}
                  style={{ height: '32px', fontSize: '13px' }}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select
                  {...signupRegister('birthMonth')}
                  disabled={isLoading}
                  style={{ height: '32px', fontSize: '13px' }}
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
                <Select
                  {...signupRegister('birthYear')}
                  disabled={isLoading}
                  style={{ height: '32px', fontSize: '13px' }}
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Gender */}
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Gender</span>
              <Controller
                name="gender"
                control={signupControl}
                render={({ field }) => (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      marginTop: '2px',
                    }}
                  >
                    <RadioCard
                      id="flip-female"
                      name="signup-gender"
                      value="female"
                      label="Female"
                      checked={field.value === 'female'}
                      onChange={field.onChange}
                    />
                    <RadioCard
                      id="flip-male"
                      name="signup-gender"
                      value="male"
                      label="Male"
                      checked={field.value === 'male'}
                      onChange={field.onChange}
                    />
                    <RadioCard
                      id="flip-custom"
                      name="signup-gender"
                      value="custom"
                      label="Custom"
                      checked={field.value === 'custom'}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
              {signupGender === 'custom' && (
                <div style={{ marginTop: '6px' }}>
                  <Select
                    {...signupRegister('pronoun')}
                    disabled={isLoading}
                    style={{ height: '32px', fontSize: '13px' }}
                  >
                    <option value="" disabled>
                      Select pronoun
                    </option>
                    <option value="she">She: &quot;Wish her a happy birthday!&quot;</option>
                    <option value="he">He: &quot;Wish him a happy birthday!&quot;</option>
                    <option value="they">They: &quot;Wish them a happy birthday!&quot;</option>
                  </Select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="success"
              size="default"
              fullWidth
              isLoading={isLoading}
              loadingText="Issuing pass..."
              style={{ marginTop: '4px', height: '42px', fontSize: '16px' }}
            >
              Get Express Pass
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        .flip-card-perspective {
          perspective: 1200px;
          width: 100%;
          max-width: 440px;
          position: relative;
          user-select: none;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          transition: transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg) !important;
        }

        @keyframes squishBounce {
          0% { transform: translateY(20px) scale(0.96, 1.06); }
          35% { transform: translateY(-10px) scale(1.04, 0.96); }
          60% { transform: translateY(4px) scale(0.99, 1.01); }
          85% { transform: translateY(-2px) scale(1.01, 0.99); }
          100% { transform: translateY(0) scale(1, 1); }
        }

        .squish-spring-bounce {
          animation: squishBounce 560ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .flip-card-face {
          width: 100%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 18px;
          padding: 20px 24px 24px 24px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.14),
                      0 4px 16px rgba(0, 0, 0, 0.04),
                      0 0 0 1px rgba(255, 255, 255, 0.9) inset;
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-sizing: border-box;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: relative;
        }

        /* Ticket Notches */
        .ticket-notch {
          position: absolute;
          top: 74px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #EEF3F8;
          border: 1px solid rgba(203, 213, 225, 0.8);
          z-index: 5;
        }
        .ticket-notch-left {
          left: -8px;
          box-shadow: 2px 0 3px rgba(0,0,0,0.06) inset;
        }
        .ticket-notch-right {
          right: -8px;
          box-shadow: -2px 0 3px rgba(0,0,0,0.06) inset;
        }

        /* Turnstile Ticket Stamp */
        @keyframes stampPop {
          0% { transform: translate(-50%, -50%) scale(2) rotate(-15deg); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(0.92) rotate(-8deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(-8deg); opacity: 0.95; }
        }
        .ticket-punch-stamp {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-8deg);
          border: 3px dashed #16A34A;
          color: #16A34A;
          background: rgba(240, 253, 244, 0.92);
          font-size: 20px;
          font-weight: 900;
          padding: 8px 18px;
          border-radius: 8px;
          letter-spacing: 1px;
          z-index: 30;
          animation: stampPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          text-align: center;
          pointer-events: none;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.25);
        }
        .punch-sparks {
          font-size: 11px;
          letter-spacing: 4px;
          color: #F59E0B;
        }

        .flip-card-front {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .flip-card-back {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Squishy drag handle at top of card */
        .squishy-drag-handle {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: grab;
          padding: 0 0 4px 0;
          touch-action: none;
        }
        .squishy-drag-handle:active {
          cursor: grabbing;
        }
        .squishy-drag-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          padding: 2px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          color: #64748B;
          transition: background 150ms ease, color 150ms ease;
        }
        .squishy-drag-handle:hover .squishy-drag-pill {
          background: #E2E8F0;
          color: #1E293B;
        }

        /* Admission Ticket Header */
        .park-ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .ticket-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #B45309;
          letter-spacing: 0.5px;
        }
        .ticket-serial {
          font-size: 11px;
          font-weight: 700;
          color: #92400E;
          font-family: monospace;
        }

        .ticket-perforated-line {
          width: 100%;
          height: 1px;
          border-top: 1.5px dashed #CBD5E1;
          margin: 4px 0;
        }

        /* Liquid Pop Bubbles */
        .liquid-pop-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .liquid-pop-bubbles {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .liquid-bubble-btn {
          width: 100%;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 150ms ease, box-shadow 150ms ease;
          box-sizing: border-box;
          user-select: none;
        }
        .liquid-bubble-btn:hover {
          transform: translateY(-1px) scale(1.01);
        }
        .liquid-bubble-btn:active {
          transform: translateY(1px) scale(0.98);
        }

        .google-bubble {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .google-bubble:hover {
          background: #F8FAFC;
        }

        .apple-bubble {
          background: #000000;
          border: none;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .apple-bubble:hover {
          background: #18181B;
        }

        @keyframes bubblePopPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); filter: brightness(1.2); }
          100% { transform: scale(1); }
        }
        .bubble-pop-active {
          animation: bubblePopPulse 320ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        .liquid-or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 2px 0;
          color: var(--color-text-muted);
          font-size: 12px;
        }
        .liquid-divider-line {
          flex: 1;
          height: 1px;
          background-color: var(--color-border-light);
        }
        .liquid-divider-text {
          font-size: 11px;
          text-transform: lowercase;
        }

        .squishy-input-wrapper {
          transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .squishy-input-wrapper:focus-within {
          transform: scale(1.012);
        }

        .enterprise-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 6px;
          font-size: 11px;
          color: #1E40AF;
        }

        .login-quick-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .action-link {
          color: var(--color-primary-blue);
          text-decoration: none;
          font-weight: 500;
        }
        .action-link:hover {
          text-decoration: underline;
        }

        .magic-link-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .create-account-flip-btn {
          height: 42px;
          padding: 0 20px;
          background-color: var(--color-success);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(66, 183, 42, 0.35);
          transition: background-color 150ms ease, transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .create-account-flip-btn:hover {
          background-color: var(--color-success-hover);
          transform: scale(1.02);
        }
        .create-account-flip-btn:active {
          transform: scale(0.98);
        }

        .signup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--color-border-light);
        }

        .signup-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .signup-subtitle {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin: 2px 0 0 0;
        }

        .back-to-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          padding: 5px 10px;
          border-radius: 6px;
          color: var(--color-text-primary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 150ms ease;
        }
        .back-to-login-btn:hover {
          background-color: #E2E8F0;
        }

        .rules-compact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 4px 2px;
        }

        @media (max-width: 480px) {
          .flip-card-face {
            padding: 16px 14px;
          }
        }
      `}</style>
    </div>
  );
};
