'use client';

import { ThemeToggle } from './ThemeToggle';

export function ThemeFloatingToggle() {
  return (
    <div className="fixed left-4 top-4 z-[60]">
      <ThemeToggle compact />
    </div>
  );
}
