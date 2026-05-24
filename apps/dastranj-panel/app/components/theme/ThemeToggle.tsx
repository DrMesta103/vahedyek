'use client';

import { useEffect } from 'react';

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  void collapsed;

  useEffect(() => {
    window.localStorage.setItem('dastranj-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return null;
}
