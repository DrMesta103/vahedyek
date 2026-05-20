'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Building2, CalendarDays, ChevronDown, ChevronLeft, ChevronUp, ListChecks, MoveRight, Pencil, Trash2, Users } from 'lucide-react';
import { Input, PersianDatePicker } from '@repo/ui';
import { BANKS } from '../../../lib/businessContractRules';
import type { AppendixLoanPayload, FinancialDueItemData } from '../../../types/contract';
import { formatMoneyInput } from '../../../lib/financialLineShared';
import { buildRegularDueItems, type DueFrequency } from '../../../lib/financialUtils';
import { ContractRegistrationSwitch, LoanChoicePills, LoanDateInput } from '../../../(panel)/business-settings/_components/LoanSettingsPrimitives';
import { TagPills } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import { FieldLabel } from '../../../(panel)/contracts/new/_components/FieldLabel';

const PAYMENT_STATUS_OPTIONS: Array<{ value: AppendixLoanPayload['paymentStatus']; title: string; description: string }> = [
  {
    value: 'full',
    title: 'بانک تمام مبلغ وام را پرداخت کرده',
    description: 'تمام مبلغ وام درج‌شده در قرارداد پرداخت شده است.',
  },
  {
    value: 'less',
    title: 'بانک مبلغ کمتری از مبلغ وام ذکر شده در اصل قرارداد پرداخت کرده است',
    description: 'بخشی از مبلغ وام پرداخت شده و مابقی پرداخت نشده است.',
  },
  {
    value: 'more',
    title: 'بانک مبلغ بیشتری از مبلغ وام ذکر شده در اصل قرارداد پرداخت کرده است',
    description: 'مبلغ پرداختی بانک از مقدار درج‌شده در قرارداد بیشتر است.',
  },
  {
    value: 'none',
    title: 'بانک هیچ مبلغی پرداخت نکرده است',
    description: 'کل مبلغ وام بانکی درج‌شده در قرارداد هنوز پرداخت نشده است.',
  },
];

const LOAN_TIMING_OPTIONS: Array<{ value: AppendixLoanPayload['loanTiming']; label: string; description: string }> = [
  { value: 'contract-date', label: 'تاریخ وام همزمان با عقد قرارداد الحاقیه میباشد', description: 'دریافت وام همزمان با عقد قرارداد الحاقیه در نظر گرفته می‌شود.' },
  { value: 'before-contract', label: 'تاریخ دریافت وام قبل از انعقاد قرارداد است', description: 'تاریخ دریافت وام پیش از انعقاد قرارداد بوده و باید ثبت شود.' },
  { value: 'dated', label: 'وام دریافت نشده اما تاریخ مشخص دارد', description: 'وام هنوز دریافت نشده است اما تاریخ مشخصی برای دریافت آن ثبت می‌شود.' },
];

const REPAYMENT_OPTIONS: Array<{ value: AppendixLoanPayload['repaymentTiming']; label: string; description: string }> = [
  {
    value: 'before-contract-started',
    label: 'قبل از عقد قرارداد، بازپرداخت وام شروع شده',
    description: 'بازپرداخت وام پیش از ثبت قرارداد آغاز شده است.',
  },
  {
    value: 'with-appendix-contract',
    label: 'همزمان با عقد الحاقیه قرارداد شروع میشود',
    description: 'شروع بازپرداخت همزمان با ثبت الحاقیه قرارداد در نظر گرفته می‌شود.',
  },
  {
    value: 'undated',
    label: 'تاریخ مشخصی ندارد',
    description: 'برای شروع بازپرداخت، تاریخ مشخصی ثبت نمی‌شود.',
  },
  {
    value: 'with-contract-bank-installments',
    label: 'همزمان با عقد قرارداد وام با بانک پرداخت اقساط شروع میشود',
    description: 'شروع بازپرداخت همزمان با عقد قرارداد و شروع اقساط بانکی در نظر گرفته می‌شود.',
  },
];

const LOAN_AMOUNT_DETAIL_ROWS = [
  {
    key: 'interest',
    title: 'نرخ سود وام',
    description: 'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    key: 'bank-fee',
    title: 'کارمزد وام بانکی',
    description: 'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    key: 'participation',
    title: 'سود دوران مشارکت',
    description: 'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    key: 'expert',
    title: 'هزینه کارشناسی',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
  {
    key: 'priority-bond',
    title: 'هزینه اوراق حق تقدم',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
] as const;

const LOAN_AMOUNT_DETAIL_ROWS_FOR_LESS = [
  ...LOAN_AMOUNT_DETAIL_ROWS,
  {
    key: 'penalty',
    title: 'جریمه',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
  {
    key: 'discount',
    title: 'تخفیف',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
  {
    key: 'forgiveness',
    title: 'بخشودگی',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
  {
    key: 'termination',
    title: 'شرایط فسخ',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
] as const;

const LOAN_BANK_FEE_MODE_OPTIONS = [
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'percent', label: 'درصدی از مبلغ وام' },
  { value: 'combined', label: 'ترکیبی از مبلغ ثابت و درصد' },
] as const;

const LOAN_PENALTY_MODE_OPTIONS = [
  { value: 'progressive', label: 'جریمه تصاعدی با روزهای تاخیر' },
  { value: 'contract-percent', label: 'درصدی از کل قرارداد' },
  { value: 'debt-percent', label: 'درصدی از مانده بدهی' },
  { value: 'fixed', label: 'مبلغ ثابت برای هر روز/ماه' },
] as const;

const LOAN_PENALTY_ROUNDING_OPTIONS = ['0.0', '0.00'] as const;
const LOAN_DISCOUNT_CONDITION_DUE_OPTIONS = [
  { value: 'all-dues', label: 'تمام انواع پرداخت' },
  { value: 'advance-payment', label: 'پیش پرداخت' },
  { value: 'installment', label: 'اقساط' },
  { value: 'unit-handover', label: 'تحویل واحد' },
  { value: 'adjustment', label: 'تعدیل' },
  { value: 'document-handover', label: 'تحویل سند' },
  { value: 'misc-costs', label: 'هزینه های جانبی' },
] as const;
const LOAN_DISCOUNT_SETTLEMENT_OPTIONS = [
  { value: 'document-handover', label: 'تحویل سند' },
  { value: 'immediate-after-cancel', label: 'تسویه فوری پس از لغو تخفیف' },
  { value: 'unit-handover', label: 'تحویل واحد' },
] as const;

function toDisplayMoney(value: string) {
  const normalized = value.replace(/\D/g, '');
  return normalized ? `${Number(normalized).toLocaleString('fa-IR')} ریال` : '۰ ریال';
}

function sumAllocations(value: AppendixLoanPayload) {
  return ['adjustment', 'landscaping', 'utilities'].reduce((sum, key) => {
    const amount = Number(value.allocations[key as keyof AppendixLoanPayload['allocations']] || 0);
    return sum + amount;
  }, 0);
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-right ${emphasized ? 'text-[16px] font-black text-slate-900' : 'text-[13px] font-bold text-slate-700'}`}>
      <div>{label}</div>
      <div className={emphasized ? 'text-slate-800' : 'text-slate-600'}>{value}</div>
    </div>
  );
}

function LoanSummaryCard({ value }: { value: AppendixLoanPayload }) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[#d8b97a] bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <a href="#" className="text-[13px] font-black text-[#2563eb] underline underline-offset-4">
          جزئیات شرایط وام
        </a>
        <div className="text-right">
          <h3 className="text-[20px] font-black text-slate-900">تنظیمات وام</h3>
        </div>
      </div>

      <div className="bg-[#f5f8fc] px-5 py-5">
        <div className="rounded-[18px] border border-[#d8b97a] bg-[#e9eef5] p-4">
          <div className="space-y-3">
            <SummaryRow label="مبلغ کل وام در اصل قرارداد" value={toDisplayMoney(value.contractLoanAmount)} />
            <SummaryRow label="مقدار وام اختصاص یافته به الحاقیه تعدیل" value={toDisplayMoney(value.allocations.adjustment)} />
            <SummaryRow label="مقدار وام اختصاص یافته به محوطه سازی" value={toDisplayMoney(value.allocations.landscaping)} />
            <SummaryRow label="مقدار وام اختصاص یافته به انشعابات آب" value={toDisplayMoney(value.allocations.utilities)} />
            <div className="border-t border-slate-300 pt-3">
              <SummaryRow label="جمع وام های اختصاص یافته" value={`${sumAllocations(value).toLocaleString('fa-IR')} ریال`} emphasized />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoanNavigationRow({
  title,
  description,
  summary,
  onClick,
}: {
  title: string;
  description: string;
  summary?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start justify-between gap-3 border-t border-slate-200 py-5 text-right first:border-t-0">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
        <ChevronLeft className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="text-[18px] font-black text-slate-900">{title}</div>
        <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">{description}</p>
        {summary ? <div className="mt-2 text-[12px] font-black text-[var(--dark-teal)]">{summary}</div> : null}
      </div>
    </button>
  );
}

function LoanStaticDetailRow({
  title,
  description,
  summary,
  onClick,
}: {
  title: string;
  description: string;
  summary?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
        <ChevronLeft className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="text-[18px] font-black text-slate-900">{title}</div>
        <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">{description}</p>
        {summary ? <div className="mt-2 text-[12px] font-black text-[var(--dark-teal)]">{summary}</div> : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex w-full items-start justify-between gap-3 border-t border-slate-200 py-5 text-right first:border-t-0">
        {content}
      </button>
    );
  }

  return <div className="flex items-start justify-between gap-3 border-t border-slate-200 py-5 text-right first:border-t-0">{content}</div>;
}

function LoanTagDropdown<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const selected = options.find((item) => item.value === value) ?? options[0];

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600"
          aria-label={expanded ? 'بستن گزینه‌ها' : 'باز کردن گزینه‌ها'}
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? '' : '-rotate-90'}`} />
        </button>
        <div className="rounded-full bg-[#bceff4] px-5 py-2 text-[14px] font-black text-[#184a66]">
          {selected?.label ?? title}
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-200 px-4 py-4">
          <LoanChoicePills
            ariaLabel={title}
            options={options.map((item) => ({ value: item.value, label: item.label }))}
            value={value}
            onChange={(nextValue) => {
              onChange(nextValue);
              setExpanded(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function DraftTwoOptionSwitch<T extends string>({
  value,
  onChange,
  onValue,
  offValue,
  onText,
  offText,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  onValue: T;
  offValue: T;
  onText: string;
  offText: string;
  disabled?: boolean;
}) {
  const checked = value === onValue;

  return (
    <button
      type="button"
      className="business-switch financial-due-switch"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onChange(checked ? offValue : onValue);
      }}
    >
      <span className="business-switch-option is-on">{onText}</span>
      <span className="business-switch-option is-off">{offText}</span>
    </button>
  );
}

export function AppendixLoanEditor({
  value,
  onChange,
}: {
  value: AppendixLoanPayload;
  onChange: (value: AppendixLoanPayload) => void;
}) {
  const [detailView, setDetailView] = useState<
    'overview' | 'amount' | 'timing' | 'repayment' | 'interest' | 'bank-fee' | 'participation' | 'expert' | 'priority-bond' | 'penalty' | 'discount' | 'discount-condition' | 'forgiveness' | 'remaining-debt'
  >('overview');
  const [remainingDebtDialog, setRemainingDebtDialog] = useState<null | {
    section: 'prepayment' | 'installment' | 'late-installment';
    itemId: string | null;
    title: string;
    amount: string;
    dueDate: string;
    mode: 'single' | 'regular';
    frequency: DueFrequency;
    period: string;
    count: string;
    startDate: string;
  }>(null);
  const [remainingDebtDialogError, setRemainingDebtDialogError] = useState('');
  const needsReceivedDate = value.loanTiming === 'before-contract' || value.loanTiming === 'dated';
  const needsRepaymentFirstInstallmentDate =
    value.repaymentTiming === 'before-contract-started' ||
    value.repaymentTiming === 'with-appendix-contract' ||
    value.repaymentTiming === 'with-contract-bank-installments';
  const timingOption = LOAN_TIMING_OPTIONS.find((item) => item.value === value.loanTiming) ?? LOAN_TIMING_OPTIONS[0];
  const repaymentOption = REPAYMENT_OPTIONS.find((item) => item.value === value.repaymentTiming) ?? REPAYMENT_OPTIONS[0];
  const patch = (next: Partial<AppendixLoanPayload>) => onChange({ ...value, ...next });
  const syncRemainingDebtPayload = (
    nextPrepayment: FinancialDueItemData[] = value.loanRemainingDebtPrepaymentDueItems,
    nextInstallments: FinancialDueItemData[] = value.loanRemainingDebtInstallmentDueItems,
    nextLateInstallments: FinancialDueItemData[] = value.loanRemainingDebtLateInstallmentDueItems,
  ) =>
    patch({
      loanRemainingDebtPrepaymentDueItems: nextPrepayment,
      loanRemainingDebtInstallmentDueItems: nextInstallments,
      loanRemainingDebtLateInstallmentDueItems: nextLateInstallments,
      loanRemainingDebtPrepaymentCount: String(nextPrepayment.length || ''),
      loanRemainingDebtPrepaymentTotal: String(nextPrepayment.reduce((sum, item) => sum + Number(item.amount || 0), 0) || ''),
      loanRemainingDebtInstallmentCount: String(nextInstallments.length || ''),
      loanRemainingDebtInstallmentTotal: String(nextInstallments.reduce((sum, item) => sum + Number(item.amount || 0), 0) || ''),
      loanRemainingDebtLateInstallmentCount: String(nextLateInstallments.length || ''),
      loanRemainingDebtLateInstallmentTotal: String(nextLateInstallments.reduce((sum, item) => sum + Number(item.amount || 0), 0) || ''),
    });
  const paidLoanAmount = Number((value.paymentStatus === 'full' ? value.contractLoanAmount : value.loanAmount) || 0);
  const totalLoanAmount = Number(value.contractLoanAmount || 0);
  const remainingDebtAmount = Math.max(0, totalLoanAmount - paidLoanAmount);

  const goToDetails = () => {
    if (value.paymentStatus !== 'less' && value.paymentStatus !== 'full') return;
    patch({
      flowStep: 'details',
      loanAmount: value.paymentStatus === 'full' && !value.loanAmount ? value.contractLoanAmount : value.loanAmount,
    });
    setDetailView('overview');
  };

  useEffect(() => {
    if (value.flowStep !== 'details') {
      setDetailView('overview');
    }
  }, [value.flowStep]);

  const renderDetailHeader = (title: string, description: string) => (
    <div className="flex justify-start">
      <button
        type="button"
        onClick={() => setDetailView('overview')}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700"
      >
        بازگشت
        <ArrowRight className="h-4 w-4" />
      </button>
      <div className="sr-only">{title}</div>
      <div className="sr-only">{description}</div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-5">
      <LoanSummaryCard value={value} />

      <section className="rounded-[26px] border border-slate-200 bg-white px-5">
        <LoanNavigationRow
          title="مبلغ وام"
          description="در این بخش می‌بایست مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود"
          summary={value.loanAmount ? `${Number(value.loanAmount).toLocaleString('fa-IR')} ریال` : undefined}
          onClick={() => setDetailView('amount')}
        />
        <LoanNavigationRow
          title="انتخاب زمان دریافت وام"
          description="در این مرحله مشخص می‌کنید وام بانکی در چه زمانی نسبت به قرارداد دریافت شده یا دریافت خواهد شد"
          summary={timingOption.label}
          onClick={() => setDetailView('timing')}
        />
        <LoanNavigationRow
          title="زمان بازپرداخت"
          description="دراین مرحله تعیین می‌کنید بازپرداخت وام از چه زمانی آغاز شده یا خواهد شد"
          summary={repaymentOption.label}
          onClick={() => setDetailView('repayment')}
        />
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">بانک عامل</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">در این بخش بانک عامل جهت دریافت وام را مشخص کنید</p>
        </div>

        <div className="mt-4">
          <LoanChoicePills
            ariaLabel="بانک عامل"
            options={BANKS.map((bank) => ({ value: bank, label: bank }))}
            value={value.selectedBank}
            onChange={(selectedBank) => patch({ selectedBank })}
          />
        </div>
      </section>
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'مبلغ وام و نرخ سود وام',
        'در این بخش می‌بایست مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <LoanSummaryCard value={value} />
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">مبلغ کل وام در اصل قرارداد</div>
        </div>
        <div className="mt-3 rounded-2xl bg-slate-100 px-4 py-4 text-right text-[18px] font-black text-slate-700">
          {value.contractLoanAmount ? `${Number(value.contractLoanAmount).toLocaleString('fa-IR')} ریال` : '۰ ریال'}
        </div>

        <div className="mt-4">
          <input
            inputMode="numeric"
            value={formatMoneyInput(value.paymentStatus === 'full' ? value.contractLoanAmount : value.loanAmount)}
            onChange={(event) => patch({ loanAmount: event.target.value.replace(/\D/g, '') })}
            placeholder="مبلغ وام پرداختی را وارد کنید"
            readOnly={value.paymentStatus === 'full'}
            className={`app-control text-right ${value.paymentStatus === 'full' ? 'cursor-default bg-slate-100 text-slate-500' : ''}`}
          />
        </div>

        {value.paymentStatus === 'full' ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-[12px] font-bold text-emerald-700">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 text-emerald-600">✓</span>
            <span className="flex-1">این مبلغ به صورت کامل توسط بانک پرداخت شده است</span>
          </div>
        ) : null}

        <div className="mt-6 border-t border-slate-200 pt-5">
          <a href="#" className="text-[13px] font-black text-[#2563eb] underline underline-offset-4">
            جزئیات شرایط وام
          </a>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="text-right">
            <div className="text-[18px] font-black text-slate-900">مهلت تنفس</div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-5 text-slate-800">
            <button
              type="button"
              onClick={() => patch({ loanGracePeriodUnit: 'month' })}
              className="flex items-center gap-2 text-[15px] font-black"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanGracePeriodUnit === 'month' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <span>ماه</span>
            </button>
            <button
              type="button"
              onClick={() => patch({ loanGracePeriodUnit: 'day' })}
              className="flex items-center gap-2 text-[15px] font-black"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanGracePeriodUnit === 'day' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <span>روز</span>
            </button>
          </div>
          <div className="mt-4">
            <input
              inputMode="numeric"
              value={formatMoneyInput(value.loanGracePeriodValue)}
              onChange={(event) => patch({ loanGracePeriodValue: event.target.value.replace(/\D/g, '') })}
              className="app-control w-full text-right"
            />
          </div>
          <p className="mt-3 text-right text-[12px] font-semibold leading-6 text-slate-500">
            مهلت تنفس به گونه ای است که زمان شروع بازپرداخت وام را مشخص میکند. مثال: ۱۲ ماه
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200">
          {(value.paymentStatus === 'less' ? LOAN_AMOUNT_DETAIL_ROWS_FOR_LESS : LOAN_AMOUNT_DETAIL_ROWS).map((item) => (
            <LoanStaticDetailRow
              key={item.key}
              title={item.key === 'termination' ? 'تنظیمات بازپرداخت مانده بدهی وام' : item.title}
              description={item.key === 'termination' ? 'در این بخش مشخص می‌کنید مانده بدهی وام در چه بخش‌هایی تسویه و بازپرداخت می‌شود' : item.description}
              summary={
                item.key === 'interest'
                  ? value.loanBankInterestEnabled
                    ? 'برابر سیاست های بانکی'
                    : value.loanBankInterestRate
                      ? `${value.loanBankInterestRate}%`
                      : undefined
                  : item.key === 'bank-fee'
                    ? value.loanBankFeeBankPolicyEnabled
                      ? 'برابر سیاست های بانکی'
                      : value.loanBankFeeValue
                        ? value.loanBankFeeMode === 'percent'
                          ? `${value.loanBankFeeValue}%`
                          : value.loanBankFeeMode === 'combined'
                            ? `${value.loanBankFeeValue} ترکیبی`
                            : `${value.loanBankFeeValue} مبلغ ثابت`
                        : undefined
                    : item.key === 'participation'
                      ? value.loanParticipationBankPolicyEnabled
                        ? 'برابر سیاست های بانکی'
                        : value.loanParticipationRate
                          ? `${value.loanParticipationRate}%`
                          : undefined
                      : item.key === 'expert'
                        ? value.loanExpertBankPolicyEnabled
                          ? 'برابر سیاست های بانکی'
                          : value.loanExpertRate
                            ? `${value.loanExpertRate}%`
                            : undefined
                        : item.key === 'priority-bond'
                          ? value.loanPriorityBondBankPolicyEnabled
                            ? 'برابر سیاست های بانکی'
                            : value.loanPriorityBondRate
                              ? `${value.loanPriorityBondRate}%`
                              : undefined
                          : item.key === 'penalty'
                            ? value.loanPenaltyEnabled
                              ? 'فعال'
                              : 'غیرفعال'
                            : item.key === 'discount'
                              ? value.loanDiscountEnabled
                                ? value.loanDiscountConditionEnabled
                                  ? 'Success message'
                                  : 'مجاز'
                                : 'غیر مجاز'
                              : item.key === 'forgiveness'
                                ? value.loanForgivenessEnabled
                                  ? 'مجاز'
                                  : 'غیر مجاز'
                  : undefined
              }
              onClick={
                item.key === 'interest'
                  ? () => setDetailView('interest')
                  : item.key === 'bank-fee'
                    ? () => setDetailView('bank-fee')
                    : item.key === 'participation'
                      ? () => setDetailView('participation')
                      : item.key === 'expert'
                        ? () => setDetailView('expert')
                        : item.key === 'priority-bond'
                          ? () => setDetailView('priority-bond')
                          : item.key === 'penalty'
                            ? () => setDetailView('penalty')
                            : item.key === 'discount'
                              ? () => setDetailView('discount')
                              : item.key === 'forgiveness'
                                ? () => setDetailView('forgiveness')
                                : item.key === 'termination'
                                  ? () => setDetailView('remaining-debt')
                                  : undefined
              }
            />
          ))}
        </div>

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('overview')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderInterestStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'نرخ سود وام',
        'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">نرخ سود وام</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود
          </p>
        </div>

        <section className="mt-5 rounded-[24px] bg-white py-2">
          <div dir="ltr" className="flex items-start justify-between gap-4">
            <ContractRegistrationSwitch
              checked={value.loanBankInterestEnabled}
              onChange={(loanBankInterestEnabled) =>
                patch({
                  loanBankInterestEnabled,
                  loanBankInterestRate: loanBankInterestEnabled ? '' : value.loanBankInterestRate,
                })
              }
            />
            <div dir="rtl" className="space-y-3 text-right">
              <h2 className="text-[20px] font-black leading-8 text-slate-900">
                نرخ سود وام بانکی برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                دستوری که سود وام در بانکی متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
              </p>
            </div>
          </div>
        </section>

        {!value.loanBankInterestEnabled ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-4 text-right">
              <div className="text-[16px] font-black text-slate-900">نرخ سود وام</div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanBankInterestRate)}
                  onChange={(event) => patch({ loanBankInterestRate: event.target.value.replace(/\D/g, '') })}
                  className="app-control w-full pl-10 text-right"
                />
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
              </div>
              <p className="text-[12px] font-semibold leading-6 text-slate-500">میزان سود وام بانکی را در این بخش مشخص کنید. مثال (۲۴٪)</p>
            </div>
          </section>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderBankFeeStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'کارمزد وام بانکی',
        'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">کارمزد وام بانکی</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در صورتی که سود مشارکت در این وام در نظر گرفته شده است، مشخص کنید که پرداخت سود مشارکت به عهده کدام طرف قرارداد میباشد
          </p>
        </div>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-4 py-5">
          <div className="text-right text-[16px] font-black text-slate-900">کارمزد وام بانکی به عهده کیست؟</div>
          <div className="mt-5 space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با خریدار است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">خریدار میبایست کارمزد وام بانکی را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanBankFeePayer === 'buyer' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanBankFeePayer === 'buyer'} onChange={() => patch({ loanBankFeePayer: 'buyer' })} />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-slate-200 pt-5 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با سازنده است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">سازنده میبایست کارمزد وام بانکی را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanBankFeePayer === 'seller' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanBankFeePayer === 'seller'} onChange={() => patch({ loanBankFeePayer: 'seller' })} />
            </label>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-5">
          <div dir="ltr" className="flex items-start justify-between gap-4">
            <ContractRegistrationSwitch
              checked={value.loanBankFeeBankPolicyEnabled}
              onChange={(loanBankFeeBankPolicyEnabled) =>
                patch({
                  loanBankFeeBankPolicyEnabled,
                  loanBankFeeValue: loanBankFeeBankPolicyEnabled ? '' : value.loanBankFeeValue,
                })
              }
            />
            <div dir="rtl" className="space-y-3 text-right">
              <h2 className="text-[20px] font-black leading-8 text-slate-900">
                میزان کارمزد وام بانکی برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                دستوری که میزان کارمزد متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
              </p>
            </div>
          </div>
        </section>

        {!value.loanBankFeeBankPolicyEnabled ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-4">
              <div className="text-right text-[16px] font-black text-slate-900">نوع کارمزد وام بانکی</div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-200 pb-3">
                {LOAN_BANK_FEE_MODE_OPTIONS.map((option) => {
                  const active = value.loanBankFeeMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => patch({ loanBankFeeMode: option.value })}
                      className={`flex flex-col items-center gap-2 rounded-[20px] px-2 py-2 text-center transition ${
                        active ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          active ? 'border-[#93a8c2] bg-[#93a8c2] text-white' : 'border-[#93a8c2] bg-white text-[#93a8c2]'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                      </span>
                      <span className="min-h-[2.8rem] text-[13px] font-black leading-5">{option.label}</span>
                      <span className={`h-0.5 w-16 rounded-full transition ${active ? 'bg-[#93a8c2]' : 'bg-transparent'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-right">
                <div className="mb-3 text-[16px] font-black text-slate-900">
                  میزان کارمزد وام بانکی <span className="text-rose-500">*</span>
                </div>
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanBankFeeValue)}
                  onChange={(event) => patch({ loanBankFeeValue: event.target.value.replace(/\D/g, '') })}
                  className="app-control w-full text-right"
                />
                <p className="mt-3 text-[12px] font-semibold leading-6 text-slate-500">
                  کارمزد وام دریافتی که برای انجام هزینه های اداری و تقسیم اقساط و همچنین اعتبارسنجی و ... به بانک دریافت میشود.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[16px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderParticipationStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'سود دوران مشارکت',
        'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">سود دوران مشارکت</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در صورتی که سود مشارکت در این وام در نظر گرفته شده است، مشخص کنید که پرداخت سود مشارکت به عهده کدام طرف قرارداد میباشد
          </p>
        </div>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-4 py-5">
          <div className="text-right text-[16px] font-black text-slate-900">سود مشارکت به عهده کیست؟</div>
          <div className="mt-5 space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با خریدار است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">خریدار میبایست سود مشارکت را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanParticipationPayer === 'buyer' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanParticipationPayer === 'buyer'} onChange={() => patch({ loanParticipationPayer: 'buyer' })} />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-slate-200 pt-5 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با سازنده است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">سازنده میبایست سود مشارکت را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanParticipationPayer === 'seller' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanParticipationPayer === 'seller'} onChange={() => patch({ loanParticipationPayer: 'seller' })} />
            </label>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-5">
          <div dir="ltr" className="flex items-start justify-between gap-4">
            <ContractRegistrationSwitch
              checked={value.loanParticipationBankPolicyEnabled}
              onChange={(loanParticipationBankPolicyEnabled) =>
                patch({
                  loanParticipationBankPolicyEnabled,
                  loanParticipationRate: loanParticipationBankPolicyEnabled ? '' : value.loanParticipationRate,
                })
              }
            />
            <div dir="rtl" className="space-y-3 text-right">
              <h2 className="text-[20px] font-black leading-8 text-slate-900">
                سود دوران مشارکت برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                دستوری که سود دوران مشارکت متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
              </p>
            </div>
          </div>
        </section>

        {!value.loanParticipationBankPolicyEnabled ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-4 text-right">
              <div className="text-[16px] font-black text-slate-900">
                سود مشارکت <span className="text-rose-500">*</span>
              </div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanParticipationRate)}
                  onChange={(event) => patch({ loanParticipationRate: event.target.value.replace(/\D/g, '') })}
                  className="app-control w-full pl-10 text-right"
                />
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
              </div>
              <p className="text-[12px] font-semibold leading-6 text-slate-500">
                از زمانی که بانک وام را پرداخت میکند و تا زمانی اولین قسط را بایستی پرداخت کند چند درصد سود بایستی پرداخت شود
              </p>
            </div>
          </section>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderExpertStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'هزینه کارشناسی',
        'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">هزینه کارشناسی</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در صورتی که هزینه کارشناسی در این وام در نظر گرفته شده است، مشخص کنید که پرداخت هزینه کارشناسی به عهده کدام طرف قرارداد میباشد
          </p>
        </div>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-4 py-5">
          <div className="text-right text-[16px] font-black text-slate-900">هزینه کارشناسی به عهده کیست؟</div>
          <div className="mt-5 space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با خریدار است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">خریدار میبایست هزینه کارشناسی را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanExpertPayer === 'buyer' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanExpertPayer === 'buyer'} onChange={() => patch({ loanExpertPayer: 'buyer' })} />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-slate-200 pt-5 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با سازنده است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">سازنده میبایست هزینه کارشناسی را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanExpertPayer === 'seller' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanExpertPayer === 'seller'} onChange={() => patch({ loanExpertPayer: 'seller' })} />
            </label>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-5">
          <div dir="ltr" className="flex items-start justify-between gap-4">
            <ContractRegistrationSwitch
              checked={value.loanExpertBankPolicyEnabled}
              onChange={(loanExpertBankPolicyEnabled) =>
                patch({
                  loanExpertBankPolicyEnabled,
                  loanExpertRate: loanExpertBankPolicyEnabled ? '' : value.loanExpertRate,
                })
              }
            />
            <div dir="rtl" className="space-y-3 text-right">
              <h2 className="text-[20px] font-black leading-8 text-slate-900">
                هزینه کارشناسی برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                درصورتی که هزینه کارشناسی متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
              </p>
            </div>
          </div>
        </section>

        {!value.loanExpertBankPolicyEnabled ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-4 text-right">
              <div className="text-[16px] font-black text-slate-900">
                هزینه کارشناسی <span className="text-rose-500">*</span>
              </div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanExpertRate)}
                  onChange={(event) => patch({ loanExpertRate: event.target.value.replace(/\D/g, '') })}
                  className="app-control w-full pl-10 text-right"
                />
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
              </div>
              <p className="text-[12px] font-semibold leading-6 text-slate-500">
                هزینه کارشناسی و هزینه های مربوط به ارزیابی و اعتبارسنجی در این بخش مشخص میشود.
              </p>
            </div>
          </section>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderPriorityBondStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'هزینه اوراق حق تقدم',
        'در این بخش می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">هزینه اوراق حق تقدم</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در صورتی که هزینه کارشناسی در این وام در نظر گرفته شده است، مشخص کنید که پرداخت سود مشارکت به عهده کدام طرف قرارداد میباشد
          </p>
        </div>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white px-4 py-5">
          <div className="text-right text-[16px] font-black text-slate-900">هزینه اوراق حق تقدم به عهده کیست؟</div>
          <div className="mt-5 space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با خریدار است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">خریدار میبایست هزینه اوراق حق تقدم را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanPriorityBondPayer === 'buyer' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanPriorityBondPayer === 'buyer'} onChange={() => patch({ loanPriorityBondPayer: 'buyer' })} />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-slate-200 pt-5 text-right">
              <div className="flex-1">
                <div className="text-[18px] font-black text-slate-900">با سازنده است</div>
                <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">سازنده میبایست هزینه اوراق حق تقدم را پرداخت کند</p>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                {value.loanPriorityBondPayer === 'seller' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
              </span>
              <input type="radio" className="sr-only" checked={value.loanPriorityBondPayer === 'seller'} onChange={() => patch({ loanPriorityBondPayer: 'seller' })} />
            </label>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-5">
          <div dir="ltr" className="flex items-start justify-between gap-4">
            <ContractRegistrationSwitch
              checked={value.loanPriorityBondBankPolicyEnabled}
              onChange={(loanPriorityBondBankPolicyEnabled) =>
                patch({
                  loanPriorityBondBankPolicyEnabled,
                  loanPriorityBondRate: loanPriorityBondBankPolicyEnabled ? '' : value.loanPriorityBondRate,
                })
              }
            />
            <div dir="rtl" className="space-y-3 text-right">
              <h2 className="text-[20px] font-black leading-8 text-slate-900">
                هزینه اوراق حق تقدم برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                درصورتی که هزینه اوراق حق تقدم متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
              </p>
            </div>
          </div>
        </section>

        {!value.loanPriorityBondBankPolicyEnabled ? (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-4 text-right">
              <div className="text-[16px] font-black text-slate-900">
                هزینه اوراق حق تقدم <span className="text-rose-500">*</span>
              </div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanPriorityBondRate)}
                  onChange={(event) => patch({ loanPriorityBondRate: event.target.value.replace(/\D/g, '') })}
                  className="app-control w-full pl-10 text-right"
                />
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
              </div>
              <p className="text-[12px] font-semibold leading-6 text-slate-500">
                از زمانی که بانک وام را پرداخت میکند و تا زمانی اولین قسط را بایستی پرداخت کند چند درصد سود بایستی پرداخت شود
              </p>
            </div>
          </section>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderPenaltyStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'جریمه تاخیر وام',
        'در این بخش می‌کنید جریمه تاخیر اقساط بر چه اساسی محاسبه و در قرارداد اعمال می‌شود',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">جریمه تاخیر وام</div>
        </div>

        <section className="mt-5 border-t border-slate-200 pt-5">
          <div className="space-y-4 text-right">
            <h2 className="text-[20px] font-black leading-8 text-slate-900">فعال سازی بخش جریمه</h2>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => patch({ loanPenaltyEnabled: true })}
                className={`rounded-full px-4 py-2 text-[13px] font-black transition ${
                  value.loanPenaltyEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                فعال
              </button>
              <button
                type="button"
                onClick={() => patch({ loanPenaltyEnabled: false })}
                className={`rounded-full px-4 py-2 text-[13px] font-black transition ${
                  !value.loanPenaltyEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                غیر فعال
              </button>
            </div>
            <p className="text-sm leading-7 text-slate-500">با فعال بودن این بخش، جریمه تاخیر اقساط بر اساس تنظیمات زیر محاسبه و در قرارداد اعمال می‌شود.</p>
          </div>
        </section>

        {value.loanPenaltyEnabled ? (
          <div className="mt-6 space-y-6">
            <section className="border-t border-slate-200 pt-5">
              <div className="flex flex-wrap justify-end gap-3">
                {LOAN_PENALTY_MODE_OPTIONS.map((option) => {
                  const active = value.loanPenaltyMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => patch({ loanPenaltyMode: option.value })}
                      className={`flex min-h-[74px] w-[88px] flex-col items-center justify-center rounded-[22px] border px-3 py-3 text-center text-[12px] font-black transition ${
                        active ? 'border-[#8aa8c4] bg-[#8ca3bd] text-white' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border ${active ? 'border-white/70 bg-white/15' : 'border-[#8aa8c4] bg-white'}`}>
                        <span className={`h-4 w-4 rounded-full ${active ? 'bg-white/80' : 'bg-[#8aa8c4]'}`} />
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {value.loanPenaltyMode === 'progressive' ? (
                <p className="mt-4 text-right text-[12px] font-semibold leading-6 text-slate-500">
                  در این روش، مبلغ جریمه با افزایش مدت تاخیر بیشتر می‌شود. مثلا در ماه اول ۰.۵٪، ماه دوم ۱٪.
                </p>
              ) : null}
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">دوره محاسبه جریمه</div>
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">مشخص می‌کند جریمه تاخیر به‌صورت روزانه یا ماهانه محاسبه شود.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => patch({ loanPenaltyPeriod: 'daily' })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-black ${value.loanPenaltyPeriod === 'daily' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  روزانه
                </button>
                <button
                  type="button"
                  onClick={() => patch({ loanPenaltyPeriod: 'monthly' })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-black ${value.loanPenaltyPeriod === 'monthly' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  ماهانه
                </button>
              </div>
            </section>

            {value.loanPenaltyMode === 'fixed' ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">مبلغ جریمه ثابت</div>
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanPenaltyFixedAmount)}
                  onChange={(event) => patch({ loanPenaltyFixedAmount: event.target.value.replace(/\D/g, '') })}
                  className="app-control mt-3 w-full text-right"
                />
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">مبلغ ثابتی که برای هر دوره تاخیر اعمال می‌شود.</p>
              </section>
            ) : null}

            {value.loanPenaltyMode === 'debt-percent' || value.loanPenaltyMode === 'contract-percent' ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">درصد جریمه</div>
                <div className="relative mt-3">
                  <input
                    inputMode="numeric"
                    value={formatMoneyInput(value.loanPenaltyPercent)}
                    onChange={(event) => patch({ loanPenaltyPercent: event.target.value.replace(/\D/g, '') })}
                    className="app-control w-full pl-10 text-right"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
                </div>
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">درصد جریمه‌ای که برای دوره انتخاب‌شده اعمال می‌شود.</p>
              </section>
            ) : null}

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">مهلت تنفس (بدون جریمه)</div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanPenaltyGraceDays)}
                onChange={(event) => patch({ loanPenaltyGraceDays: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">تعداد روزهایی که پس از سررسید قسط، بدون محاسبه جریمه به خریدار مهلت داده می‌شود.</p>
            </section>

            {value.loanPenaltyMode === 'progressive' ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">جدول جریمه‌های تصاعدی</div>
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">توجه داشته باشید که میزان نرخ جریمه با هم همپوشانی نداشته باشد</p>
                <button type="button" className="mt-2 text-[13px] font-black text-[#2563eb] underline underline-offset-4">
                  تنظیمات پیشنهادی
                </button>
                <div className="mt-4 space-y-4">
                  {value.loanPenaltyProgressiveRows.map((row, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-4">
                      <div className="grid grid-cols-[minmax(0,1.4fr)_18px_minmax(84px,0.7fr)_minmax(84px,0.7fr)] gap-3 items-end">
                        <div>
                          <div className="mb-2 text-[13px] font-black text-slate-800">نرخ جریمه <span className="text-rose-500">*</span></div>
                          <div className="relative">
                            <input
                              inputMode="numeric"
                              value={formatMoneyInput(row.rate)}
                              onChange={(event) => {
                                const nextRows = value.loanPenaltyProgressiveRows.map((item, rowIndex) =>
                                  rowIndex === index ? { ...item, rate: event.target.value.replace(/\D/g, '') } : item,
                                );
                                patch({ loanPenaltyProgressiveRows: nextRows });
                              }}
                              className="app-control w-full pl-10 text-right"
                            />
                            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
                          </div>
                          <div className="mt-2 text-[11px] font-semibold text-slate-500">مثال: ۰.۵٪</div>
                        </div>
                        <div className="pb-4 text-center text-slate-300">-</div>
                        <div>
                          <div className="mb-2 text-[13px] font-black text-slate-800">تا <span className="text-rose-500">*</span></div>
                          <input
                            inputMode="numeric"
                            value={formatMoneyInput(row.toDay)}
                            onChange={(event) => {
                              const nextRows = value.loanPenaltyProgressiveRows.map((item, rowIndex) =>
                                rowIndex === index ? { ...item, toDay: event.target.value.replace(/\D/g, '') } : item,
                              );
                              patch({ loanPenaltyProgressiveRows: nextRows });
                            }}
                            className="app-control w-full text-right"
                          />
                          <div className="mt-2 text-[11px] font-semibold text-slate-500">مثال: از روز ۱ تا {row.toDay || '۳۰'} روز تاخیر</div>
                        </div>
                        <div>
                          <div className="mb-2 text-[13px] font-black text-slate-800">از <span className="text-rose-500">*</span></div>
                          <input
                            inputMode="numeric"
                            value={formatMoneyInput(row.fromDay)}
                            onChange={(event) => {
                              const nextRows = value.loanPenaltyProgressiveRows.map((item, rowIndex) =>
                                rowIndex === index ? { ...item, fromDay: event.target.value.replace(/\D/g, '') } : item,
                              );
                              patch({ loanPenaltyProgressiveRows: nextRows });
                            }}
                            className="app-control w-full text-right"
                          />
                          <div className="mt-2 text-[11px] font-semibold text-slate-500">از روز {row.fromDay || '۱'} تا روز تاخیر</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {value.loanPenaltyMode !== 'fixed' ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">درصد سود بانکی</div>
                <div className="relative mt-3">
                  <input
                    inputMode="numeric"
                    value={formatMoneyInput(value.loanPenaltyBankPercent)}
                    onChange={(event) => patch({ loanPenaltyBankPercent: event.target.value.replace(/\D/g, '') })}
                    className="app-control w-full pl-10 text-right"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span>
                </div>
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">در این بخش درصد سود بانکی را می‌توانید به درصد جریمه اضافه کنید.</p>
              </section>
            ) : null}

            <section className="border-t border-slate-200 pt-5">
              <div dir="ltr" className="flex items-start justify-between gap-4">
                <ContractRegistrationSwitch
                  checked={value.loanPenaltyExtraFeeEnabled}
                  onChange={(loanPenaltyExtraFeeEnabled) => patch({ loanPenaltyExtraFeeEnabled })}
                />
                <div dir="rtl" className="space-y-3 text-right">
                  <h2 className="text-[20px] font-black leading-8 text-slate-900">هزینه دیرکرد</h2>
                  <p className="text-sm leading-7 text-slate-500">مبلغ یا درصدی که علاوه بر جریمه تأخیر برای هر قسط معوق اعمال می‌شود.</p>
                </div>
              </div>
            </section>

            {value.loanPenaltyExtraFeeEnabled ? (
              <section className="rounded-[24px] bg-[#bfe8ec] px-4 py-5">
                <div className="text-right text-[16px] font-black text-slate-900">مشخص کنید بر اساس درصد میباشد یا مبلغ ثابت</div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => patch({ loanPenaltyExtraFeeMode: 'percent' })}
                    className={`rounded-full border px-4 py-2 text-[13px] font-black ${value.loanPenaltyExtraFeeMode === 'percent' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    درصد
                  </button>
                  <button
                    type="button"
                    onClick={() => patch({ loanPenaltyExtraFeeMode: 'fixed' })}
                    className={`rounded-full border px-4 py-2 text-[13px] font-black ${value.loanPenaltyExtraFeeMode === 'fixed' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    مبلغ ثابت
                  </button>
                </div>
                <div className="mt-5 text-right">
                  <div className="text-[16px] font-black text-slate-900">جریمه بالاسری</div>
                  <div className="relative mt-3">
                    <input
                      inputMode="numeric"
                      value={formatMoneyInput(value.loanPenaltyExtraFeeValue)}
                      onChange={(event) => patch({ loanPenaltyExtraFeeValue: event.target.value.replace(/\D/g, '') })}
                      className="app-control w-full pl-10 text-right"
                    />
                    {value.loanPenaltyExtraFeeMode === 'percent' ? <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[18px] font-black text-slate-500">%</span> : null}
                  </div>
                </div>
              </section>
            ) : null}

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">قاعده گرد کردن مبلغ جریمه</div>
              <div className="mt-4 flex justify-end gap-3">
                {LOAN_PENALTY_ROUNDING_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => patch({ loanPenaltyRoundingMode: option })}
                    className={`rounded-full border px-4 py-2 text-[13px] font-black ${value.loanPenaltyRoundingMode === option ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود.</p>
            </section>
          </div>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderDiscountConditionStep = () => (
    <div className="space-y-5">
      {renderDetailHeader('شرط تخفیف و خوش حسابی تخفیف', 'مشخص کنید تخفیف در چه شرایطی حفظ یا لغو می‌شود')}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">شرط تخفیف و خوش حسابی تخفیف</div>
        </div>
        <section className="mt-5 border-t border-slate-200 pt-5 text-right">
          <h2 className="text-[20px] font-black text-slate-900">شرط تخفیف و خوش حسابی تخفیف داشته باشد یا خیر</h2>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => patch({ loanDiscountConditionEnabled: true })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${value.loanDiscountConditionEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              مجاز
            </button>
            <button
              type="button"
              onClick={() => patch({ loanDiscountConditionEnabled: false })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${!value.loanDiscountConditionEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              غیر مجاز
            </button>
          </div>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-slate-500">در صورت فعال بودن، مبلغ قرارداد بر اساس شاخص یا درصد ثابت، در دوره‌های مشخص تعدیل می‌شود</p>
        </section>

        {value.loanDiscountConditionEnabled ? (
          <div className="mt-6 space-y-6">
            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">حداکثر تعداد دفعات تاخیر در یک قرارداد</div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanDiscountConditionMaxDelayCount)}
                onChange={(event) => patch({ loanDiscountConditionMaxDelayCount: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">حداکثر دفعاتی که در یک قرارداد و در طول پرداخت انواع سررسیدها مجاز به تاخیر قابل بخشودگی است را وارد کنید. مثال: ۳ تاخیر مجاز</p>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">مهلت تنفس (بدون لغو تخفیف)<span className="mr-1 text-rose-500">*</span></div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanDiscountConditionGraceDays)}
                onChange={(event) => patch({ loanDiscountConditionGraceDays: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">تعداد روزهایی که خریدار می‌تواند پس از سررسید، مبلغ مربوط را بدون از دست دادن تخفیف پرداخت کند.</p>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">سررسید ها متاثر از شرط تخفیف</div>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                {LOAN_DISCOUNT_CONDITION_DUE_OPTIONS.map((option) => {
                  const active = value.loanDiscountConditionDueKeys.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        patch({
                          loanDiscountConditionDueKeys: active
                            ? value.loanDiscountConditionDueKeys.filter((item) => item !== option.value)
                            : [...value.loanDiscountConditionDueKeys, option.value],
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-[13px] font-black ${active ? 'border-[#a5e6ef] bg-[#a5e6ef] text-slate-900' : 'border-slate-300 bg-white text-slate-700'}`}
                    >
                      {active ? '✓ ' : ''}
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[12px] font-semibold leading-6 text-slate-500">در این بخش تعیین می‌کنید که برای حفظ تخفیف، کدام پرداخت‌ها باید بموقع انجام شود.</p>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <div dir="ltr" className="flex items-start justify-between gap-4">
                <ContractRegistrationSwitch
                  checked={value.loanDiscountConditionInstallmentAllowed}
                  onChange={(loanDiscountConditionInstallmentAllowed) => patch({ loanDiscountConditionInstallmentAllowed })}
                />
                <div dir="rtl" className="space-y-3 text-right">
                  <h2 className="text-[20px] font-black leading-8 text-slate-900">امکان تقسیط مبلغ لغو تخفیف</h2>
                  <p className="text-sm leading-7 text-slate-500">اگر تخفیف بدلیل تاخیر لغو شود، با فعال بودن این گزینه، مبلغ لغو شده می‌تواند بصورت اقساطی از خریدار دریافت شود</p>
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <div dir="ltr" className="flex items-start justify-between gap-4">
                <ContractRegistrationSwitch
                  checked={value.loanDiscountConditionPenaltyEnabled}
                  onChange={(loanDiscountConditionPenaltyEnabled) => patch({ loanDiscountConditionPenaltyEnabled })}
                />
                <div dir="rtl" className="space-y-3 text-right">
                  <h2 className="text-[20px] font-black leading-8 text-slate-900">اعمال جریمه بر مبلغ لغو تخفیف</h2>
                  <p className="text-sm leading-7 text-slate-500">در صورت فعال بودن این گزینه، مبلغ تخفیف لغوشده مانند بدهی تاخیری مشمول جریمه تاخیر نیز می‌شود.</p>
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">زمان تسویه تخفیف</div>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                {LOAN_DISCOUNT_SETTLEMENT_OPTIONS.map((option) => {
                  const active = value.loanDiscountSettlementTargets.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        patch({
                          loanDiscountSettlementTargets: active
                            ? value.loanDiscountSettlementTargets.filter((item) => item !== option.value)
                            : [...value.loanDiscountSettlementTargets, option.value],
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-[13px] font-black ${active ? 'border-[#a5e6ef] bg-[#a5e6ef] text-slate-900' : 'border-slate-300 bg-white text-slate-700'}`}
                    >
                      {active ? '✓ ' : ''}
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[12px] font-semibold leading-6 text-slate-500">مشخص می‌کند مبلغ لغو تخفیف در چه مرحله‌ای از قرارداد باید تسویه شود.</p>
            </section>
          </div>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('discount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderDiscountStep = () => (
    <div className="space-y-5">
      {renderDetailHeader('تخفیف وام', 'در این بخش می‌توانید مبلغ تنظیمات وام را برای قرارداد خود فعال کنید')}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">تخفیف وام</div>
        </div>
        <section className="mt-5 border-t border-slate-200 pt-5 text-right">
          <h2 className="text-[20px] font-black text-slate-900">تخفیف وام</h2>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => patch({ loanDiscountEnabled: true })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${value.loanDiscountEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              مجاز
            </button>
            <button
              type="button"
              onClick={() => patch({ loanDiscountEnabled: false })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${!value.loanDiscountEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              غیر مجاز
            </button>
          </div>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-slate-500">اگر این گزینه فعال باشد، میتوانید مبلغ تنظیمات وام را برای قرارداد خود فعال کنید.</p>
        </section>

        {value.loanDiscountEnabled ? (
          <div className="mt-6 space-y-6">
            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="flex justify-end gap-8">
                <button
                  type="button"
                  onClick={() => patch({ loanDiscountMode: 'percent' })}
                  className="flex flex-col items-center gap-2"
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${value.loanDiscountMode === 'percent' ? 'border-[#8ca3bd] bg-[#8ca3bd] text-white' : 'border-[#8ca3bd] bg-white text-[#8ca3bd]'}`}>◎</span>
                  <span className={`text-[13px] font-black ${value.loanDiscountMode === 'percent' ? 'text-slate-900' : 'text-slate-600'}`}>درصد</span>
                </button>
                <button
                  type="button"
                  onClick={() => patch({ loanDiscountMode: 'amount' })}
                  className="flex flex-col items-center gap-2"
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${value.loanDiscountMode === 'amount' ? 'border-[#8ca3bd] bg-[#8ca3bd] text-white' : 'border-[#8ca3bd] bg-white text-[#8ca3bd]'}`}>◎</span>
                  <span className={`text-[13px] font-black ${value.loanDiscountMode === 'amount' ? 'text-slate-900' : 'text-slate-600'}`}>مبلغ</span>
                </button>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">حداقل مبلغ تخفیف<span className="mr-1 text-rose-500">*</span></div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanDiscountMinValue)}
                onChange={(event) => patch({ loanDiscountMinValue: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">حداقل مبلغی که در صورت اعمال تخفیف می‌تواند کاهش داده شود. مثال ۱۰,۰۰۰,۰۰۰ تومان</p>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">حداکثر مبلغ تخفیف<span className="mr-1 text-rose-500">*</span></div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanDiscountMaxValue)}
                onChange={(event) => patch({ loanDiscountMaxValue: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">حداکثر مبلغی که مجاز به تخفیف است. مثال ۲۰,۰۰۰,۰۰۰ تومان</p>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <LoanStaticDetailRow
                title="شرط تخفیف و خوش حسابی تخفیف"
                description="در این بخش می‌توانید مشخص کنید به چه شرطی می‌خواهید تخفیف برای کاربر در نظر بگیرید"
                summary={value.loanDiscountConditionEnabled ? 'Success message' : undefined}
                onClick={() => setDetailView('discount-condition')}
              />
            </section>

            <section className="border-t border-slate-200 pt-5">
              <div dir="ltr" className="flex items-start justify-between gap-4">
                <ContractRegistrationSwitch
                  checked={value.loanDiscountManagerApprovalEnabled}
                  onChange={(loanDiscountManagerApprovalEnabled) => patch({ loanDiscountManagerApprovalEnabled })}
                />
                <div dir="rtl" className="space-y-3 text-right">
                  <h2 className="text-[20px] font-black leading-8 text-slate-900">تایید مدیر برای تخفیف‌های بزرگ</h2>
                  <p className="text-sm leading-7 text-slate-500">در صورت فعال بودن، بخشودگی‌های بیش از یک حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.</p>
                </div>
              </div>
            </section>

            {value.loanDiscountManagerApprovalEnabled ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">میزان حدآستانه تایید مدیر<span className="mr-1 text-rose-500">*</span></div>
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanDiscountApprovalThreshold)}
                  onChange={(event) => patch({ loanDiscountApprovalThreshold: event.target.value.replace(/\D/g, '') })}
                  className="app-control mt-3 w-full text-right"
                />
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">اگر مقدار بخشودگی از این حد عبور کند، درخواست باید توسط مدیر/مالی تایید شود.</p>
              </section>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderForgivenessStep = () => (
    <div className="space-y-5">
      {renderDetailHeader('بخشودگی جریمه وام', 'بخشودگی برای هر بدهی/فاکتور')}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">به ازای هر بدهی/فاکتور</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            اگر فعال باشد، اپراتور می‌تواند برای جریمه‌های ایجادشده، بخشی یا تمام جریمه را طبق سیاست‌های این بخش ببخشد.
          </p>
        </div>

        <section className="mt-5 border-t border-slate-200 pt-5 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => patch({ loanForgivenessEnabled: true })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${value.loanForgivenessEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              مجاز
            </button>
            <button
              type="button"
              onClick={() => patch({ loanForgivenessEnabled: false })}
              className={`rounded-full px-4 py-2 text-[13px] font-black ${!value.loanForgivenessEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              غیر مجاز
            </button>
          </div>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-slate-500">اگر این گزینه فعال باشد، میتوانید مبلغ تنظیمات وام را برای قرارداد خود فعال کنید.</p>
        </section>

        {value.loanForgivenessEnabled ? (
          <div className="mt-6 space-y-6">
            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="flex justify-end gap-8">
                <button
                  type="button"
                  onClick={() => patch({ loanForgivenessMode: 'percent' })}
                  className="flex flex-col items-center gap-2"
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${value.loanForgivenessMode === 'percent' ? 'border-[#8ca3bd] bg-[#8ca3bd] text-white' : 'border-[#8ca3bd] bg-white text-[#8ca3bd]'}`}>◎</span>
                  <span className={`text-[13px] font-black ${value.loanForgivenessMode === 'percent' ? 'text-slate-900' : 'text-slate-600'}`}>درصد</span>
                </button>
                <button
                  type="button"
                  onClick={() => patch({ loanForgivenessMode: 'amount' })}
                  className="flex flex-col items-center gap-2"
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${value.loanForgivenessMode === 'amount' ? 'border-[#8ca3bd] bg-[#8ca3bd] text-white' : 'border-[#8ca3bd] bg-white text-[#8ca3bd]'}`}>◎</span>
                  <span className={`text-[13px] font-black ${value.loanForgivenessMode === 'amount' ? 'text-slate-900' : 'text-slate-600'}`}>مبلغ</span>
                </button>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">
                {value.loanForgivenessMode === 'percent' ? 'حداقل درصد جریمه قابل بخشش' : 'حداقل مبلغ جریمه قابل بخشش'}
              </div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanForgivenessMinValue)}
                onChange={(event) => patch({ loanForgivenessMinValue: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">
                {value.loanForgivenessMode === 'percent'
                  ? 'حداقل درصدی که در صورت اعمال بخشودگی می‌تواند کاهش داده شود. مثال ۱۰ درصد'
                  : 'حداقل مبلغی که در صورت اعمال بخشودگی می‌تواند کاهش داده شود.'}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <div className="text-[16px] font-black text-slate-900">
                {value.loanForgivenessMode === 'percent' ? 'حداکثر درصد جریمه قابل بخشش' : 'حداکثر مبلغ جریمه قابل بخشش'}
              </div>
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanForgivenessMaxValue)}
                onChange={(event) => patch({ loanForgivenessMaxValue: event.target.value.replace(/\D/g, '') })}
                className="app-control mt-3 w-full text-right"
              />
              <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">
                {value.loanForgivenessMode === 'percent'
                  ? 'حداکثر درصدی که مجاز به بخشودگی است. مثال ۱۵ درصد'
                  : 'حداکثر مبلغی که مجاز به بخشودگی است.'}
              </p>
            </section>

            <section className="border-t border-slate-200 pt-5 text-right">
              <h2 className="text-[20px] font-black text-slate-900">تاخیر خارج از اختیار خریدار</h2>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => patch({ loanForgivenessOutsideBuyerControlEnabled: true })}
                  className={`rounded-full px-4 py-2 text-[13px] font-black ${value.loanForgivenessOutsideBuyerControlEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  مجاز
                </button>
                <button
                  type="button"
                  onClick={() => patch({ loanForgivenessOutsideBuyerControlEnabled: false })}
                  className={`rounded-full px-4 py-2 text-[13px] font-black ${!value.loanForgivenessOutsideBuyerControlEnabled ? 'bg-[var(--dark-teal)] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  غیر مجاز
                </button>
              </div>
              <p className="mt-4 text-[12px] font-semibold leading-6 text-slate-500">در صورت فعال بودن، مبلغ قرارداد بر اساس شاخص یا درصد ثابت، در دوره‌های مشخص تعدیل می‌شود</p>
            </section>

            <section className="border-t border-slate-200 pt-5">
              <div dir="ltr" className="flex items-start justify-between gap-4">
                <ContractRegistrationSwitch
                  checked={value.loanForgivenessManagerApprovalEnabled}
                  onChange={(loanForgivenessManagerApprovalEnabled) => patch({ loanForgivenessManagerApprovalEnabled })}
                />
                <div dir="rtl" className="space-y-3 text-right">
                  <h2 className="text-[20px] font-black leading-8 text-slate-900">تایید مدیر برای بخشودگی‌های بزرگ</h2>
                  <p className="text-sm leading-7 text-slate-500">اگر فعال باشد، بخشودگی‌های بالاتر از یک حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.</p>
                </div>
              </div>
            </section>

            {value.loanForgivenessManagerApprovalEnabled ? (
              <section className="border-t border-slate-200 pt-5 text-right">
                <div className="text-[16px] font-black text-slate-900">میزان حدآستانه تایید مدیر<span className="mr-1 text-rose-500">*</span></div>
                <input
                  inputMode="numeric"
                  value={formatMoneyInput(value.loanForgivenessApprovalThreshold)}
                  onChange={(event) => patch({ loanForgivenessApprovalThreshold: event.target.value.replace(/\D/g, '') })}
                  className="app-control mt-3 w-full text-right"
                />
                <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">اگر مقدار بخشودگی از این حد عبور کند، درخواست باید توسط مدیر/مالی تایید شود.</p>
              </section>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderRemainingDebtGauge = (lines: string[], amount: string) => (
    <div className="rounded-[28px] bg-white px-4 py-5">
      <div className="mx-auto flex w-full max-w-[220px] flex-col items-center">
        <div className="h-[100px] w-[196px] rounded-t-full border-[8px] border-b-0 border-[#ddf5f7]" />
        <div className="-mt-12 text-center text-[11px] font-semibold leading-6 text-slate-500">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
      <div className="mt-3 text-center text-[14px] font-black text-slate-700">{amount ? `${formatMoneyInput(amount)} ریال` : 'ریال -'}</div>
    </div>
  );

  const renderRemainingDebtMoneyInput = ({
    value: amount,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => {
    const numericValue = Number(amount || 0);
    return (
      <div className="w-full max-w-sm">
        <div className="relative">
          <Input
            value={numericValue ? numericValue.toLocaleString('en-US') : ''}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
            placeholder="مبلغ را وارد کنید"
            className="h-10 rounded-xl border-[#aeb9c3] bg-white/70 pr-4 pl-14 text-left text-[14px] font-semibold"
            inputMode="numeric"
          />
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-gray-400">تومان</span>
        </div>
        <div className="mt-1.5 text-[11px] font-bold leading-5 text-[#18a9c3]">
          {numericValue ? `${numericValue.toLocaleString('fa-IR')} تومان` : '۰ تومان'}
        </div>
      </div>
    );
  };

  const renderRemainingDebtProgressGauge = ({ percent, overLimit }: { percent: number; overLimit: boolean }) => {
    const safePercent = Math.max(0, Math.min(percent, 100));
    return (
      <div className="relative h-[74px] w-[132px] shrink-0">
        <svg viewBox="0 0 120 70" className="h-full w-full overflow-visible">
          <path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M14 58 A46 46 0 0 1 106 58"
            fill="none"
            stroke={overLimit ? '#ff6b6b' : '#0e989d'}
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - safePercent}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center text-[18px] font-bold text-[#4b5159]">{safePercent}%</div>
      </div>
    );
  };

  const renderRemainingDebtDraftSummary = ({
    itemsCount,
    registeredAmount,
    targetAmount,
  }: {
    itemsCount: number;
    registeredAmount: number;
    targetAmount: number;
  }) => {
    const effectiveTargetAmount = targetAmount > 0 ? targetAmount : registeredAmount;
    const percent = effectiveTargetAmount > 0 ? Math.min(100, Math.round((registeredAmount / effectiveTargetAmount) * 100)) : 0;
    const remaining = Math.max(0, effectiveTargetAmount - registeredAmount);
    return (
      <div className="mt-3 rounded-xl bg-[#c4e8ea]/55 px-3 py-3 text-[13px] text-[#4f545d]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {renderRemainingDebtProgressGauge({ percent, overLimit: registeredAmount > targetAmount })}
            <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-3">
              <div>
                <div className="text-[11px] text-[#6b7078]">سررسید</div>
                <div className="mt-0.5 font-bold text-[#4b5159]">{itemsCount} مورد</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6b7078]">ثبت‌شده</div>
                <div className="mt-0.5 font-bold text-[#0e989d]">{registeredAmount.toLocaleString('fa-IR')} تومان</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6b7078]">{registeredAmount <= targetAmount ? 'مانده' : 'مازاد'}</div>
                <div className={`mt-0.5 font-bold ${registeredAmount <= targetAmount ? 'text-[#4b5159]' : 'text-[#ff5252]'}`}>
                  {Math.abs(remaining).toLocaleString('fa-IR')} تومان
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#0e989d] shadow-sm">
            <ChevronUp className="h-5 w-5 text-[#13a2b2]" />
          </div>
        </div>
      </div>
    );
  };

  const renderRemainingDebtDraftCards = (
    items: Array<{ id: string; title: string; date: string; amount: string; section: 'prepayment' | 'installment' | 'late-installment' }>,
  ) => {
    if (!items.length) return null;
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.42)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[#ff4c72]">
                <button type="button" onClick={() => deleteRemainingDebtItem(item.section, item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openRemainingDebtDialog(item.section, {
                      id: item.id,
                      categoryId: '',
                      title: item.title,
                      amount: Number(item.amount || 0),
                      dueDate: item.date,
                    })
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <div className="text-[14px] font-black text-[#0e989d]">{Number(item.amount || 0).toLocaleString('fa-IR')} تومان</div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-black text-slate-800">{item.title}</div>
                <div className="mt-1 text-[12px] font-semibold text-slate-500">{item.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const openRemainingDebtDialog = (section: 'prepayment' | 'installment' | 'late-installment', item?: FinancialDueItemData) => {
    setRemainingDebtDialogError('');
    const currentItems =
      section === 'prepayment'
        ? value.loanRemainingDebtPrepaymentDueItems
        : section === 'installment'
          ? value.loanRemainingDebtInstallmentDueItems
          : value.loanRemainingDebtLateInstallmentDueItems;
    const indexLabel = currentItems.length + 1;
    setRemainingDebtDialog({
      section,
      itemId: item?.id ?? null,
      title:
        item?.title ??
        (section === 'prepayment'
          ? `پیش پرداخت ${indexLabel}`
          : section === 'installment'
            ? `قسط ${indexLabel}`
            : `قسط نامنظم ${indexLabel}`),
      amount: item ? String(item.amount || '') : '',
      dueDate: item?.dueDate ?? '',
      mode: section === 'installment' && !item ? 'regular' : 'single',
      frequency: 'monthly',
      period: '1',
      count: '',
      startDate: item?.dueDate ?? '',
    });
  };

  const saveRemainingDebtDialog = () => {
    if (!remainingDebtDialog) return;
    setRemainingDebtDialogError('');
    const targetList =
      remainingDebtDialog.section === 'prepayment'
        ? value.loanRemainingDebtPrepaymentDueItems
        : remainingDebtDialog.section === 'installment'
          ? value.loanRemainingDebtInstallmentDueItems
          : value.loanRemainingDebtLateInstallmentDueItems;
    let updatedList: FinancialDueItemData[] = targetList;
    const categoryId =
      remainingDebtDialog.section === 'prepayment'
        ? 'loan-remaining-prepayment'
        : remainingDebtDialog.section === 'installment'
          ? 'loan-remaining-installment'
          : 'loan-remaining-late-installment';

    if (remainingDebtDialog.section === 'installment' && !remainingDebtDialog.itemId && remainingDebtDialog.mode === 'regular') {
      const totalAmount = Number(remainingDebtDialog.amount || 0);
      const count = Number(remainingDebtDialog.count || 0);
      const period = Number(remainingDebtDialog.period || 1);
      if (!remainingDebtDialog.title.trim() || !remainingDebtDialog.startDate || totalAmount <= 0 || count <= 0) {
        setRemainingDebtDialogError('عنوان، مبلغ، تعداد و تاریخ شروع را کامل کنید.');
        return;
      }
      const generated = buildRegularDueItems({
        activeTab: categoryId,
        title: remainingDebtDialog.title.trim(),
        totalAmount,
        count,
        startDate: remainingDebtDialog.startDate,
        frequency: remainingDebtDialog.frequency,
        period,
        idPrefix: `loan-remaining-installment-${Date.now()}`,
      }).map((item) => ({ ...item, categoryId }));
      updatedList = [...targetList, ...generated];
    } else {
      const nextItem: FinancialDueItemData = {
        id: remainingDebtDialog.itemId ?? `${remainingDebtDialog.section}-${Date.now()}`,
        categoryId,
        title: remainingDebtDialog.title.trim(),
        amount: Number(remainingDebtDialog.amount || 0),
        dueDate: remainingDebtDialog.dueDate || remainingDebtDialog.startDate,
      };
      if (!nextItem.title || !nextItem.dueDate || nextItem.amount <= 0) {
        setRemainingDebtDialogError('عنوان، مبلغ و تاریخ سررسید را کامل کنید.');
        return;
      }
      updatedList = remainingDebtDialog.itemId
        ? targetList.map((item) => (item.id === remainingDebtDialog.itemId ? nextItem : item))
        : [...targetList, nextItem];
    }
    if (remainingDebtDialog.section === 'prepayment') {
      syncRemainingDebtPayload(updatedList, value.loanRemainingDebtInstallmentDueItems, value.loanRemainingDebtLateInstallmentDueItems);
    } else if (remainingDebtDialog.section === 'installment') {
      syncRemainingDebtPayload(value.loanRemainingDebtPrepaymentDueItems, updatedList, value.loanRemainingDebtLateInstallmentDueItems);
    } else {
      syncRemainingDebtPayload(value.loanRemainingDebtPrepaymentDueItems, value.loanRemainingDebtInstallmentDueItems, updatedList);
    }
    setRemainingDebtDialogError('');
    setRemainingDebtDialog(null);
  };

  const deleteRemainingDebtItem = (section: 'prepayment' | 'installment' | 'late-installment', itemId: string) => {
    if (section === 'prepayment') {
      syncRemainingDebtPayload(
        value.loanRemainingDebtPrepaymentDueItems.filter((item) => item.id !== itemId),
        value.loanRemainingDebtInstallmentDueItems,
        value.loanRemainingDebtLateInstallmentDueItems,
      );
      return;
    }
    if (section === 'installment') {
      syncRemainingDebtPayload(
        value.loanRemainingDebtPrepaymentDueItems,
        value.loanRemainingDebtInstallmentDueItems.filter((item) => item.id !== itemId),
        value.loanRemainingDebtLateInstallmentDueItems,
      );
      return;
    }
    syncRemainingDebtPayload(
      value.loanRemainingDebtPrepaymentDueItems,
      value.loanRemainingDebtInstallmentDueItems,
      value.loanRemainingDebtLateInstallmentDueItems.filter((item) => item.id !== itemId),
    );
  };

  const renderRemainingDebtDraftSection = ({
    title,
    description,
    actionLabel,
    onAction,
    amountValue,
    onAmountChange,
    amountHint,
    cards,
  }: {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    amountValue: string;
    onAmountChange: (value: string) => void;
    amountHint: string;
    cards: Array<{ id: string; title: string; date: string; amount: string; section: 'prepayment' | 'installment' | 'late-installment' }>;
  }) => {
    const itemsCount = cards.length;
    const registeredAmount = cards.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const targetAmount = Number(amountValue || 0);
    return (
      <section className="rounded-2xl border border-[#d9dde4] bg-white/45 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)] md:px-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
            <ListChecks className="h-5 w-5 text-[#59606a]" />
            <span>{title}</span>
          </div>
          <div className="max-w-[460px] text-right">
            <p className="text-[13px] leading-7 text-[#666b73]">{description}</p>
            <button type="button" onClick={onAction} className="mt-2 h-8 rounded-lg border border-[#14a7ad] bg-white/65 px-3 text-xs font-bold text-[#0e989d] transition hover:bg-[#dff4f3]">
              {actionLabel}
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_minmax(280px,420px)] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {renderRemainingDebtMoneyInput({ value: amountValue, onChange: onAmountChange })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-bold text-[#18a9c3]">{amountHint}</div>
          </div>
        </div>

        {renderRemainingDebtDraftSummary({ itemsCount, registeredAmount, targetAmount })}
        {renderRemainingDebtDraftCards(cards)}
      </section>
    );
  };

  const renderRemainingDebtStats = (
    title: string,
    tone: 'teal' | 'salmon',
    rows: Array<{ label: string; value: string; suffix?: string }>,
  ) => (
    <div className={`overflow-hidden rounded-[18px] ${tone === 'teal' ? 'border border-[#bfeff4]' : 'border border-[#ffb4a1]'}`}>
      <div className={`${tone === 'teal' ? 'bg-[#bfeff4] text-slate-700' : 'bg-[#ffb4a1] text-[#7a3425]'} px-4 py-3 text-center text-[14px] font-black`}>
        {title}
      </div>
      <div className={`grid grid-cols-2 gap-px ${tone === 'teal' ? 'bg-[#caedf1]' : 'bg-[#ffcaba]'}`}>
        {rows.flatMap((row) => [
          <div key={`${row.label}-label`} className={`px-4 py-3 text-right text-[13px] font-semibold ${tone === 'teal' ? 'bg-[#f9feff] text-slate-600' : 'bg-[#fff3ef] text-[#7a3425]'}`}>
            {row.label}
          </div>,
          <div key={`${row.label}-value`} className={`px-4 py-3 text-left text-[13px] font-black ${tone === 'teal' ? 'bg-[#f9feff] text-slate-700' : 'bg-[#fff3ef] text-[#7a3425]'}`}>
            {row.value ? `${formatMoneyInput(row.value)}${row.suffix ? ` ${row.suffix}` : ''}` : `${row.suffix ? `- ${row.suffix}` : '-'}`}
          </div>,
        ])}
      </div>
    </div>
  );

  const renderRemainingDebtStep = () => (
    <div className="space-y-5">
      {renderDetailHeader('تنظیمات بازپرداخت مانده بدهی وام', 'در این بخش مشخص می‌کنید مانده بدهی وام در چه بخش‌هایی تسویه و بازپرداخت می‌شود')}
      <section className="space-y-5">
        {renderRemainingDebtDraftSection({
          title: 'پیش پرداخت',
          description: 'مبلغ و زمان‌بندی پرداخت این ردیف را مشخص کنید. مبلغ این بخش در نمودار قرارداد و جمع پرداخت‌های تعریف‌شده لحاظ می‌شود.',
          actionLabel: 'ثبت سررسید برای پیش پرداخت',
          onAction: () => openRemainingDebtDialog('prepayment'),
          amountValue: value.loanRemainingDebtPrepaymentAmount,
          onAmountChange: (nextValue) => patch({ loanRemainingDebtPrepaymentAmount: nextValue }),
          amountHint: `${Number(value.loanRemainingDebtPrepaymentAmount || 0).toLocaleString('fa-IR')} تومان`,
          cards: value.loanRemainingDebtPrepaymentDueItems.map((item) => ({
            id: item.id,
            title: item.title,
            date: item.dueDate,
            amount: String(item.amount),
            section: 'prepayment' as const,
          })),
        })}

        {renderRemainingDebtDraftSection({
          title: 'اقساط ثابت',
          description: 'مبلغ و زمان‌بندی پرداخت این ردیف را مشخص کنید. مبلغ این بخش در نمودار قرارداد و جمع پرداخت‌های تعریف‌شده لحاظ می‌شود.',
          actionLabel: 'ثبت سررسید برای اقساط ثابت',
          onAction: () => openRemainingDebtDialog('installment'),
          amountValue: value.loanRemainingDebtInstallmentAmount,
          onAmountChange: (nextValue) => patch({ loanRemainingDebtInstallmentAmount: nextValue }),
          amountHint: `${Number(value.loanRemainingDebtInstallmentAmount || 0).toLocaleString('fa-IR')} تومان`,
          cards: [
            ...value.loanRemainingDebtInstallmentDueItems.map((item) => ({
              id: item.id,
              title: item.title,
              date: item.dueDate,
              amount: String(item.amount),
              section: 'installment' as const,
            })),
            ...value.loanRemainingDebtLateInstallmentDueItems.map((item) => ({
              id: item.id,
              title: item.title,
              date: item.dueDate,
              amount: String(item.amount),
              section: 'late-installment' as const,
            })),
          ],
        })}

        <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.28)]">
          <div className="text-right text-[18px] font-black text-slate-800">مانده بدهی وام در زمان تحویل واحد</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,320px] lg:items-start">
            <div className="order-2 lg:order-1">
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanRemainingDebtUnitDeliveryAmount)}
                onChange={(event) => patch({ loanRemainingDebtUnitDeliveryAmount: event.target.value.replace(/\D/g, '') })}
                className="app-control h-12 w-full text-right"
              />
              <div className="mt-2 text-left text-[13px] font-black text-[#13a2b2]">{Number(value.loanRemainingDebtUnitDeliveryAmount || 0).toLocaleString('fa-IR')} تومان</div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-right text-[14px] font-semibold leading-8 text-slate-600">
                مبلغ مانده بدهی که خریدار باید در زمان تحویل واحد پرداخت کند در این بخش تعیین می‌شود و به جمع مالی این مرحله اضافه خواهد شد.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.28)]">
          <div className="text-right text-[18px] font-black text-slate-800">مانده بدهی وام در زمان تحویل سند</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,320px] lg:items-start">
            <div className="order-2 lg:order-1">
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanRemainingDebtDocumentDeliveryAmount)}
                onChange={(event) => patch({ loanRemainingDebtDocumentDeliveryAmount: event.target.value.replace(/\D/g, '') })}
                className="app-control h-12 w-full text-right"
              />
              <div className="mt-2 text-left text-[13px] font-black text-[#13a2b2]">{Number(value.loanRemainingDebtDocumentDeliveryAmount || 0).toLocaleString('fa-IR')} تومان</div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-right text-[14px] font-semibold leading-8 text-slate-600">
                مبلغ مانده بدهی که خریدار باید در زمان انتقال رسمی سند پرداخت کند در این بخش مشخص می‌شود و در محاسبات این مرحله لحاظ خواهد شد.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-transparent bg-transparent px-1 py-1">
          <button
            type="button"
            onClick={() => setDetailView('amount')}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[16px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const legacyRenderRemainingDebtDialog = () => {
    if (!remainingDebtDialog) return null;
    const dialogTitle =
      remainingDebtDialog.section === 'prepayment'
        ? remainingDebtDialog.itemId
          ? 'ویرایش سررسید پیش پرداخت'
          : 'ثبت سررسید پیش پرداخت'
        : remainingDebtDialog.section === 'installment'
          ? remainingDebtDialog.itemId
            ? 'ویرایش سررسید اقساط ثابت'
            : 'ثبت سررسید اقساط ثابت'
          : remainingDebtDialog.itemId
            ? 'ویرایش قسط نامنظم'
            : 'ثبت قسط نامنظم';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onClick={() => setRemainingDebtDialog(null)}>
        <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl" dir="rtl" onClick={(event) => event.stopPropagation()}>
          <div className="text-[18px] font-black text-slate-900">{dialogTitle}</div>
          <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">عنوان، مبلغ و تاریخ سررسید را برای این بخش ثبت کنید.</p>

          <div className="mt-5 space-y-4">
            {remainingDebtDialog.section === 'installment' && !remainingDebtDialog.itemId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <div className="mb-2 text-right text-[13px] font-black text-slate-800">نوع ثبت سررسید</div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setRemainingDebtDialog((current) => (current ? { ...current, mode: 'regular' } : current))}
                    className={`rounded-full border px-4 py-2 text-[12px] font-black ${remainingDebtDialog.mode === 'regular' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    منظم
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemainingDebtDialog((current) => (current ? { ...current, mode: 'single' } : current))}
                    className={`rounded-full border px-4 py-2 text-[12px] font-black ${remainingDebtDialog.mode === 'single' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                  >
                    تکی
                  </button>
                </div>
              </div>
            ) : null}
            <div>
              <div className="mb-2 text-right text-[13px] font-black text-slate-800">عنوان</div>
              <Input
                value={remainingDebtDialog.title}
                onChange={(event) => setRemainingDebtDialog((current) => (current ? { ...current, title: event.target.value } : current))}
                className="h-10 rounded-xl border-slate-200 bg-white px-3 text-right text-[13px]"
              />
            </div>
            <div>
              <div className="mb-2 text-right text-[13px] font-black text-slate-800">{remainingDebtDialog.mode === 'regular' ? 'مبلغ کل اقساط' : 'مبلغ'}</div>
              <Input
                value={formatMoneyInput(remainingDebtDialog.amount)}
                onChange={(event) =>
                  setRemainingDebtDialog((current) => (current ? { ...current, amount: event.target.value.replace(/\D/g, '') } : current))
                }
                inputMode="numeric"
                className="h-10 rounded-xl border-slate-200 bg-white px-3 text-left text-[13px]"
              />
            </div>
            {remainingDebtDialog.section === 'installment' && !remainingDebtDialog.itemId && remainingDebtDialog.mode === 'regular' ? (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <div className="mb-2 text-right text-[13px] font-black text-slate-800">دوره اقساط</div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setRemainingDebtDialog((current) => (current ? { ...current, frequency: 'monthly' } : current))}
                      className={`rounded-full border px-4 py-2 text-[12px] font-black ${remainingDebtDialog.frequency === 'monthly' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                    >
                      ماهانه
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemainingDebtDialog((current) => (current ? { ...current, frequency: 'daily' } : current))}
                      className={`rounded-full border px-4 py-2 text-[12px] font-black ${remainingDebtDialog.frequency === 'daily' ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]' : 'border-slate-300 bg-white text-slate-700'}`}
                    >
                      روزانه
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-right text-[13px] font-black text-slate-800">{remainingDebtDialog.frequency === 'monthly' ? 'دوره اقساط ماهانه' : 'دوره اقساط روزانه'}</div>
                  <Input
                    value={remainingDebtDialog.period}
                    onChange={(event) => setRemainingDebtDialog((current) => (current ? { ...current, period: event.target.value.replace(/\D/g, '') } : current))}
                    className="h-10 rounded-xl border-slate-200 bg-white px-3 text-right text-[13px]"
                  />
                </div>
                <div>
                  <div className="mb-2 text-right text-[13px] font-black text-slate-800">{remainingDebtDialog.frequency === 'monthly' ? 'تعداد اقساط ماهانه' : 'تعداد اقساط روزانه'}</div>
                  <Input
                    value={remainingDebtDialog.count}
                    onChange={(event) => setRemainingDebtDialog((current) => (current ? { ...current, count: event.target.value.replace(/\D/g, '') } : current))}
                    className="h-10 rounded-xl border-slate-200 bg-white px-3 text-right text-[13px]"
                  />
                </div>
                <div>
                  <div className="mb-2 text-right text-[13px] font-black text-slate-800">{remainingDebtDialog.frequency === 'monthly' ? 'شروع اقساط ماهانه' : 'شروع اقساط روزانه'}</div>
                  <LoanDateInput
                    value={remainingDebtDialog.startDate}
                    onChange={(startDate) => setRemainingDebtDialog((current) => (current ? { ...current, startDate } : current))}
                    placeholder="تاریخ شروع را انتخاب کنید"
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] font-semibold text-slate-600">
                  مبلغ هر قسط:
                  <span className="mr-2 font-black text-[var(--dark-teal)]">
                    {Number(remainingDebtDialog.amount || 0) > 0 && Number(remainingDebtDialog.count || 0) > 0
                      ? `${Math.floor(Number(remainingDebtDialog.amount || 0) / Number(remainingDebtDialog.count || 1)).toLocaleString('fa-IR')} تومان`
                      : 'بعد از تعیین مبلغ و تعداد'}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-2 text-right text-[13px] font-black text-slate-800">تاریخ سررسید</div>
                <LoanDateInput
                  value={remainingDebtDialog.dueDate}
                  onChange={(dueDate) => setRemainingDebtDialog((current) => (current ? { ...current, dueDate } : current))}
                  placeholder="تاریخ سررسید را انتخاب کنید"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setRemainingDebtDialog(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-[13px] font-black text-slate-700"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={saveRemainingDebtDialog}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-4 text-[13px] font-black text-white"
            >
              ثبت
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRemainingDebtDialog = () => {
    if (!remainingDebtDialog) return null;
    const isInstallmentDialog = remainingDebtDialog.section === 'installment';
    const isEditing = Boolean(remainingDebtDialog.itemId);
    const isRegularInstallment = isInstallmentDialog && !isEditing && remainingDebtDialog.mode === 'regular';
    const regularCount = Number(remainingDebtDialog.count || 0);
    const regularAmount = Number(remainingDebtDialog.amount || 0);
    const regularPreviewItems =
      isRegularInstallment && remainingDebtDialog.startDate && regularCount > 0 && regularAmount > 0 && remainingDebtDialog.title.trim()
        ? buildRegularDueItems({
            activeTab: 'loan-remaining-installment-preview',
            title: remainingDebtDialog.title.trim(),
            totalAmount: regularAmount,
            count: regularCount,
            startDate: remainingDebtDialog.startDate,
            frequency: remainingDebtDialog.frequency,
            period: Number(remainingDebtDialog.period || 1),
            idPrefix: 'loan-remaining-installment-preview',
          })
        : [];
    const regularEndDate = regularPreviewItems.at(-1)?.dueDate ?? 'بعد از تعیین زمان‌بندی مشخص می‌شود';
    const regularInstallmentAmount = regularPreviewItems.length ? `${Number(regularPreviewItems[0]?.amount || 0).toLocaleString('fa-IR')} تومان` : 'بعد از تعیین مبلغ و تعداد';
    const dialogTitle =
      remainingDebtDialog.section === 'prepayment'
        ? remainingDebtDialog.itemId
          ? 'ویرایش سررسید پیش پرداخت'
          : 'ثبت سررسید پیش پرداخت'
        : remainingDebtDialog.section === 'installment'
          ? remainingDebtDialog.itemId
            ? 'ویرایش سررسید اقساط ثابت'
            : 'ثبت سررسید اقساط ثابت'
          : remainingDebtDialog.itemId
            ? 'ویرایش قسط نامنظم'
            : 'ثبت قسط نامنظم';
    const dialogDescription =
      remainingDebtDialog.section === 'prepayment'
        ? 'سررسید برای بخش پیش پرداخت مانده بدهی وام ثبت می‌شود.'
        : remainingDebtDialog.section === 'installment'
          ? 'سررسید برای بخش اقساط ثابت مانده بدهی وام ثبت می‌شود.'
          : 'سررسید برای بخش اقساط نامنظم مانده بدهی وام ثبت می‌شود.';

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
        onClick={() => {
          setRemainingDebtDialog(null);
          setRemainingDebtDialogError('');
        }}
      >
        <div className="w-full max-w-[27rem] rounded-[24px] border border-slate-200 bg-white shadow-2xl" dir="rtl" onClick={(event) => event.stopPropagation()}>
          <div className="px-5 pt-5">
            <div className="text-[18px] font-black text-slate-900">{dialogTitle}</div>
            <p className="mt-2 text-[12px] font-semibold leading-6 text-slate-500">{dialogDescription}</p>
          </div>

          <div className="space-y-4 px-5 py-4">
            {isInstallmentDialog ? (
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel label="نوع سررسید" />
                  <DraftTwoOptionSwitch<'regular' | 'single'>
                    value={remainingDebtDialog.mode}
                    onChange={(mode) => {
                      setRemainingDebtDialogError('');
                      setRemainingDebtDialog((current) => (current ? { ...current, mode } : current));
                    }}
                    onValue="regular"
                    offValue="single"
                    onText="منظم"
                    offText="تکی"
                    disabled={isEditing}
                  />
                </div>
              </section>
            ) : null}

            <section className="space-y-3 border-t border-gray-100 pt-4">
              <div className="text-[13px] font-bold text-gray-800">اطلاعات اصلی</div>
              <div className="grid gap-3">
                <div>
                  <FieldLabel label="عنوان" />
                  <Input
                    value={remainingDebtDialog.title}
                    onChange={(event) => {
                      setRemainingDebtDialogError('');
                      setRemainingDebtDialog((current) => (current ? { ...current, title: event.target.value } : current));
                    }}
                    placeholder={isRegularInstallment ? 'مثال: اقساط ماهانه' : 'مثال: پیش پرداخت ۱'}
                    className="mt-2 h-10 rounded-lg border-gray-200 bg-[#fcfdfd] px-3 text-[13px]"
                  />
                </div>

                <div>
                  <FieldLabel label={isRegularInstallment ? 'مبلغ کل اقساط' : 'مبلغ'} />
                  <div className="relative mt-2">
                    <Input
                      value={formatMoneyInput(remainingDebtDialog.amount)}
                      onChange={(event) => {
                        setRemainingDebtDialogError('');
                        setRemainingDebtDialog((current) => (current ? { ...current, amount: event.target.value.replace(/\D/g, '') } : current));
                      }}
                      placeholder={isRegularInstallment ? 'مبلغ کل را وارد کنید' : 'مبلغ سررسید'}
                      inputMode="numeric"
                      className="h-10 rounded-lg border-gray-200 bg-[#fcfdfd] pr-3 pl-12 text-[13px]"
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">تومان</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-bold text-gray-800">{isRegularInstallment ? 'زمان‌بندی اقساط' : 'زمان سررسید'}</div>
                {isRegularInstallment ? (
                  <TagPills<DueFrequency>
                    value={remainingDebtDialog.frequency}
                    onChange={(frequency) => {
                      setRemainingDebtDialogError('');
                      setRemainingDebtDialog((current) => (current ? { ...current, frequency } : current));
                    }}
                    options={[
                      { value: 'monthly', label: 'ماهانه' },
                      { value: 'daily', label: 'روزانه' },
                    ]}
                  />
                ) : null}
              </div>

              {!isRegularInstallment ? (
                <div>
                  <FieldLabel label="تاریخ سررسید" />
                  <div className="relative mt-2">
                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <PersianDatePicker
                      value={remainingDebtDialog.dueDate}
                      onChange={(dueDate) => {
                        setRemainingDebtDialogError('');
                        setRemainingDebtDialog((current) => (current ? { ...current, dueDate } : current));
                      }}
                      placeholder="تاریخ سررسید را انتخاب کنید"
                      className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] pr-12 pl-4 text-right text-[13px] shadow-none"
                      containerClassName="w-full"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <div>
                      <FieldLabel label={`دوره اقساط ${remainingDebtDialog.frequency === 'monthly' ? 'ماهانه' : 'روزانه'}`} />
                      <Input
                        value={remainingDebtDialog.period}
                        onChange={(event) => {
                          setRemainingDebtDialogError('');
                          setRemainingDebtDialog((current) => (current ? { ...current, period: event.target.value.replace(/\D/g, '') } : current));
                        }}
                        placeholder={remainingDebtDialog.frequency === 'monthly' ? 'مثال: 1 ماه' : 'مثال: 7 روز'}
                        className="mt-2 h-10 rounded-lg border-gray-200 bg-white px-3 text-[13px]"
                      />
                    </div>
                    <div>
                      <FieldLabel label={remainingDebtDialog.frequency === 'monthly' ? 'تعداد اقساط ماهانه' : 'تعداد اقساط روزانه'} />
                      <Input
                        value={remainingDebtDialog.count}
                        onChange={(event) => {
                          setRemainingDebtDialogError('');
                          setRemainingDebtDialog((current) => (current ? { ...current, count: event.target.value.replace(/\D/g, '') } : current));
                        }}
                        placeholder="مثال: 6"
                        className="mt-2 h-10 rounded-lg border-gray-200 bg-white px-3 text-[13px]"
                      />
                    </div>
                    <div>
                      <FieldLabel label={`شروع اقساط ${remainingDebtDialog.frequency === 'monthly' ? 'ماهانه' : 'روزانه'}`} />
                      <div className="relative mt-2">
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <PersianDatePicker
                          value={remainingDebtDialog.startDate}
                          onChange={(startDate) => {
                            setRemainingDebtDialogError('');
                            setRemainingDebtDialog((current) => (current ? { ...current, startDate } : current));
                          }}
                          placeholder="تاریخ شروع را انتخاب کنید"
                          className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] pr-12 pl-4 text-right text-[13px] shadow-none"
                          containerClassName="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel label="پایان اقساط" />
                      <div className="mt-2 flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-600">{regularEndDate}</div>
                    </div>
                    <div>
                      <FieldLabel label="مبلغ هر قسط" />
                      <div className="mt-2 flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] font-medium text-teal-700">{regularInstallmentAmount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f6f7f4] px-3 py-2 text-xs text-gray-500">
                    <span>{`فاصله ثبت اقساط: هر ${Number(remainingDebtDialog.period || 1)} ${remainingDebtDialog.frequency === 'monthly' ? 'ماه' : 'روز'}`}</span>
                    <span>{regularPreviewItems.length > 0 ? `${regularPreviewItems.length} سررسید` : 'تعداد سررسید نامشخص'}</span>
                  </div>
                </>
              )}
            </section>

            {remainingDebtDialogError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{remainingDebtDialogError}</div> : null}
          </div>

          <div className="flex justify-start gap-5 border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={() => {
                setRemainingDebtDialog(null);
                setRemainingDebtDialogError('');
              }}
              className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]"
            >
              لغو
            </button>
            <button type="button" onClick={saveRemainingDebtDialog} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              {isEditing ? 'ذخیره تغییرات' : 'ثبت'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTimingStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'انتخاب زمان دریافت وام',
        'در این مرحله مشخص می‌کنید وام بانکی در چه زمانی نسبت به قرارداد دریافت شده یا دریافت خواهد شد',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">انتخاب زمان دریافت وام</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            در این مرحله مشخص می‌کنید وام بانکی در چه زمانی نسبت به قرارداد دریافت شده یا دریافت خواهد شد
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <LoanTagDropdown
            title="انتخاب زمان دریافت وام"
            options={LOAN_TIMING_OPTIONS}
            value={value.loanTiming === 'undated' ? 'contract-date' : value.loanTiming}
            onChange={(loanTiming) =>
              patch({
                loanTiming,
                loanReceivedDate: loanTiming === 'before-contract' || loanTiming === 'dated' ? value.loanReceivedDate : '',
              })
            }
          />
          {needsReceivedDate ? (
            <div className="border-t border-slate-200 pt-5">
              <div className="mb-3 text-right text-[16px] font-black text-slate-900">
                تاریخ دریافت وام <span className="text-rose-500">*</span>
              </div>
              <LoanDateInput value={value.loanReceivedDate} onChange={(loanReceivedDate) => patch({ loanReceivedDate })} placeholder="تاریخ دریافت وام را انتخاب کنید" />
              <p className="mt-3 text-right text-[12px] font-semibold leading-6 text-slate-500">
                تاریخی که وام دریافت میشود
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('overview')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  const renderRepaymentStep = () => (
    <div className="space-y-5">
      {renderDetailHeader(
        'زمان بازپرداخت اقساط وام',
        'دراین مرحله تعیین می‌کنید بازپرداخت وام از چه زمانی آغاز شده یا خواهد شد',
      )}
      <section className="rounded-[26px] border border-slate-200 bg-white px-5 py-5">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">زمان بازپرداخت اقساط وام</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
            دراین مرحله تعیین می‌کنید بازپرداخت وام از چه زمانی آغاز شده یا خواهد شد
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <LoanTagDropdown
            title="زمان بازپرداخت"
            options={REPAYMENT_OPTIONS}
            value={value.repaymentTiming}
            onChange={(repaymentTiming) =>
              patch({
                repaymentTiming,
                repaymentSettledBy: repaymentTiming === 'before-contract-started' ? value.repaymentSettledBy : 'seller',
                repaymentFirstInstallmentDate: repaymentTiming === 'undated' ? '' : value.repaymentFirstInstallmentDate,
              })
            }
          />
          {value.repaymentTiming === 'before-contract-started' ? (
            <div className="rounded-[22px] border border-slate-200 bg-[#f8fbff] px-4 py-4">
              <div className="text-right text-[16px] font-black text-slate-900">اقساط پرداخت شده تا زمان عقد قرارداد به عهده کیست؟</div>

              <div className="mt-5 space-y-5">
                <label className="flex cursor-pointer items-start justify-between gap-4 text-right">
                  <div className="flex-1">
                    <div className="text-[18px] font-black text-slate-900">با خریدار است</div>
                    <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
                      خریدار میبایست اقساط سررسید شده تا تاریخ قرارداد را تسویه کند
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                    {value.repaymentSettledBy === 'buyer' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={value.repaymentSettledBy === 'buyer'}
                    onChange={() => patch({ repaymentSettledBy: 'buyer' })}
                  />
                </label>

                <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-slate-200 pt-5 text-right">
                  <div className="flex-1">
                    <div className="text-[18px] font-black text-slate-900">با سازنده است</div>
                    <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
                      سازنده اقساط سررسید شده تا تاریخ قرارداد را تسویه خواهد کرد
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-500">
                    {value.repaymentSettledBy === 'seller' ? <span className="h-3.5 w-3.5 rounded-full bg-[var(--dark-teal)]" /> : null}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={value.repaymentSettledBy === 'seller'}
                    onChange={() => patch({ repaymentSettledBy: 'seller' })}
                  />
                </label>
              </div>

              <div className="mt-6">
                <div className="mb-3 text-right text-[16px] font-black text-slate-900">
                  تاریخ شروع اولین قسط <span className="text-rose-500">*</span>
                </div>
                <LoanDateInput
                  value={value.repaymentFirstInstallmentDate}
                  onChange={(repaymentFirstInstallmentDate) => patch({ repaymentFirstInstallmentDate })}
                  placeholder="تاریخ شروع اولین قسط را انتخاب کنید"
                />
                <p className="mt-3 text-right text-[12px] font-semibold leading-6 text-slate-500">
                  در این بخش زمان شروع اولین قسط وام دریافتی را می‌توانید مشخص کنید.
                </p>
              </div>
            </div>
          ) : null}

          {value.repaymentTiming !== 'before-contract-started' && needsRepaymentFirstInstallmentDate ? (
            <div className="border-t border-slate-200 pt-5">
              <div className="mb-3 text-right text-[16px] font-black text-slate-900">
                تاریخ شروع اولین قسط <span className="text-rose-500">*</span>
              </div>
              <LoanDateInput
                value={value.repaymentFirstInstallmentDate}
                onChange={(repaymentFirstInstallmentDate) => patch({ repaymentFirstInstallmentDate })}
                placeholder="تاریخ شروع اولین قسط را انتخاب کنید"
              />
              <p className="mt-3 text-right text-[12px] font-semibold leading-6 text-slate-500">
                در این بخش زمان شروع اولین قسط وام دریافتی را میتوانید مشخص کنید.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => setDetailView('overview')}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-6 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      </section>
    </div>
  );

  if (value.flowStep === 'details' && value.paymentStatus === 'less') {
    return (
      <>
      <div className="space-y-5">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => patch({ flowStep: 'status' })}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700"
          >
            بازگشت به وضعیت پرداخت
            <MoveRight className="h-4 w-4" />
          </button>
        </div>

        {detailView === 'overview' ? renderOverview() : null}
        {detailView === 'amount' ? renderAmountStep() : null}
        {detailView === 'timing' ? renderTimingStep() : null}
        {detailView === 'repayment' ? renderRepaymentStep() : null}
        {detailView === 'interest' ? renderInterestStep() : null}
        {detailView === 'bank-fee' ? renderBankFeeStep() : null}
        {detailView === 'participation' ? renderParticipationStep() : null}
        {detailView === 'expert' ? renderExpertStep() : null}
        {detailView === 'priority-bond' ? renderPriorityBondStep() : null}
        {detailView === 'penalty' ? renderPenaltyStep() : null}
        {detailView === 'discount' ? renderDiscountStep() : null}
        {detailView === 'discount-condition' ? renderDiscountConditionStep() : null}
        {detailView === 'forgiveness' ? renderForgivenessStep() : null}
        {detailView === 'remaining-debt' ? renderRemainingDebtStep() : null}
      </div>
      {renderRemainingDebtDialog()}
      </>
    );
  }

  if (value.flowStep === 'details' && value.paymentStatus === 'full') {
    return (
      <>
      <div className="space-y-5">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => patch({ flowStep: 'status' })}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-700"
          >
            بازگشت به وضعیت پرداخت
            <MoveRight className="h-4 w-4" />
          </button>
        </div>

        {detailView === 'overview' ? renderOverview() : null}
        {detailView === 'amount' ? renderAmountStep() : null}
        {detailView === 'timing' ? renderTimingStep() : null}
        {detailView === 'repayment' ? renderRepaymentStep() : null}
        {detailView === 'interest' ? renderInterestStep() : null}
        {detailView === 'bank-fee' ? renderBankFeeStep() : null}
        {detailView === 'participation' ? renderParticipationStep() : null}
        {detailView === 'expert' ? renderExpertStep() : null}
        {detailView === 'priority-bond' ? renderPriorityBondStep() : null}
        {detailView === 'penalty' ? renderPenaltyStep() : null}
        {detailView === 'discount' ? renderDiscountStep() : null}
        {detailView === 'discount-condition' ? renderDiscountConditionStep() : null}
        {detailView === 'forgiveness' ? renderForgivenessStep() : null}
        {detailView === 'remaining-debt' ? renderRemainingDebtStep() : null}
      </div>
      {renderRemainingDebtDialog()}
      </>
    );
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="flex-1 text-right">
          <div className="text-[18px] font-black text-slate-900">وضعیت پرداخت بانک در زمان عقد قرارداد</div>
          <p className="mt-2 text-[12px] font-semibold leading-7 text-slate-500">در این بخش مشخص می‌کنید وام بانکی که در زمان عقد قرارداد تعیین شده، به چه صورت توسط بانک پرداخت شده است.</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200">
        {PAYMENT_STATUS_OPTIONS.map((option, index) => {
          const active = value.paymentStatus === option.value;
          return (
            <label key={option.value} className={`flex cursor-pointer items-start gap-4 px-4 py-4 text-right ${index ? 'border-t border-slate-200' : ''}`}>
              <input
                type="radio"
                name="appendix-loan-payment-status"
                checked={active}
                onChange={() =>
                  patch({
                    paymentStatus: option.value,
                    flowStep: 'status',
                    loanAmount: option.value === 'full' ? value.contractLoanAmount : option.value === 'less' ? value.loanAmount : '',
                  })
                }
                  className="mt-1 h-5 w-5 accent-[var(--dark-teal)]"
                />
              <div className="flex-1">
                <div className="text-[15px] font-black text-slate-900">{option.title}</div>
                <div className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{option.description}</div>
              </div>
            </label>
          );
        })}
      </div>

      {value.paymentStatus === 'less' || value.paymentStatus === 'full' ? (
        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={goToDetails}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-5 text-[13px] font-black text-white"
          >
            ثبت
          </button>
        </div>
      ) : null}
    </section>
  );
}
