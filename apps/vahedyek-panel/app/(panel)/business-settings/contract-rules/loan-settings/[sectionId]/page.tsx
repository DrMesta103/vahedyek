import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import PanelLayout from '../../../../../components/PanelLayout';
import { LoanAmountSettingsPanel } from '../../../_components/LoanAmountSettingsPanel';
import { LoanBankFeeSettingsPanel } from '../../../_components/LoanBankFeeSettingsPanel';
import { LoanInterestSettingsPanel } from '../../../_components/LoanInterestSettingsPanel';
import { LoanSharedResponsibilitySettingsPanel } from '../../../_components/LoanSharedResponsibilitySettingsPanel';
import { LoanRepaymentSettingsPanel } from '../../../_components/LoanRepaymentSettingsPanel';
import { LoanTimingSettingsPanel } from '../../../_components/LoanTimingSettingsPanel';

const SECTION_CONTENT: Record<string, { title: string; description: string }> = {
  timing: {
    title: 'انتخاب زمان دریافت وام',
    description: 'این صفحه برای تنظیم جزئیات زمان دریافت وام در مرحله بعد تکمیل می‌شود.',
  },
  amount: {
    title: 'مبلغ وام',
    description: 'این صفحه برای تنظیم جزئیات مبلغ وام در مرحله بعد تکمیل می‌شود.',
  },
  repayment: {
    title: 'زمان بازپرداخت',
    description: 'این صفحه برای تنظیم جزئیات زمان بازپرداخت در مرحله بعد تکمیل می‌شود.',
  },
};

export default function LoanSettingsSectionPage({ params }: { params: { sectionId: string } }) {
  if (params.sectionId === 'timing') {
    return (
      <PanelLayout>
        <LoanTimingSettingsPanel />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'amount') {
    return (
      <PanelLayout>
        <LoanAmountSettingsPanel />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'loan-interest') {
    return (
      <PanelLayout>
        <LoanInterestSettingsPanel />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'bank-fee') {
    return (
      <PanelLayout>
        <LoanBankFeeSettingsPanel />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'participation-profit') {
    return (
      <PanelLayout>
        <LoanSharedResponsibilitySettingsPanel
          title="سود دوران مشارکت"
          saveMessage="تنظیمات سود دوران مشارکت با موفقیت ذخیره شد."
          loadingLabel="در حال بارگذاری تنظیمات سود دوران مشارکت..."
          loadErrorMessage="بارگذاری تنظیمات سود دوران مشارکت انجام نشد."
          saveErrorMessage="ذخیره تنظیمات سود دوران مشارکت انجام نشد."
          introText="در صورتی که سود مشارکت در این وام در نظر گرفته شده است، مشخص کنید که پرداخت سود مشارکت به عهده کدام طرف قرارداد میباشد"
          responsibilityTitle="سود مشارکت به عهده کیست؟"
          policyTitle="سود دوران مشارکت برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد"
          policyDescription="درصورتی که سود دوران مشارکت متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید."
          inputLabel="سود مشارکت"
          inputHelper="از زمانی که بانک وام را پرداخت میکند و تا زمان اولین قسط را بایستی پرداخت کند چند درصد سود بایستی پرداخت شود"
          buyerKey="loanParticipationBuyer"
          sellerKey="loanParticipationSeller"
          policyKey="loanParticipationBankPolicyEnabled"
          rateKey="loanParticipationRate"
        />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'expert-cost') {
    return (
      <PanelLayout>
        <LoanSharedResponsibilitySettingsPanel
          title="هزینه کارشناسی"
          saveMessage="تنظیمات هزینه کارشناسی با موفقیت ذخیره شد."
          loadingLabel="در حال بارگذاری تنظیمات هزینه کارشناسی..."
          loadErrorMessage="بارگذاری تنظیمات هزینه کارشناسی انجام نشد."
          saveErrorMessage="ذخیره تنظیمات هزینه کارشناسی انجام نشد."
          introText="در صورتی که هزینه کارشناسی در این وام در نظر گرفته شده است، مشخص کنید که پرداخت هزینه کارشناسی به عهده کدام طرف قرارداد میباشد"
          responsibilityTitle="هزینه کارشناسی به عهده کیست؟"
          policyTitle="هزینه کارشناسی برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد"
          policyDescription="درصورتی که هزینه کارشناسی متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان مدنظر خود را وارد کنید."
          inputLabel="هزینه کارشناسی"
          inputHelper="اگر هزینه کارشناسی عدد ثابتی ندارد، درصد موردنظر خود را در این بخش وارد کنید."
          buyerKey="loanExpertBuyer"
          sellerKey="loanExpertSeller"
          policyKey="loanExpertBankPolicyEnabled"
          rateKey="loanExpertRate"
        />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'priority-bond-cost') {
    return (
      <PanelLayout>
        <LoanSharedResponsibilitySettingsPanel
          title="هزینه اوراق حق تقدم"
          saveMessage="تنظیمات هزینه اوراق حق تقدم با موفقیت ذخیره شد."
          loadingLabel="در حال بارگذاری تنظیمات هزینه اوراق حق تقدم..."
          loadErrorMessage="بارگذاری تنظیمات هزینه اوراق حق تقدم انجام نشد."
          saveErrorMessage="ذخیره تنظیمات هزینه اوراق حق تقدم انجام نشد."
          introText="در صورتی که هزینه اوراق حق تقدم در این وام در نظر گرفته شده است، مشخص کنید که پرداخت هزینه اوراق حق تقدم به عهده کدام طرف قرارداد میباشد"
          responsibilityTitle="هزینه اوراق حق تقدم به عهده کیست؟"
          policyTitle="هزینه اوراق حق تقدم برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد"
          policyDescription="درصورتی که هزینه اوراق حق تقدم متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان مدنظر خود را وارد کنید."
          inputLabel="هزینه اوراق حق تقدم"
          inputHelper="اگر هزینه اوراق حق تقدم به صورت درصدی محاسبه می‌شود، مقدار آن را در این بخش وارد کنید."
          buyerKey="loanPriorityBondBuyer"
          sellerKey="loanPriorityBondSeller"
          policyKey="loanPriorityBondBankPolicyEnabled"
          rateKey="loanPriorityBondRate"
        />
      </PanelLayout>
    );
  }

  if (params.sectionId === 'repayment') {
    return (
      <PanelLayout>
        <LoanRepaymentSettingsPanel />
      </PanelLayout>
    );
  }

  const section = SECTION_CONTENT[params.sectionId];

  if (!section) {
    notFound();
  }

  return (
    <PanelLayout>
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <Link
              href="/business-settings/contract-rules/loan-settings"
              className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--theme-action-text)]"
            >
              <ChevronRight className="h-4 w-4" />
              بازگشت
            </Link>
            <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">{section.title}</h1>
          </div>

          <div className="rounded-[24px] border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] p-8 text-right">
            <p className="text-sm leading-8 text-[color:var(--text-muted)]">{section.description}</p>
          </div>
        </div>
      </section>
    </PanelLayout>
  );
}
