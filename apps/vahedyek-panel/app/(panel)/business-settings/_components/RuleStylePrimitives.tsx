'use client';

import { BusinessSwitch, Input, RULE_PANEL_TEXT_INPUT_CLASSNAME } from '@repo/ui';
import { TagPills } from '../../contracts/new/_components/ContractFormPrimitives';
import { ProfileAwareUnitInput } from '../../../components/ProfileAwareUnitInput';

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
  if (suffix) {
    return <ProfileAwareUnitInput value={value} onChange={onChange} placeholder={placeholder} suffix={suffix} numericMode={suffix === '%' ? 'decimal' : 'integer'} />;
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={RULE_PANEL_TEXT_INPUT_CLASSNAME}
    />
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
  return <BusinessSwitch checked={checked} onChange={onChange} />;
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
  return <BusinessSwitch checked={checked} onChange={onChange} activeLabel={activeLabel} inactiveLabel={inactiveLabel} />;
}
