'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Block, Unit, Employee, Partner, Buyer } from '../../types/contract';
import { useContracts } from '../../hooks/useContracts';
import ContractTabs from './ContractTabs';
import ContractSearch from './ContractSearch';
import ContractFilters from './ContractFilters';
import ContractTable from './ContractTable';

interface ContractListProps {
  blocks: Block[];
  units?: Unit[];
  employees: Employee[];
  partners: Partner[];
  buyers: Buyer[];
}

export default function ContractList({ blocks, units = [] }: ContractListProps) {
  const router = useRouter();
  const { filteredContracts, filters, searchQuery, activeTab, finalizedCount, draftCount, setActiveTab, setSearchQuery, setFilters, clearFilters } = useContracts();

  const handleEdit = (id: string) => router.push(`/contracts/${id}/edit`);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* هدر کارت */}
      <div style={{ padding: '20px 25px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px' }}>
          <i className="fa fa-file-invoice"></i>
          <span>فهرست قراردادها</span>
        </div>
        <Link href="/contracts/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: '1px solid var(--dark-teal)',
          color: 'var(--dark-teal)', padding: '6px 18px',
          borderRadius: '20px', fontFamily: 'inherit', fontSize: '12px',
          textDecoration: 'none', cursor: 'pointer',
        }}>
          <i className="fa fa-plus" style={{ fontSize: '11px' }}></i>
          ثبت قرارداد جدید
        </Link>
      </div>

      {/* تب‌ها */}
      <div style={{ padding: '0 25px' }}>
        <ContractTabs activeTab={activeTab} finalizedCount={finalizedCount} draftCount={draftCount} onTabChange={setActiveTab} />
      </div>

      {/* جستجو و فیلترها */}
      <div style={{ padding: '16px 25px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ContractSearch value={searchQuery} onChange={setSearchQuery} />
        <ContractFilters filters={filters} blocks={blocks} units={units} onFilterChange={setFilters} onClearFilters={clearFilters} />
      </div>

      {/* جدول */}
      <ContractTable contracts={filteredContracts} onEdit={handleEdit} />
    </div>
  );
}
