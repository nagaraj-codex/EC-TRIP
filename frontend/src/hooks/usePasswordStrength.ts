export type PasswordStrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: number; // 0 to 3
  feedback: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function usePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      level: 'empty',
      score: 0,
      feedback: 'Enter a strong password with at least 8 characters.',
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let criteriaMet = 0;
  if (hasLength) criteriaMet++;
  if (hasUpper) criteriaMet++;
  if (hasLower) criteriaMet++;
  if (hasNumber) criteriaMet++;
  if (hasSpecial) criteriaMet++;

  let level: PasswordStrengthLevel = 'weak';
  let score = 1;
  let feedback = 'Weak password: Add numbers, symbols, and mixed-case letters.';

  if (criteriaMet >= 5 && password.length >= 10) {
    level = 'strong';
    score = 3;
    feedback = 'Strong password: Great job!';
  } else if (criteriaMet >= 3 && hasLength) {
    level = 'medium';
    score = 2;
    feedback = 'Moderate password: Try adding special characters or more length.';
  } else {
    level = 'weak';
    score = 1;
    feedback = 'Weak password: Must be at least 8 characters with a mix of characters.';
  }

  return {
    level,
    score,
    feedback,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}
