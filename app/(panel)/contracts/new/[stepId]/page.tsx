'use client';

import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { DiscountsStep } from '../_components/DiscountsStep';
import { FinancialStep } from '../_components/FinancialStep';
import { PartiesStep } from '../_components/PartiesStep';
import { PenaltiesStep } from '../_components/PenaltiesStep';
import { PlaceholderStep } from '../_components/PlaceholderStep';
import { SubjectStep } from '../_components/SubjectStep';

const STEP_CONFIG = {
  subject: {
    title: 'اطلاعات پایه',
    component: SubjectStep,
  },
  parties: {
    title: 'طرفین',
    component: PartiesStep,
  },
  financial: {
    title: 'اطلاعات مالی قرارداد',
    component: FinancialStep,
  },
  penalties: {
    title: 'جرایم',
    component: PenaltiesStep,
  },
  discounts: {
    title: 'تخفیف‌ها',
    component: DiscountsStep,
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
        <div className="p-8 text-center">مرحله موردنظر یافت نشد.</div>
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
