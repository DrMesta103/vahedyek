import { Input } from '../Input';
import { rulePanelNumericInputClassName } from './rulePanelClassNames';

function formatNumericInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function RuleAmountInput({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** `undefined`: default chip `تومان`. Empty string: no chip (numeric grouping). `%`/`تومان`: chip + grouping. */
  suffix?: string;
}) {
  const resolvedSuffix = suffix === undefined ? 'تومان' : suffix;
  const showSuffixChip = resolvedSuffix.length > 0;
  const isNumeric = resolvedSuffix === 'تومان' || resolvedSuffix === '%' || suffix === '';

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(isNumeric ? formatNumericInput(event.target.value) : event.target.value)}
        placeholder={placeholder}
        inputMode={isNumeric ? 'numeric' : undefined}
        dir={isNumeric ? 'ltr' : undefined}
        className={rulePanelNumericInputClassName(showSuffixChip)}
      />
      {showSuffixChip ? (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[color:var(--text-muted)]">{resolvedSuffix}</span>
      ) : null}
    </div>
  );
}
