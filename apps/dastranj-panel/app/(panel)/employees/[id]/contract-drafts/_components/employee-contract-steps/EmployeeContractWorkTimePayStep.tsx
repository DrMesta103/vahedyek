'use client';

import { CalendarDays } from 'lucide-react';
import { WorkTimePayRulesSection } from '../../../../../business-settings/_components/PayrollBusinessSettingsFlow';
import { calculatePayrollValues, type PayrollSettings } from '../../../../../../lib/payroll-business-settings';
import {
  buildTemplateComparisonPayrollSettings,
  hasWorkTimePayRulesTemplateDiff,
  syncNightWorkTimesFromTenant,
} from '../../../../../../lib/employee-contract-compensation';
import type { ContractDraftTemplate } from '../../../../../../lib/contract-draft-templates';
import type { EmployeeContractDraft } from '../../../../../../lib/employee-contract-drafts';
import { EmployeeContractStepShell, SectionPlaceholder, TemplateDiffBanner } from './employee-contract-ui';

type Props = {
  workTimePayRules: PayrollSettings['workTimePayRules'] | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  financial: EmployeeContractDraft['financial'];
  tenantSettings: PayrollSettings;
  currentTemplate: ContractDraftTemplate | null;
  errors: Record<string, string>;
  onWorkTimePayRulesChange: (rules: PayrollSettings['workTimePayRules']) => void;
};

export function EmployeeContractWorkTimePayStep({
  workTimePayRules,
  templateSnapshot,
  financial,
  tenantSettings,
  currentTemplate,
  errors,
  onWorkTimePayRulesChange,
}: Props) {
  if (!workTimePayRules) return <SectionPlaceholder />;

  const templateComparisonSettings = templateSnapshot
    ? buildTemplateComparisonPayrollSettings(tenantSettings, templateSnapshot)
    : undefined;
  const syncedValue = syncNightWorkTimesFromTenant(workTimePayRules, tenantSettings);
  const settings: PayrollSettings = {
    ...tenantSettings,
    financial: {
      dailyBaseSalary: financial.dailyBaseSalary,
      dailyRequiredMinutes: financial.dailyRequiredMinutes,
    },
    workTimePayRules: syncedValue,
  };
  const hasTemplateDiff = templateComparisonSettings
    ? hasWorkTimePayRulesTemplateDiff(syncedValue, templateComparisonSettings.workTimePayRules, tenantSettings)
    : false;

  return (
    <EmployeeContractStepShell
      title="پرداخت زمان کاری"
      tag={templateSnapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
      description="اضافه‌کاری، شب‌کاری، قواعد روزهای خاص و روش ترکیب ضرایب را بر اساس قالب انتخاب‌شده تنظیم کنید."
      icon={<CalendarDays className="h-4 w-4" />}
    >
      {hasTemplateDiff ? (
        <TemplateDiffBanner message="قوانین پرداخت زمان کاری با قالب انتخاب‌شده متفاوت است." />
      ) : null}
      <WorkTimePayRulesSection
        embedded
        comparisonMode="template"
        settings={settings}
        baseSettings={templateComparisonSettings}
        nightWorkTenantSettings={tenantSettings}
        derived={calculatePayrollValues(settings)}
        errors={errors}
        nightWorkTimesReadOnly={Boolean(templateSnapshot)}
        businessSettingsHref={
          currentTemplate
            ? `/business-settings/payroll-attendance/tenant?year=${currentTemplate.baseSettingsYear}`
            : undefined
        }
        onChange={(nextRules) =>
          onWorkTimePayRulesChange(
            templateSnapshot ? syncNightWorkTimesFromTenant(nextRules, tenantSettings) : nextRules,
          )
        }
      />
    </EmployeeContractStepShell>
  );
}
