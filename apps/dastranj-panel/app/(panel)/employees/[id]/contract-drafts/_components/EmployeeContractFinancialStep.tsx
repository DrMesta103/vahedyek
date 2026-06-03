'use client';

import type { EmployeeContractDraft } from '../../../../../lib/employee-contract-drafts';
import { ContractFinancialBasisCard } from '../../../../../components/contract-financial/ContractFinancialBasisCard';
import { formatFaNumber } from '../../../../../lib/format-fa';
import {
  WORK_DAYS_PER_YEAR,
  buildBaseSalaryDerived,
  buildRequiredMinutesDerived,
  compareFinancialToTemplate,
  formatMoneyRial,
} from '../../../../../lib/contract-financial-calculations';

type FinancialState = EmployeeContractDraft['financial'];

export function EmployeeContractFinancialStep({
  financial,
  templateSnapshot,
  usageType,
  errors,
  onFinancialChange,
}: {
  financial: FinancialState;
  templateSnapshot: EmployeeContractDraft['templateSnapshot'];
  usageType: EmployeeContractDraft['usageType'];
  errors: Record<string, string>;
  onFinancialChange: (patch: Partial<FinancialState>) => void;
}) {
  const templateMinutes = templateSnapshot?.financial.dailyRequiredMinutes;
  const templateSalary = templateSnapshot?.financial.dailyBaseSalary;

  const minutesDerived = buildRequiredMinutesDerived(financial.dailyRequiredMinutes);
  const salaryDerived = buildBaseSalaryDerived(financial.dailyBaseSalary, financial.dailyRequiredMinutes);

  const minutesTemplateDiff =
    templateMinutes !== undefined
      ? compareFinancialToTemplate(templateMinutes, financial.dailyRequiredMinutes, {
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
        footnote={
          templateMinutes !== undefined
            ? `مقدار دقایق موظفی روزانه در قالب انتخاب‌شده ${formatFaNumber(templateMinutes)} دقیقه است.`
            : undefined
        }
        derivedItems={minutesDerived}
        templateDifference={minutesTemplateDiff}
        workDaysNote={`تعداد روزهای کاری: ${formatFaNumber(WORK_DAYS_PER_YEAR)} روز (جمعه و شنبه تعطیل)`}
        tone="minutes"
      />

      {usageType === 'payroll_attendance' ? (
        <ContractFinancialBasisCard
          title="حقوق پایه"
          description="حقوق پایه روزانه را نسبت به قالب انتخاب‌شده تعیین کنید."
          fieldLabel="حقوق پایه (به ازای روز)"
          unit="ریال"
          value={financial.dailyBaseSalary}
          onChange={(dailyBaseSalary) => onFinancialChange({ dailyBaseSalary })}
          error={errors.financial_dailyBaseSalary}
          footnote={
            templateSalary !== undefined
              ? `مقدار حقوق پایه روزانه در قالب انتخاب‌شده ${formatMoneyRial(templateSalary)} است.`
              : undefined
          }
          derivedItems={salaryDerived}
          templateDifference={salaryTemplateDiff}
          tone="salary"
        />
      ) : null}
    </div>
  );
}
