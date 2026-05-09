'use client';

import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { ContractFlowExitBackBar } from '../_components/ContractFlowExitBackBar';
import { ContractFlowStepContent } from '../_components/ContractFlowStepContent';

const ContractStepPage = () => {
  const params = useParams();
  const stepId = params.stepId as string;

  return (
    <PanelLayout>
      <ContractFlowExitBackBar layout="page" />
      <ContractFlowStepContent stepId={stepId} />
    </PanelLayout>
  );
};

export default ContractStepPage;
