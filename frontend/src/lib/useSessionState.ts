import { useEffect, useState } from 'react';

/**
 * Like useState, but persists to sessionStorage under `key`. State survives
 * mount/unmount cycles (e.g. when React Router unmounts a screen on
 * navigation), but is cleared when the tab is closed.
 */
export function useSessionState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private mode, quota) — degrade silently.
    }
  }, [key, value]);

  return [value, setValue];
}

export function clearSessionState(...keys: string[]): void {
  if (typeof window === 'undefined') return;
  for (const k of keys) {
    try {
      window.sessionStorage.removeItem(k);
    } catch {
      // ignore
    }
  }
}
