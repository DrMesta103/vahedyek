import PanelLayout from '../../../../../../../../../components/PanelLayout';
import { BusinessUnitForm } from '../../../../../../../_components/BusinessProjectPanel';

export default async function BusinessProjectUnitNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ blockId: string; floorId: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { blockId, floorId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <PanelLayout>
      <BusinessUnitForm blockId={blockId} floorId={floorId} category={resolvedSearchParams?.category} />
    </PanelLayout>
  );
}
