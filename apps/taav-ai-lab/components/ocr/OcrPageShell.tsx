'use client';

import type { ReactNode } from 'react';
import { TaavBadge } from '@repo/ui/taav/primitives';

type OcrPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function OcrPageShell({ eyebrow, title, description, badge, actions, children }: OcrPageShellProps) {
  return (
    <section className="ocr-flow-page">
      <header className="ocr-flow-page-header">
        <div className="ocr-flow-page-heading">
          {eyebrow ? <span className="ocr-flow-page-eyebrow">{eyebrow}</span> : null}
          <div className="ocr-flow-page-title-row">
            <h1 className="ocr-flow-page-title">{title}</h1>
            {badge}
          </div>
          {description ? <p className="ocr-flow-page-description">{description}</p> : null}
        </div>
        {actions ? <div className="ocr-flow-page-actions">{actions}</div> : null}
      </header>
      <div className="ocr-flow-page-body">{children}</div>
    </section>
  );
}

export function OcrPageBadge({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <TaavBadge tone="brand" variant="soft" iconStart={icon}>
      {label}
    </TaavBadge>
  );
}
