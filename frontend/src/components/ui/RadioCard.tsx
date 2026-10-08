import React from 'react';

export interface RadioCardProps {
  id: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  id,
  name,
  value,
  label,
  checked,
  onChange,
  error,
}) => {
  return (
    <label
      htmlFor={id}
      style={{
        height: '36px',
        border: error
          ? '1px solid var(--color-border-error)'
          : checked
          ? '1px solid var(--color-border-focus)'
          : '1px solid var(--color-border-default)',
        borderRadius: '4px',
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '15px',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        backgroundColor: 'var(--color-surface-white)',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      <span>{label}</span>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--color-primary-blue)',
          cursor: 'pointer',
        }}
      />
    </label>
  );
};
