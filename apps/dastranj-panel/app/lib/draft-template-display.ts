import { draftTemplateLabels } from './constants';
import { formatFaCurrencyAmount, formatFaMinutes } from './format-fa';

function formatFaHours(value: unknown) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return 'ثبت نشده';
  const hours = minutes / 60;
  return `${hours.toLocaleString('fa-IR', { maximumFractionDigits: 2 })} ساعت`;
}

export type DraftTemplateBody = {
  base?: {
    title?: string;
    description?: string;
    workReference?: string;
  } | null;
  attendance?: {
    monthlyLeaveLimit?: string;
    leaveTransferLimit?: string;
    monthlyOvertimeLimit?: string;
  } | null;
  payroll?: {
    enabled?: boolean;
    type?: string | null;
    entryMode?: string | null;
    includeInsurance?: boolean;
    includeTax?: boolean;
    components?: Record<string, { amount?: string } | undefined>;
    jobBenefits?: Record<string, { amount?: string } | undefined>;
    otherBenefits?: Record<string, { amount?: string; insurance?: boolean; inBase?: boolean } | undefined>;
    fixedAdjustments?: Array<{
      id: string;
      title: string;
      itemType: 'addition' | 'deduction';
      calculationMethod: 'fixed_amount' | 'base_coefficient';
      amount: string;
      coefficient: string;
      insurance: boolean;
      tax: boolean;
      inBase: boolean;
    }>;
    timeCoefficients?: Record<string, { value?: string; insurance?: boolean; tax?: boolean } | undefined>;
    nightShiftRules?: {
      insurance?: boolean;
      tax?: boolean;
      morningEveningPercent?: string;
      morningNightPercent?: string;
      morningEveningNightPercent?: string;
      eveningNightPercent?: string;
    } | null;
    legalLimits?: {
      employeeInsuranceShare?: string;
      employerInsuranceShare?: string;
      unemploymentInsuranceShare?: string;
      insuranceCeilingCoefficient?: string;
      monthlyTaxExemption?: string;
      taxBrackets?: Array<{
        id: string;
        startAmount: string;
        endAmount: string;
        percent: string;
      }>;
    } | null;
  } | null;
};

const payrollTypeLabels = {
  monthly_fixed: 'ثابت ماهیانه',
  daily: 'روز‌مزد',
  hourly: 'ساعتی',
} as const;

export function parseDraftTemplateBody(value: string | null | undefined): DraftTemplateBody {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as DraftTemplateBody) : {};
  } catch {
    return {};
  }
}

function sumComponentAmounts(components: Record<string, { amount?: string } | undefined> | null | undefined) {
  if (!components) return 0;
  return Object.values(components).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
}

export function getDraftTemplateSummary(bodyRaw: string | null | undefined) {
  const body = parseDraftTemplateBody(bodyRaw);
  const payroll = body.payroll;
  const grossAmount =
    sumComponentAmounts(payroll?.components) +
    sumComponentAmounts(payroll?.jobBenefits) +
    sumComponentAmounts(payroll?.otherBenefits);

  const pills: string[] = [];
  if (payroll?.enabled === false) {
    pills.push('بدون حقوق و دستمزد');
  } else if (payroll) {
    if (payroll.entryMode === 'agreement') {
      pills.push('حقوق توافقی');
    } else if (payroll.entryMode === 'manual') {
      pills.push('ورود دستی همه اطلاعات');
    }
    if (payroll.includeInsurance) pills.push('بیمه دارد');
    else if (payroll.includeInsurance === false) pills.push('بدون بیمه');
    if (payroll.includeTax) pills.push('مالیات دارد');
    else if (payroll.includeTax === false) pills.push('بدون مالیات');
    const payrollType = payroll.type;
    if (payrollType && payrollType in payrollTypeLabels) {
      pills.push(`نوع: ${payrollTypeLabels[payrollType as keyof typeof payrollTypeLabels]}`);
    }
  }

  return {
    pills,
    fields: {
      monthlyLeaveLimit: formatFaHours(body.attendance?.monthlyLeaveLimit),
      leaveTransferLimit: formatFaMinutes(body.attendance?.leaveTransferLimit),
      monthlyOvertimeLimit: formatFaMinutes(body.attendance?.monthlyOvertimeLimit),
      grossPayment: formatFaCurrencyAmount(grossAmount),
      netPayment: grossAmount ? formatFaCurrencyAmount(grossAmount) : 'ثبت نشده',
    },
  };
}

export function getDraftTemplateCategoryLabel(category: keyof typeof draftTemplateLabels) {
  return draftTemplateLabels[category] ?? category;
}
