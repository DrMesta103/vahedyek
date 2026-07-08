'use client';

import { useState } from 'react';
import { ChevronDown, PanelRight } from 'lucide-react';
import type { TestSectionCompletionStatus, TestStatusReportSection, TestStatusWarning, TestWorkspaceCounts } from '@/app/lib/types/taavia-test-workspace';

const STATUS_BADGE: Record<TestSectionCompletionStatus, { label: string; className: string }> = {
  completed: {
    label: 'تکمیل‌شده',
    className: 'border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.10)] text-[rgb(150,246,231)]',
  },
  incomplete: {
    label: 'ناقص',
    className: 'border-[rgba(250,204,21,0.24)] bg-[rgba(250,204,21,0.08)] text-[rgb(253,224,71)]',
  },
  empty: {
    label: 'بدون داده',
    className: 'border-white/10 bg-white/5 text-[rgba(217,229,255,0.58)]',
  },
};

function StatusBadge({ status }: { status: TestSectionCompletionStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function ReportSectionRow({ section }: { section: TestStatusReportSection }) {
  return (
    <div className="border-b border-white/6 px-1 py-2.5 text-right last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={section.status} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-white">{section.title}</div>
          <div className="mt-1 text-[10px] leading-5 text-[rgba(217,229,255,0.52)]">
            {section.stats.join(' · ')}
          </div>
        </div>
      </div>
    </div>
  );
}

type TestStatusReportPanelProps = {
  counts: TestWorkspaceCounts;
  predictedCategories: string[];
  canBuild: boolean;
  sections: TestStatusReportSection[];
  warnings: TestStatusWarning[];
};

function formatCount(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function TestStatusReportPanel({
  counts,
  predictedCategories,
  canBuild,
  sections,
  warnings,
}: TestStatusReportPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const panelBody = (
    <div className="grid gap-2">
      <div className="border-b border-white/6 pb-1.5 text-right">
        <h2 className="m-0 text-[12px] font-black text-white">گزارش وضعیت Knowledge Base</h2>
        <p className="mt-1 mb-0 text-[10px] leading-5 text-[rgba(217,229,255,0.48)]">
          فقط راهنما — هیچ بخشی اجباری نیست.
        </p>
      </div>

      <div className="rounded-[10px] bg-white/5 px-2 py-1.5 text-right">
        <div className="text-[10px] font-bold text-[rgba(217,229,255,0.58)]">خلاصه قبل از ساخت</div>
        <div className="mt-1.5 grid gap-1 text-[10px] leading-5 text-[rgba(217,229,255,0.72)]">
          <div>برند: {formatCount(counts.brandItems)} آیتم</div>
          <div>محصول: {formatCount(counts.productRows)} مورد</div>
          <div>FAQ: {formatCount(counts.faqItems)} فعال</div>
        </div>
        {predictedCategories.length > 0 ? (
          <div className="mt-2 border-t border-white/6 pt-2">
            <div className="mb-1.5 text-[10px] font-bold text-[rgba(217,229,255,0.58)]">آماده ساخت</div>
            <p className="m-0 text-[10px] leading-5 text-[rgba(217,229,255,0.52)]">
              {formatCount(predictedCategories.length)} دسته قابل ساخت — جزئیات در پنل دسته‌بندی‌ها
            </p>
          </div>
        ) : (
          <p className="mt-2 mb-0 border-t border-white/6 pt-2 text-[10px] leading-5 text-[rgba(217,229,255,0.52)]">
            {canBuild ? 'دسته‌ای برای پیش‌نمایش محاسبه نشد.' : 'هنوز داده‌ای برای ساخت Knowledge Base وارد نشده است.'}
          </p>
        )}
      </div>

      <div className="divide-y divide-white/6">
        {sections.map((section) => (
          <ReportSectionRow key={section.id} section={section} />
        ))}
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-[10px] border border-[rgba(250,204,21,0.14)] bg-[rgba(250,204,21,0.04)] px-2 py-1.5 text-[10px] leading-5 text-[rgba(255,247,201,0.82)]">
          {warnings[0]?.message}
          {warnings.length > 1 ? ` (+${warnings.length - 1})` : ''}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <aside className="hidden h-full max-h-full w-full overflow-y-auto rounded-[14px] bg-[linear-gradient(180deg,rgba(18,30,56,0.94)_0%,rgba(10,19,38,0.94)_100%)] p-2.5 lg:block">
        {panelBody}
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/5 px-3 py-2.5 text-[12px] font-bold text-white"
        >
          <ChevronDown className={`h-4 w-4 transition ${mobileOpen ? 'rotate-180' : ''}`} />
          <span className="inline-flex items-center gap-2">
            <PanelRight className="h-3.5 w-3.5" />
            گزارش وضعیت
          </span>
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.94)_0%,rgba(10,19,38,0.94)_100%)] p-3">
            {panelBody}
          </div>
        ) : null}
      </div>
    </>
  );
}
