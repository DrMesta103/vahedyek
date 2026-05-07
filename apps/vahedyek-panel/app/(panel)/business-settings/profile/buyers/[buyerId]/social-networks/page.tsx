import { Suspense } from 'react';
import PanelLayout from '../../../../../../components/PanelLayout';
import { BuyerSocialNetworksPanel } from '../../../_components/BuyerSocialNetworksPanel';

export default function BuyerSocialNetworksPage() {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <BuyerSocialNetworksPanel />
      </Suspense>
    </PanelLayout>
  );
}
