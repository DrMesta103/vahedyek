'use client';

import { formControlStyle } from '../ui/formStyles';

interface ContractSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContractSearch({ value, onChange }: ContractSearchProps) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        color: '#9ca3af', pointerEvents: 'none', display: 'flex',
      }}>
        <i className="fa fa-search" style={{ fontSize: '13px' }}></i>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجو در قراردادها..."
        style={{
          ...formControlStyle,
          paddingRight: '36px',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );
}
