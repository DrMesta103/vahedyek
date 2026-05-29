'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Calculator,
  ChevronLeft,
  CircleAlert,
  Clock3,
  Construction,
  Info,
  LockKeyhole,
  Pencil,
  Plus,
  ReceiptText,
  Save,
  ShieldCheck,
  Trash2,
  Wallet,
} from 'lucide-react';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { UnsavedChangesDialog, useUnsavedLeaveGuard } from '../../../components/UnsavedChangesGuard';
import { formatFaNumber, toPersianDigits } from '../../../lib/format-fa';
import {
  getActiveTenantStorageId,
  BENEFIT_FIELDS,
  COEFFICIENT_COMBINATION_METHODS,
  COEFFICIENT_EXCEPTION_METHODS,
  DEFAULT_PAYROLL_SETTINGS,
  PAYROLL_STEPS,
  SETTLEMENT_RULES,
  VARIABLE_TITLES,
  WORK_TIME_CONDITIONS,
  applyPayrollOverrides,
  buildPayrollOverrides,
  calculateCombinedCoefficient,
  calculatePayrollValues,
  calculateVariableAmount,
  compareCollections,
  compareValues,
  getPayrollSettingsDraftStorageKey,
  getPayrollSettingsStorageKey,
  getPayrollStepperProgressStorageKey,
  getTenantPayrollSettingsStorageKey,
  normalizePayrollOverrides,
  normalizePayrollSettings,
  validatePayrollStep,
  validateTaxBracket,
  type BaseDifference,
  type BusinessSettingYear,
  type CoefficientCombinationMethod,
  type CoefficientExceptionMethod,
  type CoefficientExceptionRule,
  type PayrollDerivedValues,
  type PayrollSettings,
  type PayrollSettingsMode,
  type PayrollSettingsOverrides,
  type PayrollStepperProgress,
  type PayrollStepId,
  type TaxBracket,
  type VariableAmount,
  type VariableAmountType,
  type VariableCalculationBase,
  type WorkTimeConditionKey,
} from '../../../lib/payroll-business-settings';

type StepState = Record<PayrollStepId, { opened: boolean; completed: boolean; dirty: boolean; saved: boolean }>;

const INITIAL_STEP_STATE = Object.fromEntries(
  PAYROLL_STEPS.map(({ id }, index) => [id, { opened: index === 0, completed: false, dirty: false, saved: false }]),
) as StepState;

function parseNumber(value: string) {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');
  return normalized ? Number(normalized) : Number.NaN;
}

function money(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function decimal(value: number) {
  return toPersianDigits(Number.isFinite(value) ? String(value) : '');
}

type TransferLimitKey = keyof PayrollSettings['leave']['transferLimits'];

const TRANSFER_LIMIT_RULES: Array<{
  key: TransferLimitKey;
  label: string;
  tooltip: string;
}> = [
  { key: 'monthly', label: 'انتقال ماهیانه', tooltip: 'سقف انتقال ماهانه' },
  { key: 'quarterly', label: 'انتقال سه ماهه', tooltip: 'سقف انتقال سه ماهه' },
  { key: 'semiAnnual', label: 'انتقال شش ماهه / فصلی', tooltip: 'سقف انتقال شش ماهه' },
  { key: 'annual', label: 'انتقال سالیانه', tooltip: 'سقف انتقال سالیانه' },
];

function getTransferLimitLabel(key: TransferLimitKey) {
  return TRANSFER_LIMIT_RULES.find((rule) => rule.key === key)?.label ?? key;
}

function compareTransferLimit(
  baseRule: PayrollSettings['leave']['transferLimits'][TransferLimitKey] | undefined,
  currentRule: PayrollSettings['leave']['transferLimits'][TransferLimitKey],
  label: string,
) {
  if (!baseRule) return null;
  if (baseRule.enabled === currentRule.enabled && baseRule.hours === currentRule.hours) return null;
  if (!baseRule.enabled && currentRule.enabled) {
    return customDifference('فعال شده نسبت به مبنا', `در تنظیمات تاو ادمین، ${label} غیرفعال است.`, 'added');
  }
  if (baseRule.enabled && !currentRule.enabled) {
    return customDifference('غیرفعال نسبت به مبنا', `در تنظیمات تاو ادمین، ${label} با سقف ${formatFaNumber(baseRule.hours ?? 0)} ساعت فعال است.`, 'removed');
  }
  if (baseRule.enabled && currentRule.enabled && baseRule.hours !== currentRule.hours) {
    return compareValues(baseRule.hours ?? 0, currentRule.hours ?? 0, {
      changed: 'متفاوت با سقف مبنا',
      tooltip: `سقف ${label} در مبنای تاو ادمین ${formatFaNumber(baseRule.hours ?? 0)} ساعت است.`,
    });
  }
  return compareCollections(baseRule.enabled, currentRule.enabled, {
    changed: 'متفاوت با سیاست مبنا',
    tooltip: `سیاست ${label} در تنظیمات پایه تاو ادمین متفاوت است.`,
  });
}

function conditionLabel(condition: WorkTimeConditionKey, short = false) {
  const item = WORK_TIME_CONDITIONS.find((entry) => entry.key === condition);
  return short ? item?.shortLabel ?? condition : item?.label ?? condition;
}

function methodLabel(method: CoefficientExceptionMethod) {
  return COEFFICIENT_EXCEPTION_METHODS.find((entry) => entry.value === method)?.label
    ?? COEFFICIENT_COMBINATION_METHODS.find((entry) => entry.value === method)?.label
    ?? method;
}

function formatFormula(value: string) {
  return toPersianDigits(value.replace(/(\d+\.\d{1,3})\d+/g, (_, number) => Number(number).toFixed(3)));
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <button type="button" className="business-payroll-info" title={text} aria-label={text}>
      <Info className="h-3.5 w-3.5" />
    </button>
  );
}

function DifferenceBadge({ difference }: { difference?: BaseDifference | null }) {
  if (!difference) return null;
  return (
    <span
      className="business-payroll-difference-badge"
      title={difference.tooltip}
      aria-label={`${difference.message}. ${difference.tooltip}`}
    >
      <Info className="h-3.5 w-3.5" />
      {difference.message}
    </span>
  );
}

function customDifference(message: string, tooltip: string, direction: BaseDifference['direction'] = 'changed'): BaseDifference {
  return { isDifferent: true, direction, message, tooltip };
}

function NumericField({
  label,
  value,
  onChange,
  unit,
  helper,
  tooltip,
  error,
  decimalValue = false,
  difference,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  helper?: string;
  tooltip?: string;
  error?: string;
  decimalValue?: boolean;
  difference?: BaseDifference | null;
}) {
  const displayValue = Number.isFinite(value) ? toPersianDigits(String(value)) : '';
  const [draftValue, setDraftValue] = useState(displayValue);

  useEffect(() => {
    setDraftValue(displayValue);
  }, [displayValue]);

  return (
    <label className={`business-payroll-field ${error ? 'has-error' : ''}`}>
      <span className="business-payroll-field-label">
        {label}
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </span>
      <span className="business-payroll-input">
        <input
          value={draftValue}
          inputMode={decimalValue ? 'decimal' : 'numeric'}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            onChange(parseNumber(nextValue));
          }}
        />
        <b>{unit}</b>
      </span>
      <DifferenceBadge difference={difference} />
      {helper ? <small>{helper}</small> : null}
      {error ? <em>{error}</em> : null}
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
  helper,
  tooltip,
  error,
  difference,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  tooltip?: string;
  error?: string;
  difference?: BaseDifference | null;
}) {
  return (
    <label className={`business-payroll-field ${error ? 'has-error' : ''}`}>
      <span className="business-payroll-field-label">
        {label}
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </span>
      <span className="business-payroll-input" dir="ltr">
        <input value={value} inputMode="numeric" placeholder="22:00" onChange={(event) => onChange(event.target.value)} />
      </span>
      <DifferenceBadge difference={difference} />
      {helper ? <small>{helper}</small> : null}
      {error ? <em>{error}</em> : null}
    </label>
  );
}

function SectionHeader({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <header className="draft-template-flow-section-head business-payroll-section-head">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {icon ? <span className="business-payroll-section-icon">{icon}</span> : null}
    </header>
  );
}

function FinancialSection({
  settings,
  baseSettings,
  derived,
  errors,
  onChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  derived: PayrollDerivedValues;
  errors: Record<string, string>;
  onChange: (key: keyof PayrollSettings['financial'], value: number) => void;
}) {
  return (
    <>
      <SectionHeader
        title="اطلاعات مالی (بر اساس اداره کار)"
        description="مبنای مزد و زمان موظفی که محاسبات حقوق از آن آغاز می شود."
        icon={<Wallet className="h-5 w-5" />}
      />
      <div className="business-payroll-fields two">
        <NumericField
          label="حقوق پایه روزانه"
          value={settings.financial.dailyBaseSalary}
          unit="ریال"
          onChange={(value) => onChange('dailyBaseSalary', value)}
          helper="مبلغ ثابت حقوق برای یک روز کاری کامل"
          tooltip="مبلغ پایه برای یک روز کاری کامل است. روز کاری کامل بر اساس دقایق موظفی تعریف می شود، نه ۲۴ ساعت."
          error={errors.dailyBaseSalary}
          difference={baseSettings ? compareValues(baseSettings.financial.dailyBaseSalary, settings.financial.dailyBaseSalary, {
            changed: 'متفاوت با حقوق پایه',
            tooltip: `حقوق پایه روزانه تعریف شده توسط تاو ادمین برای این سال ${money(baseSettings.financial.dailyBaseSalary)} است.`,
          }) : null}
        />
        <NumericField
          label="دقایق موظفی روزانه"
          value={settings.financial.dailyRequiredMinutes}
          unit="دقیقه"
          onChange={(value) => onChange('dailyRequiredMinutes', value)}
          helper="زمان کار موظفی تعریف شده در هر روز کاری"
          tooltip="زمان کار موظفی در یک روز کاری است. ۴۴۰ دقیقه یعنی ۷ ساعت و ۲۰ دقیقه."
          error={errors.dailyRequiredMinutes}
          difference={baseSettings ? compareValues(baseSettings.financial.dailyRequiredMinutes, settings.financial.dailyRequiredMinutes, {
            changed: 'متفاوت با مبنای قانون کار',
            lower: (difference) => `${formatFaNumber(difference)} دقیقه کمتر از مبنای قانون کار`,
            higher: (difference) => `${formatFaNumber(difference)} دقیقه بیشتر از مبنای قانون کار`,
            tooltip: `مبنای دقایق موظفی روزانه تعریف شده توسط تاو ادمین ${formatFaNumber(baseSettings.financial.dailyRequiredMinutes)} دقیقه (${formatFaNumber(Math.floor(baseSettings.financial.dailyRequiredMinutes / 60))} ساعت${baseSettings.financial.dailyRequiredMinutes % 60 ? ` و ${formatFaNumber(baseSettings.financial.dailyRequiredMinutes % 60)} دقیقه` : ''}) است.`,
          }) : null}
        />
      </div>
      <div className="business-payroll-highlight">
        <CircleAlert className="h-4 w-4" />
        مبنای روز کاری در این بخش، دقایق موظفی روزانه است؛ نه ۲۴ ساعت شبانه روز.
      </div>
      <section className="business-payroll-calculation">
        <header>
          <Calculator className="h-4 w-4" />
          <strong>نمایش محاسبه</strong>
        </header>
        <div className="business-payroll-calculation-grid">
          <div>
            <span>روز کاری کامل</span>
            <strong>
              {formatFaNumber(settings.financial.dailyRequiredMinutes)} دقیقه = {formatFaNumber(derived.fullWorkingDayHours)} ساعت و{' '}
              {formatFaNumber(derived.fullWorkingDayMinutes)} دقیقه
            </strong>
          </div>
          <div>
            <span>حقوق هر دقیقه</span>
            <strong>حدود {money(derived.salaryPerMinute)}</strong>
          </div>
          <div>
            <span>حقوق هر ساعت</span>
            <strong>حدود {money(derived.salaryPerHour)}</strong>
          </div>
        </div>
        <p>
          فرمول: {formatFaNumber(settings.financial.dailyBaseSalary)} ÷ {formatFaNumber(settings.financial.dailyRequiredMinutes)} ={' '}
          {formatFaNumber(Math.round(derived.salaryPerMinute))} ریال
        </p>
      </section>
    </>
  );
}

function TaxBracketDialog({
  open,
  bracket,
  existing,
  onClose,
  onSubmit,
}: {
  open: boolean;
  bracket: TaxBracket | null;
  existing: TaxBracket[];
  onClose: () => void;
  onSubmit: (bracket: TaxBracket) => void;
}) {
  const [draft, setDraft] = useState<TaxBracket>(
    bracket ?? { id: `tax-${Date.now()}`, from: Number.NaN, to: Number.NaN, percent: Number.NaN },
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(bracket ?? { id: `tax-${Date.now()}`, from: Number.NaN, to: Number.NaN, percent: Number.NaN });
    setError('');
  }, [bracket, open]);

  const submit = () => {
    const nextError = validateTaxBracket(draft, existing);
    if (nextError) {
      setError(nextError);
      return;
    }
    onSubmit(draft);
  };

  return (
    <PanelFormModal
      open={open}
      title={bracket ? 'ویرایش پله مالیاتی' : 'افزودن پله مالیاتی'}
      lead="هر درصد فقط روی بخش درآمد واقع در همان بازه اعمال می‌شود."
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت پله" onSubmit={submit} onCancel={onClose} />}
    >
      <div className="draft-template-tax-bracket-form payroll-tax-bracket-dialog-fields">
        <NumericField label="از" value={draft.from} unit="ریال" onChange={(from) => setDraft((value) => ({ ...value, from }))} />
        <NumericField label="تا" value={draft.to} unit="ریال" onChange={(to) => setDraft((value) => ({ ...value, to }))} />
        <NumericField
          label="درصد"
          value={draft.percent}
          unit="%"
          decimalValue
          onChange={(percent) => setDraft((value) => ({ ...value, percent }))}
        />
      </div>
    </PanelFormModal>
  );
}

function DeductionsSection({
  settings,
  baseSettings,
  derived,
  errors,
  onPercentChange,
  onBracketsChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  derived: PayrollDerivedValues;
  errors: Record<string, string>;
  onPercentChange: (key: 'employerInsurancePercent' | 'employeeInsurancePercent', value: number) => void;
  onBracketsChange: (items: TaxBracket[]) => void;
}) {
  const [bracketEditor, setBracketEditor] = useState<{ open: boolean; bracket: TaxBracket | null }>({ open: false, bracket: null });
  const [deletingBracket, setDeletingBracket] = useState<TaxBracket | null>(null);

  const upsertBracket = (bracket: TaxBracket) => {
    const exists = settings.deductions.taxBrackets.some((item) => item.id === bracket.id);
    const next = exists
      ? settings.deductions.taxBrackets.map((item) => (item.id === bracket.id ? bracket : item))
      : [...settings.deductions.taxBrackets, bracket];
    onBracketsChange(next.sort((left, right) => left.from - right.from));
    setBracketEditor({ open: false, bracket: null });
  };

  const confirmDeleteBracket = () => {
    if (!deletingBracket) return;
    onBracketsChange(settings.deductions.taxBrackets.filter((item) => item.id !== deletingBracket.id));
    setDeletingBracket(null);
  };

  return (
    <>
      <SectionHeader
        title="کسورات دستمزد"
        description="کسورات قانونی پایه را از کسورات قراردادی جدا تعریف کنید."
        icon={<ReceiptText className="h-5 w-5" />}
      />
      <section className="business-payroll-subcard">
        <h3>بیمه</h3>
        <div className="business-payroll-fields two">
          <NumericField
            label="درصد بیمه کارفرما"
            value={settings.deductions.employerInsurancePercent}
            unit="%"
            decimalValue
            onChange={(value) => onPercentChange('employerInsurancePercent', value)}
            helper="سهم پرداختی شرکت است و معمولاً از حقوق کارمند کم نمی شود."
            error={errors.employerInsurancePercent}
            difference={baseSettings ? compareValues(baseSettings.deductions.employerInsurancePercent, settings.deductions.employerInsurancePercent, {
              changed: 'متفاوت با درصد پایه',
              tooltip: `درصد پایه بیمه کارفرما تعریف شده توسط تاو ادمین ${formatFaNumber(baseSettings.deductions.employerInsurancePercent)}٪ است.`,
            }) : null}
          />
          <NumericField
            label="درصد بیمه کارمند"
            value={settings.deductions.employeeInsurancePercent}
            unit="%"
            decimalValue
            onChange={(value) => onPercentChange('employeeInsurancePercent', value)}
            helper="سهم بیمه ای که از حقوق کارمند کسر می شود."
            error={errors.employeeInsurancePercent}
            difference={baseSettings ? compareValues(baseSettings.deductions.employeeInsurancePercent, settings.deductions.employeeInsurancePercent, {
              changed: 'متفاوت با درصد پایه',
              tooltip: `درصد پایه بیمه کارمند تعریف شده توسط تاو ادمین ${formatFaNumber(baseSettings.deductions.employeeInsurancePercent)}٪ است.`,
            }) : null}
          />
        </div>
        <div className="business-payroll-example">
          <strong>نمونه برای پایه بیمه {money(10000000)}</strong>
          <span>بیمه کارمند {formatFaNumber(settings.deductions.employeeInsurancePercent)}٪ = {money((10000000 * settings.deductions.employeeInsurancePercent) / 100)} کسر از حقوق</span>
          <span>بیمه کارفرما {formatFaNumber(settings.deductions.employerInsurancePercent)}٪ = {money((10000000 * settings.deductions.employerInsurancePercent) / 100)} هزینه شرکت</span>
        </div>
        <p className="business-payroll-derived-note">برآورد بیمه کارمند در خلاصه زنده: {money(derived.employeeInsuranceAmount)}</p>
      </section>
      <section className="business-payroll-subcard">
        <div className="business-payroll-subcard-head">
          <div>
            <h3>مالیات</h3>
            <p>هر درصد فقط روی بخش درآمد واقع در همان بازه اعمال می شود.</p>
          </div>
          <button
            type="button"
            className="business-payroll-outline-button"
            onClick={() => setBracketEditor({ open: true, bracket: null })}
          >
            <Plus className="h-4 w-4" /> افزودن پله
          </button>
        </div>
        <div className="business-payroll-table">
          <div className="business-payroll-table-head">
            <span>از</span>
            <span>تا</span>
            <span>درصد</span>
            <span>عملیات</span>
          </div>
          {settings.deductions.taxBrackets.map((bracket) => {
            const baseBracket = baseSettings?.deductions.taxBrackets.find((item) => item.id === bracket.id);
            const difference = baseSettings
              ? baseBracket
                ? compareCollections(baseBracket, bracket, {
                    changed: 'متفاوت با جدول پایه',
                    tooltip: 'این بازه یا درصد مالیاتی با مقادیر پایه تعریف شده توسط تاو ادمین متفاوت است.',
                  })
                : customDifference('اختصاصی کسب و کار', 'این بازه مالیاتی فقط برای این کسب و کار تعریف شده است.', 'added')
              : null;
            return (
            <div className="business-payroll-table-row" key={bracket.id}>
              <span>{money(bracket.from)}</span>
              <span>{money(bracket.to)}</span>
              <strong>{formatFaNumber(bracket.percent)}%</strong>
              <div>
                <button
                  type="button"
                  aria-label="ویرایش بازه مالیاتی"
                  onClick={() => setBracketEditor({ open: true, bracket })}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="حذف بازه مالیاتی"
                  onClick={() => setDeletingBracket(bracket)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <DifferenceBadge difference={difference} />
              {errors[`tax-${bracket.id}`] ? <em>{errors[`tax-${bracket.id}`]}</em> : null}
            </div>
            );
          })}
        </div>
        {baseSettings?.deductions.taxBrackets
          .filter((baseBracket) => !settings.deductions.taxBrackets.some((item) => item.id === baseBracket.id))
          .map((baseBracket) => (
            <DifferenceBadge
              key={`removed-${baseBracket.id}`}
              difference={customDifference(
                'حذف از مبنا',
                `بازه ${money(baseBracket.from)} تا ${money(baseBracket.to)} در جدول پایه تاو ادمین وجود دارد.`,
                'removed',
              )}
            />
          ))}
        {bracketEditor.open ? (
          <TaxBracketDialog
            open={bracketEditor.open}
            bracket={bracketEditor.bracket}
            existing={settings.deductions.taxBrackets}
            onClose={() => setBracketEditor({ open: false, bracket: null })}
            onSubmit={upsertBracket}
          />
        ) : null}
        <ConfirmDialog
          open={Boolean(deletingBracket)}
          title="حذف پله مالیاتی"
          description={
            deletingBracket
              ? `آیا از حذف پله ${money(deletingBracket.from)} تا ${money(deletingBracket.to)} با نرخ ${formatFaNumber(deletingBracket.percent)}٪ مطمئن هستید؟`
              : ''
          }
          confirmLabel="حذف"
          cancelLabel="انصراف"
          tone="danger"
          onConfirm={confirmDeleteBracket}
          onCancel={() => setDeletingBracket(null)}
        />
      </section>
    </>
  );
}

function BenefitsSection({
  settings,
  baseSettings,
  errors,
  onChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  errors: Record<string, string>;
  onChange: (key: keyof PayrollSettings['benefits'], value: number) => void;
}) {
  return (
    <>
      <SectionHeader
        title="مزایا (اضافات حقوق و دستمزد)"
        description="مبالغ ثابت افزوده شده به حقوق؛ آیتم ها یک بار و قابل توسعه تعریف شده اند."
        icon={<Wallet className="h-5 w-5" />}
      />
      <div className="business-payroll-fields two">
        {BENEFIT_FIELDS.map((field) => (
          <NumericField
            key={field.key}
            label={field.label}
            value={settings.benefits[field.key]}
            unit="ریال"
            onChange={(value) => onChange(field.key, value)}
            helper={field.helper}
            error={errors[field.key]}
            difference={baseSettings ? compareValues(baseSettings.benefits[field.key], settings.benefits[field.key], {
              changed: 'متفاوت با مبلغ پایه',
              tooltip: `مبلغ پایه تعریف شده توسط تاو ادمین برای ${field.label} ${money(baseSettings.benefits[field.key])} است.`,
            }) : null}
          />
        ))}
      </div>
      <div className="business-payroll-highlight subtle">
        عیدی و سنوات ممکن است مطابق سیاست سازمان در پرداخت ماهانه یا در زمان تسویه لحاظ شوند؛ مقدار اینجا مبنای تنظیم است.
      </div>
    </>
  );
}

function newVariableAmount(type: VariableAmountType): VariableAmount {
  return {
    id: `amount-${Date.now()}`,
    title: VARIABLE_TITLES[type][0],
    type,
    calculationMethod: 'fixed',
    amount: Number.NaN,
    percent: Number.NaN,
    calculationBase: 'baseSalary',
  };
}

function VariableAmountDialog({
  open,
  initialItem,
  derived,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialItem: VariableAmount | null;
  derived: PayrollDerivedValues;
  onClose: () => void;
  onSubmit: (item: VariableAmount) => void;
}) {
  const [item, setItem] = useState<VariableAmount>(initialItem ?? newVariableAmount('addition'));
  const [error, setError] = useState('');
  const calculated = calculateVariableAmount(item, derived.monthlyBaseSalary, derived.grossPay);
  const isEditing = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;
    setItem(initialItem ?? newVariableAmount('addition'));
    setError('');
  }, [initialItem, open]);

  const submit = () => {
    if (!item.title.trim()) return setError('عنوان الزامی است.');
    if (item.calculationMethod === 'fixed' && (!Number.isFinite(item.amount) || item.amount < 0)) {
      return setError('مبلغ وارد شده معتبر نیست.');
    }
    if (item.calculationMethod === 'percentage' && (!Number.isFinite(item.percent) || item.percent <= 0 || item.percent > 100)) {
      return setError('درصد باید بیشتر از صفر و حداکثر ۱۰۰ باشد.');
    }
    onSubmit(item);
  };

  return (
    <PanelFormModal
      open={open}
      title={isEditing ? 'ویرایش مبلغ متغیر' : item.type === 'addition' ? 'افزودن اضافات' : 'افزودن کسورات'}
      lead={
        item.type === 'addition'
          ? 'این مبلغ به حقوق قابل پرداخت افزوده می‌شود.'
          : 'این مبلغ قراردادی از حقوق قابل پرداخت کم می‌شود و مستقل از بیمه و مالیات پایه است.'
      }
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={submit} onCancel={onClose} />}
    >
      <div className="payroll-variable-amount-dialog-form business-payroll-editor variable">
        <div className="business-payroll-chips">
          {VARIABLE_TITLES[item.type].map((title) => (
            <button
              key={title}
              type="button"
              className={item.title === title ? 'is-selected' : ''}
              onClick={() => setItem((value) => ({ ...value, title }))}
            >
              {title}
            </button>
          ))}
        </div>
        <div className="business-payroll-toggle">
          <button
            type="button"
            className={item.calculationMethod === 'fixed' ? 'is-selected' : ''}
            onClick={() => setItem((value) => ({ ...value, calculationMethod: 'fixed' }))}
          >
            مبلغ ثابت
          </button>
          <button
            type="button"
            className={item.calculationMethod === 'percentage' ? 'is-selected' : ''}
            onClick={() => setItem((value) => ({ ...value, calculationMethod: 'percentage' }))}
          >
            ضریب محاسبه
          </button>
        </div>
        {item.calculationMethod === 'fixed' ? (
          <NumericField label="مبلغ" value={item.amount} unit="ریال" onChange={(amount) => setItem((value) => ({ ...value, amount }))} />
        ) : (
          <div className="business-payroll-fields two">
            <NumericField
              label="درصد محاسبه"
              value={item.percent}
              unit="%"
              decimalValue
              onChange={(percent) => setItem((value) => ({ ...value, percent }))}
            />
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">مبنای پرداخت</span>
              <select
                value={item.calculationBase}
                onChange={(event) => setItem((value) => ({ ...value, calculationBase: event.target.value as VariableCalculationBase }))}
              >
                <option value="baseSalary">درصدی از حقوق پایه ماهانه</option>
                <option value="grossPay">درصدی از جمع حقوق دریافتی</option>
              </select>
              <small>حقوق پایه ماهانه برابر حقوق پایه روزانه ضرب در ۳۰ است.</small>
            </label>
          </div>
        )}
        {Number.isFinite(calculated) ? <div className="business-payroll-formula">مبلغ نهایی محاسبه شده: {money(calculated)}</div> : null}
      </div>
    </PanelFormModal>
  );
}

function VariableAmountsSection({
  settings,
  baseSettings,
  derived,
  onChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  derived: PayrollDerivedValues;
  onChange: (type: VariableAmountType, items: VariableAmount[]) => void;
}) {
  const [amountEditor, setAmountEditor] = useState<{ open: boolean; item: VariableAmount | null }>({ open: false, item: null });
  const [deletingItem, setDeletingItem] = useState<VariableAmount | null>(null);
  const list = [...settings.variableAmounts.additions, ...settings.variableAmounts.deductions];

  const upsert = (item: VariableAmount) => {
    const current = item.type === 'addition' ? settings.variableAmounts.additions : settings.variableAmounts.deductions;
    const exists = current.some((entry) => entry.id === item.id);
    onChange(item.type, exists ? current.map((entry) => (entry.id === item.id ? item : entry)) : [...current, item]);
    setAmountEditor({ open: false, item: null });
  };

  const confirmDeleteItem = () => {
    if (!deletingItem) return;
    const current = deletingItem.type === 'addition' ? settings.variableAmounts.additions : settings.variableAmounts.deductions;
    onChange(deletingItem.type, current.filter((entry) => entry.id !== deletingItem.id));
    setDeletingItem(null);
  };

  return (
    <>
      <SectionHeader
        title="مبالغ متغیر"
        description="آیتم های وابسته به قرارداد یا فرد را به صورت مبلغ ثابت یا درصدی تعریف کنید."
        icon={<ReceiptText className="h-5 w-5" />}
      />
      <div className="business-payroll-variable-actions">
        <button type="button" onClick={() => setAmountEditor({ open: true, item: newVariableAmount('addition') })}>
          <Plus className="h-4 w-4" /> افزودن اضافات
        </button>
        <button type="button" onClick={() => setAmountEditor({ open: true, item: newVariableAmount('deduction') })}>
          <Plus className="h-4 w-4" /> افزودن کسورات
        </button>
      </div>
      <VariableAmountDialog
        open={amountEditor.open}
        initialItem={amountEditor.item}
        derived={derived}
        onClose={() => setAmountEditor({ open: false, item: null })}
        onSubmit={upsert}
      />
      <div className="business-payroll-items">
        {list.length ? (
          list.map((item) => {
            const amount = calculateVariableAmount(item, derived.monthlyBaseSalary, derived.grossPay);
            const baseList = item.type === 'addition' ? baseSettings?.variableAmounts.additions : baseSettings?.variableAmounts.deductions;
            const baseItem = baseList?.find((entry) => entry.id === item.id);
            const difference = baseSettings
              ? baseItem
                ? compareCollections(baseItem, item, {
                    changed: 'متفاوت با مبنا',
                    tooltip: 'نحوه محاسبه یا مقدار این آیتم با تنظیم پایه تاو ادمین متفاوت است.',
                  })
                : customDifference('اختصاصی کسب و کار', 'این آیتم فقط در تنظیمات این کسب و کار تعریف شده است.', 'added')
              : null;
            return (
              <article key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.type === 'addition' ? 'اضافه اختیاری' : 'کسور اختیاری'}</span>
                  <DifferenceBadge difference={difference} />
                </div>
                <p>
                  {item.calculationMethod === 'fixed'
                    ? 'مبلغ ثابت'
                    : `${formatFaNumber(item.percent)}٪ از ${item.calculationBase === 'baseSalary' ? 'حقوق پایه ماهانه' : 'جمع حقوق دریافتی'}`}
                </p>
                <b>{money(amount)}</b>
                <div className="business-payroll-item-actions">
                  <button type="button" aria-label="ویرایش آیتم" onClick={() => setAmountEditor({ open: true, item })}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="حذف آیتم" onClick={() => setDeletingItem(item)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <p className="business-payroll-empty">هنوز مبلغ متغیری ثبت نشده است.</p>
        )}
      </div>
      {baseSettings ? (
        <div className="business-payroll-removed-items">
          {[...baseSettings.variableAmounts.additions, ...baseSettings.variableAmounts.deductions]
            .filter((baseItem) => !list.some((item) => item.id === baseItem.id))
            .map((baseItem) => (
              <DifferenceBadge
                key={`removed-${baseItem.id}`}
                difference={customDifference(
                  'حذف از مبنا',
                  `${baseItem.title} در تنظیمات پایه تاو ادمین وجود دارد.`,
                  'removed',
                )}
              />
            ))}
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="حذف مبلغ متغیر"
        description={deletingItem ? `آیا از حذف «${deletingItem.title}» مطمئن هستید؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
}

function CoefficientRuleCard({
  title,
  label,
  value,
  helper,
  tooltip,
  difference,
  salaryPerHour,
  error,
  onChange,
}: {
  title: string;
  label: string;
  value: number;
  helper: string;
  tooltip?: string;
  difference?: BaseDifference | null;
  salaryPerHour: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <article>
      <div className="business-payroll-rule-title">
        <h4>{title}</h4>
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </div>
      <NumericField
        label={label}
        value={value}
        unit="ضریب"
        decimalValue
        onChange={onChange}
        error={error}
        difference={difference}
      />
      <div className="business-payroll-rule-result">
        <strong>{formatFaNumber((value - 1) * 100)}٪ بیشتر از ساعت عادی</strong>
        <span>{money(salaryPerHour * value)} به ازای هر ساعت</span>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function toggleCondition(list: WorkTimeConditionKey[], condition: WorkTimeConditionKey) {
  return list.includes(condition) ? list.filter((item) => item !== condition) : [...list, condition];
}

function CombinationMethodPreview({
  method,
  salaryPerHour,
}: {
  method: CoefficientCombinationMethod;
  salaryPerHour: number;
}) {
  const sample = {
    normal_overtime: 1.4,
    night_work: 1.35,
    weekly_rest_day_work: 1.4,
    official_holiday_work: 1.96,
    organizational_holiday_work: 1.4,
    mission: 1.89,
  };
  const result = calculateCombinedCoefficient({
    activeConditions: ['normal_overtime', 'night_work', 'weekly_rest_day_work'],
    coefficientsByCondition: sample,
    defaultMethod: method,
    exceptionRules: [],
  });
  const scenarioChips = [
    'اضافه‌کاری',
    'شب‌کاری',
    'جمعه‌کاری',
  ];
  const formula = method === 'highest_only'
    ? '۱.۴ ← ضریب نهایی'
    : method === 'multiply_coefficients'
      ? '۱.۴ × ۱.۳۵ × ۱.۴ = ۲.۶۴۶'
      : method === 'separate_premium_sum'
        ? 'پایه + ۴۰٪ + ۳۵٪ + ۴۰٪ = ۲.۱۵'
        : '۱ + ۰.۴ + ۰.۳۵ + ۰.۴ = ۲.۱۵';
  return (
    <div className="business-payroll-combination-preview">
      <div className="business-payroll-preview-row">
        <span>سناریو نمونه</span>
        <div className="business-payroll-preview-chips">
          {scenarioChips.map((chip) => <span key={chip}>{chip}</span>)}
        </div>
      </div>
      <div className="business-payroll-preview-formula">
        <span>محاسبه</span>
        <strong>{formula}</strong>
      </div>
      <div className="business-payroll-preview-result">
        <div>
          <span>ضریب نمونه</span>
          <strong>{decimal(Number(result.finalCoefficient.toFixed(3)))}</strong>
        </div>
        <div>
          <span>مبلغ نمونه هر ساعت</span>
          <strong>{money(salaryPerHour * result.finalCoefficient)}</strong>
        </div>
      </div>
    </div>
  );
}

function CoefficientCombinationSection({
  settings,
  baseSettings,
  salaryPerHour,
  onChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  salaryPerHour: number;
  onChange: (combination: PayrollSettings['workTimePayRules']['coefficientCombination']) => void;
}) {
  const combination = settings.workTimePayRules.coefficientCombination;
  const baseCombination = baseSettings?.workTimePayRules.coefficientCombination;
  const [previewConditions, setPreviewConditions] = useState<WorkTimeConditionKey[]>(['normal_overtime', 'night_work', 'weekly_rest_day_work']);
  const coefficientsByCondition = {
    normal_overtime: settings.workTimePayRules.overtime.normalCoefficient,
    night_work: settings.workTimePayRules.nightWork.coefficient,
    weekly_rest_day_work: settings.workTimePayRules.weeklyRestDayWork.coefficient,
    official_holiday_work: settings.workTimePayRules.officialHolidayWork.coefficient,
    organizational_holiday_work: settings.workTimePayRules.organizationalHolidayWork.coefficient,
    mission: settings.workTimePayRules.mission.coefficient,
  };
  const preview = calculateCombinedCoefficient({
    activeConditions: previewConditions,
    coefficientsByCondition,
    defaultMethod: combination.defaultMethod,
    exceptionRules: [],
  });
  const setCombination = (next: PayrollSettings['workTimePayRules']['coefficientCombination']) => onChange(next);

  return (
    <section className="business-payroll-subcard business-payroll-combination">
      <div className="business-payroll-subcard-head">
        <div>
          <h3>روش ترکیب ضرایب</h3>
          <p>وقتی چند وضعیت کاری هم زمان رخ می دهند، این بخش مشخص می کند ضریب نهایی چگونه محاسبه شود.</p>
        </div>
      </div>
      <div className="business-payroll-highlight subtle">
        <Info className="h-4 w-4" />
        سیاست کاری و تقویم مشخص می کنند چه زمانی یک وضعیت رخ داده است؛ این بخش مشخص می کند آن وضعیت ها با چه روشی در پرداخت ترکیب شوند.
      </div>
      <div className="business-payroll-combination-card">
        <header>
          <div>
            <h4>روش پیش فرض ترکیب ضرایب</h4>
            <p>اگر استثنا نداشته باشیم، همین روش اعمال می شود.</p>
          </div>
          <DifferenceBadge
            difference={baseCombination ? compareValues(baseCombination.defaultMethod, combination.defaultMethod, {
              changed: 'متفاوت با روش ترکیب مبنا',
              tooltip: `روش ترکیب تعریف شده توسط تاو ادمین برای این سال «${methodLabel(baseCombination.defaultMethod)}» است.`,
            }) : null}
          />
        </header>
        <div className="business-payroll-method-options">
          {COEFFICIENT_COMBINATION_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              className={combination.defaultMethod === method.value ? 'is-selected' : ''}
              onClick={() => setCombination({ ...combination, defaultMethod: method.value })}
            >
              <span className="business-payroll-method-badge">{method.badge}</span>
              <strong>{method.label}</strong>
              <span className="business-payroll-method-helper">{method.helper}</span>
              <span className="business-payroll-method-example">{method.example}</span>
              <span className="business-payroll-method-info" title={method.explanation} aria-label={method.explanation}>
                <Info className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
        <CombinationMethodPreview method={combination.defaultMethod} salaryPerHour={salaryPerHour} />
      </div>
      <div className="business-payroll-combination-card">
        <header>
          <div>
            <h4>پیش نمایش ترکیب ضرایب</h4>
            <p>چند وضعیت کاری را انتخاب کنید تا نتیجه را ببینید.</p>
          </div>
        </header>
        <div className="business-payroll-chips">
          {WORK_TIME_CONDITIONS.map((condition) => (
            <button
              key={condition.key}
              type="button"
              className={previewConditions.includes(condition.key) ? 'is-selected' : ''}
              onClick={() => setPreviewConditions(toggleCondition(previewConditions, condition.key))}
            >
              {condition.shortLabel}
            </button>
          ))}
        </div>
        <div className="business-payroll-preview-result">
          <div>
            <span>قانون اعمال شده</span>
            <strong>{preview.appliedRule?.name ?? 'روش پیش فرض'}</strong>
          </div>
          <div>
            <span>روش اعمال شده</span>
            <strong>{methodLabel(preview.appliedMethod)}</strong>
          </div>
          <div>
            <span>ضریب نهایی</span>
            <strong>{decimal(Number(preview.finalCoefficient.toFixed(3)))}</strong>
          </div>
          <div>
            <span>مبلغ نمونه هر ساعت</span>
            <strong>{money(salaryPerHour * preview.finalCoefficient)}</strong>
          </div>
        </div>
        <div className="business-payroll-formula">
          <strong>{formatFormula(preview.formula)}</strong>
          {preview.breakdown.length ? (
            <div className="business-payroll-preview-breakdown">
              {preview.breakdown.map((item) => (
                <span key={item.condition}>
                  {conditionLabel(item.condition, true)}: +{toPersianDigits(String(Math.round(item.premiumPercent * 100)))}٪
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function WorkTimePayRulesSection({
  settings,
  baseSettings,
  derived,
  errors,
  onChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  derived: PayrollDerivedValues;
  errors: Record<string, string>;
  onChange: (rules: PayrollSettings['workTimePayRules']) => void;
}) {
  const rules = settings.workTimePayRules;
  const baseRules = baseSettings?.workTimePayRules;
  const update = <K extends keyof PayrollSettings['workTimePayRules']>(
    key: K,
    value: PayrollSettings['workTimePayRules'][K],
  ) => onChange({ ...rules, [key]: value });
  return (
    <>
      <SectionHeader
        title="قوانین پرداخت زمان کاری"
        description="تنظیم ضرایب اضافه کاری، شب کاری، جمعه کاری، تعطیلات و ماموریت"
        icon={<Clock3 className="h-5 w-5" />}
      />
      <div className="business-payroll-highlight subtle">
        <Info className="h-4 w-4" />
        سیاست کاری و تقویم مشخص می کنند چه زمانی یک وضعیت رخ داده است؛ این بخش مشخص می کند آن وضعیت با چه ضریبی محاسبه شود.
      </div>
      <section className="business-payroll-subcard">
        <h3>اضافه کاری عادی</h3>
        <div className="business-payroll-fields two">
          <NumericField
            label="سقف اضافه کاری روزانه"
            value={rules.overtime.dailyLimitHours}
            unit="ساعت"
            decimalValue
            helper="حداکثر ساعت اضافه کاری مجاز در هر روز کاری."
            onChange={(dailyLimitHours) => update('overtime', { ...rules.overtime, dailyLimitHours })}
            error={errors.dailyLimitHours}
            difference={baseRules ? compareValues(baseRules.overtime.dailyLimitHours, rules.overtime.dailyLimitHours, {
              changed: 'متفاوت با سقف پایه',
              tooltip: `سقف پایه اضافه کاری روزانه تاو ادمین ${formatFaNumber(baseRules.overtime.dailyLimitHours)} ساعت است.`,
            }) : null}
          />
          <NumericField
            label="ضریب اضافه کاری عادی"
            value={rules.overtime.normalCoefficient}
            unit="ضریب"
            decimalValue
            helper="هر ساعت اضافه کاری عادی با این ضریب نسبت به حقوق ساعتی محاسبه می شود."
            onChange={(normalCoefficient) => update('overtime', { ...rules.overtime, normalCoefficient })}
            error={errors.normalCoefficient}
            difference={baseRules ? compareValues(baseRules.overtime.normalCoefficient, rules.overtime.normalCoefficient, {
              changed: 'متفاوت با ضریب اضافه کاری مبنا',
              tooltip: `ضریب اضافه کاری عادی مبنا ${decimal(baseRules.overtime.normalCoefficient)} است.`,
            }) : null}
          />
        </div>
        <div className="business-payroll-overtime-limits">
          <div>سقف هفتگی <strong>{formatFaNumber(derived.weeklyOvertimeLimit)} ساعت</strong></div>
          <div>سقف ماهانه <strong>{formatFaNumber(derived.monthlyOvertimeLimit)} ساعت</strong></div>
        </div>
        <div className="business-payroll-example">
          <strong>مبلغ هر ساعت اضافه کاری عادی</strong>
          <span>تقریباً {money(derived.salaryPerHour * rules.overtime.normalCoefficient)}</span>
        </div>
      </section>
      <section className="business-payroll-subcard">
        <div className="business-payroll-subcard-head">
          <div>
            <h3>شب کاری</h3>
            <p>شب کاری ممکن است داخل ساعت موظفی یا خارج از آن رخ دهد و همیشه اضافه کاری نیست.</p>
          </div>
          <div className="business-payroll-toggle">
            <button
              type="button"
              className={rules.nightWork.enabled ? 'is-selected' : ''}
              onClick={() => update('nightWork', { ...rules.nightWork, enabled: true })}
            >
              فعال
            </button>
            <button
              type="button"
              className={!rules.nightWork.enabled ? 'is-selected' : ''}
              onClick={() => update('nightWork', { ...rules.nightWork, enabled: false })}
            >
              غیرفعال
            </button>
          </div>
        </div>
        {baseRules ? (
          <DifferenceBadge
            difference={compareCollections(baseRules.nightWork.enabled, rules.nightWork.enabled, {
              changed: 'متفاوت با وضعیت شب کاری مبنا',
              tooltip: `شب کاری در تنظیمات پایه ${baseRules.nightWork.enabled ? 'فعال' : 'غیرفعال'} است.`,
            })}
          />
        ) : null}
        <div className="business-payroll-fields three">
          <TimeField
            label="شروع بازه شب کاری"
            value={rules.nightWork.startTime}
            onChange={(startTime) => update('nightWork', { ...rules.nightWork, startTime })}
            error={errors.nightStartTime}
            difference={baseRules ? compareValues(baseRules.nightWork.startTime, rules.nightWork.startTime, {
              changed: 'متفاوت با بازه شب کاری مبنا',
              tooltip: `بازه شب کاری پایه ${baseRules.nightWork.startTime} تا ${baseRules.nightWork.endTime} است.`,
            }) : null}
          />
          <TimeField
            label="پایان بازه شب کاری"
            value={rules.nightWork.endTime}
            onChange={(endTime) => update('nightWork', { ...rules.nightWork, endTime })}
            error={errors.nightEndTime}
            difference={baseRules ? compareValues(baseRules.nightWork.endTime, rules.nightWork.endTime, {
              changed: 'متفاوت با بازه شب کاری مبنا',
              tooltip: `بازه شب کاری پایه ${baseRules.nightWork.startTime} تا ${baseRules.nightWork.endTime} است.`,
            }) : null}
          />
          <NumericField
            label="ضریب شب کاری"
            value={rules.nightWork.coefficient}
            unit="ضریب"
            decimalValue
            onChange={(coefficient) => update('nightWork', { ...rules.nightWork, coefficient })}
            error={errors.nightCoefficient}
            difference={baseRules ? compareValues(baseRules.nightWork.coefficient, rules.nightWork.coefficient, {
              changed: 'متفاوت با ضریب شب کاری مبنا',
              tooltip: `ضریب شب کاری مبنا ${decimal(baseRules.nightWork.coefficient)} است.`,
            }) : null}
          />
        </div>
        <div className="business-payroll-example">
          <strong>بازه شب کاری: {toPersianDigits(rules.nightWork.startTime)} تا {toPersianDigits(rules.nightWork.endTime)}</strong>
          <span>{formatFaNumber((rules.nightWork.coefficient - 1) * 100)}٪ بیشتر از ساعت عادی؛ {money(derived.salaryPerHour * rules.nightWork.coefficient)} به ازای هر ساعت</span>
        </div>
      </section>
      <section className="business-payroll-subcard">
        <h3>ضرایب شرایط زمانی و ماموریت</h3>
        <div className="business-payroll-time-rule-cards">
          <CoefficientRuleCard
            title="جمعه کاری / کار در تعطیل هفتگی"
            label="ضریب جمعه کاری"
            value={rules.weeklyRestDayWork.coefficient}
            salaryPerHour={derived.salaryPerHour}
            helper="برای کار در روز تعطیل هفتگی تعیین شده توسط سیاست کاری یا گروه کاری."
            tooltip="روز تعطیل هفتگی توسط سیاست کاری یا گروه کاری مشخص می شود. اینجا فقط ضریب پرداخت تعیین می شود."
            onChange={(coefficient) => update('weeklyRestDayWork', { coefficient })}
            error={errors.weeklyRestDayWorkCoefficient}
            difference={baseRules ? compareValues(baseRules.weeklyRestDayWork.coefficient, rules.weeklyRestDayWork.coefficient, {
              changed: 'متفاوت با ضریب جمعه کاری مبنا',
              tooltip: `ضریب کار در تعطیل هفتگی مبنا ${decimal(baseRules.weeklyRestDayWork.coefficient)} است.`,
            }) : null}
          />
          <CoefficientRuleCard
            title="تعطیل کاری رسمی"
            label="ضریب تعطیل کاری رسمی"
            value={rules.officialHolidayWork.coefficient}
            salaryPerHour={derived.salaryPerHour}
            helper="برای کار در تعطیلات رسمی تقویمی استفاده می شود."
            tooltip="تشخیص تعطیلات رسمی از تقویم انجام می شود. اینجا فقط ضریب پرداخت تعیین می شود."
            onChange={(coefficient) => update('officialHolidayWork', { coefficient })}
            error={errors.officialHolidayWorkCoefficient}
            difference={baseRules ? compareValues(baseRules.officialHolidayWork.coefficient, rules.officialHolidayWork.coefficient, {
              changed: 'متفاوت با ضریب تعطیل رسمی مبنا',
              tooltip: `ضریب تعطیل کاری رسمی مبنا ${decimal(baseRules.officialHolidayWork.coefficient)} است.`,
            }) : null}
          />
          <CoefficientRuleCard
            title="تعطیل کاری سازمانی"
            label="ضریب تعطیل کاری سازمانی"
            value={rules.organizationalHolidayWork.coefficient}
            salaryPerHour={derived.salaryPerHour}
            helper="برای روزهای تعطیل اعلام شده توسط سازمان، مستقل از تعطیلات رسمی."
            tooltip="تعطیلات سازمانی از تقویم سازمانی یا تنظیمات تقویم می آیند. اینجا فقط ضریب پرداخت تعیین می شود."
            onChange={(coefficient) => update('organizationalHolidayWork', { coefficient })}
            error={errors.organizationalHolidayWorkCoefficient}
            difference={baseRules ? compareValues(baseRules.organizationalHolidayWork.coefficient, rules.organizationalHolidayWork.coefficient, {
              changed: 'متفاوت با ضریب تعطیل سازمانی مبنا',
              tooltip: `ضریب تعطیل کاری سازمانی مبنا ${decimal(baseRules.organizationalHolidayWork.coefficient)} است.`,
            }) : null}
          />
          <CoefficientRuleCard
            title="ماموریت"
            label="ضریب ماموریت"
            value={rules.mission.coefficient}
            salaryPerHour={derived.salaryPerHour}
            helper="برای ساعات ماموریت؛ ثبت و تایید ماموریت در ماژول مربوط انجام می شود."
            tooltip="این بخش فقط ضریب پرداخت ماموریت را مشخص می کند. فرآیند ثبت و تایید ماموریت در ماژول جداگانه انجام می شود."
            onChange={(coefficient) => update('mission', { coefficient })}
            error={errors.missionCoefficient}
            difference={baseRules ? compareValues(baseRules.mission.coefficient, rules.mission.coefficient, {
              changed: 'متفاوت با ضریب ماموریت مبنا',
              tooltip: `ضریب ماموریت مبنا ${decimal(baseRules.mission.coefficient)} است.`,
            }) : null}
          />
        </div>
      </section>
      <CoefficientCombinationSection
        settings={settings}
        baseSettings={baseSettings}
        salaryPerHour={derived.salaryPerHour}
        onChange={(coefficientCombination) => update('coefficientCombination', coefficientCombination)}
      />
    </>
  );
}

export function LeaveSection({
  settings,
  baseSettings,
  errors,
  onLeaveChange,
}: {
  settings: PayrollSettings;
  baseSettings?: PayrollSettings;
  errors: Record<string, string>;
  onLeaveChange: (settings: PayrollSettings['leave']) => void;
}) {
  const [storedHours, setStoredHours] = useState(10);
  const cashSettlement = storedHours * settings.leave.settlementRatePerHour;
  const enabledTransferRules = TRANSFER_LIMIT_RULES.filter(({ key }) => settings.leave.transferLimits[key].enabled);
  const transferLimitWarning = (() => {
    const ordered = TRANSFER_LIMIT_RULES
      .map(({ key, label }) => ({ key, label, value: settings.leave.transferLimits[key] }))
      .filter(({ value }) => value.enabled && Number.isFinite(value.hours ?? Number.NaN) && (value.hours ?? 0) > 0);
    for (let i = 0; i < ordered.length; i += 1) {
      for (let j = i + 1; j < ordered.length; j += 1) {
        if ((ordered[i].value.hours ?? 0) > (ordered[j].value.hours ?? 0)) {
          return `سقف ${ordered[i].label} از ${ordered[j].label} بیشتر است. لطفاً مقادیر را بررسی کنید.`;
        }
      }
    }
    return '';
  })();

  return (
    <>
      <SectionHeader
        title="مرخصی"
        description="سهمیه، مقدار قابل انتقال و تصمیم تسویه مرخصی ذخیره شده را مشخص کنید."
        icon={<Clock3 className="h-5 w-5" />}
      />
      <NumericField
        label="سهمیه مرخصی ماهانه"
        value={settings.leave.monthlyQuotaHours}
        unit="ساعت"
        helper="مقدار مرخصی مجاز کارمند در هر ماه."
        onChange={(monthlyQuotaHours) => onLeaveChange({ ...settings.leave, monthlyQuotaHours })}
        error={errors.monthlyQuotaHours}
        difference={baseSettings ? compareValues(baseSettings.leave.monthlyQuotaHours, settings.leave.monthlyQuotaHours, {
          changed: 'متفاوت با سیاست پایه',
          tooltip: `سهمیه مرخصی ماهانه تعریف شده توسط تاو ادمین ${formatFaNumber(baseSettings.leave.monthlyQuotaHours)} ساعت است.`,
        }) : null}
      />
      <section className="business-payroll-subcard">
        <h3>حداکثر ساعات انتقال</h3>
        <p>اگر مرخصی کامل استفاده نشود، فقط سقف های فعال شده قابل ذخیره یا انتقال هستند.</p>
        <div className="business-payroll-transfer-grid">
          {TRANSFER_LIMIT_RULES.map(({ key, label }) => {
            const currentRule = settings.leave.transferLimits[key];
            const baseRule = baseSettings?.leave.transferLimits[key];
            return (
              <TransferLimitRuleCard
                key={key}
                title={label}
                baseRule={baseRule}
                value={currentRule}
                error={currentRule.enabled ? errors[key] : undefined}
                onToggle={(enabled) =>
                  onLeaveChange({
                    ...settings.leave,
                    transferLimits: {
                      ...settings.leave.transferLimits,
                      [key]: {
                        enabled,
                        hours: enabled ? (currentRule.hours ?? baseRule?.hours ?? (key === 'monthly' ? 16 : key === 'quarterly' ? 32 : key === 'semiAnnual' ? 48 : 64)) : null,
                      },
                    },
                  })
                }
                onHoursChange={(hours) =>
                  onLeaveChange({
                    ...settings.leave,
                    transferLimits: {
                      ...settings.leave.transferLimits,
                      [key]: {
                        enabled: true,
                        hours,
                      },
                    },
                  })
                }
              />
            );
          })}
        </div>
        <div className="business-payroll-example">
          <strong>مثال انتقال مرخصی</strong>
          <span>
            سهمیه {formatFaNumber(settings.leave.monthlyQuotaHours)} ساعت - مصرف {formatFaNumber(20)} ساعت = مانده {formatFaNumber(Math.max(0, settings.leave.monthlyQuotaHours - 20))} ساعت
          </span>
          {enabledTransferRules.length ? (
            enabledTransferRules.map(({ key, label }) => {
              const hours = settings.leave.transferLimits[key].hours ?? 0;
              return <span key={key}>{label}: {formatFaNumber(hours)} ساعت</span>;
            })
          ) : (
            <span>انتقال مرخصی غیرفعال است.</span>
          )}
          {transferLimitWarning ? <span className="business-payroll-warning">{transferLimitWarning}</span> : null}
        </div>
      </section>
      <section className="business-payroll-subcard">
        <h3>تسویه نقدی مرخصی ذخیره شده</h3>
        <div className="business-payroll-fields two">
          <NumericField
            label="نرخ تسویه نقدی به ازای هر ساعت"
            value={settings.leave.settlementRatePerHour}
            unit="ریال"
            helper="برای پرداخت نقدی مرخصی استفاده نشده به کار می رود."
            onChange={(settlementRatePerHour) => onLeaveChange({ ...settings.leave, settlementRatePerHour })}
            error={errors.settlementRatePerHour}
            difference={baseSettings ? compareValues(baseSettings.leave.settlementRatePerHour, settings.leave.settlementRatePerHour, {
              changed: 'متفاوت با سیاست پایه',
              tooltip: `نرخ پایه تسویه نقدی تعریف شده توسط تاو ادمین ${money(baseSettings.leave.settlementRatePerHour)} است.`,
            }) : null}
          />
          <NumericField
            label="ساعت ذخیره برای نمایش محاسبه"
            value={storedHours}
            unit="ساعت"
            helper="صرفاً برای پیش نمایش مبلغ تسویه در این صفحه."
            onChange={setStoredHours}
          />
        </div>
        <div className="business-payroll-formula">
          {formatFaNumber(storedHours)} ساعت × {money(settings.leave.settlementRatePerHour)} = {money(cashSettlement)}
        </div>
      </section>
      <section className="business-payroll-subcard">
        <h3>وضعیت مرخصی های ذخیره شده در زمان تسویه نهایی</h3>
        <p>برای هر دلیل پایان همکاری، یکی از دو رفتار پرداخت یا ابطال را انتخاب کنید.</p>
        <div className="business-payroll-settlement-rules">
          {SETTLEMENT_RULES.map(({ key, label }) => {
            const value = settings.leave.finalSettlementRules[key];
            const difference = baseSettings ? compareValues(baseSettings.leave.finalSettlementRules[key], value, {
              changed: 'متفاوت با سیاست پایه',
              tooltip: `تصمیم پایه تاو ادمین برای ${label} «${baseSettings.leave.finalSettlementRules[key] === 'cash' ? 'تسویه نقدی' : 'ابطال مرخصی'}» است.`,
            }) : null;
            return (
              <article key={key}>
                <strong>{label}</strong>
                <div className="business-payroll-toggle">
                  <button
                    type="button"
                    className={value === 'cash' ? 'is-selected' : ''}
                    onClick={() =>
                      onLeaveChange({
                        ...settings.leave,
                        finalSettlementRules: { ...settings.leave.finalSettlementRules, [key]: 'cash' },
                      })
                    }
                  >
                    تسویه نقدی مرخصی ذخیره شده
                  </button>
                  <button
                    type="button"
                    className={value === 'cancel' ? 'is-warning' : ''}
                    onClick={() =>
                      onLeaveChange({
                        ...settings.leave,
                        finalSettlementRules: { ...settings.leave.finalSettlementRules, [key]: 'cancel' },
                      })
                    }
                  >
                    ابطال مرخصی ذخیره شده
                  </button>
                </div>
                <DifferenceBadge difference={difference} />
                {value === 'cancel' ? (
                  <p className="business-payroll-warning">
                    <CircleAlert className="h-4 w-4" /> با ابطال مرخصی ذخیره شده، مبلغ ریالی مرخصی های استفاده نشده پرداخت نخواهد شد.
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function MissionSection() {
  return (
    <>
      <SectionHeader
        title="ماموریت"
        description="تنظیمات پیشرفته ماموریت در نسخه های بعدی در دسترس قرار می گیرد."
        icon={<Construction className="h-5 w-5" />}
      />
      <section className="business-payroll-coming-soon">
        <span>در حال توسعه</span>
        <h3>قوانین پیشرفته ماموریت</h3>
        <p>ضریب پرداخت ماموریت در بخش قوانین پرداخت زمان کاری تعریف می شود. تنظیمات پیشرفته ماموریت مانند قوانین تایید، سقف ها و شرایط پرداخت در نسخه های بعدی اضافه خواهد شد.</p>
      </section>
    </>
  );
}

function TransferLimitRuleCard({
  title,
  baseRule,
  value,
  error,
  onToggle,
  onHoursChange,
}: {
  title: string;
  baseRule?: { enabled: boolean; hours: number | null };
  value: { enabled: boolean; hours: number | null };
  error?: string;
  onToggle: (enabled: boolean) => void;
  onHoursChange: (hours: number) => void;
}) {
  const difference = baseRule ? compareTransferLimit(baseRule, value, title) : null;
  return (
    <article className={`business-payroll-transfer-rule ${value.enabled ? 'is-enabled' : 'is-disabled'}`}>
      <div className="business-payroll-transfer-rule-head">
        <div>
          <strong>{title}</strong>
          {baseRule ? <DifferenceBadge difference={difference} /> : null}
        </div>
        <div className="business-payroll-toggle">
          <button type="button" className={value.enabled ? 'is-selected' : ''} onClick={() => onToggle(true)}>
            فعال
          </button>
          <button type="button" className={!value.enabled ? 'is-warning' : ''} onClick={() => onToggle(false)}>
            غیرفعال
          </button>
        </div>
      </div>
      {value.enabled ? (
        <NumericField
          label="حداکثر ساعت قابل انتقال"
          value={value.hours ?? Number.NaN}
          unit="ساعت"
          onChange={onHoursChange}
          error={error}
        />
      ) : (
        <div className="business-payroll-transfer-rule-muted">
          این قانون در محاسبه انتقال مرخصی لحاظ نمی شود.
        </div>
      )}
    </article>
  );
}

function SummarySidebar({ settings, derived }: { settings: PayrollSettings; derived: PayrollDerivedValues }) {
  const cancellationCount = SETTLEMENT_RULES.filter(({ key }) => settings.leave.finalSettlementRules[key] === 'cancel').length;
  const combinationPreview = calculateCombinedCoefficient({
    activeConditions: ['normal_overtime', 'night_work', 'weekly_rest_day_work'],
    coefficientsByCondition: {
      normal_overtime: settings.workTimePayRules.overtime.normalCoefficient,
      night_work: settings.workTimePayRules.nightWork.coefficient,
      weekly_rest_day_work: settings.workTimePayRules.weeklyRestDayWork.coefficient,
      official_holiday_work: settings.workTimePayRules.officialHolidayWork.coefficient,
      organizational_holiday_work: settings.workTimePayRules.organizationalHolidayWork.coefficient,
      mission: settings.workTimePayRules.mission.coefficient,
    },
    defaultMethod: settings.workTimePayRules.coefficientCombination.defaultMethod,
    exceptionRules: [],
  });
  const enabledTransferRules = TRANSFER_LIMIT_RULES.filter(({ key }) => settings.leave.transferLimits[key].enabled);

  return (
    <aside className="draft-template-flow-report business-payroll-report" aria-label="خلاصه زنده تنظیمات">
      <div className="draft-template-flow-report-panel">
        <header className="draft-template-flow-report-header">
          <div className="draft-template-flow-report-meta">
            <span>وضعیت</span>
            <strong>در حال ویرایش</strong>
          </div>
          <h2>خلاصه زنده</h2>
          <p>نتیجه محاسبات با تغییر مقادیر بلافاصله به روز می شود.</p>
        </header>
        <MinimalScroll className="draft-template-flow-report-body business-payroll-summary">
          <div className="draft-template-flow-report-card accent">
            <span>روز کاری کامل</span>
            <strong>{formatFaNumber(derived.fullWorkingDayHours)} ساعت و {formatFaNumber(derived.fullWorkingDayMinutes)} دقیقه</strong>
            <small>{formatFaNumber(settings.financial.dailyRequiredMinutes)} دقیقه موظفی روزانه</small>
          </div>
          <div className="draft-template-flow-report-grid">
            <div>
              <span>حقوق هر دقیقه</span>
              <strong>{money(derived.salaryPerMinute)}</strong>
            </div>
            <div>
              <span>حقوق هر ساعت</span>
              <strong>{money(derived.salaryPerHour)}</strong>
            </div>
          </div>
          <div className="draft-template-flow-report-card">
            <span>حقوق پایه ماهانه محاسباتی</span>
            <strong>{money(derived.monthlyBaseSalary)}</strong>
            <small>حقوق پایه روزانه × ۳۰ روز</small>
          </div>
          <div className="draft-template-flow-report-card">
            <span>مجموع مزایای تنظیم شده</span>
            <strong className="is-positive">{money(derived.totalBenefits)}</strong>
          </div>
          <div className="draft-template-flow-report-grid">
            <div>
              <span>اضافات اختیاری</span>
              <strong className="is-positive">{money(derived.totalOptionalAdditions)}</strong>
            </div>
            <div>
              <span>کسورات اختیاری</span>
              <strong className="is-negative">{money(derived.totalOptionalDeductions)}</strong>
            </div>
          </div>
          <div className="draft-template-flow-report-card">
            <span>مجموع کسورات برآوردی</span>
            <strong className="is-negative">{money(derived.totalDeductions)}</strong>
            <small>بیمه کارمند، مالیات پلکانی و کسورات اختیاری</small>
          </div>
          <div className="draft-template-flow-report-card total">
            <span>خالص پرداختی برآوردی</span>
            <strong>{money(derived.netPayable)}</strong>
          </div>
          <div className="draft-template-flow-report-card business-payroll-time-summary">
            <span>ضرایب پرداخت زمان کاری</span>
            <small>اضافه کاری: {decimal(settings.workTimePayRules.overtime.normalCoefficient)}</small>
            <small>
              شب کاری: {toPersianDigits(settings.workTimePayRules.nightWork.startTime)} تا {toPersianDigits(settings.workTimePayRules.nightWork.endTime)} / ضریب {decimal(settings.workTimePayRules.nightWork.coefficient)}
            </small>
            <small>جمعه کاری: {decimal(settings.workTimePayRules.weeklyRestDayWork.coefficient)} | تعطیل رسمی: {decimal(settings.workTimePayRules.officialHolidayWork.coefficient)}</small>
            <small>تعطیل سازمانی: {decimal(settings.workTimePayRules.organizationalHolidayWork.coefficient)} | ماموریت: {decimal(settings.workTimePayRules.mission.coefficient)}</small>
            <small>روش پیش فرض: {methodLabel(settings.workTimePayRules.coefficientCombination.defaultMethod)}</small>
            <small>پیش نمایش ضریب: {decimal(Number(combinationPreview.finalCoefficient.toFixed(3)))}</small>
          </div>
          <div className="draft-template-flow-report-card">
            <span>سیاست مرخصی ذخیره شده</span>
            {enabledTransferRules.length ? (
              enabledTransferRules.map(({ key, label }) => (
                <small key={key}>{label}: {formatFaNumber(settings.leave.transferLimits[key].hours ?? 0)} ساعت</small>
              ))
            ) : (
              <small>قوانین انتقال مرخصی غیرفعال است.</small>
            )}
            <small>{formatFaNumber(cancellationCount)} وضعیت با ابطال مرخصی ذخیره شده تنظیم شده است.</small>
          </div>
        </MinimalScroll>
      </div>
    </aside>
  );
}

function stepStateFromProgress(progress?: PayrollStepperProgress): StepState {
  return Object.fromEntries(
    PAYROLL_STEPS.map(({ id }, index) => [
      id,
      {
        opened: progress ? progress.openedStepIds.includes(id) : index === 0,
        completed: progress?.completedStepIds.includes(id) ?? false,
        dirty: progress?.dirtyStepIds.includes(id) ?? false,
        saved: progress?.savedStepIds.includes(id) ?? false,
      },
    ]),
  ) as StepState;
}

function createStepperProgress(selectedYear: number, state: StepState, currentStepId: PayrollStepId): PayrollStepperProgress {
  return {
    selectedYear,
    openedStepIds: PAYROLL_STEPS.filter(({ id }) => state[id].opened).map(({ id }) => id),
    completedStepIds: PAYROLL_STEPS.filter(({ id }) => state[id].completed).map(({ id }) => id),
    currentStepId,
    savedStepIds: PAYROLL_STEPS.filter(({ id }) => state[id].saved).map(({ id }) => id),
    dirtyStepIds: PAYROLL_STEPS.filter(({ id }) => state[id].dirty).map(({ id }) => id),
  };
}

export function PayrollBusinessSettingsFlow({
  mode,
  selectedYear,
  tenantId = null,
  onBackToYears,
}: {
  mode: PayrollSettingsMode;
  selectedYear: BusinessSettingYear;
  tenantId?: string | null;
  onBackToYears: () => void;
}) {
  const isTenant = mode === 'tenant';
  const [settings, setSettings] = useState<PayrollSettings>(DEFAULT_PAYROLL_SETTINGS);
  const [adminBaseSettings, setAdminBaseSettings] = useState<PayrollSettings>(DEFAULT_PAYROLL_SETTINGS);
  const [activeStep, setActiveStep] = useState<PayrollStepId>('financial');
  const [stepState, setStepState] = useState<StepState>(INITIAL_STEP_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const savedSettingsRef = useRef<PayrollSettings>(DEFAULT_PAYROLL_SETTINGS);
  const tenantOverridesRef = useRef<PayrollSettingsOverrides>({});
  const derived = useMemo(() => calculatePayrollValues(settings), [settings]);
  const tenantStorageId = isTenant ? tenantId ?? getActiveTenantStorageId() : null;
  const adminStorageKey = getPayrollSettingsStorageKey(selectedYear.year);
  const storageKey = isTenant ? getTenantPayrollSettingsStorageKey(selectedYear.year, tenantStorageId) : adminStorageKey;
  const progressStorageKey = getPayrollStepperProgressStorageKey(mode, selectedYear.year, tenantStorageId);
  const draftStorageKey = getPayrollSettingsDraftStorageKey(mode, selectedYear.year, tenantStorageId);
  const hasUnsavedChanges = useMemo(
    () => PAYROLL_STEPS.some(({ id }) => stepState[id]?.dirty),
    [stepState],
  );

  useEffect(() => {
    let baseSettings = DEFAULT_PAYROLL_SETTINGS;
    const rawBase = window.localStorage.getItem(adminStorageKey);
    try {
      if (rawBase) baseSettings = normalizePayrollSettings(JSON.parse(rawBase));
    } catch {
      window.localStorage.removeItem(adminStorageKey);
    }
    setAdminBaseSettings(baseSettings);

    const raw = window.localStorage.getItem(storageKey);
    try {
      const storedSettings = isTenant
        ? normalizePayrollSettings(applyPayrollOverrides(baseSettings, raw ? normalizePayrollOverrides(JSON.parse(raw)) : {}))
        : raw
          ? normalizePayrollSettings(JSON.parse(raw))
          : baseSettings;
      if (isTenant) tenantOverridesRef.current = buildPayrollOverrides(baseSettings, storedSettings);
      savedSettingsRef.current = storedSettings;
      const rawProgress = window.localStorage.getItem(progressStorageKey);
      const progress = rawProgress ? JSON.parse(rawProgress) as PayrollStepperProgress : undefined;
      const restoredState = stepStateFromProgress(progress);
      const restoredStep = progress?.currentStepId && restoredState[progress.currentStepId]?.opened ? progress.currentStepId : 'financial';
      const rawDraft = progress?.dirtyStepIds.length ? window.localStorage.getItem(draftStorageKey) : null;
      setSettings(rawDraft ? normalizePayrollSettings(JSON.parse(rawDraft)) : storedSettings);
      setStepState(restoredState);
      setActiveStep(restoredStep);
    } catch {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(progressStorageKey);
      window.localStorage.removeItem(draftStorageKey);
      if (isTenant) tenantOverridesRef.current = {};
      savedSettingsRef.current = baseSettings;
      setSettings(baseSettings);
      setStepState(INITIAL_STEP_STATE);
      setActiveStep('financial');
    }
  }, [adminStorageKey, draftStorageKey, isTenant, progressStorageKey, storageKey]);

  const persistProgress = (state: StepState, step: PayrollStepId) => {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(createStepperProgress(selectedYear.year, state, step)));
  };

  const markDirty = (step: PayrollStepId) => {
    setStepState((current) => {
      const next = { ...current, [step]: { ...current[step], dirty: true, saved: false } };
      persistProgress(next, activeStep);
      return next;
    });
    setNotice('');
  };

  const update = (step: PayrollStepId, apply: (value: PayrollSettings) => PayrollSettings) => {
    setSettings((current) => {
      const next = apply(current);
      window.localStorage.setItem(draftStorageKey, JSON.stringify(next));
      return next;
    });
    markDirty(step);
    setErrors({});
  };

  const scrollToStep = (step: PayrollStepId) => {
    document.getElementById(`business-payroll-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateToOpenedStep = (step: PayrollStepId) => {
    if (!stepState[step].opened) return;
    setActiveStep(step);
    persistProgress(stepState, step);
    requestAnimationFrame(() => scrollToStep(step));
  };

  const saveStep = (step: PayrollStepId) => {
    const validation = validatePayrollStep(step, settings);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setActiveStep(step);
      requestAnimationFrame(() => scrollToStep(step));
      return false;
    }
    const currentSaved = savedSettingsRef.current;
    const nextSaved: PayrollSettings =
      step === 'financial'
        ? { ...currentSaved, financial: settings.financial }
        : step === 'deductions'
          ? { ...currentSaved, deductions: settings.deductions }
          : step === 'benefits'
            ? { ...currentSaved, benefits: settings.benefits }
            : step === 'variableAmounts'
              ? { ...currentSaved, variableAmounts: settings.variableAmounts }
              : step === 'overtime'
                ? { ...currentSaved, workTimePayRules: settings.workTimePayRules }
                : step === 'leave'
                  ? { ...currentSaved, leave: settings.leave }
                  : currentSaved;
    savedSettingsRef.current = nextSaved;
    if (isTenant) {
      tenantOverridesRef.current = buildPayrollOverrides(adminBaseSettings, nextSaved);
      window.localStorage.setItem(storageKey, JSON.stringify(tenantOverridesRef.current));
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(nextSaved));
    }
    setErrors({});
    setStepState((current) => {
      const next = { ...current, [step]: { ...current[step], dirty: false, saved: true } };
      persistProgress(next, activeStep);
      return next;
    });
    setNotice('تغییرات این مرحله ذخیره شد.');
    return true;
  };

  const openNextStep = (step: PayrollStepId) => {
    const index = PAYROLL_STEPS.findIndex((item) => item.id === step);
    const next = PAYROLL_STEPS[index + 1];
    if (!next) return;
    setStepState((current) => {
      const updated = {
        ...current,
        [step]: { ...current[step], completed: true },
        [next.id]: { ...current[next.id], opened: true },
      };
      persistProgress(updated, next.id);
      return updated;
    });
    setActiveStep(next.id);
    setNotice('');
    requestAnimationFrame(() => scrollToStep(next.id));
  };

  const continueFromStep = (step: PayrollStepId) => {
    const validation = validatePayrollStep(step, settings);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setActiveStep(step);
      requestAnimationFrame(() => scrollToStep(step));
      return;
    }
    if (stepState[step].dirty && !saveStep(step)) return;
    openNextStep(step);
  };

  const submitAll = () => {
    for (const step of PAYROLL_STEPS) {
      const validation = validatePayrollStep(step.id, settings);
      if (Object.keys(validation).length) {
        setStepState((current) => {
          const next = { ...current, [step.id]: { ...current[step.id], opened: true } };
          persistProgress(next, step.id);
          return next;
        });
        setActiveStep(step.id);
        setErrors(validation);
        setNotice('برای ثبت تنظیمات، خطاهای نمایش داده شده را برطرف کنید.');
        requestAnimationFrame(() => scrollToStep(step.id));
        return;
      }
    }
    savedSettingsRef.current = settings;
    if (isTenant) {
      tenantOverridesRef.current = buildPayrollOverrides(adminBaseSettings, settings);
      window.localStorage.setItem(storageKey, JSON.stringify(tenantOverridesRef.current));
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    }
    setStepState((current) => {
      const next = Object.fromEntries(
        PAYROLL_STEPS.map(({ id }) => [id, { ...current[id], opened: true, completed: true, dirty: false, saved: true }]),
      ) as StepState;
      persistProgress(next, activeStep);
      return next;
    });
    window.localStorage.removeItem(draftStorageKey);
    setErrors({});
    setNotice('تنظیمات حقوق، حضور و غیاب با موفقیت ثبت شد.');
  };

  const saveDirtyStepsAndLeave = () => {
    const dirtySteps = PAYROLL_STEPS.filter(({ id }) => stepState[id]?.dirty).map(({ id }) => id);
    for (const step of dirtySteps) {
      if (!saveStep(step)) return false;
    }
    if (dirtySteps.length) {
      window.localStorage.removeItem(draftStorageKey);
    }
    return true;
  };

  const unsavedLeaveGuard = useUnsavedLeaveGuard({
    hasUnsavedChanges,
    onSaveAndLeave: saveDirtyStepsAndLeave,
    onBrowserBack: onBackToYears,
  });

  const allStepsOpened = PAYROLL_STEPS.every(({ id }) => stepState[id].opened);

  const renderSectionContent = (step: PayrollStepId) => {
    switch (step) {
      case 'financial':
        return (
          <FinancialSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            derived={derived}
            errors={errors}
            onChange={(key, value) => update('financial', (current) => ({ ...current, financial: { ...current.financial, [key]: value } }))}
          />
        );
      case 'deductions':
        return (
          <DeductionsSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            derived={derived}
            errors={errors}
            onPercentChange={(key, value) =>
              update('deductions', (current) => ({ ...current, deductions: { ...current.deductions, [key]: value } }))
            }
            onBracketsChange={(taxBrackets) =>
              update('deductions', (current) => ({ ...current, deductions: { ...current.deductions, taxBrackets } }))
            }
          />
        );
      case 'benefits':
        return (
          <BenefitsSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            errors={errors}
            onChange={(key, value) => update('benefits', (current) => ({ ...current, benefits: { ...current.benefits, [key]: value } }))}
          />
        );
      case 'variableAmounts':
        return (
          <VariableAmountsSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            derived={derived}
            onChange={(type, items) =>
              update('variableAmounts', (current) => ({
                ...current,
                variableAmounts: { ...current.variableAmounts, [type === 'addition' ? 'additions' : 'deductions']: items },
              }))
            }
          />
        );
      case 'overtime':
        return (
          <WorkTimePayRulesSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            derived={derived}
            errors={errors}
            onChange={(workTimePayRules) => update('overtime', (current) => ({ ...current, workTimePayRules }))}
          />
        );
      case 'leave':
        return (
          <LeaveSection
            settings={settings}
            baseSettings={isTenant ? adminBaseSettings : undefined}
            errors={errors}
            onLeaveChange={(leave) => update('leave', (current) => ({ ...current, leave }))}
          />
        );
      case 'mission':
        return <MissionSection />;
    }
  };

  const renderStepFooter = (step: PayrollStepId) => {
    const index = PAYROLL_STEPS.findIndex((item) => item.id === step);
    const state = stepState[step];
    return (
      <footer className="business-payroll-step-footer">
        {index < PAYROLL_STEPS.length - 1 ? (
          <button
            type="button"
            className={state.dirty ? 'draft-template-flow-action is-save-continue' : 'draft-template-flow-action is-primary'}
            onClick={() => continueFromStep(step)}
          >
            {state.dirty ? <Save className="h-4 w-4" /> : null}
            {state.dirty ? 'ذخیره و ادامه' : 'مرحله بعد'}
          </button>
        ) : (
          <button type="button" className="draft-template-flow-action is-primary" onClick={submitAll}>
            <Save className="h-4 w-4" /> ذخیره تغییرات
          </button>
        )}
      </footer>
    );
  };

  return (
    <div className="draft-template-flow-page business-payroll-flow" dir="rtl" lang="fa">
      <aside className="draft-template-flow-sidebar draft-template-flow-sidebar-right" aria-label="مراحل تنظیمات">
        <div className="draft-template-flow-sidebar-panel">
          <header className="draft-template-flow-sidebar-header">
            <h2>تنظیمات کسب و کار</h2>
            <p>{isTenant ? 'مقادیر اختصاصی حقوق و حضور کسب و کار' : 'حقوق، حضور و قوانین قرارداد کارکنان'}</p>
          </header>
          <MinimalScroll className="draft-template-flow-nav-list">
            {PAYROLL_STEPS.map((step, index) => {
              const state = stepState[step.id];
              const isCurrent = state.opened && activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`draft-template-flow-nav-item ${isCurrent ? 'is-active' : ''} ${state.dirty ? 'is-dirty' : ''} ${state.opened ? 'is-opened' : 'is-locked'}`}
                >
                  <button
                    type="button"
                    className="draft-template-flow-nav-main"
                    disabled={!state.opened}
                    title={state.opened ? undefined : 'ابتدا مراحل قبلی را تکمیل کنید'}
                    onClick={() => navigateToOpenedStep(step.id)}
                  >
                    <span className="draft-template-flow-nav-number">{formatFaNumber(index + 1, { useGrouping: false })}</span>
                    <span className="draft-template-flow-nav-copy">
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                      <span className="business-payroll-step-badges">
                        {isCurrent ? <span className="business-payroll-step-badge is-current">در حال انجام</span> : null}
                        {!isCurrent && state.opened && !state.saved ? <span className="business-payroll-step-badge is-opened">باز شده</span> : null}
                        {!isCurrent && state.opened && state.saved && !state.dirty ? (
                          <span className="business-payroll-step-badge is-saved">ذخیره شده</span>
                        ) : null}
                        {!state.opened ? (
                          <span className="business-payroll-step-badge is-locked" aria-label="قفل شده">
                            <LockKeyhole className="h-3 w-3" />
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                  {state.opened && state.dirty ? (
                    <button type="button" className="business-payroll-step-save-tag" onClick={() => saveStep(step.id)}>
                      ذخیره
                    </button>
                  ) : null}
                </div>
              );
            })}
          </MinimalScroll>
          <div className="draft-template-flow-sidebar-footer">
            <button
              type="button"
              className="draft-template-flow-action is-secondary"
              onClick={() => unsavedLeaveGuard.requestLeave(onBackToYears)}
            >
              بازگشت به لیست سال ها
            </button>
            <button type="button" className="draft-template-flow-action is-primary" disabled={!allStepsOpened} onClick={submitAll}>
              <ShieldCheck className="h-4 w-4" /> ثبت تنظیمات
            </button>
          </div>
        </div>
      </aside>
      <SummarySidebar settings={settings} derived={derived} />
      <main className="draft-template-flow-content business-payroll-content">
        <header className="draft-template-flow-page-header">
          <nav className="draft-template-flow-breadcrumb" aria-label="مسیر صفحه">
            <Link href="/">دسترنج</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/business-settings">تنظیمات کسب و کار</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <button
              type="button"
              className="business-payroll-year-back"
              onClick={() => unsavedLeaveGuard.requestLeave(onBackToYears)}
            >
              {isTenant ? 'تنظیمات اختصاصی حقوق و دستمزد کسب و کار' : 'قوانین حقوق و حضور و غیاب'}
            </button>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{selectedYear.title}</span>
          </nav>
          <div className="business-payroll-title-row">
            <h1>قوانین حقوق و حضور و غیاب</h1>
            {isTenant ? <strong className="business-payroll-mode-badge">صاحب کسب و کار</strong> : null}
            <span>{selectedYear.title}</span>
          </div>
          <p>
            {isTenant
              ? `تنظیم مقادیر اختصاصی کسب و کار بر اساس مقادیر پایه ${selectedYear.title}`
              : `تنظیمات پایه محاسبه حقوق، کسورات، پرداخت زمان کاری و مرخصی برای ${selectedYear.title} را مرحله به مرحله ثبت کنید.`}
          </p>
        </header>
        <div className="business-payroll-default-banner" role="note">
          <Info className="business-payroll-default-banner-icon h-5 w-5" aria-hidden />
          <div className="business-payroll-default-banner-copy">
            <strong>اطلاعات پیش‌فرض بر اساس قوانین اداره کار</strong>
            <p>تمامی اطلاعات به‌صورت پیش‌فرض مطابق قوانین اداره کار پر شده‌اند و شما می‌توانید در هر مرحله تغییرات لازم را اعمال کنید.</p>
          </div>
        </div>
        {notice ? <div className="business-payroll-notice">{notice}</div> : null}
        <div className="business-payroll-sections">
          {PAYROLL_STEPS.map((step) =>
            stepState[step.id].opened ? (
              <section
                key={step.id}
                id={`business-payroll-${step.id}`}
                data-step-id={step.id}
                tabIndex={-1}
                className={`draft-template-flow-section business-payroll-current-section ${activeStep === step.id ? 'is-current' : ''}`}
                onFocusCapture={() => {
                  setActiveStep(step.id);
                  persistProgress(stepState, step.id);
                }}
              >
                {renderSectionContent(step.id)}
                {renderStepFooter(step.id)}
              </section>
            ) : null,
          )}
        </div>
      </main>
      <UnsavedChangesDialog
        open={unsavedLeaveGuard.dialogOpen}
        saving={unsavedLeaveGuard.saving}
        onSaveAndLeave={unsavedLeaveGuard.confirmSaveAndLeave}
        onDiscardAndLeave={unsavedLeaveGuard.confirmDiscardAndLeave}
        onCancel={unsavedLeaveGuard.closeDialog}
      />
    </div>
  );
}
