import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import PanelLayout from '../../../../../components/PanelLayout';

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
