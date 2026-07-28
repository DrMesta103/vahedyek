'use client';

import type { ReactNode } from 'react';
import { DocBreadcrumb } from './DocBlocks';
import { LabLayout } from './LabLayout';

export function DocPageShell({
  breadcrumbs,
  children,
  inspector,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: ReactNode;
  /** Optional left-edge inspector panel (appears on the physical left in RTL). */
  inspector?: ReactNode;
}) {
  if (!inspector) {
    return (
      <LabLayout>
        <div className="lab-page lab-page-stack">
          <DocBreadcrumb items={breadcrumbs} />
          {children}
        </div>
      </LabLayout>
    );
  }

  return (
    <LabLayout>
      <div className="flex min-h-full">
        <div className="lab-page lab-page-stack min-w-0 flex-1">
          <DocBreadcrumb items={breadcrumbs} />
          {children}
        </div>
        <aside className="lab-doc-inspector">{inspector}</aside>
      </div>
    </LabLayout>
  );
}
