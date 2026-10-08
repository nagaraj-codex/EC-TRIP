import React, { useEffect, useState } from 'react';

export interface PeekABooMascotProps {
  isPasswordFocused?: boolean;
  isEmailFocused?: boolean;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  inputLength?: number;
}

export const PeekABooMascot: React.FC<PeekABooMascotProps> = ({
  isPasswordFocused = false,
  isEmailFocused = false,
  isSubmitting = false,
  isSuccess = false,
  inputLength = 0,
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // When typing in email, shift gaze based on input length
    if (isEmailFocused) {
      const x = Math.min(Math.max((inputLength - 15) * 0.4, -4), 4);
      setPupilOffset({ x, y: 3 });
      return;
    }

    if (isPasswordFocused) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    // When idle, follow mouse slightly
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = 300;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / 400;
      setPupilOffset({
        x: Math.max(-4, Math.min(4, dx * 4)),
        y: Math.max(-2, Math.min(3, dy * 3)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isEmailFocused, isPasswordFocused, inputLength]);

  return (
    <div
      style={{
        position: 'relative',
        width: '120px',
        height: '90px',
        margin: '0 auto -12px auto',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isSubmitting ? 'translateY(4px) scale(0.96)' : 'translateY(0)',
      }}
    >
      <svg
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {/* Soft shadow */}
        <ellipse cx="60" cy="85" rx="42" ry="6" fill="rgba(0, 0, 0, 0.08)" />

        {/* Ears */}
        <circle cx="34" cy="28" r="14" fill="#3B82F6" />
        <circle cx="34" cy="28" r="8" fill="#93C5FD" />
        <circle cx="86" cy="28" r="14" fill="#3B82F6" />
        <circle cx="86" cy="28" r="8" fill="#93C5FD" />

        {/* Head */}
        <ellipse cx="60" cy="50" rx="38" ry="34" fill="#1877F2" />

        {/* Face Muzzle */}
        <ellipse cx="60" cy="62" rx="20" ry="15" fill="#DBEAFE" />

        {/* Cute Nose */}
        <ellipse cx="60" cy="56" rx="5" ry="3.5" fill="#1E3A8A" />

        {/* Mouth */}
        {isSuccess ? (
          // Happy smiling mouth
          <path
            d="M52 64 Q60 74 68 64"
            stroke="#1E3A8A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          // Normal mouth
          <path
            d="M55 63 Q60 67 65 63"
            stroke="#1E3A8A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Eyes & Eyeballs */}
        <g id="eyes">
          {/* Left Eye Sclera */}
          <circle cx="46" cy="44" r="8" fill="#FFFFFF" />
          {/* Right Eye Sclera */}
          <circle cx="74" cy="44" r="8" fill="#FFFFFF" />

          {/* Left Pupil */}
          <circle
            cx={46 + pupilOffset.x}
            cy={44 + pupilOffset.y}
            r="4.5"
            fill="#0F172A"
            style={{ transition: 'cx 80ms ease, cy 80ms ease' }}
          />
          <circle cx={44.5 + pupilOffset.x} cy={42.5 + pupilOffset.y} r="1.5" fill="#FFFFFF" />

          {/* Right Pupil */}
          <circle
            cx={74 + pupilOffset.x}
            cy={44 + pupilOffset.y}
            r="4.5"
            fill="#0F172A"
            style={{ transition: 'cx 80ms ease, cy 80ms ease' }}
          />
          <circle cx={72.5 + pupilOffset.x} cy={42.5 + pupilOffset.y} r="1.5" fill="#FFFFFF" />
        </g>

        {/* Blushing cheeks */}
        <ellipse cx="32" cy="56" rx="5" ry="3" fill="rgba(244, 114, 182, 0.45)" />
        <ellipse cx="88" cy="56" rx="5" ry="3" fill="rgba(244, 114, 182, 0.45)" />

        {/* Paws (Peek-a-Boo Mechanism) */}
        {/* Left Paw */}
        <g
          style={{
            transformOrigin: '32px 85px',
            transform: isPasswordFocused
              ? 'translate(12px, -36px) rotate(18deg)'
              : 'translate(0px, 0px) rotate(0deg)',
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ellipse cx="30" cy="80" rx="13" ry="11" fill="#1D4ED8" />
          <ellipse cx="30" cy="79" rx="11" ry="9" fill="#2563EB" />
          {/* Little claw dots */}
          <circle cx="25" cy="74" r="1.8" fill="#93C5FD" />
          <circle cx="30" cy="72" r="1.8" fill="#93C5FD" />
          <circle cx="35" cy="74" r="1.8" fill="#93C5FD" />
        </g>

        {/* Right Paw */}
        <g
          style={{
            transformOrigin: '88px 85px',
            transform: isPasswordFocused
              ? 'translate(-12px, -36px) rotate(-18deg)'
              : 'translate(0px, 0px) rotate(0deg)',
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <ellipse cx="90" cy="80" rx="13" ry="11" fill="#1D4ED8" />
          <ellipse cx="90" cy="79" rx="11" ry="9" fill="#2563EB" />
          {/* Little claw dots */}
          <circle cx="85" cy="74" r="1.8" fill="#93C5FD" />
          <circle cx="90" cy="72" r="1.8" fill="#93C5FD" />
          <circle cx="95" cy="74" r="1.8" fill="#93C5FD" />
        </g>
      </svg>
    </div>
  );
};
