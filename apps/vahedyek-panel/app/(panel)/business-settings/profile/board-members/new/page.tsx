import { Suspense } from 'react';
import PanelLayout from '../../../../../components/PanelLayout';
import { BusinessRepresentativePickerPanel } from '../../_components/BusinessRepresentativePickerPanel';

export default function BusinessBoardMemberNewPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BusinessRepresentativePickerPanel mode="board-member" />
      </Suspense>
    </PanelLayout>
  );
}
