import { Suspense } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { ProjectPhysicalProgressSchedulesPanel } from '../../_components/ProjectPhysicalProgressSchedulesPanel';

export default function ProjectPhysicalProgressSchedulesPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <ProjectPhysicalProgressSchedulesPanel />
      </Suspense>
    </PanelLayout>
  );
}
