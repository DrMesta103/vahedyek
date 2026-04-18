
'use client';

import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { SubjectStep } from '../_components/SubjectStep';
import { FinancialStep } from '../_components/FinancialStep';
import { PlaceholderStep } from '../_components/PlaceholderStep';

// We can expand this config as we implement more steps
const STEP_CONFIG = {
  subject: {
    title: 'اطلاعات پایه',
    component: SubjectStep,
  },
  financial: {
    title: 'اطلاعات مالی قرارداد',
    component: FinancialStep,
  },
  'party-one': {
    title: 'طرف اول',
    component: PlaceholderStep,
  },
  'party-two': {
    title: 'طرف دوم',
    component: PlaceholderStep,
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
    // Or show a 404 not found page
    return (
        <PanelLayout>
            <div className="text-center p-8">مرحله مورد نظر یافت نشد.</div>
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
