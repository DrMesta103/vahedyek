'use client';

import { BusinessSwitch } from './rules/BusinessSwitch';

/** @deprecated Use `BusinessSwitch` — this export wraps it for backwards compatibility. */
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
