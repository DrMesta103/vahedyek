import { cva } from 'class-variance-authority';

export type TaavFieldHintTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type TaavFieldHintSize = 'sm' | 'md';

const toneStyles: Record<TaavFieldHintTone, string> = {
  neutral:
    'bg-[var(--taav-surface-muted)] border-[color:var(--taav-border)] text-[var(--taav-text-muted)]',
  info: 'bg-[var(--taav-info-muted)] border-[color:var(--taav-info-border)] text-[var(--taav-info-strong)]',
  success:
    'bg-[var(--taav-success-muted)] border-[color:var(--taav-success-border)] text-[var(--taav-success-strong)]',
  warning:
    'bg-[var(--taav-warning-muted)] border-[color:var(--taav-warning-border)] text-[var(--taav-warning-strong)]',
  danger:
    'bg-[var(--taav-danger-muted)] border-[color:var(--taav-danger-border)] text-[var(--taav-danger-strong)]',
};

export const taavFieldHintVariants = cva(
  'flex items-start gap-[var(--taav-field-hint-gap)] rounded-[var(--taav-field-hint-radius)] border border-solid',
  {
    variants: {
      size: {
        sm: 'p-[var(--taav-field-hint-padding-sm)] text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)]',
        md: 'p-[var(--taav-field-hint-padding-md)] text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export function getTaavFieldHintToneClasses(tone: TaavFieldHintTone): string {
  return toneStyles[tone];
}
