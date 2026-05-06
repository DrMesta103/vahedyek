import { notFound } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import { BuilderCancellationDetailPanel } from '../../../_components/BuilderCancellationDetailPanel';

const VALID_SECTION_IDS = [
  'late-installment',
  'financial-obligations',
  'document-deficiencies',
  'other-breach',
  'notifications',
] as const;

export default async function BuilderCancellationSectionPage({
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
      <BuilderCancellationDetailPanel key={sectionId} sectionId={sectionId as (typeof VALID_SECTION_IDS)[number]} />
    </PanelLayout>
  );
}
