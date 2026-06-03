import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { ContractFlowHub } from '../../contracts/new/_components/ContractFlowHub';

const DraftTemplateNewPage = () => {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <ContractFlowHub />
      </Suspense>
    </PanelLayout>
  );
};

export default DraftTemplateNewPage;
