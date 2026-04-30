import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessRepresentativePickerPanel } from '../../_components/BusinessRepresentativePickerPanel';

export default function BusinessPartnerNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessRepresentativePickerPanel mode="partner" />
      </Suspense>
    </PanelLayout>
  );
}
