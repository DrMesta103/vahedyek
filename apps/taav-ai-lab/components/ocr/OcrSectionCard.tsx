'use client';

import type { ReactNode } from 'react';

type OcrSectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function OcrSectionCard({ title, description, actions, children, className }: OcrSectionCardProps) {
  return (
    <article className={['ocr-flow-section-card', className].filter(Boolean).join(' ')}>
      <header className="ocr-flow-section-header">
        <div className="ocr-flow-section-heading">
          <h2 className="ocr-flow-section-title">{title}</h2>
          {description ? <p className="ocr-flow-section-description">{description}</p> : null}
        </div>
        {actions ? <div className="ocr-flow-section-actions">{actions}</div> : null}
      </header>
      <div className="ocr-flow-section-body">{children}</div>
    </article>
  );
}
