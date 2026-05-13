'use client';

import { useRouter } from 'next/navigation';
import { Building2, Circle, Pencil } from 'lucide-react';
import type { Block, Contract, ContractStatus, ContractType, Unit } from '../../types/contract';
import { computeContractTotalRialFromFinancial } from '../../lib/contractFinancialPricing';
import { formatDateFa } from '../../lib/dateFormat';

interface ContractTableProps {
  contracts: Contract[];
  blocks: Block[];
  units: Unit[];
  onEdit: (id: string) => void;
  loading?: boolean;
  listContext?: ContractStatus;
}

const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  sale: 'فروش',
  'pre-sale': 'پیش‌فروش',
};

function formatCurrency(value: number) {
  if (!value) return '—';
  return `${Math.round(value).toLocaleString('fa-IR')} ریال`;
}

function DetailRow({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="contract-reference-detail-row">
      <span>{label}</span>
      <strong className={accent ? 'is-accent' : ''}>{value}</strong>
    </div>
  );
}

function getRibbonLabels(contract: Contract) {
  const isAppendix = contract.entityKind === 'appendix';
  const right =
    contract.status === 'draft'
      ? 'قابل تکمیل'
      : contract.status === 'appendix_draft'
        ? 'پیش‌نویس متمم'
        : contract.status === 'pending_approval'
          ? 'در انتظار تایید'
          : contract.appendixStatusBadge ?? 'تکمیل شده';

  const left =
    contract.status === 'draft'
      ? 'پیش‌نویس قرارداد'
      : contract.status === 'appendix_draft'
        ? 'متمم در حال تدوین'
        : contract.status === 'pending_approval'
          ? isAppendix
            ? 'متمم در انتظار تایید'
            : 'آماده بررسی'
          : contract.hasApprovedAppendix
            ? 'قرارداد متمم‌خورده'
            : 'تکمیل شده';

  return { left, right };
}

export default function ContractTable({ contracts, blocks, units, onEdit, loading = false, listContext }: ContractTableProps) {
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
        const isAppendix = contract.entityKind === 'appendix';
        const blockName = blockMap.get(subject.blockId) ?? '—';
        const unit = unitMap.get(subject.unitId);
        const partyOnePrimary = parties.partyOne.find((party) => party.isPrimary) ?? parties.partyOne[0];
        const partyTwoPrimary = parties.partyTwo.find((party) => party.isPrimary) ?? parties.partyTwo[0];
        const partyTwoNames = parties.partyTwo.map((party) => party.name).filter(Boolean);
        const partyTwoLabel = partyTwoNames.length ? partyTwoNames.join('، ') : partyTwoPrimary?.name ?? partyOnePrimary?.name ?? '—';
        const amount = computeContractTotalRialFromFinancial(financial ?? null);
        const ribbons = getRibbonLabels(contract);
        const detailsHref = isAppendix
          ? `/contracts/${contract.baseContractId}/appendices/${contract.id}${listContext ? `?list=${encodeURIComponent(listContext)}` : ''}`
          : `/contracts/${contract.id}${listContext ? `?list=${encodeURIComponent(listContext)}` : ''}`;

        return (
          <article
            key={contract.id}
            className="contract-reference-card"
            role="button"
            tabIndex={0}
            onClick={() => router.push(detailsHref)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') router.push(detailsHref);
            }}
          >
            <div className="contract-reference-ribbon is-left">{ribbons.left}</div>

            <div className="contract-reference-main">
              <div className="contract-reference-head">
                <div className="contract-reference-owner">
                  <span className="contract-reference-warning">
                    <Circle className="h-2.5 w-2.5 fill-current" />
                    {isAppendix ? 'متمم' : 'بدهکار'}
                  </span>
                  <strong className="contract-reference-owner-names">{partyTwoLabel}</strong>
                </div>

                <div className="contract-reference-meta">
                  <span className="contract-reference-inline">
                    <Building2 className="h-3.5 w-3.5" />
                    {blockName}
                  </span>
                  <span className="contract-reference-inline">طبقه {unit?.floorName ?? '—'}</span>
                  <span className="contract-reference-inline">واحد {unit?.name ?? '—'}</span>
                  <span className="contract-reference-inline">{unit?.category ?? 'مسکونی'}</span>
                </div>
              </div>

              <div className="contract-reference-grid">
                <section className="contract-reference-panel">
                  <DetailRow label="طرف اول" value={partyOnePrimary?.name ?? 'ثبت نشده'} />
                  <DetailRow label="انعقاد قرارداد" value={subject.contractDate || '—'} />
                  {isAppendix ? <DetailRow label="وضعیت آیتم" value={contract.appendixStatusBadge ?? 'متمم'} accent /> : null}
                  <DetailRow
                    label="ثبت در سامانه"
                    value={
                      <span className="contracts-datetime" dir="ltr">
                        {formatDateFa(contract.updatedAt, { withTime: true })}
                      </span>
                    }
                  />
                </section>

                <section className="contract-reference-panel">
                  <DetailRow label={isAppendix ? 'شماره قرارداد پایه' : 'شماره قرارداد'} value={subject.contractNumber || '—'} />
                  <DetailRow label="مبلغ قرارداد" value={formatCurrency(amount)} />
                  <div className="contract-reference-actions">
                    <span className="contract-reference-status-pill">
                      {isAppendix ? `متمم ${contract.appendixNumber?.toLocaleString('fa-IR') ?? ''}` : CONTRACT_TYPE_LABEL[subject.contractType] ?? subject.contractType}
                    </span>
                    <button
                      type="button"
                      className="contract-reference-edit-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isAppendix) {
                          router.push(detailsHref);
                          return;
                        }
                        onEdit(contract.id);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {isAppendix ? 'جزئیات' : 'ویرایش'}
                    </button>
                  </div>
                </section>
              </div>
            </div>

            <div className={`contract-reference-ribbon is-right${contract.status === 'completed' ? ' is-finalized' : ''}`}>{ribbons.right}</div>
          </article>
        );
      })}
    </div>
  );
}
