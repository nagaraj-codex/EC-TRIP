import { z } from 'zod';

// Helper to calculate age from YYYY-MM-DD
export function calculateAge(dobString: string): number {
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
    .string({ required_error: 'Please enter your email or phone number.' })
    .min(1, 'Please enter your email or phone number.'),
  password: z
    .string({ required_error: 'Please enter your password.' })
    .min(1, 'Please enter your password.'),
});

export const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: "What's your name?" })
      .trim()
      .min(1, "What's your name?")
      .max(50, 'First name must be 50 characters or less.'),
    lastName: z
      .string({ required_error: "What's your name?" })
      .trim()
      .min(1, "What's your name?")
      .max(50, 'Last name must be 50 characters or less.'),
    emailOrPhone: z
      .string({ required_error: "You'll need this when you log in and if you ever need to reset your password." })
      .trim()
      .min(1, 'Please enter a valid mobile number or email address.')
      .refine(val => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^[+]?[\d\s-]{7,15}$/.test(val);
        return isEmail || isPhone;
      }, 'Please enter a valid mobile number or email address.'),
    password: z
      .string({ required_error: 'Enter a combination of at least 8 numbers, letters and punctuation marks.' })
      .min(8, 'Password must be at least 8 characters long.'),
    dateOfBirth: z
      .string({ required_error: 'Please enter your date of birth.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .refine(dob => {
        const age = calculateAge(dob);
        return age >= 13 && age <= 120;
      }, 'It looks like you have entered the wrong info. Please make sure that you use your real date of birth (must be at least 13 years old).'),
    gender: z.enum(['female', 'male', 'custom'], {
      required_error: 'Please choose a gender. You can change who can see this later.',
    }),
    pronoun: z.string().optional(),
    customGender: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.gender === 'custom' && !data.pronoun) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pronoun'],
        message: 'Please select your pronoun.',
      });
    }
  });

export const findAccountSchema = z.object({
  identifier: z
    .string({ required_error: 'Please enter your email or mobile number.' })
    .trim()
    .min(1, 'Please enter your email or mobile number.'),
});

export const sendOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  method: z.enum(['email', 'phone']).default('email'),
});

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  code: z
    .string()
    .trim()
    .length(6, 'Please enter the 6-digit confirmation code.')
    .regex(/^\d{6}$/, 'Code must be 6 numeric digits.'),
});

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, 'Reset token is required.'),
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
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
