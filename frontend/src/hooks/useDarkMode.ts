import { useEffect, useState } from 'react';

// Hook to manage dark mode preference and persist it in localStorage
export function useDarkMode(): [boolean, () => void] {
  // Initialise to false for server‑side rendering consistency
  const [isDark, setIsDark] = useState(false);

  // Determine saved or system preference on client mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    if (saved !== null) {
      setIsDark(saved === 'true');
    } else if (typeof window !== 'undefined') {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Keep document class and storage in sync when isDark changes (for init & external changes)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(isDark));
    }
  }, [isDark]);

  // Toggle that also updates the class immediately for a snappy UI
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(next));
    }
  };

  return [isDark, toggle];
}

