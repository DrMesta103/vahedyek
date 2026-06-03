'use client';

import type { EmployeeContractDraft, EmployeeMissionRule } from '../../../../../../lib/employee-contract-drafts';
import type { PayrollDerivedValues } from '../../../../../../lib/payroll-business-settings';
import { MissionStep } from './MissionStep';

type Props = {
  mission: NonNullable<EmployeeContractDraft['mission']> | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  derived: PayrollDerivedValues;
  onMissionChange: (patch: Partial<NonNullable<EmployeeContractDraft['mission']>>) => void;
  onEditRule: (rule: EmployeeMissionRule) => void;
  onDeleteRule: (rule: EmployeeMissionRule) => void;
  onAddRule: () => void;
};

export function EmployeeContractMissionStep({
  mission,
  templateSnapshot,
  derived,
  onMissionChange,
  onEditRule,
  onDeleteRule,
  onAddRule,
}: Props) {
  return (
    <MissionStep
      mission={mission}
      baseMission={templateSnapshot?.mission ?? null}
      derived={derived}
      comparisonMode={templateSnapshot ? 'template' : undefined}
      comparisonReferenceWord="قالب"
      exclusiveLabel="این قرارداد"
      tag={templateSnapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
      description="قوانین پرداخت ماموریت را برای این قرارداد تنظیم کنید."
      onMissionChange={onMissionChange}
      onEditRule={onEditRule}
      onDeleteRule={onDeleteRule}
      onAddRule={onAddRule}
      showEnabledToggle={false}
    />
  );
}
