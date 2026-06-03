'use client';

import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  const saved = window.localStorage.getItem('dastranj-theme');
  if (saved === 'light' || saved === 'dark') return saved;

  return 'dark';
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem('dastranj-theme', theme);
}

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const current = getInitialTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle-button${collapsed ? ' toolbar-menu-item' : ''}`}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      aria-label={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
    >
      <i className={`fa ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  );
}
