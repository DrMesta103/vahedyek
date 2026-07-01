'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { useAiLabTheme } from './ThemeProvider';

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useAiLabTheme();
  const isDark = theme === 'dark';

  return (
    <TaavButton
      type="button"
      variant={compact ? 'ghost' : 'outline'}
      tone="neutral"
      size="sm"
      onClick={toggleTheme}
      iconStart={isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      unsafeClassName={className}
    >
      {compact ? null : isDark ? 'تم روشن' : 'تم تیره'}
    </TaavButton>
  );
}
