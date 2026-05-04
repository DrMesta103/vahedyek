import PanelLayout from '../../../../../../components/PanelLayout';
import { ProjectUnitTypeForm } from '../../../../_components/ProjectDetailPanels';

export default async function EditProjectUnitTypePage({ params }: { params: Promise<{ typeId: string }> }) {
  const { typeId } = await params;

  return (
    <PanelLayout>
      <ProjectUnitTypeForm typeId={typeId} />
    </PanelLayout>
  );
}
