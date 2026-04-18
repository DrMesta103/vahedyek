'use client';

import type { ContractSubjectData, ContractorType, ContractType, Employee, Block, Unit } from '../../types/contract';

interface Step1Props {
  data: Partial<ContractSubjectData>;
  employees: Employee[];
  blocks: Block[];
  units: Unit[];
  errors: Record<string, string>;
  onChange: (data: Partial<ContractSubjectData>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
  borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px',
  outline: 'none', color: '#4b5563', transition: '0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block', fontWeight: '600',
};

const errorStyle: React.CSSProperties = {
  fontSize: '11px', color: '#ef4444', marginTop: '4px',
};

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

      {/* منعقدکننده */}
      <div>
        <label style={labelStyle}>منعقدکننده قرارداد</label>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {(['self', 'employee', 'former-employee'] as ContractorType[]).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#4b5563' }}>
              <input type="radio" name="contractorType" value={type} checked={contractor.type === type}
                onChange={() => handleContractorType(type)} style={{ accentColor: 'var(--dark-teal)' }} />
              {type === 'self' ? 'خودم' : type === 'employee' ? 'سایر کارمندان' : 'کارمند سابق'}
            </label>
          ))}
        </div>

        {contractor.type === 'employee' && (
          <div style={{ marginTop: '10px' }}>
            <select value={contractor.employeeId ?? ''} onChange={(e) => onChange({ ...data, contractor: { ...contractor, employeeId: e.target.value } })}
              style={{ ...inputStyle, maxWidth: '280px' }}>
              <option value="">انتخاب کارمند...</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
            {errors['contractor.employeeId'] && <p style={errorStyle}>{errors['contractor.employeeId']}</p>}
          </div>
        )}

        {contractor.type === 'former-employee' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <input type="text" placeholder="نام" value={contractor.formerFirstName ?? ''}
                onChange={(e) => onChange({ ...data, contractor: { ...contractor, formerFirstName: e.target.value } })}
                style={{ ...inputStyle, width: '160px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              {errors['contractor.formerFirstName'] && <p style={errorStyle}>{errors['contractor.formerFirstName']}</p>}
            </div>
            <div>
              <input type="text" placeholder="نام خانوادگی" value={contractor.formerLastName ?? ''}
                onChange={(e) => onChange({ ...data, contractor: { ...contractor, formerLastName: e.target.value } })}
                style={{ ...inputStyle, width: '180px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
              {errors['contractor.formerLastName'] && <p style={errorStyle}>{errors['contractor.formerLastName']}</p>}
            </div>
          </div>
        )}
      </div>

      {/* نوع قرارداد */}
      <div>
        <label style={labelStyle}>نوع قرارداد</label>
        <div style={{ display: 'flex', gap: '20px' }}>
          {(['sale', 'pre-sale'] as ContractType[]).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#4b5563' }}>
              <input type="radio" name="contractType" value={type} checked={data.contractType === type}
                onChange={() => handleChange('contractType', type)} style={{ accentColor: 'var(--dark-teal)' }} />
              {type === 'sale' ? 'فروش' : 'پیش‌فروش'}
            </label>
          ))}
        </div>
        {errors['contractType'] && <p style={errorStyle}>{errors['contractType']}</p>}
      </div>

      {/* تاریخ و شماره */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={labelStyle}>تاریخ قرارداد</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>
              <i className="fa fa-calendar"></i>
            </span>
            <input type="text" placeholder="۱۴۰۳/۰۱/۰۱" value={data.contractDate ?? ''}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              style={{ ...inputStyle, paddingRight: '32px' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
          </div>
          {errors['contractDate'] && <p style={errorStyle}>{errors['contractDate']}</p>}
        </div>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={labelStyle}>شماره قرارداد</label>
          <input type="text" placeholder="شماره قرارداد" value={data.contractNumber ?? ''}
            onChange={(e) => handleChange('contractNumber', e.target.value)} style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
          {errors['contractNumber'] && <p style={errorStyle}>{errors['contractNumber']}</p>}
        </div>
      </div>

      {/* تاریخ تحویل */}
      <div style={{ maxWidth: '280px' }}>
        <label style={labelStyle}>تاریخ تحویل واحد</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>
            <i className="fa fa-calendar-check"></i>
          </span>
          <input type="text" placeholder="۱۴۰۳/۰۶/۰۱" value={data.deliveryDate ?? ''}
            onChange={(e) => handleChange('deliveryDate', e.target.value)}
            style={{ ...inputStyle, paddingRight: '32px' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--dark-teal)'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
        </div>
        {errors['deliveryDate'] && <p style={errorStyle}>{errors['deliveryDate']}</p>}
      </div>

      {/* بلوک و واحد */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={labelStyle}>بلوک</label>
          <select value={data.blockId ?? ''} onChange={(e) => handleChange('blockId', e.target.value)} style={inputStyle}>
            <option value="">انتخاب بلوک...</option>
            {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {errors['blockId'] && <p style={errorStyle}>{errors['blockId']}</p>}
        </div>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={labelStyle}>واحد</label>
          <select value={data.unitId ?? ''} onChange={(e) => handleChange('unitId', e.target.value)}
            disabled={!selectedBlockId}
            style={{ ...inputStyle, background: !selectedBlockId ? '#f9fafb' : '#fff', color: !selectedBlockId ? '#9ca3af' : '#4b5563' }}>
            <option value="">{!selectedBlockId ? 'ابتدا یک بلوک انتخاب کنید' : 'انتخاب واحد...'}</option>
            {filteredUnits.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {errors['unitId'] && <p style={errorStyle}>{errors['unitId']}</p>}
        </div>
      </div>
    </div>
  );
}
