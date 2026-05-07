import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { BusinessShareholderEditorPanel } from '../../business-settings/profile/_components/BusinessShareholderEditorPanel';

export default async function CustomerEditPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;

  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessShareholderEditorPanel shareholderId={customerId} entity="customer" />
      </Suspense>
    </PanelLayout>
  );
}
