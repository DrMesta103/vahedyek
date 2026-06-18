'use client';

import type { ReactNode } from 'react';
import { DocBreadcrumb } from './DocBlocks';
import { LabLayout } from './LabLayout';

export function DocPageShell({
  breadcrumbs,
  children,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: ReactNode;
}) {
  return (
    <LabLayout>
      <div className="lab-page lab-page-stack">
        <DocBreadcrumb items={breadcrumbs} />
        {children}
      </div>
    </LabLayout>
  );
}
