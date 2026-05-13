'use client';

import { ChevronDown, ChevronUp, Eye, GitCompareArrows, Trash2 } from 'lucide-react';
import { formatDateFa } from '../../../lib/dateFormat';
import { appendixItemValueText, appendixStatusLabel } from '../../../lib/appendixLifecycle';
import type { ContractAppendix } from '../../../types/contract';

export function AppendixTimelineCard({
  appendix,
  expanded,
  onToggle,
  onView,
  onCompare,
  onDelete,
}: {
  appendix: ContractAppendix;
  expanded: boolean;
  onToggle: () => void;
  onView: () => void;
  onCompare: () => void;
  onDelete: () => void;
}) {
  const statusLabel = appendixStatusLabel(appendix.status);

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
      <button type="button" onClick={onToggle} className="flex w-full flex-col gap-4 px-5 py-5 text-right transition hover:bg-slate-50/80 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <span className="inline-flex min-h-[30px] items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-900">
              {statusLabel}
            </span>
            {appendix.items.map((item) => (
              <span
                key={item.id}
                className="inline-flex min-h-[30px] items-center rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_24%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_08%,white)] px-3 py-1 text-[11px] font-black text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]"
              >
                {item.title}
              </span>
            ))}
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-right">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[17px] font-black text-slate-900">{appendix.title}</h3>
            <span className="text-[12px] font-bold text-slate-500">{formatDateFa(appendix.createdAt, { withTime: true })}</span>
          </div>
          <div className="text-[13px] font-semibold text-slate-600">{appendix.issuerName} • ثبت متمم</div>
          <p className="m-0 text-[12px] font-semibold leading-7 text-slate-500">{appendix.summary}</p>
        </div>
      </button>

      <div className="border-t border-slate-100 bg-white px-5 py-3 sm:px-6">
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onView} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700">
            <Eye className="h-4 w-4" />
            مشاهده جزئیات
          </button>
          <button type="button" onClick={onCompare} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700">
            <GitCompareArrows className="h-4 w-4" />
            تاریخچه / مقایسه
          </button>
          {appendix.canDelete ? (
            <button type="button" onClick={onDelete} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-[12px] font-extrabold text-rose-700">
              <Trash2 className="h-4 w-4" />
              حذف
            </button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white px-4 py-4">
            <div className="text-[14px] font-black text-slate-900">جزئیات متمم</div>
            <p className="mt-2 text-[12px] font-semibold leading-7 text-slate-500">
              در این بخش می‌توانید تمام تغییراتی را که با این متمم انجام گرفته است را مشاهده کنید.
            </p>
            <div className="mt-4 space-y-3">
              {appendix.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="text-[13px] font-black text-slate-800">{item.title}</div>
                  <div className="mt-1 text-[12px] font-semibold leading-6 text-slate-600">{appendixItemValueText(item)}</div>
                </div>
              ))}
            </div>
            {appendix.notes ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-[12px] font-semibold leading-7 text-slate-600">
                {appendix.notes}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
