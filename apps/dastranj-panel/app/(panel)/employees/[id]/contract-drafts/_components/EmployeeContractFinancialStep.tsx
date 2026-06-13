'use client';

import type { EmployeeContractDraft } from '../../../../../lib/employee-contract-drafts';
import { ContractFinancialBasisCard } from '../../../../../components/contract-financial/ContractFinancialBasisCard';
import { formatFaNumber } from '../../../../../lib/format-fa';
import {
  WORK_DAYS_PER_YEAR,
  buildBaseSalaryDerived,
  buildRequiredMinutesDerived,
  compareFinancialToTemplate,
  compareFinancialToTenantBase,
} from '../../../../../lib/contract-financial-calculations';

type FinancialState = EmployeeContractDraft['financial'];

export function EmployeeContractFinancialStep({
  financial,
  templateSnapshot,
  comparisonBaseSnapshot,
  comparisonBaseYear,
  usageType,
  errors,
  onFinancialChange,
}: {
  financial: FinancialState;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  comparisonBaseSnapshot?: EmployeeContractDraft['comparisonBaseSettingsSnapshot'];
  comparisonBaseYear?: number | null;
  usageType: EmployeeContractDraft['usageType'];
  errors: Record<string, string>;
  onFinancialChange: (patch: Partial<FinancialState>) => void;
}) {
  const templateMinutes = templateSnapshot?.financial.dailyRequiredMinutes;
  const templateSalary = templateSnapshot?.financial.dailyBaseSalary;
  const baseMinutes = comparisonBaseSnapshot?.financial.dailyRequiredMinutes;
  const baseSalary = comparisonBaseSnapshot?.financial.dailyBaseSalary;
  const baseYear = comparisonBaseYear ?? comparisonBaseSnapshot?.baseSettingsYear ?? null;

  const minutesDerived = buildRequiredMinutesDerived(financial.dailyRequiredMinutes);
  const salaryDerived = buildBaseSalaryDerived(financial.dailyBaseSalary, financial.dailyRequiredMinutes);

  const minutesTemplateDiff =
    templateMinutes !== undefined
      ? compareFinancialToTemplate(templateMinutes, financial.dailyRequiredMinutes, {
          fieldLabel: 'دقایق موظفی روزانه',
          unit: 'دقیقه',
        })
      : null;

  const minutesTenantBaseDiff =
    baseMinutes !== undefined && baseYear
      ? compareFinancialToTenantBase(baseMinutes, financial.dailyRequiredMinutes, baseYear, {
          fieldLabel: 'دقایق موظفی روزانه',
          unit: 'دقیقه',
        })
      : null;

  const salaryTemplateDiff =
    templateSalary !== undefined
      ? compareFinancialToTemplate(templateSalary, financial.dailyBaseSalary, {
          fieldLabel: 'حقوق پایه روزانه',
          unit: 'ریال',
          formatAmount: (amount) => formatFaNumber(Math.round(amount)),
        })
      : null;

  const salaryTenantBaseDiff =
    baseSalary !== undefined && baseYear
      ? compareFinancialToTenantBase(baseSalary, financial.dailyBaseSalary, baseYear, {
          fieldLabel: 'حقوق پایه روزانه',
          unit: 'ریال',
          formatAmount: (amount) => formatFaNumber(Math.round(amount)),
        })
      : null;

  return (
    <div className="contract-financial-step">
      <ContractFinancialBasisCard
        title="دقایق موظفی"
        description="این مقدار مبنای محاسبه حقوق، اضافه‌کار و مرخصی است."
        fieldLabel="دقایق موظفی روزانه"
        unit="دقیقه"
        value={financial.dailyRequiredMinutes}
        onChange={(dailyRequiredMinutes) => onFinancialChange({ dailyRequiredMinutes })}
        error={errors.financial_dailyRequiredMinutes}
        derivedItems={minutesDerived}
        templateDifference={minutesTemplateDiff}
        tenantBaseDifference={minutesTenantBaseDiff}
        workDaysNote={`تعداد روزهای کاری: ${formatFaNumber(WORK_DAYS_PER_YEAR)} روز (جمعه و شنبه تعطیل)`}
        tone="minutes"
      />

      {usageType === 'payroll_attendance' ? (
        <ContractFinancialBasisCard
          title="حقوق پایه"
          description="حقوق پایه روزانه را نسبت به مبنای انتخاب‌شده تعیین کنید."
          fieldLabel="حقوق پایه (به ازای روز)"
          unit="ریال"
          value={financial.dailyBaseSalary}
          onChange={(dailyBaseSalary) => onFinancialChange({ dailyBaseSalary })}
          error={errors.financial_dailyBaseSalary}
          derivedItems={salaryDerived}
          templateDifference={salaryTemplateDiff}
          tenantBaseDifference={salaryTenantBaseDiff}
          tone="salary"
        />
      ) : null}
    </div>
  );
}
