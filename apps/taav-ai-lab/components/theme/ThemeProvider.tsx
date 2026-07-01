'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AiLabThemeMode = 'light' | 'dark';

type AiLabThemeContextValue = {
  theme: AiLabThemeMode;
  setTheme: (theme: AiLabThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'taav-ai-lab-theme';
const ThemeContext = createContext<AiLabThemeContextValue | null>(null);

function getSystemTheme(): AiLabThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): AiLabThemeMode {
  if (typeof window === 'undefined') return 'dark';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  return getSystemTheme();
}

function applyTheme(theme: AiLabThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.taavTheme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function AiLabThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AiLabThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';

    const fromDom = document.documentElement.dataset.taavTheme;
    if (fromDom === 'light' || fromDom === 'dark') return fromDom;

    return getInitialTheme();
  });

  useEffect(() => {
    const current = getInitialTheme();
    setThemeState(current);
    applyTheme(current);
  }, []);

  const setTheme = (next: AiLabThemeMode) => {
    setThemeState(next);
    applyTheme(next);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAiLabTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAiLabTheme must be used within AiLabThemeProvider');
  }
  return context;
}
