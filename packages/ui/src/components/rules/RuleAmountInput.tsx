import { Input } from '../Input';
import { rulePanelNumericInputClassName } from './rulePanelClassNames';

function formatIntegerInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function formatDecimalInput(value: string) {
  const normalized = value.replace(/[٫,]/g, '.');
  const cleaned = normalized.replace(/[^\d.]/g, '');
  if (!cleaned) return '';

  const [integerPart = '', ...fractionParts] = cleaned.split('.');
  const fractionPart = fractionParts.join('');
  if (!fractionParts.length) return integerPart;
  return `${integerPart}.${fractionPart}`;
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
  suffix?: string;
}) {
  const resolvedSuffix = suffix === undefined ? 'تومان' : suffix;
  const showSuffixChip = resolvedSuffix.length > 0;
  const isPercent = resolvedSuffix === '%';
  const isNumeric = resolvedSuffix === 'تومان' || isPercent || suffix === '';
  const suffixPosition = !showSuffixChip ? 'none' : isPercent ? 'left' : 'right';

  return (
    <Input
      value={value}
      onChange={(event) =>
        onChange(
          isNumeric
            ? isPercent
              ? formatDecimalInput(event.target.value)
              : formatIntegerInput(event.target.value)
            : event.target.value,
        )
      }
      placeholder={placeholder}
      inputMode={isPercent ? 'decimal' : isNumeric ? 'numeric' : undefined}
      dir={isNumeric ? 'ltr' : undefined}
      className={`${rulePanelNumericInputClassName(suffixPosition)} ${isPercent ? '!text-left' : ''}`}
      startAdornment={suffixPosition === 'left' ? resolvedSuffix : undefined}
      startAdornmentClassName="text-xs font-bold text-[color:var(--text-muted)]"
      startAdornmentWrapperClassName={suffixPosition === 'left' ? 'w-8' : undefined}
      endAdornment={suffixPosition === 'right' ? resolvedSuffix : undefined}
      endAdornmentClassName="text-xs font-bold text-[color:var(--text-muted)]"
      endAdornmentWrapperClassName={suffixPosition === 'right' ? 'w-8' : undefined}
    />
  );
}
