'use client';

import type { ReactNode } from 'react';
import { minimalScrollClass } from '../MinimalScroll';

type DastRanjPanelContentProps = {
  children: ReactNode;
  variant?: 'home' | 'panel' | 'dev-doc-threads';
};

export function DastRanjPanelContent({ children, variant = 'panel' }: DastRanjPanelContentProps) {
  if (variant === 'home') {
    return <main className={minimalScrollClass('vertical', 'main-content home-main-content')}>{children}</main>;
  }

  if (variant === 'dev-doc-threads') {
    return <main className={minimalScrollClass('vertical', 'main-content')}>{children}</main>;
  }

  return (
    <main className={minimalScrollClass('vertical', 'main-content panel-route-main')}>
      <div className="content-body panel-route-body" dir="rtl" lang="fa">
        {children}
      </div>
    </main>
  );
}
