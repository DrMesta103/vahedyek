'use client';

import type { FilterState, Block, Unit, ContractType } from '../../types/contract';
import { formControlMutedDisabledStyle, formControlStyle, formMetaLabelStyle, outlineButtonStyle } from '../ui/formStyles';

interface ContractFiltersProps {
  filters: FilterState;
  blocks: Block[];
  units: Unit[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

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
        <label style={formMetaLabelStyle}>نوع قرارداد</label>
        <select value={filters.contractType ?? ''} onChange={(e) => handleChange('contractType', e.target.value as ContractType)} style={formControlStyle}>
          <option value="">همه</option>
          <option value="pre-sale">پیش‌فروش</option>
        </select>
      </div>

      <div style={{ minWidth: '130px' }}>
        <label style={formMetaLabelStyle}>از تاریخ</label>
        <input
          type="text"
          value={filters.dateFrom ?? ''}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
          placeholder="۱۴۰۰/۰۱/۰۱"
          style={formControlStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      <div style={{ minWidth: '130px' }}>
        <label style={formMetaLabelStyle}>تا تاریخ</label>
        <input
          type="text"
          value={filters.dateTo ?? ''}
          onChange={(e) => handleChange('dateTo', e.target.value)}
          placeholder="۱۴۰۳/۱۲/۲۹"
          style={formControlStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      <div style={{ minWidth: '120px' }}>
        <label style={formMetaLabelStyle}>بلوک</label>
        <select value={filters.blockId ?? ''} onChange={(e) => handleChange('blockId', e.target.value)} style={formControlStyle}>
          <option value="">همه بلوک‌ها</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ minWidth: '120px' }}>
        <label style={formMetaLabelStyle}>واحد</label>
        <select
          value={filters.unitId ?? ''}
          onChange={(e) => handleChange('unitId', e.target.value)}
          disabled={!filters.blockId}
          style={!filters.blockId ? { ...formControlStyle, ...formControlMutedDisabledStyle } : formControlStyle}
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
            ...outlineButtonStyle,
            borderColor: '#ef4444',
            color: '#ef4444',
          }}
        >
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );
}
