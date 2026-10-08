import React, { useState } from 'react';

export interface FerrisWheelToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const FerrisWheelToggle: React.FC<FerrisWheelToggleProps> = ({
  isVisible,
  onToggle,
  disabled = false,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    setIsSpinning(true);
    setRotation(prev => prev + 360);
    onToggle();

    setTimeout(() => {
      setIsSpinning(false);
    }, 450);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      aria-label={isVisible ? 'Hide password (spin ferris wheel)' : 'Show password (spin ferris wheel)'}
      title={isVisible ? 'Spin Ferris Wheel to hide password' : 'Spin Ferris Wheel to reveal password'}
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 100ms ease',
        }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Central Support Legs */}
          <line x1="18" y1="18" x2="8" y2="34" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="18" x2="28" y2="34" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <line x1="11" y1="29" x2="25" y2="29" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Wheel Outer Rim */}
          <circle
            cx="18"
            cy="18"
            r="13"
            stroke={isVisible ? '#1877F2' : '#94A3B8'}
            strokeWidth="2"
            fill={isVisible ? 'rgba(24, 119, 242, 0.08)' : 'none'}
            style={{ transition: 'stroke 200ms ease, fill 200ms ease' }}
          />

          {/* Spokes (6 spokes) */}
          <line x1="18" y1="5" x2="18" y2="31" stroke={isVisible ? '#3B82F6' : '#CBD5E1'} strokeWidth="1.2" />
          <line x1="6.7" y1="11.5" x2="29.3" y2="24.5" stroke={isVisible ? '#3B82F6' : '#CBD5E1'} strokeWidth="1.2" />
          <line x1="6.7" y1="24.5" x2="29.3" y2="11.5" stroke={isVisible ? '#3B82F6' : '#CBD5E1'} strokeWidth="1.2" />

          {/* Central Hub */}
          <circle cx="18" cy="18" r="3.5" fill={isVisible ? '#1D4ED8' : '#64748B'} />
          <circle cx="18" cy="18" r="1.5" fill="#FFFFFF" />

          {/* 6 Passenger Gondolas / Cabins */}
          {/* Top Gondola */}
          <rect x="15.5" y="3" width="5" height="4" rx="1.5" fill="#EF4444" />
          {/* Top-Right Gondola */}
          <rect x="27" y="9.5" width="5" height="4" rx="1.5" fill="#F59E0B" />
          {/* Bottom-Right Gondola */}
          <rect x="27" y="22.5" width="5" height="4" rx="1.5" fill="#10B981" />
          {/* Bottom Gondola */}
          <rect x="15.5" y="29" width="5" height="4" rx="1.5" fill="#3B82F6" />
          {/* Bottom-Left Gondola */}
          <rect x="4" y="22.5" width="5" height="4" rx="1.5" fill="#8B5CF6" />
          {/* Top-Left Gondola */}
          <rect x="4" y="9.5" width="5" height="4" rx="1.5" fill="#EC4899" />
        </svg>
      </div>

      {/* Tiny Status Indicator Dot */}
      <span
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: isVisible ? '#10B981' : '#94A3B8',
          boxShadow: isVisible ? '0 0 4px #10B981' : 'none',
          transition: 'all 200ms ease',
        }}
      />
    </button>
  );
};
