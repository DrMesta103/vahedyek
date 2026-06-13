'use client';

import type { EmployeeContractDraft, EmployeeMissionRule } from '../../../../../../lib/employee-contract-drafts';
import type { PayrollDerivedValues } from '../../../../../../lib/payroll-business-settings';
import { formatComparisonBaseLabel } from '../../../../../../lib/employee-draft-comparison';
import { MissionStep } from './MissionStep';

type Props = {
  mission: NonNullable<EmployeeContractDraft['mission']> | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  comparisonBaseSnapshot?: EmployeeContractDraft['comparisonBaseSettingsSnapshot'];
  comparisonBaseYear?: number | null;
  derived: PayrollDerivedValues;
  onMissionChange: (patch: Partial<NonNullable<EmployeeContractDraft['mission']>>) => void;
  onEditRule: (rule: EmployeeMissionRule) => void;
  onDeleteRule: (rule: EmployeeMissionRule) => void;
  onAddRule: () => void;
};

export function EmployeeContractMissionStep({
  mission,
  templateSnapshot,
  comparisonBaseSnapshot,
  comparisonBaseYear,
  derived,
  onMissionChange,
  onEditRule,
  onDeleteRule,
  onAddRule,
}: Props) {
  const baseLabel = comparisonBaseYear ? formatComparisonBaseLabel(comparisonBaseYear) : 'مبنای تنظیمات';

  return (
    <MissionStep
      mission={mission}
      baseMission={templateSnapshot?.mission ?? null}
      secondaryBaseMission={comparisonBaseSnapshot?.mission ?? null}
      derived={derived}
      comparisonMode={templateSnapshot ? 'template' : undefined}
      secondaryComparisonMode={comparisonBaseSnapshot ? 'tenant_base' : undefined}
      secondaryComparisonReferenceWord={baseLabel}
      comparisonReferenceWord="قالب"
      exclusiveLabel="این قرارداد"
      tag={templateSnapshot ? 'قالب انتخاب‌شده' : comparisonBaseSnapshot ? 'مبنای تنظیمات' : 'بدون قالب'}
      description="قوانین پرداخت ماموریت را برای این قرارداد تنظیم کنید."
      onMissionChange={onMissionChange}
      onEditRule={onEditRule}
      onDeleteRule={onDeleteRule}
      onAddRule={onAddRule}
      showEnabledToggle={false}
    />
  );
}
