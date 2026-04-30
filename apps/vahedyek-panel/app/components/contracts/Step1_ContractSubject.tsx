'use client';

import type { ContractSubjectData, ContractorType, ContractType, Employee, Block, Unit } from '../../types/contract';
import { formControlMutedDisabledStyle, formControlStyle, formErrorStyle, formLabelStyle } from '@repo/ui';

interface Step1Props {
  data: Partial<ContractSubjectData>;
  employees: Employee[];
  blocks: Block[];
  units: Unit[];
  errors: Record<string, string>;
  onChange: (data: Partial<ContractSubjectData>) => void;
}

export default function Step1_ContractSubject({ data, employees, blocks, units, errors, onChange }: Step1Props) {
  const contractor = data.contractor ?? { type: 'self' as ContractorType };
  const selectedBlockId = data.blockId ?? '';
  const filteredUnits = selectedBlockId ? units.filter((u) => u.blockId === selectedBlockId) : [];

  const handleContractorType = (type: ContractorType) => onChange({ ...data, contractor: { type } });
  const handleChange = (key: keyof ContractSubjectData, value: string) => {
    const updated: Partial<ContractSubjectData> = { ...data, [key]: value };
    if (key === 'blockId') updated.unitId = '';
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={formLabelStyle}>منعقدکننده قرارداد</label>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {(['self', 'employee', 'former-employee'] as ContractorType[]).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#4b5563' }}>
              <input type="radio" name="contractorType" value={type} checked={contractor.type === type} onChange={() => handleContractorType(type)} style={{ accentColor: 'var(--dark-teal)' }} />
              {type === 'self' ? 'خودم' : type === 'employee' ? 'سایر کارمندان' : 'کارمند سابق'}
            </label>
          ))}
        </div>

        {contractor.type === 'employee' && (
          <div style={{ marginTop: '10px' }}>
            <select value={contractor.employeeId ?? ''} onChange={(e) => onChange({ ...data, contractor: { ...contractor, employeeId: e.target.value } })} style={{ ...formControlStyle, maxWidth: '280px' }}>
              <option value="">انتخاب کارمند...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            {errors['contractor.employeeId'] && <p style={formErrorStyle}>{errors['contractor.employeeId']}</p>}
          </div>
        )}

        {contractor.type === 'former-employee' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <input
                type="text"
                placeholder="نام"
                value={contractor.formerFirstName ?? ''}
                onChange={(e) => onChange({ ...data, contractor: { ...contractor, formerFirstName: e.target.value } })}
                style={{ ...formControlStyle, width: '160px' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
              {errors['contractor.formerFirstName'] && <p style={formErrorStyle}>{errors['contractor.formerFirstName']}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="نام خانوادگی"
                value={contractor.formerLastName ?? ''}
                onChange={(e) => onChange({ ...data, contractor: { ...contractor, formerLastName: e.target.value } })}
                style={{ ...formControlStyle, width: '180px' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />
              {errors['contractor.formerLastName'] && <p style={formErrorStyle}>{errors['contractor.formerLastName']}</p>}
            </div>
          </div>
        )}
      </div>

      <div>
        <label style={formLabelStyle}>نوع قرارداد</label>
        <div style={{ display: 'flex', gap: '20px' }}>
          {(['pre-sale'] as ContractType[]).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#4b5563' }}>
              <input type="radio" name="contractType" value={type} checked={data.contractType === type} onChange={() => handleChange('contractType', type)} style={{ accentColor: 'var(--dark-teal)' }} />
              {'پیش‌فروش'}
            </label>
          ))}
        </div>
        {errors.contractType && <p style={formErrorStyle}>{errors.contractType}</p>}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={formLabelStyle}>تاریخ قرارداد</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>
              <i className="fa fa-calendar"></i>
            </span>
            <input
              type="text"
              placeholder="۱۴۰۳/۰۱/۰۱"
              value={data.contractDate ?? ''}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              style={{ ...formControlStyle, paddingRight: '32px' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>
          {errors.contractDate && <p style={formErrorStyle}>{errors.contractDate}</p>}
        </div>

        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={formLabelStyle}>شماره قرارداد</label>
          <input
            type="text"
            placeholder="شماره قرارداد"
            value={data.contractNumber ?? ''}
            onChange={(e) => handleChange('contractNumber', e.target.value)}
            style={formControlStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
          {errors.contractNumber && <p style={formErrorStyle}>{errors.contractNumber}</p>}
        </div>
      </div>

      <div style={{ maxWidth: '280px' }}>
        <label style={formLabelStyle}>تاریخ تحویل واحد</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>
            <i className="fa fa-calendar-check"></i>
          </span>
          <input
            type="text"
            placeholder="۱۴۰۳/۰۶/۰۱"
            value={data.deliveryDate ?? ''}
            onChange={(e) => handleChange('deliveryDate', e.target.value)}
            style={{ ...formControlStyle, paddingRight: '32px' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--dark-teal)')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>
        {errors.deliveryDate && <p style={formErrorStyle}>{errors.deliveryDate}</p>}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={formLabelStyle}>بلوک</label>
          <select value={data.blockId ?? ''} onChange={(e) => handleChange('blockId', e.target.value)} style={formControlStyle}>
            <option value="">انتخاب بلوک...</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.blockId && <p style={formErrorStyle}>{errors.blockId}</p>}
        </div>

        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={formLabelStyle}>واحد</label>
          <select value={data.unitId ?? ''} onChange={(e) => handleChange('unitId', e.target.value)} disabled={!selectedBlockId} style={!selectedBlockId ? { ...formControlStyle, ...formControlMutedDisabledStyle } : formControlStyle}>
            <option value="">{!selectedBlockId ? 'ابتدا یک بلوک انتخاب کنید' : 'انتخاب واحد...'}</option>
            {filteredUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {errors.unitId && <p style={formErrorStyle}>{errors.unitId}</p>}
        </div>
      </div>
    </div>
  );
}
