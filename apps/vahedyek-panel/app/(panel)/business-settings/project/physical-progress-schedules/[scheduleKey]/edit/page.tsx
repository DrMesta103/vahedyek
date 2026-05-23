import { Suspense } from 'react';
import PanelLayout from '../../../../../../components/PanelLayout';
import { ProjectPhysicalProgressScheduleForm } from '../../../../_components/ProjectPhysicalProgressScheduleForm';

export default async function EditProjectPhysicalProgressSchedulePage({ params }: { params: Promise<{ scheduleKey: string }> }) {
  const { scheduleKey } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <ProjectPhysicalProgressScheduleForm scheduleKey={scheduleKey} />
      </Suspense>
    </PanelLayout>
  );
}
