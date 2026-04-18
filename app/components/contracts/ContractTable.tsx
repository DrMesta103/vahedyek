'use client';

import type { Contract } from '../../types/contract';

interface ContractTableProps {
  contracts: Contract[];
  onEdit: (id: string) => void;
}

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  sale: 'فروش',
  'pre-sale': 'پیش‌فروش',
};

export default function ContractTable({ contracts, onEdit }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af' }}>
        <i className="fa fa-file-invoice" style={{ fontSize: '40px', marginBottom: '12px', display: 'block', color: '#d1d5db' }}></i>
        <p style={{ fontSize: '13px' }}>قراردادی یافت نشد</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {['شماره قرارداد', 'نوع', 'واحد', 'طرف اول', 'طرف دوم', 'تاریخ', 'وضعیت', 'عملیات'].map((h) => (
              <th key={h} style={{ padding: '10px 16px', fontWeight: '600', color: '#6b7280', fontSize: '12px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => {
            const { subject, parties } = contract.data;
            const partyOneNames = parties.partyOne.map((p) => p.name).join('، ');
            const partyTwoNames = parties.partyTwo.map((p) => p.name).join('، ');
            return (
              <tr key={contract.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>{subject.contractNumber || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{CONTRACT_TYPE_LABEL[subject.contractType] ?? subject.contractType}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{subject.unitId || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partyOneNames || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partyTwoNames || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#4b5563' }}>{subject.contractDate || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  {contract.status === 'finalized' ? (
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>نهایی</span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>پیش‌نویس</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => onEdit(contract.id)} style={{
                    background: 'transparent', border: '1px solid var(--dark-teal)',
                    color: 'var(--dark-teal)', padding: '4px 14px', borderRadius: '20px',
                    fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer',
                  }}>ویرایش</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
