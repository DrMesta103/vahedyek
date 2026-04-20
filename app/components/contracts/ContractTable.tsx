'use client';

import { Building2, CircleAlert, UserRound } from 'lucide-react';
import type { Block, Contract, Unit } from '../../types/contract';

interface ContractTableProps {
  contracts: Contract[];
  blocks: Block[];
  units: Unit[];
  onEdit: (id: string) => void;
  loading?: boolean;
}

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  'pre-sale': 'پیش‌فروش',
};

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}

export default function ContractTable({ contracts, blocks, units, onEdit, loading = false }: ContractTableProps) {
  const blockMap = new Map(blocks.map((block) => [block.id, block.name]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        <i className="fa fa-spinner fa-spin mb-3 block text-3xl"></i>
        <p className="text-sm">در حال دریافت فهرست قراردادها...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <i className="fa fa-file-invoice mb-3 block text-4xl text-gray-300"></i>
        <p className="text-sm">قراردادی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {contracts.map((contract) => {
        const { subject, parties, financial } = contract.data;
        const blockName = blockMap.get(subject.blockId) ?? '—';
        const unit = unitMap.get(subject.unitId);
        const primaryPartyOne = parties.partyOne.find((party) => party.isPrimary) ?? parties.partyOne[0];
        const partyOneNames = parties.partyOne.map((party) => party.name);
        const partyTwoNames = parties.partyTwo.map((party) => party.name);
        const amount =
          financial?.pricingType === 'metered'
            ? Number(financial.totalArea || 0) * Number(financial.pricePerMeter || 0)
            : Number(financial?.fixedTotalAmount || 0);

        return (
          <article
            key={contract.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-teal-400 hover:shadow-md"
          >
            <div className="flex">
              <div className="flex w-9 items-center justify-center bg-amber-500 px-2 py-6 text-center text-xs font-bold text-white [writing-mode:vertical-rl] [transform:rotate(180deg)]">
                {contract.status === 'draft' ? 'پیش‌نویس' : 'نهایی'}
              </div>

              <div className="flex-1 p-5 text-gray-700">
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {blockName}
                    </span>
                    <span>
                      طبقه <b className="font-bold text-gray-800">{unit?.floorName ?? '—'}</b>
                    </span>
                    <span>
                      واحد <b className="font-bold text-gray-800">{unit?.name ?? subject.unitId ?? '—'}</b>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                      <CircleAlert className="h-3.5 w-3.5" />
                      {contract.status === 'draft' ? 'نیازمند تکمیل' : 'ثبت شده'}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <span>طرف اصلی: {primaryPartyOne?.name ?? '—'}</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-600">
                        <UserRound className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  <div className="space-y-3">
                    <RowItem label="شماره قرارداد:" value={subject.contractNumber || '—'} />
                    <RowItem label="مبلغ قرارداد:" value={amount ? `${Math.round(amount).toLocaleString('en-US')} تومان` : '—'} />
                  </div>

                  <div className="space-y-3">
                    <RowItem label="انعقاد قرارداد:" value={subject.contractDate || '—'} />
                    <RowItem label="تحویل واحد:" value={subject.deliveryDate || '—'} />
                  </div>

                  <div className="space-y-3">
                    {partyTwoNames.length ? (
                      partyTwoNames.slice(0, 2).map((name) => (
                        <div key={name} className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm font-semibold text-gray-800">{name}</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-600">
                            <UserRound className="h-4 w-4" />
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm font-semibold text-gray-400">طرف دومی ثبت نشده</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {CONTRACT_TYPE_LABEL[subject.contractType] ?? subject.contractType}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                      {parties.partyOne.length} طرف اول
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                      {parties.partyTwo.length} طرف دوم
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEdit(contract.id)}
                    className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    ویرایش
                  </button>
                </div>
              </div>

              <div className="flex w-9 items-center justify-center bg-amber-500 px-2 py-6 text-center text-xs font-bold text-white [writing-mode:vertical-rl]">
                {contract.status === 'draft' ? 'قابل ویرایش' : 'ثبت شده'}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
