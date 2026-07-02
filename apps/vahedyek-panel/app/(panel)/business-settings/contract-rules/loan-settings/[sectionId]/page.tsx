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
    title: 'زمان‌بندی اقساط',
    description: 'در این بخش زمان پرداخت و سررسید هر قسط را مشخص می‌کنید.',
  },
  amount: {
    title: 'مبلغ وام',
    description: 'در این بخش مبلغ وام و بازه‌های مرتبط با آن را مشخص می‌کنید.',
  },
  repayment: {
    title: 'نحوه بازپرداخت',
    description: 'در این بخش شیوه تسویه و بازپرداخت اقساط را تنظیم می‌کنید.',
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
          title="سهم مشارکت"
          saveMessage="تنظیمات سهم مشارکت با موفقیت ذخیره شد."
          loadingLabel="در حال دریافت تنظیمات سهم مشارکت..."
          loadErrorMessage="دریافت تنظیمات سهم مشارکت ناموفق بود."
          saveErrorMessage="ذخیره تنظیمات سهم مشارکت ناموفق بود."
          introText="در این بخش می‌توانید مشخص کنید سهم هر طرف در وام چگونه تعریف شود و آیا بانک در این نسبت دخیل هست یا نه."
          responsibilityTitle="سهم طرفین"
          policyTitle="سیاست بانک درباره این سهم چیست؟"
          policyDescription="در صورت فعال بودن سیاست بانک، مقدار وام یا نسبت مورد نظر در محاسبات لحاظ می‌شود."
          inputLabel="سهم مشارکت"
          inputHelper="اگر سیاست بانک غیرفعال باشد، مقدار را دستی وارد کنید."
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
          title="کارمزد کارشناسی"
          saveMessage="تنظیمات کارمزد کارشناسی با موفقیت ذخیره شد."
          loadingLabel="در حال دریافت تنظیمات کارمزد کارشناسی..."
          loadErrorMessage="دریافت تنظیمات کارمزد کارشناسی ناموفق بود."
          saveErrorMessage="ذخیره تنظیمات کارمزد کارشناسی ناموفق بود."
          introText="در این بخش می‌توانید مشخص کنید هزینه کارشناسی چگونه بین طرفین تقسیم شود و آیا بانک در آن نقش دارد یا نه."
          responsibilityTitle="تقسیم کارمزد کارشناسی"
          policyTitle="سیاست بانک درباره این هزینه چیست؟"
          policyDescription="در صورت فعال بودن سیاست بانک، کارمزد در محاسبات بر اساس تنظیمات سامانه لحاظ می‌شود."
          inputLabel="کارمزد کارشناسی"
          inputHelper="اگر سیاست بانک غیرفعال باشد، مقدار را دستی وارد کنید."
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
          title="کارمزد سند رهن"
          saveMessage="تنظیمات کارمزد سند رهن با موفقیت ذخیره شد."
          loadingLabel="در حال دریافت تنظیمات کارمزد سند رهن..."
          loadErrorMessage="دریافت تنظیمات کارمزد سند رهن ناموفق بود."
          saveErrorMessage="ذخیره تنظیمات کارمزد سند رهن ناموفق بود."
          introText="در این بخش می‌توانید تعیین کنید کارمزد سند رهن چگونه بین طرفین تقسیم شود و آیا بانک آن را در محاسبات دخیل کند یا نه."
          responsibilityTitle="تقسیم کارمزد سند رهن"
          policyTitle="سیاست بانک درباره این کارمزد چیست؟"
          policyDescription="در صورت فعال بودن سیاست بانک، این هزینه بر اساس تنظیمات سامانه لحاظ می‌شود."
          inputLabel="کارمزد سند رهن"
          inputHelper="اگر سیاست بانک غیرفعال باشد، مقدار را دستی وارد کنید."
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
        <div className="rounded-[8px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
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

          <div className="rounded-[8px] border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] p-8 text-right">
            <p className="text-sm leading-8 text-[color:var(--text-muted)]">{section.description}</p>
          </div>
        </div>
      </section>
    </PanelLayout>
  );
}

