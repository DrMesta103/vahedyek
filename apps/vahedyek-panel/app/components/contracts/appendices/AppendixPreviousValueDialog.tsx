'use client';

import { Eye, FileClock, Users } from 'lucide-react';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import type { AppendixTagKey } from '../../../types/contract';

type PreviousValueData = {
  title: string;
  sourceLabel: string;
  payload: Record<string, unknown>;
};

function partyShareText(party: any) {
  const value = Number(party?.share?.value ?? 0);
  const mode = party?.share?.mode === 'percent' ? 'درصد' : 'دانگ';
  return `${value.toLocaleString('fa-IR')} ${mode}`;
}

function buildSections(tag: AppendixTagKey, payload: Record<string, unknown>) {
  if (tag === 'unit-delivery-date') {
    return [
      {
        title: 'اطلاعات تاریخ تحویل',
        icon: FileClock,
        rows: [
          {
            label: 'تاریخ تحویل ثبت‌شده',
            value: String(payload.deliveryDate ?? payload.nextDate ?? payload.previousDate ?? '—'),
          },
        ],
      },
    ];
  }

  const parties = Array.isArray(payload.parties) ? payload.parties : [];

  return [
    {
      title: tag === 'first-party' ? 'فهرست طرف اول' : 'فهرست طرف دوم',
      icon: Users,
      rows: parties.length
        ? parties.map((party: any, index: number) => ({
            label: (index + 1).toLocaleString('fa-IR'),
            value: `${String(party?.name ?? '—')} • ${partyShareText(party)}${party?.isPrimary ? ' • طرف اصلی' : ''}`,
          }))
        : [{ label: 'وضعیت', value: 'داده‌ای ثبت نشده است.' }],
    },
  ];
}

export function AppendixPreviousValueDialog({
  open,
  tag,
  data,
  onClose,
}: {
  open: boolean;
  tag: AppendixTagKey | null;
  data: PreviousValueData | null;
  onClose: () => void;
}) {
  if (!open || !tag || !data) return null;

  const sections = buildSections(tag, data.payload);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        dir="rtl"
        lang="fa"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"
            aria-label="بستن"
          >
            <span className="text-lg leading-none">×</span>
          </button>

          <div className="min-w-0 flex-1 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-800">
              <Eye className="h-3.5 w-3.5" />
              مشاهده داده قبلی
            </div>
            <h3 className="mt-3 text-[20px] font-black text-slate-900">
              {data.title || CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title || tag}
            </h3>
            <p className="mt-2 text-[12px] font-bold leading-6 text-slate-500">منبع داده: {data.sourceLabel}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-right">
                    <div className="text-[15px] font-black text-slate-900">{section.title}</div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      نمایش نزدیک‌ترین داده معتبر قبلی برای این بخش
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {section.rows.map((row, index) => (
                    <div
                      key={`${section.title}-${index}`}
                      className={`grid gap-2 px-4 py-3 text-right sm:grid-cols-[140px_minmax(0,1fr)] ${
                        index > 0 ? 'border-t border-slate-100' : ''
                      }`}
                    >
                      <div className="text-[11px] font-black text-slate-500">{row.label}</div>
                      <div className="text-[13px] font-semibold leading-7 text-slate-700">{row.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
