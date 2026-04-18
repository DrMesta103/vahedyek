'use client';

import type { Share, ShareMode } from '../../types/contract';

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
      <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '20px', overflow: 'hidden' }}>
        {(['percent', 'dang'] as ShareMode[]).map((mode) => (
          <button key={mode} type="button" onClick={() => handleModeChange(mode)} style={{
            padding: '4px 12px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', border: 'none',
            background: value.mode === mode ? 'var(--dark-teal)' : '#fff',
            color: value.mode === mode ? '#fff' : '#6b7280',
            transition: '0.2s',
          }}>
            {mode === 'percent' ? 'درصد' : 'دانگ'}
          </button>
        ))}
      </div>
      <input type="number" min={0} max={value.mode === 'percent' ? 100 : 6} step={value.mode === 'dang' ? 0.5 : 1}
        value={value.value === 0 ? '' : value.value} onChange={handleValueChange}
        placeholder="0" style={{
          width: '80px', padding: '6px 10px', border: '1px solid #d1d5db',
          borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px',
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
