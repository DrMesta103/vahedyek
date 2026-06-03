'use client';

import { Suspense } from 'react';
import PanelLayout from '../../../components/PanelLayout';
import { ContractFlowHub } from './_components/ContractFlowHub';

const NewContractHubPage = () => {
  return (
    <PanelLayout>
      <Suspense fallback={null}>
        <ContractFlowHub />
      </Suspense>
    </PanelLayout>
  );
};

export default NewContractHubPage;
