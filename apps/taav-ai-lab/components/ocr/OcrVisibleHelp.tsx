import type { ReactNode } from 'react';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';

export function formatOcrHelpText(content: AiLabTooltipDef | string): string {
  if (typeof content === 'string') return content;
  if (content.example) return `${content.text} · مثال: ${content.example}`;
  return content.text;
}

type OcrVisibleHelpProps = {
  content: AiLabTooltipDef | string;
  variant?: 'inline' | 'block' | 'compact';
  className?: string;
};

/** Always-visible help text — no hover required. */
export function OcrVisibleHelp({ content, variant = 'inline', className }: OcrVisibleHelpProps) {
  if (typeof content === 'string') {
    return (
      <p className={['ocr-visible-help', `ocr-visible-help--${variant}`, className].filter(Boolean).join(' ')}>
        {content}
      </p>
    );
  }

  return (
    <p className={['ocr-visible-help', `ocr-visible-help--${variant}`, className].filter(Boolean).join(' ')}>
      <span>{content.text}</span>
      {content.example ? (
        <span className="ocr-visible-help-example"> · مثال: {content.example}</span>
      ) : null}
    </p>
  );
}

export function OcrLabelWithHelp({
  label,
  help,
  required,
  as = 'span',
}: {
  label: string;
  help: AiLabTooltipDef | string;
  required?: boolean;
  as?: 'span' | 'div';
}) {
  const Tag = as;

  return (
    <Tag className="ocr-visible-label">
      <span className="ocr-visible-label-text">
        {label}
        {required ? <span className="ocr-visible-label-required">*</span> : null}
      </span>
      <OcrVisibleHelp content={help} variant="compact" />
    </Tag>
  );
}

export function OcrSectionLabelWithHelp({
  label,
  help,
}: {
  label: string;
  help: AiLabTooltipDef | string;
}) {
  return <OcrLabelWithHelp label={label} help={help} as="div" />;
}

export function OcrActionWithHelp({
  children,
  help,
}: {
  children: ReactNode;
  help: AiLabTooltipDef | string;
}) {
  return (
    <div className="ocr-visible-action">
      {children}
      <OcrVisibleHelp content={help} variant="compact" />
    </div>
  );
}
