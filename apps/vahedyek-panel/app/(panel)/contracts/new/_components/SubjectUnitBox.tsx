'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Building2, ExternalLink, Home, Layers3, X } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ExpandableTagGroup } from '@repo/ui';
import { SectionCard } from './ContractFormPrimitives';

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

type FloorShortcut = {
  id: string;
  name: string;
  unitCount: number;
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
            <p className="mt-2 text-[12px] font-semibold text-slate-500">وضعیت قرارداد: {toStatusLabel(lockedUnit.lockedByStatus)}</p>
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const blockManagementHref = selectedBlock ? `/business-settings/project/blocks/${selectedBlock}` : '/business-settings/project/blocks';
  const selectedBlockData = blocks.find((block) => block.id === selectedBlock) ?? null;
  const [unitShortcutOpen, setUnitShortcutOpen] = useState(false);
  const [floors, setFloors] = useState<FloorShortcut[]>([]);
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [floorsError, setFloorsError] = useState('');
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const openUnitShortcut = async () => {
    if (!selectedBlock) return;

    setFloorsLoading(true);
    setFloorsError('');

    try {
      const response = await fetch(`/api/business-settings/project/blocks/${selectedBlock}/floors`, { cache: 'no-store' });
      const data = (await response.json().catch(() => ({}))) as {
        floors?: FloorShortcut[];
        message?: string;
      };
      if (!response.ok) throw new Error(data.message ?? 'دریافت طبقات بلوک انجام نشد.');
      const nextFloors = Array.isArray(data.floors) ? data.floors : [];
      setFloors(nextFloors);
      if (nextFloors.length === 1) {
        window.location.href = `/business-settings/project/blocks/${selectedBlock}/floors/${nextFloors[0].id}/units/new?category=unit&returnTo=${encodeURIComponent(returnTo)}`;
        setUnitShortcutOpen(false);
        return;
      }
      setUnitShortcutOpen(true);
    } catch (error) {
      setFloors([]);
      setFloorsError(error instanceof Error ? error.message : 'دریافت طبقات بلوک انجام نشد.');
      setUnitShortcutOpen(true);
    } finally {
      setFloorsLoading(false);
    }
  };

  return (
    <SectionCard>
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">انتخاب واحد</p>
            <p className="mt-0.5 text-[13px] text-slate-500">ابتدا بلوک، سپس واحد مورد نظر را انتخاب کنید</p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={`/business-settings/project/blocks/new?returnTo=${encodeURIComponent(returnTo)}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[12px] font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/50 hover:text-cyan-800"
            >
              <Building2 className="h-4 w-4" />
              <span>افزودن بلوک / مجتمع</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => void openUnitShortcut()}
              disabled={!selectedBlock}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-[12px] font-bold transition ${
                selectedBlock
                  ? 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50 hover:text-cyan-800'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              <Layers3 className="h-4 w-4" />
              <span>{selectedBlock ? 'افزودن واحد برای این بلوک' : 'ابتدا یک بلوک انتخاب کنید'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

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

      {unitShortcutOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" dir="rtl" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-[16px] font-black text-slate-900">
                  {selectedBlockData ? `افزودن واحد برای ${selectedBlockData.name}` : 'مدیریت بلوک و واحدها'}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  طبقه مقصد را انتخاب کنید تا فرم افزودن واحد برای همان طبقه باز شود.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUnitShortcutOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {floorsLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600">
                  در حال دریافت طبقات بلوک...
                </div>
              ) : floorsError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-bold text-rose-700">{floorsError}</div>
              ) : floors.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {floors.map((floor) => (
                    <Link
                      key={floor.id}
                      href={`/business-settings/project/blocks/${selectedBlock}/floors/${floor.id}/units/new?category=unit&returnTo=${encodeURIComponent(returnTo)}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-black text-slate-900">{floor.name}</div>
                          <div className="mt-1 text-[12px] text-slate-500">
                            {floor.unitCount.toLocaleString('fa-IR')} واحد ثبت‌شده
                          </div>
                        </div>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                          <Home className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  برای این بلوک هنوز طبقه‌ای ثبت نشده است. ابتدا طبقه را بسازید تا فرم افزودن واحد باز شود.
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <Link
                href={`/business-settings/project/blocks/${selectedBlock}/floors/new`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[12px] font-bold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/50 hover:text-cyan-800"
              >
                <Building2 className="h-4 w-4" />
                <span>افزودن طبقه برای این بلوک</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
