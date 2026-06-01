'use client';

import { DiscountsStep } from './DiscountsStep';
import { FinancialStep } from './FinancialStep';
import { PartiesStep } from './PartiesStep';
import { PenaltiesStep } from './PenaltiesStep';
import { PlaceholderStep } from './PlaceholderStep';
import { SubjectStep } from './SubjectStep';
import { TerminationStep } from './TerminationStep';
import { ContractRuleDraftStep } from './ContractRuleDraftStep';

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
  interest: {
    title: 'سود دریافتی',
    component: (props: { stepId: string; title: string }) => (
      <ContractRuleDraftStep stepId="interest" ruleId="interest" title={props.title} />
    ),
  },
  forgiveness: {
    title: 'بخشودگی',
    component: (props: { stepId: string; title: string }) => (
      <ContractRuleDraftStep stepId="forgiveness" ruleId="forgiveness" title={props.title} />
    ),
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
    component: TerminationStep,
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

export type ContractStepId = keyof typeof STEP_CONFIG;

export function ContractFlowStepContent({ stepId }: { stepId: string }) {
  const stepInfo = STEP_CONFIG[stepId as ContractStepId];

  if (!stepInfo) {
    return <div className="p-8 text-center">مرحله موردنظر یافت نشد.</div>;
  }

  const StepComponent = stepInfo.component;
  return <StepComponent stepId={stepId} title={stepInfo.title} />;
}
