/**
 * useTurnTimer.js — 30-second countdown for online turns.
 *
 * BUGS FIXED:
 * 🔴 Wrapped onTimeout in try/catch — previously if it threw, interval was
 *    already cleared and error was silently swallowed
 * 🟡 Added Page Visibility API — timer pauses when tab is hidden, resumes
 *    when visible (prevents false timeouts on tab switches)
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useTurnTimer({ isActive, timeoutSeconds = 30, onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const intervalRef   = useRef(null);
  const onTimeoutRef  = useRef(onTimeout);
  const hiddenAtRef   = useRef(null); // track when tab was hidden
  onTimeoutRef.current = onTimeout;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((startFrom) => {
    clearTimer();
    let current = startFrom;
    setSecondsLeft(current);

    intervalRef.current = setInterval(() => {
      current -= 1;
      setSecondsLeft(current);
      if (current <= 0) {
        clearTimer();
        // FIX: wrap in try/catch so a throwing callback doesn't break timer state
        setTimeout(() => {
          try { onTimeoutRef.current?.(); }
          catch (e) { console.error('useTurnTimer onTimeout error:', e); }
        }, 0);
      }
    }, 1000);
  }, [clearTimer]);

  const reset = useCallback(() => {
    if (isActive) startTimer(timeoutSeconds);
    else setSecondsLeft(timeoutSeconds);
  }, [isActive, timeoutSeconds, startTimer]);

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      setSecondsLeft(timeoutSeconds);
      return;
    }
    startTimer(timeoutSeconds);
    return clearTimer;
  }, [isActive, timeoutSeconds, startTimer, clearTimer]);

  // FIX: Page Visibility API — pause/resume on tab hide/show
  useEffect(() => {
    if (!isActive) return;

    const onVisChange = () => {
      if (document.hidden) {
        // Tab hidden — record time and stop counting
        hiddenAtRef.current = Date.now();
        clearTimer();
      } else {
        // Tab visible — subtract elapsed time, continue if time remains
        if (hiddenAtRef.current) {
          const elapsed = Math.round((Date.now() - hiddenAtRef.current) / 1000);
          hiddenAtRef.current = null;
          setSecondsLeft(prev => {
            const remaining = Math.max(0, prev - elapsed);
            if (remaining <= 0) {
              setTimeout(() => {
                try { onTimeoutRef.current?.(); }
                catch (e) { console.error('useTurnTimer onTimeout error:', e); }
              }, 0);
              return 0;
            }
            startTimer(remaining);
            return remaining;
          });
        }
      }
    };

    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [isActive, clearTimer, startTimer]);

  // Percentage for arc/progress renders
  const pct = secondsLeft / timeoutSeconds;
  const isWarning  = secondsLeft <= 10 && secondsLeft > 5;
  const isDanger   = secondsLeft <= 5;

  return { secondsLeft, pct, isWarning, isDanger, reset };
}
