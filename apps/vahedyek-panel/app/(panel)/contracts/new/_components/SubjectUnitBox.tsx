'use client';

import { ExpandableTagGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';

export type SubjectUnitOption = {
  id: string;
  name: string;
  floorName: string;
  title: string;
  category: string;
  area: number | null;
  assignedToUnitId: string | null;
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

function UnitSelector({
  blocks,
  selectedBlock,
  selectedUnit,
  onBlockChange,
  onUnitChange,
}: {
  blocks: BlockOption[];
  selectedBlock: string;
  selectedUnit: string;
  onBlockChange: (id: string) => void;
  onUnitChange: (id: string) => void;
}) {
  const blockData = blocks.find((block) => block.id === selectedBlock);
  const selectableUnits = blockData?.units.filter((unit) => unit.category === 'unit') ?? [];
  const selectedUnitData = selectableUnits.find((unit) => unit.id === selectedUnit);

  return (
    <div className="space-y-4">
      <ExpandableTagGroup
        label="بلوک"
        items={blocks.map((block) => ({ id: block.id, name: block.name }))}
        selectedId={selectedBlock}
        onSelect={(id) => {
          onBlockChange(id);
          onUnitChange('');
        }}
        emptyText="بلوکی تعریف نشده است"
      />

      {blockData ? (
        <ExpandableTagGroup
          label="واحد"
          items={selectableUnits.map((unit) => ({ id: unit.id, name: unit.name, sub: unit.floorName }))}
          selectedId={selectedUnit}
          onSelect={onUnitChange}
          emptyText="واحدی در این بلوک وجود ندارد"
        />
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
    </div>
  );
}

export function SubjectUnitBox({
  blocks,
  selectedBlock,
  selectedUnit,
  onBlockChange,
  onUnitChange,
}: {
  blocks: BlockOption[];
  selectedBlock: string;
  selectedUnit: string;
  onBlockChange: (id: string) => void;
  onUnitChange: (id: string) => void;
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
        />
      </div>
    </SectionCard>
  );
}
