import { Suspense } from 'react';
import PanelLayout from '../../components/PanelLayout';
import { BusinessShareholdersPanel } from '../business-settings/profile/_components/BusinessShareholdersPanel';

export default function CustomersPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholdersPanel entity="customer" />
      </Suspense>
    </PanelLayout>
  );
}
