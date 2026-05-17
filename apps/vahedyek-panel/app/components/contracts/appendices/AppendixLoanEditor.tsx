'use client';

import { useState } from 'react';
import { Building2, ChevronLeft, MoveLeft, MoveRight } from 'lucide-react';
import { BANKS } from '../../../lib/businessContractRules';
import type { AppendixLoanPayload } from '../../../types/contract';
import { formatMoneyInput } from '../../../lib/financialLineShared';
import { LoanChoicePills, LoanDateInput } from '../../../(panel)/business-settings/_components/LoanSettingsPrimitives';

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
  { value: 'undated', label: 'بدون تاریخ مشخص', description: 'وام دریافت شده ولی تاریخ مشخصی برای آن ثبت نمی‌شود.' },
  { value: 'contract-date', label: 'همزمان با قرارداد', description: 'وام در همان تاریخ انعقاد قرارداد دریافت شده است.' },
  { value: 'before-contract', label: 'قبل از قرارداد', description: 'وام پیش از عقد قرارداد دریافت شده و تاریخ آن باید ثبت شود.' },
  { value: 'dated', label: 'دارای تاریخ مشخص', description: 'وام دریافت شده و تاریخ دقیق دریافت آن باید ثبت شود.' },
];

const REPAYMENT_OPTIONS: Array<{ value: AppendixLoanPayload['repaymentTiming']; label: string; description: string }> = [
  { value: 'next-month', label: 'ماه بعد', description: 'بازپرداخت از ماه بعد آغاز می‌شود.' },
  { value: 'after-two-months', label: 'دو ماه بعد', description: 'بازپرداخت با فاصله دو ماهه شروع می‌شود.' },
  { value: 'custom', label: 'قابل تنظیم', description: 'زمان شروع بازپرداخت هنگام ثبت قرارداد تعیین می‌شود.' },
];

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

function LoanStepSection({
  title,
  description,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 py-5 first:border-t-0">
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-3 text-right">
        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition ${open ? 'bg-slate-100' : 'bg-white'}`}>
          <ChevronLeft className={`h-5 w-5 transition-transform ${open ? 'rotate-[-90deg]' : ''}`} />
        </span>
        <div className="flex-1">
          <div className="text-[18px] font-black text-slate-900">{title}</div>
          <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">{description}</p>
          {!open && summary ? <div className="mt-2 text-[12px] font-black text-[var(--dark-teal)]">{summary}</div> : null}
        </div>
      </button>

      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function AppendixLoanEditor({
  value,
  onChange,
}: {
  value: AppendixLoanPayload;
  onChange: (value: AppendixLoanPayload) => void;
}) {
  const [openSection, setOpenSection] = useState<'amount' | 'timing' | 'repayment' | null>('amount');
  const needsReceivedDate = value.loanTiming === 'before-contract' || value.loanTiming === 'dated';
  const timingOption = LOAN_TIMING_OPTIONS.find((item) => item.value === value.loanTiming) ?? LOAN_TIMING_OPTIONS[0];
  const repaymentOption = REPAYMENT_OPTIONS.find((item) => item.value === value.repaymentTiming) ?? REPAYMENT_OPTIONS[0];

  const patch = (next: Partial<AppendixLoanPayload>) => onChange({ ...value, ...next });

  const goToDetails = () => {
    if (value.paymentStatus !== 'less') return;
    patch({ flowStep: 'details' });
  };

  if (value.flowStep === 'details' && value.paymentStatus === 'less') {
    return (
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

          <div className="px-5">
            <LoanStepSection
              title="مبلغ وام"
              description="در این بخش می‌بایست مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود"
              summary={value.loanAmount ? `${Number(value.loanAmount).toLocaleString('fa-IR')} ریال` : undefined}
              open={openSection === 'amount'}
              onToggle={() => setOpenSection((current) => (current === 'amount' ? null : 'amount'))}
            >
              <input
                inputMode="numeric"
                value={formatMoneyInput(value.loanAmount)}
                onChange={(event) => patch({ loanAmount: event.target.value.replace(/\D/g, '') })}
                placeholder="مبلغ وام پرداختی را وارد کنید"
                className="app-control text-right"
              />
            </LoanStepSection>

            <LoanStepSection
              title="انتخاب زمان دریافت وام"
              description="در این مرحله مشخص می‌کنید وام بانکی در چه زمانی نسبت به قرارداد دریافت شده یا دریافت خواهد شد"
              summary={timingOption.label}
              open={openSection === 'timing'}
              onToggle={() => setOpenSection((current) => (current === 'timing' ? null : 'timing'))}
            >
              <div className="space-y-4">
                <LoanChoicePills
                  ariaLabel="زمان دریافت وام"
                  options={LOAN_TIMING_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  value={value.loanTiming}
                  onChange={(loanTiming) =>
                    patch({
                      loanTiming,
                      loanReceivedDate: loanTiming === 'before-contract' || loanTiming === 'dated' ? value.loanReceivedDate : '',
                    })
                  }
                />
                <p className="text-right text-[12px] font-semibold leading-6 text-slate-500">{timingOption.description}</p>
                {needsReceivedDate ? (
                  <LoanDateInput value={value.loanReceivedDate} onChange={(loanReceivedDate) => patch({ loanReceivedDate })} placeholder="تاریخ دریافت وام را انتخاب کنید" />
                ) : null}
              </div>
            </LoanStepSection>

            <LoanStepSection
              title="زمان بازپرداخت"
              description="دراین مرحله تعیین می‌کنید بازپرداخت وام از چه زمانی آغاز شده یا خواهد شد"
              summary={repaymentOption.label}
              open={openSection === 'repayment'}
              onToggle={() => setOpenSection((current) => (current === 'repayment' ? null : 'repayment'))}
            >
              <div className="space-y-4">
                <LoanChoicePills
                  ariaLabel="زمان بازپرداخت"
                  options={REPAYMENT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  value={value.repaymentTiming}
                  onChange={(repaymentTiming) => patch({ repaymentTiming })}
                />
                <p className="text-right text-[12px] font-semibold leading-6 text-slate-500">{repaymentOption.description}</p>
              </div>
            </LoanStepSection>
          </div>

          <section className="border-t border-slate-200 px-5 py-5">
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
        </section>
      </div>
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
                onChange={() => patch({ paymentStatus: option.value, flowStep: 'status' })}
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

      {value.paymentStatus === 'less' ? (
        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={goToDetails}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_90%,black)] px-5 text-[13px] font-black text-white"
          >
            ادامه تنظیمات وام
            <MoveLeft className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
