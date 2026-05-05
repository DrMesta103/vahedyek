'use client';

import { useRouter } from 'next/navigation';
import { Building2, Circle, Pencil, Square, UserRound } from 'lucide-react';
import type { Block, Contract, ContractType, Unit } from '../../types/contract';

interface ContractTableProps {
  contracts: Contract[];
  blocks: Block[];
  units: Unit[];
  onEdit: (id: string) => void;
  loading?: boolean;
}

const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  sale: 'فروش',
  'pre-sale': 'پیش‌فروش',
};

function formatCurrency(value: number) {
  if (!value) {
    return '—';
  }

  return `${Math.round(value).toLocaleString('fa-IR')} ریال`;
}

function DetailRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="contract-reference-detail-row">
      <span>{label}</span>
      <strong className={accent ? 'is-accent' : ''}>{value}</strong>
    </div>
  );
}

export default function ContractTable({ contracts, blocks, units, onEdit, loading = false }: ContractTableProps) {
  const router = useRouter();
  const blockMap = new Map(blocks.map((block) => [block.id, block.name]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));

  if (loading) {
    return (
      <div className="contracts-list-state card">
        <i className="fa fa-spinner fa-spin" />
        <p>در حال دریافت فهرست قراردادها...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="contracts-list-state card">
        <i className="fa fa-file-invoice" />
        <p>قراردادی یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="contracts-list-grid">
      {contracts.map((contract) => {
        const { subject, parties, financial } = contract.data;
        const blockName = blockMap.get(subject.blockId) ?? '—';
        const unit = unitMap.get(subject.unitId);
        const partyOnePrimary = parties.partyOne.find((party) => party.isPrimary) ?? parties.partyOne[0];
        const partyTwoPrimary = parties.partyTwo.find((party) => party.isPrimary) ?? parties.partyTwo[0];
        const parkingArea = Number(financial?.parkingArea || 0);
        const unitArea = Number(financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0));
        const amount =
          financial?.pricingType === 'metered'
            ? unitArea * Number(financial.pricePerMeter || 0) + parkingArea * Number(financial.parkingPricePerMeter || 0)
            : Number(financial?.fixedTotalAmount || 0);
        const rightRibbonLabel =
          contract.status === 'draft' ? 'قابل تکمیل' : contract.status === 'pending_approval' ? 'در انتظار تایید' : 'بزودی';
        const leftRibbonLabel =
          contract.status === 'draft' ? 'پیش‌نویس قرارداد' : contract.status === 'pending_approval' ? 'آماده بررسی' : 'تکمیل شده';

        return (
          <article
            key={contract.id}
            className="contract-reference-card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/contracts/${contract.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') router.push(`/contracts/${contract.id}`);
            }}
          >
            <div className="contract-reference-ribbon is-left">{leftRibbonLabel}</div>

            <div className="contract-reference-main">
              <div className="contract-reference-head">
                <div className="contract-reference-meta">
                  <span className="contract-reference-check">
                    <Square className="h-3.5 w-3.5" />
                  </span>
                  <span className="contract-reference-chip">{blockName}</span>
                  <span className="contract-reference-inline">
                    <Building2 className="h-3.5 w-3.5" />
                    بلوک ۱
                  </span>
                  <span className="contract-reference-inline">طبقه {unit?.floorName ?? '—'}</span>
                  <span className="contract-reference-inline">واحد {unit?.name ?? '—'}</span>
                  <span className="contract-reference-inline">{unit?.category ?? 'مسکونی'}</span>
                </div>

                <div className="contract-reference-owner">
                  <span className="contract-reference-warning">
                    <Circle className="h-2.5 w-2.5 fill-current" />
                    بدهکار
                  </span>
                  <strong>{partyTwoPrimary?.name ?? partyOnePrimary?.name ?? '—'}</strong>
                  <span className="contract-reference-avatar">
                    <UserRound className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="contract-reference-grid">
                <section className="contract-reference-panel">
                  <DetailRow label="طرف اول" value={partyOnePrimary?.name ?? 'ثبت نشده'} />
                  <DetailRow label="انعقاد قرارداد" value={subject.contractDate || '—'} />
                  <DetailRow label="ثبت در سامانه" value={contract.updatedAt || '—'} />
                </section>

                <section className="contract-reference-panel">
                  <DetailRow label="شماره قرارداد" value={subject.contractNumber || '—'} />
                  <DetailRow label="مبلغ قرارداد" value={formatCurrency(amount)} />
                  <div className="contract-reference-actions">
                    <span className="contract-reference-status-pill">
                      {CONTRACT_TYPE_LABEL[subject.contractType] ?? subject.contractType}
                    </span>
                    <button
                      type="button"
                      className="contract-reference-edit-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(contract.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      ویرایش
                    </button>
                  </div>
                </section>
              </div>
            </div>

            <div className={`contract-reference-ribbon is-right${contract.status === 'completed' ? ' is-finalized' : ''}`}>{rightRibbonLabel}</div>
          </article>
        );
      })}
    </div>
  );
}
