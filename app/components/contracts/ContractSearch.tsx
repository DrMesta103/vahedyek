'use client';

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
          width: '100%', padding: '10px 36px 10px 14px',
          border: '1px solid #d1d5db', borderRadius: '8px',
          fontFamily: 'inherit', fontSize: '13px', outline: 'none',
          color: '#4b5563', background: '#fff', transition: '0.2s',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );
}
