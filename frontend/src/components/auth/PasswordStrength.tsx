import React from 'react';
import { Check, Circle } from 'lucide-react';
import { PasswordStrengthResult } from '../../hooks/usePasswordStrength.js';

export interface PasswordStrengthProps {
  strength: PasswordStrengthResult;
  showChecklist?: boolean;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  strength,
  showChecklist = true,
}) => {
  const { score, level, feedback, hasLength, hasUpper, hasLower, hasNumber, hasSpecial } = strength;

  // Segment colors based on level
  let activeColor = '#DADDE1';
  let feedbackColor = 'var(--color-text-secondary)';

  if (level === 'weak') {
    activeColor = 'var(--color-error)'; // #F02849
    feedbackColor = 'var(--color-error)';
  } else if (level === 'medium') {
    activeColor = 'var(--color-warning)'; // #F7B928
    feedbackColor = '#B27B00';
  } else if (level === 'strong') {
    activeColor = 'var(--color-success)'; // #42B72A
    feedbackColor = 'var(--color-success-hover)';
  }

  const rules = [
    { label: 'At least 8 characters', met: hasLength },
    { label: 'At least one uppercase letter (A-Z)', met: hasUpper },
    { label: 'At least one lowercase letter (a-z)', met: hasLower },
    { label: 'At least one number (0-9)', met: hasNumber },
    { label: 'At least one special character (!@#$...)', met: hasSpecial },
  ];

  return (
    <div style={{ width: '100%', marginTop: '8px' }}>
      {/* 3 Segments */}
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-label="Password strength"
        style={{
          display: 'flex',
          gap: '4px',
          height: '4px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: score >= 1 ? activeColor : 'var(--color-border-light)',
            transition: 'background-color 150ms ease',
          }}
        />
        <div
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: score >= 2 ? activeColor : 'var(--color-border-light)',
            transition: 'background-color 150ms ease',
          }}
        />
        <div
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: score >= 3 ? activeColor : 'var(--color-border-light)',
            transition: 'background-color 150ms ease',
          }}
        />
      </div>

      {/* Descriptive Text & Badge */}
      <div
        aria-live="polite"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: feedbackColor,
            fontWeight: 500,
            lineHeight: 1.25,
          }}
        >
          {feedback}
        </span>
        {level !== 'empty' && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: feedbackColor,
              letterSpacing: '0.5px',
            }}
          >
            {level}
          </span>
        )}
      </div>

      {/* Live Password Rules Checklist (Prompt 1) */}
      {showChecklist && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '8px',
            padding: '8px 10px',
            backgroundColor: '#F8F9FA',
            borderRadius: '6px',
            border: '1px solid var(--color-border-light)',
          }}
        >
          {rules.map((rule, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: rule.met ? 'var(--color-success)' : 'var(--color-text-secondary)',
                fontWeight: rule.met ? 600 : 400,
                transition: 'color 150ms ease',
              }}
            >
              {rule.met ? (
                <Check size={14} color="var(--color-success)" strokeWidth={3} />
              ) : (
                <Circle size={10} color="var(--color-text-muted)" />
              )}
              <span>{rule.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
