'use client';

import type { EmployeeMissionRule } from '../../../../../../lib/employee-contract-drafts';
import { MissionRuleDialog } from './MissionStep';

export function EmployeeMissionRuleDialog({
  open,
  initialRule,
  monthlyBaseSalary,
  grossPay,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialRule: EmployeeMissionRule | null;
  monthlyBaseSalary: number;
  grossPay: number;
  onClose: () => void;
  onSubmit: (rule: EmployeeMissionRule) => void;
}) {
  return (
    <MissionRuleDialog
      open={open}
      initialRule={initialRule}
      monthlyBaseSalary={monthlyBaseSalary}
      grossPay={grossPay}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
