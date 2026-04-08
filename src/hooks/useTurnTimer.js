/**
 * useTurnTimer.js — 30-second countdown for online turns.
 * Calls onTimeout() when time runs out.
 * Only counts when isActive = true.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTurnTimer({ isActive, timeoutSeconds = 30, onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout; // always fresh callback

  const reset = useCallback(() => {
    setSecondsLeft(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!isActive) {
      // Reset when turn switches away
      setSecondsLeft(timeoutSeconds);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start countdown
    setSecondsLeft(timeoutSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Fire after state update settles
          setTimeout(() => onTimeoutRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeoutSeconds]);

  return { secondsLeft, reset };
}
