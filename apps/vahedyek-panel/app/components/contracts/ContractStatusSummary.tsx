'use client';

import type { ContractStatus } from '../../types/contract';

interface ContractStatusSummaryProps {
  activeTab: ContractStatus;
  draftCount: number;
  pendingApprovalCount: number;
  completedCount: number;
  onChange: (status: ContractStatus) => void;
}

export default function ContractStatusSummary({
  activeTab,
  draftCount,
  pendingApprovalCount,
  completedCount,
  onChange,
}: ContractStatusSummaryProps) {
  const items = [
    {
      key: 'draft' as const,
      label: 'پیش نویس',
      count: draftCount,
      className: 'is-draft',
    },
    {
      key: 'pending_approval' as const,
      label: 'در انتظار تایید',
      count: pendingApprovalCount,
      className: 'is-pending',
    },
    {
      key: 'completed' as const,
      label: 'تکمیل شده',
      count: completedCount,
      className: 'is-complete',
      hint: 'بزودی',
    },
  ];

  return (
    <div className="contracts-status-summary">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`contracts-status-pill ${item.className}${activeTab === item.key ? ' is-active' : ''}`}
        >
          <span className="contracts-status-pill-count">{item.count.toLocaleString('fa-IR')}</span>
          <span>{item.label}</span>
          {'hint' in item ? <small>{item.hint}</small> : null}
        </button>
      ))}
    </div>
  );
}
