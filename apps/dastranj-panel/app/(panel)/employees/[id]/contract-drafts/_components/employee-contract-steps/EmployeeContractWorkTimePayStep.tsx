'use client';

import { CalendarDays } from 'lucide-react';
import { WorkTimePayRulesSection } from '../../../../../business-settings/_components/PayrollBusinessSettingsFlow';
import { calculatePayrollValues, type PayrollSettings } from '../../../../../../lib/payroll-business-settings';
import {
  buildTemplateComparisonPayrollSettings,
  hasWorkTimePayRulesTemplateDiff,
  syncNightWorkTimesFromTenant,
} from '../../../../../../lib/employee-contract-compensation';
import { buildComparisonBasePayrollSettings } from '../../../../../../lib/employee-draft-comparison';
import type { ContractDraftTemplate } from '../../../../../../lib/contract-draft-templates';
import type { EmployeeContractDraft } from '../../../../../../lib/employee-contract-drafts';
import { EmployeeContractStepShell, SectionPlaceholder, TemplateDiffBanner, TenantBaseDiffBanner } from './employee-contract-ui';

type Props = {
  workTimePayRules: PayrollSettings['workTimePayRules'] | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  comparisonBaseSnapshot?: EmployeeContractDraft['comparisonBaseSettingsSnapshot'];
  comparisonBaseYear?: number | null;
  financial: EmployeeContractDraft['financial'];
  tenantSettings: PayrollSettings;
  currentTemplate: ContractDraftTemplate | null;
  errors: Record<string, string>;
  onWorkTimePayRulesChange: (rules: PayrollSettings['workTimePayRules']) => void;
};

export function EmployeeContractWorkTimePayStep({
  workTimePayRules,
  templateSnapshot,
  comparisonBaseSnapshot,
  comparisonBaseYear,
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
  const tenantBaseComparisonSettings = comparisonBaseSnapshot
    ? buildComparisonBasePayrollSettings(tenantSettings, comparisonBaseSnapshot)
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
  const hasTenantBaseDiff = tenantBaseComparisonSettings
    ? hasWorkTimePayRulesTemplateDiff(syncedValue, tenantBaseComparisonSettings.workTimePayRules, tenantSettings)
    : false;

  return (
    <EmployeeContractStepShell
      title="پرداخت زمان کاری"
      tag={templateSnapshot ? 'قالب انتخاب‌شده' : comparisonBaseSnapshot ? 'مبنای تنظیمات' : 'بدون قالب'}
      description="اضافه‌کاری، شب‌کاری، قواعد روزهای خاص و روش ترکیب ضرایب را بر اساس مبنای انتخاب‌شده تنظیم کنید."
      icon={<CalendarDays className="h-4 w-4" />}
    >
      {hasTemplateDiff ? (
        <TemplateDiffBanner message="قوانین پرداخت زمان کاری با قالب انتخاب‌شده متفاوت است." />
      ) : null}
      {hasTenantBaseDiff && comparisonBaseYear ? (
        <TenantBaseDiffBanner
          baseYear={comparisonBaseYear}
          message={`قوانین پرداخت زمان کاری با ${comparisonBaseSnapshot?.name ?? 'مبنای تنظیمات'} متفاوت است.`}
        />
      ) : null}
      <WorkTimePayRulesSection
        embedded
        comparisonMode="template"
        settings={settings}
        baseSettings={templateComparisonSettings}
        secondaryComparisonMode={comparisonBaseSnapshot ? 'tenant_base' : undefined}
        secondaryBaseSettings={tenantBaseComparisonSettings}
        secondaryComparisonYear={comparisonBaseYear ?? undefined}
        nightWorkTenantSettings={tenantSettings}
        derived={calculatePayrollValues(settings)}
        errors={errors}
        nightWorkTimesReadOnly={Boolean(templateSnapshot)}
        businessSettingsHref={
          currentTemplate
            ? `/business-settings/payroll-attendance/tenant?year=${currentTemplate.baseSettingsYear}`
            : comparisonBaseYear
              ? `/business-settings/payroll-attendance/tenant?year=${comparisonBaseYear}`
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
