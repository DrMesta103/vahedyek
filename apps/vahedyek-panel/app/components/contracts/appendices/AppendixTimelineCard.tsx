'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, GitCompareArrows, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDateFa } from '../../../lib/dateFormat';
import { appendixStatusLabel } from '../../../lib/appendixLifecycle';
import type { ContractAppendix } from '../../../types/contract';

function getStatusTone(status: ContractAppendix['status']) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (status === 'pending_approval') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export function AppendixTimelineCard({
  appendix,
  onView,
  onCompare,
  onDelete,
}: {
  appendix: ContractAppendix;
  onView: () => void;
  onCompare: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const tagsText = appendix.items.map((item) => item.title).join(' • ');

  return (
    <article className="relative overflow-visible rounded-[24px] border border-slate-200/80 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--dark-teal)_24%,transparent)] hover:shadow-[0_24px_48px_-30px_rgba(15,23,42,0.3)]">
      <div ref={menuRef} className="absolute right-4 top-4 z-20">
        <button
          type="button"
          aria-label="اکشن‌های متمم"
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((current) => !current);
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.24)]">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onView();
              }}
              className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-right text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <span>مشاهده جزئیات</span>
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onCompare();
              }}
              className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-right text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <span>مقایسه</span>
              <GitCompareArrows className="h-4 w-4" />
            </button>
            {appendix.canDelete ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-right text-[12px] font-extrabold text-rose-700 transition hover:bg-rose-50"
              >
                <span>حذف</span>
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <button type="button" onClick={onView} className="flex w-full flex-col gap-4 px-5 py-5 pr-16 text-right sm:px-6 sm:pr-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <span className={`inline-flex min-h-[32px] items-center rounded-full border px-3.5 py-1 text-[11px] font-black ${getStatusTone(appendix.status)}`}>
            {appendixStatusLabel(appendix.status)}
          </span>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-slate-400">تاریخ ثبت</span>
            <span className="text-slate-600">{formatDateFa(appendix.createdAt, { withTime: true })}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-4 py-3">
            <div className="min-w-0 text-[13px] font-black text-slate-900">{appendix.title}</div>
            <div className="shrink-0 text-[11px] font-bold text-slate-400">عنوان متمم</div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-4 py-3">
            <div className="min-w-0 text-[12px] font-semibold text-slate-700">{appendix.issuerName}</div>
            <div className="shrink-0 text-[11px] font-bold text-slate-400">ثبت‌کننده</div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_05%,white)] px-4 py-3">
            <div className="min-w-0 line-clamp-1 text-[12px] font-semibold text-slate-700">{tagsText}</div>
            <div className="shrink-0 text-[11px] font-bold text-slate-400">نوع متمم</div>
          </div>

          {appendix.notes ? (
            <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 line-clamp-2 text-[11px] font-semibold leading-6 text-slate-500">{appendix.notes}</div>
                <div className="shrink-0 pt-0.5 text-[11px] font-bold text-slate-400">یادداشت</div>
              </div>
            </div>
          ) : null}
        </div>
      </button>
    </article>
  );
}
