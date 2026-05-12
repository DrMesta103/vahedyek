'use client';

import { useMemo, useState } from 'react';
import { ExpandableTagGroup } from '@repo/ui';
import { SectionCard, SectionHeader } from './ContractFormPrimitives';

export type SubjectUnitOption = {
  id: string;
  name: string;
  floorName: string;
  title: string;
  category: string;
  area: number | null;
  assignedToUnitId: string | null;
  isLocked: boolean;
  lockedByDraftId: string | null;
  lockedByContractNumber: string | null;
  lockedByStatus: 'draft' | 'pending_approval' | 'completed' | null;
};

type BlockOption = {
  id: string;
  name: string;
  units: SubjectUnitOption[];
};

function toCategoryLabel(category: string) {
  switch (category) {
    case 'unit':
      return 'واحد';
    case 'parking':
      return 'پارکینگ';
    case 'storage':
      return 'انباری';
    case 'amenity':
      return 'فضای خدماتی';
    default:
      return category || 'نامشخص';
  }
}

function toStatusLabel(status: SubjectUnitOption['lockedByStatus']) {
  switch (status) {
    case 'completed':
      return 'تکمیل‌شده';
    case 'pending_approval':
      return 'در انتظار تایید';
    default:
      return 'پیش‌نویس';
  }
}

function UnitSelector({
  blocks,
  selectedBlock,
  selectedUnit,
  onBlockChange,
  onUnitChange,
  blockInvalid = false,
  unitInvalid = false,
}: {
  blocks: BlockOption[];
  selectedBlock: string;
  selectedUnit: string;
  onBlockChange: (id: string) => void;
  onUnitChange: (id: string) => void;
  blockInvalid?: boolean;
  unitInvalid?: boolean;
}) {
  const blockData = blocks.find((block) => block.id === selectedBlock);
  const selectableUnits = blockData?.units.filter((unit) => unit.category === 'unit') ?? [];
  const selectedUnitData = selectableUnits.find((unit) => unit.id === selectedUnit);
  const [lockedUnitDialogId, setLockedUnitDialogId] = useState<string | null>(null);
  const lockedUnit = useMemo(
    () => selectableUnits.find((unit) => unit.id === lockedUnitDialogId) ?? null,
    [lockedUnitDialogId, selectableUnits],
  );

  return (
    <div className="space-y-4">
      <div className={`space-y-2 ${blockInvalid ? 'rounded-xl border border-rose-300 bg-rose-50/40 p-2' : ''}`}>
        <ExpandableTagGroup
          label="بلوک"
          required
          items={blocks.map((block) => ({ id: block.id, name: block.name }))}
          selectedId={selectedBlock}
          onSelect={(id) => {
            onBlockChange(id);
            onUnitChange('');
          }}
          emptyText="بلوکی وجود ندارد"
          itemsPerRow={8}
        />
      </div>

      {blockData ? (
        <div className={`space-y-2 ${unitInvalid ? 'rounded-xl border border-rose-300 bg-rose-50/40 p-2' : ''}`}>
          <ExpandableTagGroup
            label="واحد"
            required
            items={selectableUnits.map((unit) => ({
              id: unit.id,
              name: unit.name,
              sub: unit.isLocked ? `${unit.floorName} · ثبت‌شده` : unit.floorName,
              disabled: unit.isLocked,
            }))}
            selectedId={selectedUnit}
            onSelect={onUnitChange}
            onDisabledSelect={setLockedUnitDialogId}
            emptyText="واحدی یافت نشد"
            itemsPerRow={8}
          />
        </div>
      ) : null}

      {selectedUnitData ? (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-cyan-700">اطلاعات واحد انتخاب‌شده</p>
              <h3 className="mt-1 text-[15px] font-bold text-slate-800">{selectedUnitData.title}</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-cyan-700 shadow-sm">
              {toCategoryLabel(selectedUnitData.category)}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-400">بلوک</div>
              <div className="mt-1 text-[13px] font-bold text-slate-700">{blockData?.name ?? '—'}</div>
            </div>
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-400">طبقه</div>
              <div className="mt-1 text-[13px] font-bold text-slate-700">{selectedUnitData.floorName || '—'}</div>
            </div>
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-400">شماره / نام واحد</div>
              <div className="mt-1 text-[13px] font-bold text-slate-700">{selectedUnitData.name || '—'}</div>
            </div>
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-400">متراژ</div>
              <div className="mt-1 text-[13px] font-bold text-slate-700">
                {selectedUnitData.area != null ? `${selectedUnitData.area.toLocaleString('fa-IR')} متر مربع` : 'ثبت نشده'}
              </div>
            </div>
          </div>

          {selectedUnitData.assignedToUnitId ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700">
              این واحد به یک رکورد دیگر متصل است: <span className="font-bold">{selectedUnitData.assignedToUnitId}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {lockedUnit ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" dir="rtl" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-5 text-right shadow-2xl">
            <h3 className="text-[16px] font-black text-slate-900">واحد غیرقابل انتخاب است</h3>
            <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-600">
              این واحد برای قرارداد شماره <span className="font-black text-slate-900">{lockedUnit.lockedByContractNumber || '—'}</span> ثبت شده است.
            </p>
            <p className="mt-2 text-[12px] font-semibold text-slate-500">
              وضعیت قرارداد: {toStatusLabel(lockedUnit.lockedByStatus)}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setLockedUnitDialogId(null)}
                className="rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] px-5 py-2 text-[12px] font-black text-white transition hover:brightness-105"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SubjectUnitBox({
  blocks,
  selectedBlock,
  selectedUnit,
  onBlockChange,
  onUnitChange,
  blockInvalid = false,
  unitInvalid = false,
}: {
  blocks: BlockOption[];
  selectedBlock: string;
  selectedUnit: string;
  onBlockChange: (id: string) => void;
  onUnitChange: (id: string) => void;
  blockInvalid?: boolean;
  unitInvalid?: boolean;
}) {
  return (
    <SectionCard>
      <SectionHeader label="انتخاب واحد" description="ابتدا بلوک، سپس واحد مورد نظر را انتخاب کنید" />
      <div className="p-5">
        <UnitSelector
          blocks={blocks}
          selectedBlock={selectedBlock}
          selectedUnit={selectedUnit}
          onBlockChange={onBlockChange}
          onUnitChange={onUnitChange}
          blockInvalid={blockInvalid}
          unitInvalid={unitInvalid}
        />
      </div>
    </SectionCard>
  );
}
