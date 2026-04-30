'use client';

import { TagPills } from '../rules/TagPills';

export type ContractType = 'sale' | 'pre-sale';

export function ContractTypeTags({
  value,
  onChange,
}: {
  value: ContractType;
  onChange: (value: ContractType) => void;
}) {
  return (
    <TagPills
      value={value}
      onChange={onChange}
      options={[
        { value: 'pre-sale', label: 'پیش‌فروش' },
        { value: 'sale', label: 'فروش' },
      ]}
    />
  );
}

