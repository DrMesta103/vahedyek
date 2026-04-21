'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={collapsed ? 'toolbar-menu-item theme-toggle-button' : 'theme-toggle-button'}
      title={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
      aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
