import { Input } from '../Input';

function formatNumericInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function RuleAmountInput({
  value,
  onChange,
  placeholder,
  suffix = 'تومان',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  const isNumeric = suffix === 'تومان' || suffix === '%';

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(isNumeric ? formatNumericInput(event.target.value) : event.target.value)}
        placeholder={placeholder}
        inputMode={isNumeric ? 'numeric' : undefined}
        dir={isNumeric ? 'ltr' : undefined}
        className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] pl-20 pr-4 text-right text-[13px] font-semibold shadow-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
      />
      {suffix ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">{suffix}</span> : null}
    </div>
  );
}

