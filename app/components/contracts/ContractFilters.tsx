'use client';

import type { FilterState, Block, Unit, ContractType } from '../../types/contract';

interface ContractFiltersProps {
  filters: FilterState;
  blocks: Block[];
  units: Unit[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '8px 12px',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: '#4b5563',
  background: '#fff',
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  marginBottom: '4px',
  display: 'block',
};

export default function ContractFilters({ filters, blocks, units, onFilterChange, onClearFilters }: ContractFiltersProps) {
  const filteredUnits = filters.blockId ? units.filter((u) => u.blockId === filters.blockId) : [];

  const handleChange = (key: keyof FilterState, value: string | null) => {
    const updated = { ...filters, [key]: value || null };
    if (key === 'blockId') updated.unitId = null;
    onFilterChange(updated);
  };

  const hasActiveFilters = filters.contractType || filters.dateFrom || filters.dateTo || filters.blockId || filters.unitId;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
      <div style={{ minWidth: '130px' }}>
        <label style={labelStyle}>نوع قرارداد</label>
        <select value={filters.contractType ?? ''} onChange={(e) => handleChange('contractType', e.target.value as ContractType)} style={selectStyle}>
          <option value="">همه</option>
          <option value="pre-sale">پیش‌فروش</option>
        </select>
      </div>

      <div style={{ minWidth: '130px' }}>
        <label style={labelStyle}>از تاریخ</label>
        <input
          type="text"
          value={filters.dateFrom ?? ''}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
          placeholder="۱۴۰۰/۰۱/۰۱"
          style={selectStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      <div style={{ minWidth: '130px' }}>
        <label style={labelStyle}>تا تاریخ</label>
        <input
          type="text"
          value={filters.dateTo ?? ''}
          onChange={(e) => handleChange('dateTo', e.target.value)}
          placeholder="۱۴۰۳/۱۲/۲۹"
          style={selectStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      <div style={{ minWidth: '120px' }}>
        <label style={labelStyle}>بلوک</label>
        <select value={filters.blockId ?? ''} onChange={(e) => handleChange('blockId', e.target.value)} style={selectStyle}>
          <option value="">همه بلوک‌ها</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ minWidth: '120px' }}>
        <label style={labelStyle}>واحد</label>
        <select
          value={filters.unitId ?? ''}
          onChange={(e) => handleChange('unitId', e.target.value)}
          disabled={!filters.blockId}
          style={{ ...selectStyle, background: !filters.blockId ? '#f9fafb' : '#fff', color: !filters.blockId ? '#9ca3af' : '#4b5563' }}
        >
          <option value="">همه واحدها</option>
          {filteredUnits.map((u) => (
            <option key={u.id} value={u.id}>
              {u.floorName ? `${u.floorName} - ${u.name}` : u.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: 'inherit',
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );
}
