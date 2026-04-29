'use client';

import { formControlStyle } from '../ui/formStyles';

interface ContractSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContractSearch({ value, onChange }: ContractSearchProps) {
  return (
    <div className="contracts-search">
      <span className="contracts-search-icon">
        <i className="fa fa-search text-[13px]" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجو در شماره قرارداد، طرفین و اطلاعات ثبت..."
        className="contracts-search-input"
        style={formControlStyle}
      />
    </div>
  );
}
