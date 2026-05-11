'use client';

import { PersianDatePicker } from '@repo/ui';
import type { Block, ContractType, FilterState, Unit } from '../../types/contract';

interface ContractFiltersProps {
  filters: FilterState;
  blocks: Block[];
  units: Unit[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export default function ContractFilters({ filters, blocks, units, onFilterChange, onClearFilters }: ContractFiltersProps) {
  const filteredUnits = filters.blockId ? units.filter((unit) => unit.blockId === filters.blockId) : [];

  const handleChange = (key: keyof FilterState, value: string | null) => {
    const updated = { ...filters, [key]: value || null };

    if (key === 'blockId') {
      updated.unitId = null;
    }

    onFilterChange(updated);
  };

  const hasActiveFilters = Boolean(filters.contractType || filters.dateFrom || filters.dateTo || filters.blockId || filters.unitId);

  return (
    <section className="contracts-filter-sidebar">
      <div className="contracts-filter-panel">
        <div className="contracts-filter-panel-head">
        <div>
          <p>فیلترهای فهرست قرارداد</p>
          <h2>جستجو و مرتب‌سازی</h2>
        </div>

        {hasActiveFilters ? (
          <button type="button" className="contracts-filter-reset" onClick={onClearFilters}>
            پاک کردن
          </button>
        ) : null}
        </div>

        <div className="contracts-filter-body">
          <div className="contracts-filter-stack">
            <div className="contracts-filter-section">
              <label className="contracts-filter-label">نوع قرارداد</label>
              <select className="app-select contracts-filter-control" value={filters.contractType ?? ''} onChange={(e) => handleChange('contractType', e.target.value as ContractType)}>
                <option value="">همه</option>
                <option value="sale">فروش</option>
                <option value="pre-sale">پیش‌فروش</option>
              </select>
            </div>

            <div className="contracts-filter-section">
              <label className="contracts-filter-label">بازه تاریخ قرارداد</label>
              <div className="contracts-filter-date-grid">
                <PersianDatePicker
                  value={filters.dateFrom ?? ''}
                  onChange={(value) => handleChange('dateFrom', value)}
                  placeholder="از تاریخ"
                  className="contracts-filter-control"
                />
                <PersianDatePicker
                  value={filters.dateTo ?? ''}
                  onChange={(value) => handleChange('dateTo', value)}
                  placeholder="تا تاریخ"
                  className="contracts-filter-control"
                />
              </div>
            </div>

            <div className="contracts-filter-section">
              <label className="contracts-filter-label">نام بلوک</label>
              <select className="app-select contracts-filter-control" value={filters.blockId ?? ''} onChange={(e) => handleChange('blockId', e.target.value)}>
                <option value="">همه بلوک‌ها</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contracts-filter-section">
              <label className="contracts-filter-label">شماره واحد</label>
              <select
                className="app-select contracts-filter-control"
                value={filters.unitId ?? ''}
                onChange={(e) => handleChange('unitId', e.target.value)}
                disabled={!filters.blockId}
              >
                <option value="">همه واحدها</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.floorName ? `${unit.floorName} - ${unit.name}` : unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contracts-filter-note">
              <span>فیلترها روی قراردادهای تب فعال اعمال می‌شوند.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
