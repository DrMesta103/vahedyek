'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, FileClock, History, Sparkles } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../../components/PanelLayout';
import { getAppendixCompare } from '../../../../../../lib/contractDraftClient';
import { appendixStatusLabel } from '../../../../../../lib/appendixLifecycle';
import { formatDateFa } from '../../../../../../lib/dateFormat';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixLoanPayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  AppendixTagKey,
  ContractParty,
  FinancialCategoryData,
  FinancialDueItemData,
} from '../../../../../../types/contract';

type CompareHistoryEntry = {
  sourceType: 'contract' | 'appendix';
  sourceLabel: string;
  appendixNumber: number | null;
  effectiveDate: string | null;
  createdAt: string | null;
  isCurrent: boolean;
  status: 'draft' | 'pending_approval' | 'completed';
  payload: Record<string, unknown>;
};

type CompareHistorySection = {
  tagKey: AppendixTagKey;
  title: string;
  entries: CompareHistoryEntry[];
};

type CompareResponse = {
  current: {
    title: string;
    appendixNumber: number;
  };
  sections: CompareHistorySection[];
};

function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  return `${Math.round(amount).toLocaleString('fa-IR')} تومان`;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, val]) => `${key}:${stableSerialize(val)}`).join(',')}}`;
  }
  return String(value ?? '');
}

function isSamePayload(a: Record<string, unknown>, b: Record<string, unknown>) {
  return stableSerialize(a) === stableSerialize(b);
}

function renderValueRow(label: string, value: string, accent = false) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3">
      <div className={`min-w-0 text-right text-[12px] font-semibold ${accent ? 'text-slate-900' : 'text-slate-700'}`}>{value || '—'}</div>
      <div className="shrink-0 text-[11px] font-bold text-slate-400">{label}</div>
    </div>
  );
}

function renderPartyList(parties: ContractParty[]) {
  if (!parties.length) return renderValueRow('طرفین', '—');
  return (
    <div className="space-y-2">
      {parties.map((party, index) => (
        <div key={`${party.personId}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3">
          <div className="min-w-0 text-right text-[12px] font-semibold text-slate-700">
            {party.name} ({party.share?.value ?? 0} {party.share?.mode === 'percent' ? 'درصد' : 'دانگ'})
          </div>
          <div className="shrink-0 text-[11px] font-bold text-slate-400">{index === 0 ? 'طرف قرارداد' : `شریک ${index.toLocaleString('fa-IR')}`}</div>
        </div>
      ))}
    </div>
  );
}

function renderDueItems(dueItems: FinancialDueItemData[]) {
  if (!dueItems.length) return null;
  return (
    <div className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-3">
      <div className="mb-3 text-right text-[11px] font-black text-slate-500">سررسیدها</div>
      <div className="space-y-2">
        {dueItems.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-2xl bg-white px-4 py-3">
            {renderValueRow('عنوان', item.title || '—')}
            {renderValueRow('مبلغ', formatMoney(item.amount))}
            {renderValueRow('تاریخ سررسید', item.dueDate || '—')}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderFinancialCategories(categories: FinancialCategoryData[]) {
  const visible = categories.filter((item) => Number(item.capAmount ?? 0) > 0 || Number(item.dueAmount ?? 0) > 0 || Number(item.noDueAmount ?? 0) > 0);
  if (!visible.length) return renderValueRow('ردیف مالی', 'موردی ثبت نشده است.');
  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <div key={item.id} className="grid gap-2 rounded-2xl bg-white px-4 py-3">
          {renderValueRow('عنوان ردیف', item.name || '—', true)}
          {renderValueRow('سقف مبلغ', formatMoney(item.capAmount))}
          {renderValueRow('مبلغ سررسیددار', formatMoney(item.dueAmount))}
          {renderValueRow('مبلغ بدون سررسید', formatMoney(item.noDueAmount))}
        </div>
      ))}
    </div>
  );
}

function renderDeliveryPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixDeliveryDatePayload & { deliveryDate?: string };
  return (
    <div className="space-y-2">
      {renderValueRow('تاریخ قبلی', String(row.previousDate ?? row.deliveryDate ?? '—'))}
      {renderValueRow('تاریخ جدید', String(row.nextDate ?? row.deliveryDate ?? '—'), true)}
      {String(row.reason ?? '').trim() ? renderValueRow('توضیحات', String(row.reason)) : null}
    </div>
  );
}

function renderPartiesPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixPartiesPayload;
  const parties = Array.isArray(row.parties) ? row.parties : [];
  return renderPartyList(parties);
}

function renderLoanPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixLoanPayload;
  const statusLabel =
    row.paymentStatus === 'full'
      ? 'پرداخت کامل'
      : row.paymentStatus === 'less'
        ? 'پرداخت کمتر از مبلغ قرارداد'
        : row.paymentStatus === 'more'
          ? 'پرداخت بیشتر از مبلغ قرارداد'
          : row.paymentStatus === 'none'
            ? 'بدون پرداخت'
            : 'مشخص نشده';

  return (
    <div className="space-y-2">
      {renderValueRow('وضعیت پرداخت', statusLabel, true)}
      {renderValueRow('مبلغ وام قرارداد', formatMoney(row.contractLoanAmount))}
      {renderValueRow('مبلغ وام', formatMoney(row.loanAmount))}
      {renderValueRow('بانک عامل', row.selectedBank || '—')}
      {renderValueRow('زمان دریافت', row.loanTiming || '—')}
      {row.loanReceivedDate ? renderValueRow('تاریخ دریافت', row.loanReceivedDate) : null}
    </div>
  );
}

function renderFinancialPayload(payload: Record<string, unknown>) {
  const row = payload as unknown as AppendixAdjustmentPayload | AppendixContractBaseCostsPayload | AppendixSideCostsPayload;
  const categories = Array.isArray(row.categories) ? row.categories : [];
  const dueItems = Array.isArray(row.dueItems) ? row.dueItems : [];

  return (
    <div className="space-y-3">
      {renderFinancialCategories(categories)}
      {renderDueItems(dueItems)}
    </div>
  );
}

function renderGenericPayload(payload: Record<string, unknown>) {
  const entries = Object.entries(payload ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) return renderValueRow('محتوا', '—');
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => renderValueRow(key, typeof value === 'string' ? value : JSON.stringify(value)))}
    </div>
  );
}

function PayloadContent({ payload, tagKey }: { payload: Record<string, unknown>; tagKey: AppendixTagKey }) {
  if (tagKey === 'unit-delivery-date') return renderDeliveryPayload(payload);
  if (tagKey === 'first-party' || tagKey === 'second-party') return renderPartiesPayload(payload);
  if (tagKey === 'loan') return renderLoanPayload(payload);
  if (tagKey === 'adjustment' || tagKey === 'contract-base-costs' || tagKey === 'side-costs') return renderFinancialPayload(payload);
  return renderGenericPayload(payload);
}

function getEntryTone(entry: CompareHistoryEntry, unchanged: boolean) {
  if (unchanged) return 'border-slate-200 bg-slate-50/90';
  if (entry.isCurrent) return 'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.98),rgba(248,250,252,0.98))]';
  if (entry.sourceType === 'contract') return 'border-slate-200 bg-slate-50/80';
  return 'border-slate-200 bg-white';
}

function EntryStatusBadge({ entry }: { entry: CompareHistoryEntry }) {
  if (!entry.isCurrent && entry.sourceType === 'contract') return null;
  const label = entry.sourceType === 'contract' ? 'اصل قرارداد' : entry.isCurrent ? 'متمم فعلی' : appendixStatusLabel(entry.status);
  const cls =
    entry.sourceType === 'contract'
      ? 'border-slate-200 bg-slate-100 text-slate-700'
      : entry.isCurrent
        ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
        : 'border-slate-200 bg-slate-100 text-slate-700';
  return <span className={`inline-flex min-h-[30px] items-center rounded-full border px-3 py-1 text-[11px] font-black ${cls}`}>{label}</span>;
}

function UnchangedBanner() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
      <div className="text-[12px] font-semibold text-slate-600">این بخش نسبت به نسخه قبلی تغییری نداشته است.</div>
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
        <Sparkles className="h-3.5 w-3.5" />
        بدون تغییر
      </div>
    </div>
  );
}

function ChangedBadge() {
  return (
    <span className="inline-flex min-h-[30px] items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
      تغییر کرده
    </span>
  );
}

function TimelineEntryCard({
  entry,
  previousEntry,
  tagKey,
}: {
  entry: CompareHistoryEntry;
  previousEntry: CompareHistoryEntry | null;
  tagKey: AppendixTagKey;
}) {
  const unchanged = previousEntry ? isSamePayload(previousEntry.payload, entry.payload) : false;
  const changed = Boolean(previousEntry) && !unchanged;
  const [open, setOpen] = useState(entry.isCurrent || !unchanged);

  return (
    <div className="relative pr-8">
      <span className="absolute right-[7px] top-8 z-10 h-4 w-4 rounded-full border-4 border-white bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] shadow-sm" />
      <div className={`rounded-[24px] border p-4 text-right shadow-sm transition ${getEntryTone(entry, unchanged)}`}>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-start justify-between gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="text-[15px] font-black text-slate-900">{entry.sourceLabel}</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                  {entry.effectiveDate ? <span>تاریخ موثر: {entry.effectiveDate}</span> : null}
                  {entry.createdAt ? <span>ثبت: {formatDateFa(entry.createdAt, { withTime: true })}</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {changed ? <ChangedBadge /> : null}
                {unchanged ? (
                  <span className="inline-flex min-h-[30px] items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                    بدون تغییر
                  </span>
                ) : null}
                <EntryStatusBadge entry={entry} />
              </div>
            </div>
          </div>
        </button>

        {open ? (
          <div className="mt-4 space-y-3">
            {unchanged ? <UnchangedBanner /> : null}
            {!unchanged ? <PayloadContent payload={entry.payload} tagKey={tagKey} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CompareSection({ section }: { section: CompareHistorySection }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.74),rgba(255,255,255,0.92))] p-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.22)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-right">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <div className="text-[17px] font-black text-slate-900">{section.title}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            {section.entries.length.toLocaleString('fa-IR')} گره در تاریخچه این بخش
          </div>
        </div>
      </button>

      {open ? (
        <div className="relative mt-5 pr-2">
          <div className="absolute bottom-0 right-[14px] top-2 w-px bg-[linear-gradient(180deg,rgba(14,152,157,0.24),rgba(148,163,184,0.28))]" />
          <div className="space-y-4">
            {section.entries.map((entry, index) => (
              <TimelineEntryCard
                key={`${section.tagKey}-${entry.sourceType}-${entry.appendixNumber ?? 'contract'}-${index}`}
                entry={entry}
                previousEntry={index > 0 ? section.entries[index - 1] : null}
                tagKey={section.tagKey}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function AppendixComparePage() {
  const params = useParams<{ contractId: string; appendixId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<CompareResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setData(await getAppendixCompare(String(params.appendixId)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت مقایسه متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.appendixId]);

  const backHref = useMemo(
    () =>
      `/contracts/${params.contractId}/appendices/${params.appendixId}${
        searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''
      }`,
    [params.appendixId, params.contractId, searchParams],
  );

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            بازگشت به جزئیات متمم
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            در حال بارگذاری...
          </section>
        ) : error ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
            {error}
          </section>
        ) : data ? (
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.84))] px-5 py-5 text-right">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">
                  <FileClock className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[22px] font-black text-slate-900">تاریخچه متمم</h1>
                  <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">
                    در این صفحه سیر تغییرات هر بخش از اصل قرارداد تا آخرین متمم تاییدشده و نسخه فعلی نمایش داده می‌شود.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {renderValueRow('متمم فعلی', data.current.title, true)}
                {renderValueRow('تعداد بخش‌ها', `${data.sections.length.toLocaleString('fa-IR')} مورد`)}
                {renderValueRow('نوع نمایش', 'تاریخچه کامل')}
                {renderValueRow('الگوی مرور', 'تایم‌لاین ستونی')}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {data.sections.map((section) => (
                <CompareSection key={section.tagKey} section={section} />
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 px-5 py-4 text-right">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-semibold leading-7 text-slate-600">
                  هر کارت تاریخچه را می‌توانید جداگانه باز و بسته کنید. اگر در یک نسخه تغییری نسبت به نسخه قبلی ثبت نشده باشد، به‌صورت واضح مشخص شده است.
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <History className="h-5 w-5" />
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PanelLayout>
  );
}
