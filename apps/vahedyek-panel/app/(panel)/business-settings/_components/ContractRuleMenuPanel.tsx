'use client';

import Link from 'next/link';
import { Landmark, ChevronLeft } from 'lucide-react';
import { CONTRACT_RULE_ITEMS } from '../../../lib/businessContractRules';

const RULE_DISPLAY_ORDER: Record<string, number> = {
  prepayment: 0,
  installments: 1,
  adjustment: 2,
  'additional-costs': 3,
  discount: 4,
  penalty: 5,
  'builder-penalty': 6,
  forgiveness: 7,
  interest: 8,
  'loan-settings': 9,
};

function MenuCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[148px] flex-col justify-between rounded-2xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] p-5 shadow-[0_10px_24px_var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--theme-accent-softer)]"
    >
      <div className="flex flex-row-reverse items-start gap-4">
        <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-[color:var(--text-faint)] transition group-hover:text-[color:var(--theme-action-text)]" />
        <div className="flex-1 space-y-2 text-right">
          <h3 className="text-lg font-black text-[color:var(--text-strong)]">{title}</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
        </div>
      </div>
      <div className="flex justify-start [direction:ltr]">
        <span className="rounded-full border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">
          انجام شده
        </span>
      </div>
    </Link>
  );
}

export function ContractRuleMenuPanel() {
  const orderedItems = [...CONTRACT_RULE_ITEMS].sort(
    (a, b) => (RULE_DISPLAY_ORDER[a.id] ?? Number.MAX_SAFE_INTEGER) - (RULE_DISPLAY_ORDER[b.id] ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[color:var(--border-soft)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 text-right">
            <p className="text-sm text-[color:var(--text-muted)]">تنظیمات کسب و کار / تنظیمات مالی و قواعد قراردادی</p>
            <h1 className="text-2xl font-black text-[color:var(--text-strong)] sm:text-3xl">تنظیمات مالی و قواعد قراردادی</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center self-end rounded-2xl border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] sm:self-auto">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface-soft)] p-5 sm:p-6">
          <div className="mb-5 space-y-2 text-right">
            <h2 className="text-xl font-black text-[color:var(--text-strong)]">فلو تنظیمات مالی و قواعد قراردادی</h2>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              آیتم‌های این صفحه به صورت next page عمل می‌کنند و وارد جزئیات هر تنظیم می‌شوید.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 [direction:rtl] xl:grid-cols-2">
            {orderedItems.map((item) => (
              <MenuCard
                key={item.id}
                title={item.title}
                description={item.description}
                href={`/business-settings/contract-rules/${item.id}`}
              />
            ))}
            <MenuCard
              title="تنظیمات وام"
              description="در این بخش می‌توانید تنظیمات مربوط به وام را انجام دهید."
              href="/business-settings/contract-rules/loan-settings"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
