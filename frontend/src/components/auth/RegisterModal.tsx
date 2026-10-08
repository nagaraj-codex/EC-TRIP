import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../../schemas/authSchemas.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { PasswordInput } from '../ui/PasswordInput.js';
import { Select } from '../ui/Select.js';
import { RadioCard } from '../ui/RadioCard.js';
import { Button } from '../ui/Button.js';
import { Tooltip } from '../ui/Tooltip.js';
import { Alert } from '../ui/Alert.js';
import { usePasswordStrength } from '../../hooks/usePasswordStrength.js';
import { PasswordStrength } from './PasswordStrength.js';
import { SocialLoginButtons } from './SocialLoginButtons.js';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate Day, Month, Year arrays
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
const YEARS = Array.from({ length: 110 }, (_, i) => String(currentYear - i));

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
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

  const selectedGender = watch('gender');
  const currentPassword = watch('password') || '';
  const passwordStrength = usePasswordStrength(currentPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const formattedDob = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;

    const res = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      emailOrPhone: data.emailOrPhone,
      password: data.password,
      dateOfBirth: formattedDob,
      gender: data.gender,
      pronoun: data.gender === 'custom' ? data.pronoun : undefined,
      customGender: data.gender === 'custom' ? data.customGender : undefined,
    });

    if (res.success) {
      onClose();
      navigate('/dashboard');
    } else {
      setServerError(res.error || 'Failed to create account. Please try again.');
    }
  };

  const handleSocialSelect = async (provider: 'google' | 'apple') => {
    setServerError(null);
    const res = await registerUser({
      firstName: provider === 'google' ? 'Google' : 'Apple',
      lastName: 'User',
      emailOrPhone: `social.${Date.now()}@connectly.local`,
      password: 'SocialAuthPassword123!',
      dateOfBirth: '2000-01-01',
      gender: 'custom',
      pronoun: 'they',
    });
    if (res.success) {
      onClose();
      navigate('/dashboard');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a new account"
      subtitle="It's quick and easy."
      maxWidth="432px"
    >
      {/* Social Sign Up Options (Prompt 6) */}
      <div style={{ marginBottom: '10px' }}>
        <SocialLoginButtons onSelectProvider={handleSocialSelect} disabled={isLoading} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {serverError && <Alert type="error" message={serverError} />}

        {/* First Name & Surname Grid */}
        <div className="name-grid">
          <Input
            {...register('firstName')}
            variant="modal"
            placeholder="First name"
            error={errors.firstName?.message}
            disabled={isLoading}
          />
          <Input
            {...register('lastName')}
            variant="modal"
            placeholder="Surname"
            error={errors.lastName?.message}
            disabled={isLoading}
          />
        </div>

        {/* Mobile number or email */}
        <Input
          {...register('emailOrPhone')}
          variant="modal"
          placeholder="Mobile number or email address"
          error={errors.emailOrPhone?.message}
          disabled={isLoading}
        />

        {/* New Password with live rules checklist */}
        <div>
          <PasswordInput
            {...register('password')}
            variant="modal"
            placeholder="New password"
            error={errors.password?.message}
            disabled={isLoading}
          />
          <PasswordStrength strength={passwordStrength} showChecklist={true} />
        </div>

        {/* Date of Birth Section */}
        <div style={{ marginTop: '4px' }}>
          <div
            style={{
              fontSize: 'var(--font-size-fine)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Date of birth</span>
            <Tooltip content="Your date of birth helps us provide an age-appropriate experience." />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr 1fr',
              gap: '10px',
              marginTop: '4px',
            }}
          >
            <Select {...register('birthDay')} disabled={isLoading} error={!!errors.birthDay}>
              {DAYS.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>

            <Select {...register('birthMonth')} disabled={isLoading} error={!!errors.birthDay}>
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>

            <Select {...register('birthYear')} disabled={isLoading} error={!!errors.birthDay}>
              {YEARS.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </Select>
          </div>
          {errors.birthDay?.message && (
            <span
              style={{
                fontSize: '13px',
                color: 'var(--color-border-error)',
                marginTop: '4px',
                display: 'block',
              }}
            >
              {errors.birthDay.message}
            </span>
          )}
        </div>

        {/* Gender Section */}
        <div style={{ marginTop: '4px' }}>
          <div
            style={{
              fontSize: 'var(--font-size-fine)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Gender</span>
            <Tooltip content="You can change who sees your gender on your profile later." />
          </div>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginTop: '5px',
                }}
              >
                <RadioCard
                  id="gender-female"
                  name="gender"
                  value="female"
                  label="Female"
                  checked={field.value === 'female'}
                  onChange={field.onChange}
                  error={!!errors.gender}
                />
                <RadioCard
                  id="gender-male"
                  name="gender"
                  value="male"
                  label="Male"
                  checked={field.value === 'male'}
                  onChange={field.onChange}
                  error={!!errors.gender}
                />
                <RadioCard
                  id="gender-custom"
                  name="gender"
                  value="custom"
                  label="Custom"
                  checked={field.value === 'custom'}
                  onChange={field.onChange}
                  error={!!errors.gender}
                />
              </div>
            )}
          />

          {/* Custom Gender Animated Flow */}
          {selectedGender === 'custom' && (
            <div
              className="animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '10px',
                paddingTop: '6px',
              }}
            >
              <Select
                {...register('pronoun')}
                disabled={isLoading}
                error={!!errors.pronoun}
                defaultValue=""
              >
                <option value="" disabled>
                  Select your pronoun
                </option>
                <option value="she">She: &quot;Wish her a happy birthday!&quot;</option>
                <option value="he">He: &quot;Wish him a happy birthday!&quot;</option>
                <option value="they">They: &quot;Wish them a happy birthday!&quot;</option>
              </Select>
              {errors.pronoun?.message && (
                <span style={{ fontSize: '13px', color: 'var(--color-border-error)' }}>
                  {errors.pronoun.message}
                </span>
              )}

              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Your pronoun is visible to everyone.
              </p>

              <Input
                {...register('customGender')}
                variant="modal"
                placeholder="Gender (optional)"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Terms Section */}
        <p
          style={{
            fontSize: 'var(--font-size-micro)',
            lineHeight: 1.35,
            color: '#777777',
            marginTop: '6px',
          }}
        >
          People who use our service may have uploaded your contact information to Connectly.{' '}
          <a href="#learn-more" style={{ color: 'var(--color-text-link)' }}>
            Learn more
          </a>
          .
        </p>

        <p
          style={{
            fontSize: 'var(--font-size-micro)',
            lineHeight: 1.35,
            color: '#777777',
            marginTop: '2px',
          }}
        >
          By clicking Sign Up, you agree to our{' '}
          <a href="#terms" style={{ color: 'var(--color-text-link)' }}>
            Terms
          </a>
          ,{' '}
          <a href="#privacy" style={{ color: 'var(--color-text-link)' }}>
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="#cookies" style={{ color: 'var(--color-text-link)' }}>
            Cookies Policy
          </a>
          . You may receive SMS notifications from us and can opt out at any time.
        </p>

        {/* Centered Sign Up Button Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '12px',
          }}
        >
          <Button
            type="submit"
            variant="success"
            size="modal"
            isLoading={isLoading}
            loadingText="Creating account..."
            disabled={isLoading}
            style={{
              width: '200px',
              height: '40px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Sign Up
          </Button>
        </div>
      </form>

      <style>{`
        .name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 480px) {
          .name-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};
