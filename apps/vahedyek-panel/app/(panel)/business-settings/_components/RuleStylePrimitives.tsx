'use client';

import { Input } from '../../../components/ui/input';
import { TagPills } from '../../contracts/new/_components/ContractFormPrimitives';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatNumericInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function RuleTextInput({
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
  if (suffix === 'تومان' || suffix === '%') {
    return (
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => onChange(formatNumericInput(event.target.value))}
          placeholder={placeholder}
          inputMode="numeric"
          dir="ltr"
          className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] pl-20 pr-4 text-right text-[13px] font-semibold shadow-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">{suffix}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn('h-[42px] rounded-xl border-slate-200 bg-[image:var(--control-bg-gradient)] px-3.5 text-right text-[13px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10')}
      />
    </div>
  );
}

export function ChoicePills({
  options,
  value,
  onChange,
}: {
  options: readonly string[] | string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return <TagPills options={options.map((option) => ({ value: option, label: option }))} value={value} onChange={onChange} className="justify-end flex-row-reverse" />;
}

export function MiniToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button type="button" className="business-switch" aria-pressed={checked} onClick={() => onChange(!checked)}>
      <span className="business-switch-option is-on">فعال</span>
      <span className="business-switch-option is-off">غیرفعال</span>
    </button>
  );
}

export function SegmentedToggle({
  checked,
  onChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <button type="button" className="business-switch" aria-pressed={checked} onClick={() => onChange(!checked)}>
      <span className="business-switch-option is-on">{activeLabel}</span>
      <span className="business-switch-option is-off">{inactiveLabel}</span>
    </button>
  );
}
