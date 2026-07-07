'use client';

import { Check, CircleHelp, Clock, DatabaseZap } from 'lucide-react';
import type { WorkspaceSectionStatus } from '@/app/lib/types/taavia-workspace';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function WorkspaceStatusSummary({
  sections,
  lastTextUpdatedAt,
  lastKnowledgeBaseSyncAt,
  canTransfer,
}: {
  sections: WorkspaceSectionStatus[];
  lastTextUpdatedAt: string | null;
  lastKnowledgeBaseSyncAt: string | null;
  canTransfer: boolean;
}) {
  const readyCount = sections.filter((section) => section.isReadyForTransfer).length;

  return (
    <section className="relative z-[1] mb-5 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.88)_0%,rgba(10,19,38,0.88)_100%)] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] md:p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex items-center justify-end gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-right">
          <div>
            <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">آخرین آپدیت اطلاعات</div>
            <div className="mt-1 text-[13px] font-black text-white">
              {lastTextUpdatedAt ? formatUpdatedAt(lastTextUpdatedAt) : 'هنوز تغییری ثبت نشده'}
            </div>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(66,237,211,0.12)] text-[rgb(150,246,231)]">
            <Clock className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-right">
          <div>
            <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">آخرین انتقال نالج‌بیس</div>
            <div className="mt-1 text-[13px] font-black text-white">
              {lastKnowledgeBaseSyncAt ? formatUpdatedAt(lastKnowledgeBaseSyncAt) : 'هنوز انتقالی انجام نشده'}
            </div>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(130,158,255,0.12)] text-[rgb(199,210,254)]">
            <DatabaseZap className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="text-left">
          <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">بخش‌های آماده انتقال</div>
          <div className="mt-1 text-[18px] font-black text-white">
            {new Intl.NumberFormat('fa-IR').format(readyCount)} / {new Intl.NumberFormat('fa-IR').format(sections.length)}
          </div>
        </div>
        <div className="text-right">
          <h2 className="m-0 text-[clamp(1.1rem,1.6vw,1.45rem)] font-black text-white">وضعیت ورود اطلاعات</h2>
          <p className="mt-2 max-w-3xl text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.68)]">
            هیچ‌کدام از بخش‌ها اجباری نیستند؛ فقط برای انتقال به نالج‌بیس حداقل یک بخش باید داده داشته باشد.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className={`rounded-[18px] border px-4 py-3 text-right ${
              section.isReadyForTransfer
                ? 'border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.08)]'
                : 'border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.06)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  section.isReadyForTransfer
                    ? 'bg-[rgba(66,237,211,0.14)] text-[rgb(150,246,231)]'
                    : 'bg-[rgba(148,163,184,0.14)] text-[rgba(217,229,255,0.58)]'
                }`}
              >
                {section.isReadyForTransfer ? <Check className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-black text-white">{section.label}</div>
                <div className="mt-1 text-[11px] font-bold text-[rgba(217,229,255,0.58)]">{section.statusLabel}</div>
                <p className="mt-2 mb-0 text-[12px] leading-6 text-[rgba(217,229,255,0.72)]">
                  {section.itemCount > 0
                    ? `${new Intl.NumberFormat('fa-IR').format(section.itemCount)} آیتم ثبت شده`
                    : 'هنوز داده‌ای وارد نشده'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 rounded-[16px] border px-4 py-3 text-[12px] font-semibold ${
          canTransfer
            ? 'border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] text-[rgb(165,248,235)]'
            : 'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)] text-[rgb(254,202,202)]'
        }`}
      >
        {canTransfer
          ? 'حداقل یک بخش آماده است. می‌توانی اطلاعات را به نالج‌بیس منتقل کنی.'
          : 'برای انتقال به نالج‌بیس، حداقل یک مورد اطلاعات وارد کن.'}
      </div>
    </section>
  );
}
