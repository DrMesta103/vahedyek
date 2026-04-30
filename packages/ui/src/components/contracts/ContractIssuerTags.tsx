'use client';

import { TagPills } from '../rules/TagPills';

export type ContractIssuerType = 'self' | 'former' | 'staff';

export function ContractIssuerTags({
  value,
  onChange,
}: {
  value: ContractIssuerType;
  onChange: (value: ContractIssuerType) => void;
}) {
  return (
    <TagPills
      value={value}
      onChange={onChange}
      options={[
        { value: 'self', label: 'خودم' },
        { value: 'former', label: 'کارمند سابق' },
        { value: 'staff', label: 'سایر کارمندان' },
      ]}
    />
  );
}

