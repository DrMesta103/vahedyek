'use client';

import { useState } from 'react';
import type { ContractPartiesData, ContractParty, Partner, Buyer, Share } from '../../types/contract';
import ShareInput from './ShareInput';

interface Step2Props {
  data: Partial<ContractPartiesData>;
  partners: Partner[];
  buyers: Buyer[];
  errors: Record<string, string>;
  onChange: (data: Partial<ContractPartiesData>) => void;
}

const DEFAULT_SHARE: Share = { value: 0, mode: 'percent' };
const OWNER_PARTY: ContractParty = { personId: 'owner', personType: 'natural', name: 'صاحب کسب‌وکار', share: DEFAULT_SHARE };

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: '600', color: '#374151',
  display: 'flex', alignItems: 'center', gap: '8px',
};

const partyRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '12px 16px', borderRadius: '8px',
  background: '#f9fafb', border: '1px solid #f3f4f6',
  marginBottom: '8px',
};

export default function Step2_ContractParties({ data, partners, buyers, errors, onChange }: Step2Props) {
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);

  const partyOne: ContractParty[] = data.partyOne && data.partyOne.length > 0 ? data.partyOne : [OWNER_PARTY];
  const partyTwo: ContractParty[] = data.partyTwo ?? [];

  const updatePartyOneShare = (index: number, share: Share) =>
    onChange({ ...data, partyOne: partyOne.map((p, i) => (i === index ? { ...p, share } : p)) });

  const removePartyOne = (index: number) => {
    const updated = partyOne.filter((_, i) => i !== index);
    onChange({ ...data, partyOne: updated.length > 0 ? updated : [OWNER_PARTY] });
  };

  const addPartner = (partner: Partner) => {
    if (partyOne.some((p) => p.personId === partner.id)) return;
    const base = partyOne[0]?.personId === 'owner' && partyOne.length === 1 ? [] : partyOne;
    onChange({ ...data, partyOne: [...base, { personId: partner.id, personType: partner.personType, name: partner.name, share: DEFAULT_SHARE }] });
    setShowPartnerDropdown(false);
  };

  const updatePartyTwoShare = (index: number, share: Share) =>
    onChange({ ...data, partyTwo: partyTwo.map((p, i) => (i === index ? { ...p, share } : p)) });

  const removePartyTwo = (index: number) =>
    onChange({ ...data, partyTwo: partyTwo.filter((_, i) => i !== index) });

  const addBuyer = (buyer: Buyer) => {
    if (partyTwo.some((p) => p.personId === buyer.id)) return;
    onChange({ ...data, partyTwo: [...partyTwo, { personId: buyer.id, personType: buyer.personType, name: buyer.name, share: DEFAULT_SHARE }] });
    setShowBuyerDropdown(false);
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', left: '0', top: 'calc(100% + 4px)', zIndex: 20,
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', minWidth: '200px',
  };

  const dropdownBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '13px', color: '#4b5563', textAlign: 'right',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* طرف اول */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={sectionTitleStyle}><i className="fa fa-user-tie" style={{ color: 'var(--dark-teal)' }}></i> طرف اول</span>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowPartnerDropdown((v) => !v)} style={{
              background: 'transparent', border: '1px solid var(--dark-teal)', color: 'var(--dark-teal)',
              padding: '5px 14px', borderRadius: '20px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer',
            }}>
              <i className="fa fa-exchange-alt" style={{ marginLeft: '5px', fontSize: '11px' }}></i>
              تغییر طرف اول
            </button>
            {showPartnerDropdown && (
              <div style={dropdownStyle}>
                <button type="button" onClick={() => { onChange({ ...data, partyOne: [OWNER_PARTY] }); setShowPartnerDropdown(false); }}
                  style={{ ...dropdownBtnStyle, borderBottom: '1px solid #f3f4f6' }}>
                  <i className="fa fa-user" style={{ color: '#9ca3af' }}></i> صاحب کسب‌وکار (پیش‌فرض)
                </button>
                {partners.length === 0
                  ? <p style={{ padding: '10px 16px', fontSize: '12px', color: '#9ca3af' }}>شریکی یافت نشد</p>
                  : partners.map((p) => (
                    <button key={p.id} type="button" onClick={() => addPartner(p)} style={dropdownBtnStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                      <i className={`fa ${p.personType === 'legal' ? 'fa-building' : 'fa-user'}`} style={{ color: '#9ca3af' }}></i>
                      {p.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
        {errors['partyOne'] && <p style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px' }}>{errors['partyOne']}</p>}
        {partyOne.map((party, index) => (
          <div key={party.personId} style={partyRowStyle}>
            <i className={`fa ${party.personType === 'legal' ? 'fa-building' : 'fa-user'}`} style={{ color: '#9ca3af' }}></i>
            <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{party.name}</span>
            <ShareInput value={party.share} onChange={(share) => updatePartyOneShare(index, share)} />
            {party.personId !== 'owner' && (
              <button type="button" onClick={() => removePartyOne(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', lineHeight: 1 }}>×</button>
            )}
          </div>
        ))}
        {errors['shares'] && <p style={{ fontSize: '11px', color: '#ef4444' }}>{errors['shares']}</p>}
      </div>

      {/* طرف دوم */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={sectionTitleStyle}><i className="fa fa-users" style={{ color: 'var(--primary-teal)' }}></i> طرف دوم</span>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowBuyerDropdown((v) => !v)} style={{
              background: 'transparent', border: '1px solid var(--primary-teal)', color: 'var(--primary-teal)',
              padding: '5px 14px', borderRadius: '20px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer',
            }}>
              <i className="fa fa-plus" style={{ marginLeft: '5px', fontSize: '11px' }}></i>
              افزودن خریدار
            </button>
            {showBuyerDropdown && (
              <div style={dropdownStyle}>
                {buyers.length === 0
                  ? <p style={{ padding: '10px 16px', fontSize: '12px', color: '#9ca3af' }}>خریداری یافت نشد</p>
                  : buyers.map((b) => (
                    <button key={b.id} type="button" onClick={() => addBuyer(b)} style={dropdownBtnStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                      <i className={`fa ${b.personType === 'legal' ? 'fa-building' : 'fa-user'}`} style={{ color: '#9ca3af' }}></i>
                      {b.name}
                      <span style={{ marginRight: 'auto', fontSize: '11px', color: '#9ca3af' }}>{b.personType === 'legal' ? 'حقوقی' : 'حقیقی'}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
        {errors['partyTwo'] && <p style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px' }}>{errors['partyTwo']}</p>}
        {partyTwo.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d1d5db', borderRadius: '8px', color: '#9ca3af', fontSize: '13px' }}>
            خریداری انتخاب نشده است
          </div>
        )}
        {partyTwo.map((party, index) => (
          <div key={party.personId} style={{
            ...partyRowStyle,
            background: party.personType === 'legal' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${party.personType === 'legal' ? '#fde68a' : '#bbf7d0'}`,
          }}>
            <i className={`fa ${party.personType === 'legal' ? 'fa-building' : 'fa-user'}`} style={{ color: party.personType === 'legal' ? '#d97706' : '#16a34a' }}></i>
            <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{party.name}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>{party.personType === 'legal' ? 'حقوقی' : 'حقیقی'}</span>
            <ShareInput value={party.share} onChange={(share) => updatePartyTwoShare(index, share)} />
            <button type="button" onClick={() => removePartyTwo(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
        ))}
        {errors['partyTwoShares'] && <p style={{ fontSize: '11px', color: '#ef4444' }}>{errors['partyTwoShares']}</p>}
      </div>
    </div>
  );
}
