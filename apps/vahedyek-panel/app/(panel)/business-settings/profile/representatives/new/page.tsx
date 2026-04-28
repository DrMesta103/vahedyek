import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessRepresentativePickerPanel } from '../../_components/BusinessRepresentativePickerPanel';

export default function BusinessRepresentativeNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessRepresentativePickerPanel />
      </Suspense>
    </PanelLayout>
  );
}
