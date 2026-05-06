import { notFound } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import { BuyerCancellationDetailPanel } from '../../../_components/BuyerCancellationDetailPanel';

const VALID_SECTION_IDS = ['late-delivery', 'specification-changes', 'breach-of-obligations', 'area-discrepancy', 'notification', 'draft-template-usage'] as const;

export default async function BuyerCancellationSectionPage({
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
      <BuyerCancellationDetailPanel key={sectionId} sectionId={sectionId as (typeof VALID_SECTION_IDS)[number]} />
    </PanelLayout>
  );
}
