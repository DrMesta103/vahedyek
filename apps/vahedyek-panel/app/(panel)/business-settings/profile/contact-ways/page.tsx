import PanelLayout from '../../../../components/PanelLayout';
import { BusinessContactWaysPanel } from '../_components/BusinessContactWaysPanel';

export const dynamic = 'force-dynamic';

export default function BusinessContactWaysPage() {
  return (
    <PanelLayout>
      <BusinessContactWaysPanel />
    </PanelLayout>
  );
}
