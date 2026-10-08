import React, { useState, useRef, useEffect } from 'react';
import { Target, Zap } from 'lucide-react';

export interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success';
  isLoading?: boolean;
  loadingText?: string;
  isEmptyFields?: boolean;
  onAttemptEmpty?: () => void;
  onSlingshotLaunch?: () => void;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  isEmptyFields = false,
  onAttemptEmpty,
  onSlingshotLaunch,
  style,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [isShaking, setIsShaking] = useState(false);
  const [showHungryNotice, setShowHungryNotice] = useState(false);
  const [hungryEmoji, setHungryEmoji] = useState('ಠ_ಠ');

  // Slingshot mode state
  const [slingshotMode, setSlingshotMode] = useState(false);
  const [isDraggingSlingshot, setIsDraggingSlingshot] = useState(false);
  const [slingshotDrag, setSlingshotDrag] = useState({ x: 0, y: 0 });
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Magnetic cursor attraction & taffy stretch
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || isDraggingSlingshot || slingshotMode || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const pullStrength = 0.28;
    const deltaX = (e.clientX - centerX) * pullStrength;
    const deltaY = (e.clientY - centerY) * pullStrength;

    // Taffy stretch effect
    const dist = Math.hypot(deltaX, deltaY);
    const stretchX = 1 + (Math.abs(deltaX) / rect.width) * 0.15;
    const stretchY = 1 - (dist / 300) * 0.05;

    setOffset({ x: deltaX, y: deltaY });
    setScale({ x: stretchX, y: Math.max(0.92, stretchY) });
  };

  const handleMouseLeave = () => {
    if (!isDraggingSlingshot) {
      setOffset({ x: 0, y: 0 });
      setScale({ x: 1, y: 1 });
    }
  };

  // Hungry CTA check & regular click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEmptyFields) {
      e.preventDefault();
      setIsShaking(true);
      const emojis = ['(>_<)', '(¬_¬)', '(ಠ_ಠ)', '(•ˋ _ ˊ•)'];
      setHungryEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      setShowHungryNotice(true);
      onAttemptEmpty?.();

      setTimeout(() => setIsShaking(false), 520);
      setTimeout(() => setShowHungryNotice(false), 2800);
      return;
    }

    onClick?.(e);
  };

  // Slingshot drag handling
  const startSlingshotDrag = () => {
    if (isLoading) return;
    setIsDraggingSlingshot(true);
    setSlingshotDrag({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!isDraggingSlingshot) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      // Pull backwards (down and slightly left/right)
      const dx = Math.max(-120, Math.min(120, (e.clientX - originX) * 0.8));
      const dy = Math.max(0, Math.min(90, (e.clientY - originY) * 0.8)); // only pull down/back

      setSlingshotDrag({ x: dx, y: dy });
    };

    const handlePointerUp = () => {
      setIsDraggingSlingshot(false);

      // Check if pulled far enough to launch
      if (slingshotDrag.y > 40) {
        if (isEmptyFields) {
          setIsShaking(true);
          setShowHungryNotice(true);
          setHungryEmoji('(╯°□°)╯');
          setSlingshotDrag({ x: 0, y: 0 });
          setTimeout(() => setIsShaking(false), 500);
          setTimeout(() => setShowHungryNotice(false), 2600);
          return;
        }

        // Launch forward!
        setIsLaunching(true);
        setLaunchSuccess(true);
        setSlingshotDrag({ x: 0, y: -120 }); // launch upward into socket

        setTimeout(() => {
          setIsLaunching(false);
          setSlingshotDrag({ x: 0, y: 0 });
          setLaunchSuccess(false);
          onSlingshotLaunch?.();
          // Trigger form submit
          if (buttonRef.current?.form) {
            buttonRef.current.form.requestSubmit();
          }
        }, 320);
      } else {
        // Snap back without launch
        setSlingshotDrag({ x: 0, y: 0 });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSlingshot, slingshotDrag, isEmptyFields, onSlingshotLaunch]);

  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? 'var(--color-primary-blue)' : 'var(--color-success)';
  const hoverBg = isPrimary ? 'var(--color-hover-blue)' : 'var(--color-success-hover)';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Target Socket (Visible during slingshot mode) */}
      {slingshotMode && (
        <div
          style={{
            position: 'absolute',
            top: '-42px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: launchSuccess ? '#DCFCE7' : '#EFF6FF',
            border: `1.5px dashed ${launchSuccess ? '#16A34A' : '#3B82F6'}`,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: launchSuccess ? '#15803D' : '#1D4ED8',
            transition: 'all 200ms ease',
            zIndex: 4,
          }}
        >
          <Target size={14} className={isDraggingSlingshot ? 'animate-spin' : ''} />
          <span>{launchSuccess ? '🎯 Bullseye! Logged In!' : 'Release to Launch'}</span>
        </div>
      )}

      {/* Slingshot Rubber Band SVG Tension Lines */}
      {isDraggingSlingshot && (
        <svg
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            width: '100%',
            height: '160px',
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'visible',
          }}
        >
          {/* Left Anchor to Button */}
          <line
            x1="20"
            y1="40"
            x2={`calc(50% + ${slingshotDrag.x - 40}px)`}
            y2={40 + slingshotDrag.y}
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Anchor to Button */}
          <line
            x1="calc(100% - 20px)"
            y1="40"
            x2={`calc(50% + ${slingshotDrag.x + 40}px)`}
            y2={40 + slingshotDrag.y}
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* The Main Interactive Button */}
      <button
        ref={buttonRef}
        type="submit"
        disabled={isLoading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onPointerDown={e => {
          if (slingshotMode) {
            e.preventDefault();
            startSlingshotDrag();
          }
        }}
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: isDraggingSlingshot ? '#DC2626' : bgColor,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '17px',
          fontWeight: 700,
          cursor: isLoading ? 'not-allowed' : slingshotMode ? 'grab' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: isDraggingSlingshot
            ? '0 10px 24px rgba(220, 38, 38, 0.4)'
            : '0 4px 14px rgba(24, 119, 242, 0.3)',
          transform: isDraggingSlingshot || isLaunching
            ? `translate(${slingshotDrag.x}px, ${slingshotDrag.y}px) scale(${isDraggingSlingshot ? 0.94 : 1.05})`
            : `translate(${offset.x}px, ${offset.y}px) scale(${scale.x}, ${scale.y})`,
          transition: isDraggingSlingshot
            ? 'none'
            : isLaunching
            ? 'transform 260ms cubic-bezier(0.1, 0.9, 0.2, 1)'
            : 'transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 150ms ease, box-shadow 150ms ease',
          zIndex: 2,
          position: 'relative',
          ...style,
        }}
        className={isShaking ? 'hungry-shake' : ''}
        onMouseEnter={e => {
          if (!isLoading && !slingshotMode) e.currentTarget.style.backgroundColor = hoverBg;
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block',
              }}
              className="animate-spin"
            />
            <span>{loadingText || 'Please wait...'}</span>
          </>
        ) : slingshotMode ? (
          <span>{isDraggingSlingshot ? '🚀 Release to Slingshot!' : '🏹 Drag Backwards & Launch'}</span>
        ) : (
          <span>{children}</span>
        )}
      </button>

      {/* Hungry Popover Bubble */}
      {showHungryNotice && (
        <div
          role="status"
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <span style={{ fontSize: '15px' }}>{hungryEmoji}</span>
          <span>Feed me your email & password first!</span>
        </div>
      )}

      {/* Mode Switch Pill: Magnetic vs Slingshot Mode */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <button
          type="button"
          onClick={() => setSlingshotMode(!slingshotMode)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 600,
            color: slingshotMode ? '#DC2626' : 'var(--color-text-secondary)',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: slingshotMode ? '#FEE2E2' : 'transparent',
            transition: 'all 150ms ease',
          }}
          title="Toggle between Magnetic Click and Physics Slingshot"
        >
          <Zap size={11} color={slingshotMode ? '#DC2626' : 'var(--color-primary-blue)'} />
          <span>{slingshotMode ? '🏹 Slingshot Active (Drag Back to Launch)' : '✨ Switch to Slingshot Launch'}</span>
        </button>
      </div>

      <style>{`
        @keyframes hungryShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px) rotate(-1.5deg); }
          30% { transform: translateX(10px) rotate(1.5deg); }
          45% { transform: translateX(-8px) rotate(-1deg); }
          60% { transform: translateX(8px) rotate(1deg); }
          75% { transform: translateX(-4px) rotate(-0.5deg); }
          90% { transform: translateX(4px) rotate(0.5deg); }
        }
        .hungry-shake {
          animation: hungryShake 480ms ease-in-out !important;
        }
      `}</style>
    </div>
  );
};
