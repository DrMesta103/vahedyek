import { cn } from '../../utils/cn';

export type TaavRequiredMarkTone = 'danger' | 'muted';

export type TaavRequiredMarkProps = {
  tone?: TaavRequiredMarkTone;
  /** Accessible label for screen readers */
  label?: string;
};

export function TaavRequiredMark({ tone = 'danger', label = 'الزامی' }: TaavRequiredMarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center leading-none',
        tone === 'danger' ? 'text-[var(--taav-required-mark)]' : 'text-[var(--taav-required-mark-muted)]',
      )}
    >
      <span aria-hidden="true">*</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
