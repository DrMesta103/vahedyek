'use client';

import { CalendarDays } from 'lucide-react';
import { LeaveSection } from '../../../../../business-settings/_components/PayrollBusinessSettingsFlow';
import { type PayrollSettings } from '../../../../../../lib/payroll-business-settings';
import { buildTemplateComparisonPayrollSettings } from '../../../../../../lib/employee-contract-compensation';
import { buildComparisonBasePayrollSettings } from '../../../../../../lib/employee-draft-comparison';
import type { EmployeeContractDraft } from '../../../../../../lib/employee-contract-drafts';
import { EmployeeContractStepShell, SectionPlaceholder, TemplateDiffBanner, TenantBaseDiffBanner } from './employee-contract-ui';

type Props = {
  leave: PayrollSettings['leave'] | undefined;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  comparisonBaseSnapshot?: EmployeeContractDraft['comparisonBaseSettingsSnapshot'];
  comparisonBaseYear?: number | null;
  financial: EmployeeContractDraft['financial'];
  tenantSettings: PayrollSettings;
  errors: Record<string, string>;
  onLeaveChange: (leave: PayrollSettings['leave']) => void;
};

export function EmployeeContractLeaveStep({
  leave,
  templateSnapshot,
  comparisonBaseSnapshot,
  comparisonBaseYear,
  financial,
  tenantSettings,
  errors,
  onLeaveChange,
}: Props) {
  if (!leave) return <SectionPlaceholder />;

  const templateComparisonSettings = templateSnapshot
    ? buildTemplateComparisonPayrollSettings(tenantSettings, templateSnapshot)
    : undefined;
  const tenantBaseComparisonSettings = comparisonBaseSnapshot
    ? buildComparisonBasePayrollSettings(tenantSettings, comparisonBaseSnapshot)
    : undefined;
  const settings: PayrollSettings = {
    ...tenantSettings,
    financial: {
      dailyBaseSalary: financial.dailyBaseSalary,
      dailyRequiredMinutes: financial.dailyRequiredMinutes,
    },
    leave,
  };
  const hasTemplateDiff = templateComparisonSettings
    ? JSON.stringify(templateComparisonSettings.leave) !== JSON.stringify(leave)
    : false;
  const hasTenantBaseDiff = tenantBaseComparisonSettings
    ? JSON.stringify(tenantBaseComparisonSettings.leave) !== JSON.stringify(leave)
    : false;

  return (
    <EmployeeContractStepShell
      title="مرخصی"
      tag={templateSnapshot ? 'قالب انتخاب‌شده' : comparisonBaseSnapshot ? 'مبنای تنظیمات' : 'بدون قالب'}
      description="سهمیه، انتقال، ابطال و تسویه مرخصی ذخیره‌شده را بر اساس مبنای انتخاب‌شده تنظیم کنید."
      icon={<CalendarDays className="h-4 w-4" />}
    >
      {hasTemplateDiff ? <TemplateDiffBanner message="قوانین مرخصی با قالب انتخاب‌شده متفاوت است." /> : null}
      {hasTenantBaseDiff && comparisonBaseYear ? (
        <TenantBaseDiffBanner
          baseYear={comparisonBaseYear}
          message={`قوانین مرخصی با ${comparisonBaseSnapshot?.name ?? 'مبنای تنظیمات'} متفاوت است.`}
        />
      ) : null}
      <LeaveSection
        embedded
        comparisonMode="template"
        settings={settings}
        baseSettings={templateComparisonSettings}
        secondaryComparisonMode={comparisonBaseSnapshot ? 'tenant_base' : undefined}
        secondaryBaseSettings={tenantBaseComparisonSettings}
        secondaryComparisonYear={comparisonBaseYear ?? undefined}
        errors={errors}
        onLeaveChange={onLeaveChange}
      />
    </EmployeeContractStepShell>
  );
}
