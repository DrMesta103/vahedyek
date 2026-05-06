import { notFound } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import { BuilderPenaltyDetailPanel } from '../../../_components/BuilderPenaltyDetailPanel';

const VALID_SECTION_IDS = ['unit-delivery-delay', 'material-specs-change', 'area-difference'] as const;

export default async function BuilderPenaltySectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;

  if (!VALID_SECTION_IDS.includes(sectionId as (typeof VALID_SECTION_IDS)[number])) {
    notFound();
  }

  return (
    <PanelLayout>
      <BuilderPenaltyDetailPanel key={sectionId} sectionId={sectionId as (typeof VALID_SECTION_IDS)[number]} />
    </PanelLayout>
  );
}
