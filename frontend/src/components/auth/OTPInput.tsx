import React, { useRef, useEffect } from 'react';

export interface OTPInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first input on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [value]);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      // Clear current digit
      const newDigits = [...digits];
      newDigits[index] = '';
      const newCode = newDigits.join('');
      onChange(newCode);
      return;
    }

    // Single digit input
    const singleChar = rawVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleChar;
    const newCode = newDigits.join('');
    onChange(newCode);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (newCode.length === 6) {
      onComplete?.(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input and clear it
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    onChange(pasted);

    // Focus last filled digit or final input
    const targetIndex = Math.min(pasted.length, 5);
    inputRefs.current[targetIndex]?.focus();

    if (pasted.length === 6) {
      onComplete?.(pasted);
    }
  };

  return (
    <div
      role="group"
      aria-label="6-digit confirmation code"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        margin: '24px 0',
        width: '100%',
        maxWidth: '380px',
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={el => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index] || ''}
          disabled={disabled}
          onChange={e => handleInputChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
          style={{
            width: '52px',
            height: '58px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-surface-white)',
            border: hasError
              ? '2px solid var(--color-border-error)'
              : '1px solid var(--color-border-default)',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onFocus={e => {
            if (!hasError) {
              e.currentTarget.style.border = '2px solid var(--color-border-focus)';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(24,119,242,0.12)';
            }
          }}
          onBlur={e => {
            if (!hasError) {
              e.currentTarget.style.border = '1px solid var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />
      ))}
    </div>
  );
};
