'use client';

import type { Share } from '../../types/contract';
import { formControlStyle, ShareModePills, type ShareMode } from '@repo/ui';

interface ShareInputProps {
  value: Share;
  onChange: (share: Share) => void;
}

export default function ShareInput({ value, onChange }: ShareInputProps) {
  const handleModeChange = (mode: ShareMode) => onChange({ ...value, mode });
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    onChange({ ...value, value: isNaN(num) ? 0 : num });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <ShareModePills value={value.mode as ShareMode} onChange={handleModeChange} />
      <input type="number" min={0} max={value.mode === 'percent' ? 100 : 6} step={value.mode === 'dang' ? 0.5 : 1}
        value={value.value === 0 ? '' : value.value} onChange={handleValueChange}
        placeholder="0" style={{
          ...formControlStyle,
          width: '84px',
          textAlign: 'center', outline: 'none',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
      {value.mode === 'dang' && (
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{value.value} از ۶ دانگ</span>
      )}
    </div>
  );
}
