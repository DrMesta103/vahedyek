'use client';

import type { ContractStatus } from '../../types/contract';

interface ContractTabsProps {
  activeTab: ContractStatus;
  finalizedCount: number;
  draftCount: number;
  onTabChange: (tab: ContractStatus) => void;
}

export default function ContractTabs({ activeTab, finalizedCount, draftCount, onTabChange }: ContractTabsProps) {
  const tabs: { key: ContractStatus; label: string; count: number }[] = [
    { key: 'finalized', label: 'قراردادهای نهایی', count: finalizedCount },
    { key: 'draft', label: 'پیش‌نویس‌ها', count: draftCount },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '0' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', fontSize: '13px', fontFamily: 'inherit',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: isActive ? '2px solid var(--dark-teal)' : '2px solid transparent',
              marginBottom: '-2px',
              color: isActive ? 'var(--dark-teal)' : '#6b7280',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: '0.2s',
            }}
          >
            {tab.label}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '22px', height: '22px', padding: '0 6px',
              borderRadius: '20px', fontSize: '11px', fontFamily: 'tahoma',
              background: isActive ? 'var(--dark-teal)' : '#e5e7eb',
              color: isActive ? '#fff' : '#6b7280',
            }}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
