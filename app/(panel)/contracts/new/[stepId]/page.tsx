'use client';

import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { SubjectStep } from '../_components/SubjectStep';
import { FinancialStep } from '../_components/FinancialStep';
import { PartiesStep } from '../_components/PartiesStep';
import { PlaceholderStep } from '../_components/PlaceholderStep';

const STEP_CONFIG = {
  subject: {
    title: 'اطلاعات پایه',
    component: SubjectStep,
  },
  financial: {
    title: 'اطلاعات مالی قرارداد',
    component: FinancialStep,
  },
  parties: {
    title: 'طرفین',
    component: PartiesStep,
  },
  'party-one': {
    title: 'طرفین',
    component: PartiesStep,
  },
  'party-two': {
    title: 'طرفین',
    component: PartiesStep,
  },
  termination: {
    title: 'شرایط فسخ',
    component: PlaceholderStep,
  },
  review: {
    title: 'نمایش کلی جزئیات',
    component: PlaceholderStep,
  },
  final: {
    title: 'تایید نهایی قرارداد',
    component: PlaceholderStep,
  },
};

type StepId = keyof typeof STEP_CONFIG;

const ContractStepPage = () => {
  const params = useParams();
  const stepId = params.stepId as StepId;

  const stepInfo = STEP_CONFIG[stepId];

  if (!stepInfo) {
    return (
      <PanelLayout>
        <div className="p-8 text-center">مرحله مورد نظر یافت نشد.</div>
      </PanelLayout>
    );
  }

  const StepComponent = stepInfo.component;

  return (
    <PanelLayout>
      <StepComponent stepId={stepId} title={stepInfo.title} />
    </PanelLayout>
  );
};

export default ContractStepPage;
