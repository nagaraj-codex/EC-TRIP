import { z } from 'zod';

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Please enter your email or phone number.'),
  password: z
    .string()
    .min(1, 'Please enter your password.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "What's your name?")
      .max(50, 'First name must be 50 characters or less.'),
    lastName: z
      .string()
      .trim()
      .min(1, "What's your name?")
      .max(50, 'Last name must be 50 characters or less.'),
    emailOrPhone: z
      .string()
      .trim()
      .min(1, "You'll need this when you log in and if you ever need to reset your password.")
      .refine(val => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^[+]?[\d\s-]{7,15}$/.test(val);
        return isEmail || isPhone;
      }, 'Please enter a valid mobile number or email address.'),
    password: z
      .string()
      .min(8, 'Enter a combination of at least 8 numbers, letters and punctuation marks.'),
    birthDay: z.string().min(1, 'Day'),
    birthMonth: z.string().min(1, 'Month'),
    birthYear: z.string().min(1, 'Year'),
    gender: z.enum(['female', 'male', 'custom'], {
      required_error: 'Please choose a gender. You can change who can see this later.',
    }),
    pronoun: z.string().optional(),
    customGender: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const formattedDate = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    const age = calculateAge(formattedDate);
    if (isNaN(age) || age < 13 || age > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthDay'],
        message: 'It looks like you have entered the wrong info. Please make sure that you use your real date of birth (must be at least 13 years old).',
      });
    }

    if (data.gender === 'custom' && !data.pronoun) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pronoun'],
        message: 'Please select your pronoun.',
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Please enter your email or mobile number to search for your account.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Please enter the 6-digit confirmation code.')
    .regex(/^\d{6}$/, 'Code must contain only numeric digits.'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match. Please check and try again.",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
