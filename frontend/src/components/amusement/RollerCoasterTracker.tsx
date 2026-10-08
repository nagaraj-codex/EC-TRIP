import React from 'react';

export interface RollerCoasterTrackerProps {
  inputLength: number;
  maxCharacters?: number;
}

export const RollerCoasterTracker: React.FC<RollerCoasterTrackerProps> = ({
  inputLength,
  maxCharacters = 30,
}) => {
  const progress = Math.min(inputLength / maxCharacters, 1);
  const trackWidth = 340; // Total track pixel span
  const cartX = Math.max(8, Math.min(trackWidth - 36, progress * (trackWidth - 44) + 8));

  // Sine wave vertical elevation and slope tilt
  const waveY = Math.sin(progress * Math.PI * 4.5) * 5;
  const tiltAngle = Math.cos(progress * Math.PI * 4.5) * 16;
  const isMoving = inputLength > 0;

  return (
    <div
      style={{
        width: '100%',
        height: '32px',
        position: 'relative',
        margin: '2px 0 -4px 0',
        userSelect: 'none',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 360 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {/* Track Pillars / Support Struts */}
        <line x1="45" y1="18" x2="45" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="125" y1="14" x2="125" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="205" y1="22" x2="205" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="285" y1="14" x2="285" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Roller Coaster Rails (Double Rail) */}
        <path
          d="M 10,18 Q 50,6 90,18 T 170,18 T 250,18 T 330,18 L 350,18"
          stroke="#94A3B8"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 10,21 Q 50,9 90,21 T 170,21 T 250,21 T 330,21 L 350,21"
          stroke="#64748B"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Ties connecting double rails */}
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(tx => (
          <line
            key={tx}
            x1={tx}
            y1={17 + Math.sin((tx / 80) * Math.PI) * 3}
            x2={tx}
            y2={21 + Math.sin((tx / 80) * Math.PI) * 3}
            stroke="#64748B"
            strokeWidth="1.5"
          />
        ))}

        {/* Checkered Finish Flag at Track End */}
        <g transform="translate(342, 6)">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#475569" strokeWidth="1.5" />
          <rect x="0" y="0" width="10" height="7" fill="#1E293B" />
          <rect x="0" y="0" width="5" height="3.5" fill="#FFFFFF" />
          <rect x="5" y="3.5" width="5" height="3.5" fill="#FFFFFF" />
        </g>

        {/* The Roller Coaster Cart */}
        <g
          style={{
            transform: `translate(${cartX}px, ${10 + waveY}px) rotate(${tiltAngle}deg)`,
            transformOrigin: '14px 10px',
            transition: 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Motion wind lines when typing */}
          {isMoving && (
            <g opacity="0.6">
              <line x1="-6" y1="5" x2="-2" y2="5" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="-9" y1="8" x2="-3" y2="8" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* Cart Wheels */}
          <circle cx="6" cy="13" r="2.8" fill="#1E293B" />
          <circle cx="6" cy="13" r="1.2" fill="#E2E8F0" />
          <circle cx="22" cy="13" r="2.8" fill="#1E293B" />
          <circle cx="22" cy="13" r="1.2" fill="#E2E8F0" />

          {/* Cart Body */}
          <path
            d="M 2,5 L 26,5 Q 28,5 28,8 L 26,12 L 4,12 L 2,8 Q 1.5,5 2,5 Z"
            fill="#EF4444"
          />
          {/* Cart Gold Accent Stripe */}
          <line x1="3" y1="9" x2="27" y2="9" stroke="#FBBF24" strokeWidth="1.5" />

          {/* Passenger 1 (Driver / Mascot) */}
          <circle cx="8" cy="2" r="3" fill="#3B82F6" />
          {/* Goggles / Face */}
          <rect x="7" y="1" width="3" height="1.5" rx="0.5" fill="#FFFFFF" />

          {/* Passenger 2 (Waving with arms up!) */}
          <circle cx="18" cy="2" r="3" fill="#10B981" />
          {/* Arms raised up in excitement */}
          <line x1="16" y1="2" x2="14" y2="-2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="2" x2="22" y2="-2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
