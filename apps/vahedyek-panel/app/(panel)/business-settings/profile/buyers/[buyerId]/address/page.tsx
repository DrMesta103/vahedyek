import { Suspense } from 'react';
import PanelLayout from '../../../../../../components/PanelLayout';
import { BuyerAddressPanel } from '../../../_components/BuyerAddressPanel';

export default function BuyerAddressPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BuyerAddressPanel />
      </Suspense>
    </PanelLayout>
  );
}
