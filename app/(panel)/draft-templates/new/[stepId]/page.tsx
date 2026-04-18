'use client';

import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { ContractFlowStepContent } from '../../../contracts/new/_components/ContractFlowStepContent';

const DraftTemplateStepPage = () => {
  const params = useParams();
  const stepId = params.stepId as string;

  return (
    <PanelLayout>
      <ContractFlowStepContent stepId={stepId} />
    </PanelLayout>
  );
};

export default DraftTemplateStepPage;
