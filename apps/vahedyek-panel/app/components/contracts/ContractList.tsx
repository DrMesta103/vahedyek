'use client';

import { useRouter } from 'next/navigation';
import type { Block, Unit, Employee, Partner, Buyer } from '../../types/contract';
import { useContracts } from '../../hooks/useContracts';
import { clearActiveDraftId, setActiveDraftId } from '../../lib/contractDraftClient';
import ContractFilters from './ContractFilters';
import ContractOverviewCards from './ContractOverviewCards';
import ContractSearch from './ContractSearch';
import ContractStatusSummary from './ContractStatusSummary';
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
  const {
    contracts,
    filteredContracts,
    filters,
    searchQuery,
    activeTab,
    draftCount,
    pendingApprovalCount,
    completedCount,
    loading,
    setActiveTab,
    setSearchQuery,
    setFilters,
    clearFilters,
  } = useContracts();

  const handleEdit = (id: string) => {
    setActiveDraftId(id);
    router.push('/contracts/new');
  };

  const hasScopedResults = Boolean(
    searchQuery.trim() || filters.contractType || filters.dateFrom || filters.dateTo || filters.blockId || filters.unitId,
  );

  const overviewContracts =
    hasScopedResults || contracts.length === 0
      ? filteredContracts
      : contracts.filter((contract) => contract.status === activeTab);

  return (
    <div className="contracts-page-shell">
      <div className="contracts-workspace">
        <div className="contracts-main-column">
          <section className="contracts-hero card">
            <div className="contracts-hero-header">
              <div>
                <p className="contracts-hero-kicker">قراردادها</p>
                <h1 className="contracts-hero-title">فهرست قراردادها</h1>
              </div>
            </div>

            <ContractOverviewCards contracts={overviewContracts} />

            <div className="contracts-toolbar">
              <button
                type="button"
                className="app-button app-button-primary contracts-create-button is-inline"
                onClick={() => {
                  clearActiveDraftId();
                  router.push('/contracts/new');
                }}
              >
                <i className="fa fa-plus text-[11px]" />
                ثبت قرارداد جدید
              </button>
              <div className="contracts-toolbar-search">
                <ContractSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>

            <ContractStatusSummary
              activeTab={activeTab}
              draftCount={draftCount}
              pendingApprovalCount={pendingApprovalCount}
              completedCount={completedCount}
              onChange={setActiveTab}
            />
          </section>

          <ContractTable contracts={filteredContracts} blocks={blocks} units={units} onEdit={handleEdit} loading={loading} />
        </div>

        <aside className="contracts-sidebar-column">
          <ContractFilters filters={filters} blocks={blocks} units={units} onFilterChange={setFilters} onClearFilters={clearFilters} />
        </aside>
      </div>
    </div>
  );
}
