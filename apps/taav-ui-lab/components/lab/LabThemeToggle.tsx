'use client';

import { Moon, Sun } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { useLabTheme } from './LabThemeProvider';

export function LabThemeToggle() {
  const { theme, toggleTheme } = useLabTheme();

  return (
    <TaavButton
      variant="outline"
      size="sm"
      tone="neutral"
      onClick={toggleTheme}
      iconStart={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    >
      {theme === 'dark' ? 'تم روشن' : 'تم تیره'}
    </TaavButton>
  );
}
