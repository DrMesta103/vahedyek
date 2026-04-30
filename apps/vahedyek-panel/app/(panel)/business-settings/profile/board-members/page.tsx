import PanelLayout from '../../../../components/PanelLayout';
import { BusinessRepresentativesPanel } from '../_components/BusinessRepresentativesPanel';

export default function BusinessBoardMembersPage() {
  return (
    <PanelLayout>
      <BusinessRepresentativesPanel kind="board-member" />
    </PanelLayout>
  );
}
