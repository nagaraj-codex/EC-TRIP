import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number = 45) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  const reset = useCallback((newSeconds?: number) => {
    setSecondsLeft(newSeconds ?? initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formattedTime = `00:${String(secondsLeft).padStart(2, '0')}`;

  return {
    secondsLeft,
    formattedTime,
    isExpired: secondsLeft === 0,
    reset,
  };
}
