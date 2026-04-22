'use client';

import { ExpandableTagGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';

type BlockOption = {
  id: string;
  name: string;
  units: Array<{
    id: string;
    name: string;
    floorName: string;
    title: string;
    category: string;
    area: number | null;
    assignedToUnitId: string | null;
  }>;
};

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
          items={blockData.units.map((unit) => ({ id: unit.id, name: unit.name, sub: unit.floorName }))}
          selectedId={selectedUnit}
          onSelect={onUnitChange}
          emptyText="واحدی در این بلوک وجود ندارد"
        />
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
