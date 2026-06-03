import { formatFaNumber } from './format-fa';
import { compareValues, type BaseDifference } from './payroll-business-settings';

export const LEGAL_MAX_DAILY_MINUTES = 480;
export const WORK_DAYS_PER_WEEK = 5.5;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const WORK_DAYS_PER_YEAR = 235;

export type ContractFinancialDerivedItem = {
  label: string;
  value: string;
};

export function formatDurationMinutes(totalMinutes: number) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return 'ثبت نشده';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours <= 0) return `${formatFaNumber(minutes)} دقیقه`;
  if (minutes <= 0) return `${formatFaNumber(hours)} ساعت`;
  return `${formatFaNumber(hours)} ساعت و ${formatFaNumber(minutes)} دقیقه`;
}

export function formatMoneyRial(value: number) {
  if (!Number.isFinite(value)) return 'ثبت نشده';
  return `${formatFaNumber(Math.round(value))} ریال`;
}

export function compareFinancialToTemplate(
  templateValue: number,
  currentValue: number,
  config: {
    fieldLabel: string;
    unit: string;
    formatAmount?: (value: number) => string;
  },
): BaseDifference | null {
  const formatAmount = config.formatAmount ?? ((value: number) => formatFaNumber(value));
  return compareValues(templateValue, currentValue, {
    changed: 'متفاوت با مبنای قالب',
    tooltip: `${config.fieldLabel} در قالب انتخاب‌شده ${formatAmount(templateValue)} ${config.unit} است.`,
    higher: (difference) => `${formatAmount(difference)} ${config.unit} بیشتر از مبنای قالب`,
    lower: (difference) => `${formatAmount(difference)} ${config.unit} کمتر از مبنای قالب`,
  });
}

export function buildRequiredMinutesDerived(dailyMinutes: number): ContractFinancialDerivedItem[] {
  const safeMinutes = Number.isFinite(dailyMinutes) && dailyMinutes > 0 ? dailyMinutes : 0;
  const weeklyMinutes = Math.round(safeMinutes * WORK_DAYS_PER_WEEK);
  const monthlyMinutes = safeMinutes * DAYS_PER_MONTH;
  const yearlyMinutes = monthlyMinutes * MONTHS_PER_YEAR;

  return [
    { label: 'به ازای یک روز', value: formatDurationMinutes(safeMinutes) },
    { label: 'به ازای یک هفته کاری', value: formatDurationMinutes(weeklyMinutes) },
    { label: 'به ازای هر ماه ۳۰ روزه', value: formatDurationMinutes(monthlyMinutes) },
    { label: 'به ازای ۱۲ ماه کاری', value: formatDurationMinutes(yearlyMinutes) },
  ];
}

export function buildBaseSalaryDerived(dailySalary: number, dailyMinutes: number): ContractFinancialDerivedItem[] {
  const safeSalary = Number.isFinite(dailySalary) && dailySalary > 0 ? dailySalary : 0;
  const safeMinutes = Number.isFinite(dailyMinutes) && dailyMinutes > 0 ? dailyMinutes : 1;
  const hourlySalary = (safeSalary / safeMinutes) * 60;
  const weeklySalary = safeSalary * WORK_DAYS_PER_WEEK;
  const monthlySalary = safeSalary * DAYS_PER_MONTH;
  const yearlySalary = monthlySalary * MONTHS_PER_YEAR;

  return [
    { label: 'به ازای یک ساعت', value: formatMoneyRial(hourlySalary) },
    { label: 'به ازای یک هفته کاری', value: formatMoneyRial(weeklySalary) },
    { label: 'به ازای هر ماه ۳۰ روزه', value: formatMoneyRial(monthlySalary) },
    { label: 'به ازای ۱۲ ماه کاری', value: formatMoneyRial(yearlySalary) },
  ];
}
