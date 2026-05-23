import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { ProjectPhysicalProgressScheduleForm } from '../../../_components/ProjectPhysicalProgressScheduleForm';

export default function NewProjectPhysicalProgressSchedulePage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <ProjectPhysicalProgressScheduleForm />
      </Suspense>
    </PanelLayout>
  );
}
