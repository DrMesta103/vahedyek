import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { EmployeeManagementPanel } from '../_components/EmployeeManagementPanel';

export default function NewEmployeePage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <EmployeeManagementPanel />
      </Suspense>
    </PanelLayout>
  );
}
