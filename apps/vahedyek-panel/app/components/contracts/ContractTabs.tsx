'use client';

import type { ContractStatus } from '../../types/contract';

interface ContractTabsProps {
  activeTab: ContractStatus;
  draftCount: number;
  pendingApprovalCount: number;
  completedCount: number;
  onTabChange: (tab: ContractStatus) => void;
}

export default function ContractTabs({ activeTab, draftCount, pendingApprovalCount, completedCount, onTabChange }: ContractTabsProps) {
  const tabs: { key: ContractStatus; label: string; count: number }[] = [
    { key: 'draft', label: 'پیش‌نویس', count: draftCount },
    { key: 'pending_approval', label: 'در انتظار تایید', count: pendingApprovalCount },
    { key: 'completed', label: 'تکمیل شده', count: completedCount },
  ];

  return (
    <div className="contracts-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button key={tab.key} type="button" onClick={() => onTabChange(tab.key)} className={`contracts-tab${isActive ? ' is-active' : ''}`}>
            {tab.label}
            <span className="contracts-tab-count">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
