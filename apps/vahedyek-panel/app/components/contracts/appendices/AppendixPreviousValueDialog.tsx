'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, FileClock, ListChecks, Users, WalletCards } from 'lucide-react';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import { APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE, APPENDIX_CONTRACT_BASE_TITLE } from '../../../lib/appendixPayloads';
import { FINANCIAL_SUB_CATEGORY_IDS } from '../../../lib/financialLineShared';
import { isFinancialLineHeaderCategoryId } from '../../../lib/financialUtils';
import type { AppendixTagKey, FinancialCategoryData, FinancialDueItemData } from '../../../types/contract';

type PreviousValueData = {
  title: string;
  sourceLabel: string;
  payload: Record<string, unknown>;
};

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString('fa-IR')} تومان`;
}

function partyShareText(party: any) {
  const value = Number(party?.share?.value ?? 0);
  const mode = party?.share?.mode === 'percent' ? 'درصد' : 'دانگ';
  return `${value.toLocaleString('fa-IR')} ${mode}`;
}

function sumDueItems(dueItems: FinancialDueItemData[]) {
  return dueItems.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
}

function categoryDueItemsMap(dueItems: FinancialDueItemData[]) {
  return dueItems.reduce<Record<string, FinancialDueItemData[]>>((acc, item) => {
    acc[item.categoryId] = [...(acc[item.categoryId] ?? []), item];
    return acc;
  }, {});
}

function AccordionToggle({ open }: { open: boolean }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 shadow-sm">
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </span>
  );
}

function FinancialDueList({ dueItems }: { dueItems: FinancialDueItemData[] }) {
  if (!dueItems.length) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">برای این بخش سررسیدی ثبت نشده است.</div>;
  }

  return (
    <div className="space-y-2">
      {dueItems.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <div className="text-[13px] font-black text-slate-800">{item.title}</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-500">{item.dueDate}</div>
            </div>
            <div className="text-[13px] font-black text-emerald-700">{formatMoney(Number(item.amount ?? 0))}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialSubCategoryCard({
  category,
  dueItems,
}: {
  category: FinancialCategoryData;
  dueItems: FinancialDueItemData[];
}) {
  const [open, setOpen] = useState(true);
  const registered = sumDueItems(dueItems);
  const remaining = Math.max(Number(category.capAmount ?? 0) - registered, 0);
  const percent = Number(category.capAmount ?? 0) > 0 ? Math.min(Math.round((registered / Number(category.capAmount ?? 0)) * 100), 100) : 0;

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-3 text-right">
        <AccordionToggle open={open} />
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2 text-[14px] font-black text-slate-900">
            <ListChecks className="h-4 w-4 text-slate-500" />
            {category.name}
          </div>
          <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">این زیرردیف به صورت اکسپند نمایش داده شده است.</p>
        </div>
        <div className="text-left">
          <div className="text-[13px] font-black text-emerald-700">{formatMoney(Number(category.capAmount ?? 0))}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">{percent.toLocaleString('fa-IR')}٪ ثبت شده</div>
        </div>
      </button>

      {open ? (
        <>
          <div className="mt-4 grid gap-3 rounded-2xl bg-[#c4e8ea]/35 px-4 py-3 text-[12px] font-bold text-slate-700 sm:grid-cols-3">
            <div className="text-right">
              <div className="text-slate-500">سررسید</div>
              <div className="mt-1">{dueItems.length.toLocaleString('fa-IR')} مورد</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500">ثبت‌شده</div>
              <div className="mt-1 text-emerald-700">{formatMoney(registered)}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500">مانده</div>
              <div className="mt-1">{formatMoney(remaining)}</div>
            </div>
          </div>

          <div className="mt-4">
            <FinancialDueList dueItems={dueItems} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function FinancialLineCard({
  title,
  amount,
  dueRegistered,
  children,
}: {
  title: string;
  amount: number;
  dueRegistered: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-[26px] border border-slate-200 bg-white/80 p-4 sm:p-5">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-3 border-b border-slate-200 pb-4 text-right">
        <AccordionToggle open={open} />
        <div className="flex-1 text-right">
          <div className="text-[18px] font-black text-slate-900">{title}</div>
          <p className="mt-1 text-[12px] font-semibold text-slate-500">این ردیف مالی در حالت اکسپند نمایش داده شده است.</p>
        </div>
        <div className="text-left">
          <div className="text-[13px] font-black text-emerald-700">{formatMoney(amount)}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">ثبت‌شده: {formatMoney(dueRegistered)}</div>
        </div>
      </button>

      {open ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  );
}

function PrincipalFinancialPreview({ payload }: { payload: Record<string, unknown> }) {
  const categories = (Array.isArray(payload.categories) ? payload.categories : []) as FinancialCategoryData[];
  const dueItems = (Array.isArray(payload.dueItems) ? payload.dueItems : []) as FinancialDueItemData[];
  const dueMap = categoryDueItemsMap(dueItems);
  const principal = categories.find((item) => item.id === 'principal');
  const subCategories = FINANCIAL_SUB_CATEGORY_IDS.map((subId) => categories.find((item) => item.id === subId)).filter(Boolean) as FinancialCategoryData[];

  return (
    <FinancialLineCard
      title={String(principal?.name ?? APPENDIX_CONTRACT_BASE_TITLE)}
      amount={Number(principal?.capAmount ?? 0)}
      dueRegistered={sumDueItems(subCategories.flatMap((item) => dueMap[item.id] ?? []))}
    >
      {subCategories.map((category) => (
        <FinancialSubCategoryCard key={category.id} category={category} dueItems={dueMap[category.id] ?? []} />
      ))}
    </FinancialLineCard>
  );
}

function SideCostsFinancialPreview({ payload }: { payload: Record<string, unknown> }) {
  const categories = (Array.isArray(payload.categories) ? payload.categories : []) as FinancialCategoryData[];
  const dueItems = (Array.isArray(payload.dueItems) ? payload.dueItems : []) as FinancialDueItemData[];
  const dueMap = categoryDueItemsMap(dueItems);
  const lineHeaders = categories.filter((item) => isFinancialLineHeaderCategoryId(item.id));

  if (!lineHeaders.length) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] font-semibold text-slate-500">ردیف مالی جانبی معتبری در داده قبلی ثبت نشده است.</div>;
  }

  return (
    <div className="space-y-4">
      {lineHeaders.map((header) => {
        const subCategories = FINANCIAL_SUB_CATEGORY_IDS.map((subId) => categories.find((item) => item.id === `${header.id}:${subId}`)).filter(Boolean) as FinancialCategoryData[];
        const dueRegistered = sumDueItems(subCategories.flatMap((item) => dueMap[item.id] ?? []));

        return (
          <FinancialLineCard key={header.id} title={header.name} amount={Number(header.capAmount ?? 0)} dueRegistered={dueRegistered}>
            {subCategories.map((category) => (
              <FinancialSubCategoryCard key={category.id} category={category} dueItems={dueMap[category.id] ?? []} />
            ))}
          </FinancialLineCard>
        );
      })}
    </div>
  );
}

function AdjustmentFinancialPreview({ payload }: { payload: Record<string, unknown> }) {
  const categories = (Array.isArray(payload.categories) ? payload.categories : []) as FinancialCategoryData[];
  const dueItems = (Array.isArray(payload.dueItems) ? payload.dueItems : []) as FinancialDueItemData[];
  const dueMap = categoryDueItemsMap(dueItems);
  const header = categories.find((item) => item.id === APPENDIX_ADJUSTMENT_LINE_ID);
  const subCategories = FINANCIAL_SUB_CATEGORY_IDS.map((subId) => categories.find((item) => item.id === `${APPENDIX_ADJUSTMENT_LINE_ID}:${subId}`)).filter(Boolean) as FinancialCategoryData[];

  return (
    <FinancialLineCard
      title={String(header?.name ?? APPENDIX_ADJUSTMENT_TITLE)}
      amount={Number(header?.capAmount ?? 0)}
      dueRegistered={sumDueItems(subCategories.flatMap((item) => dueMap[item.id] ?? []))}
    >
      {subCategories.map((category) => (
        <FinancialSubCategoryCard key={category.id} category={category} dueItems={dueMap[category.id] ?? []} />
      ))}
    </FinancialLineCard>
  );
}

function FinancialPreviewSection({
  title,
  payload,
  mode,
}: {
  title: string;
  payload: Record<string, unknown>;
  mode: 'adjustment' | 'contract-base-costs' | 'side-costs';
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <WalletCards className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">{title}</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش ساختاریافته داده معتبر قبلی برای این بخش</div>
        </div>
      </div>

      <div className="mt-4">
        {mode === 'adjustment' ? <AdjustmentFinancialPreview payload={payload} /> : null}
        {mode === 'contract-base-costs' ? <PrincipalFinancialPreview payload={payload} /> : null}
        {mode === 'side-costs' ? <SideCostsFinancialPreview payload={payload} /> : null}
      </div>
    </section>
  );
}

function PartySection({ tag, payload }: { tag: AppendixTagKey; payload: Record<string, unknown> }) {
  const parties = Array.isArray(payload.parties) ? payload.parties : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Users className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">{tag === 'first-party' ? 'فهرست طرف اول' : 'فهرست طرف دوم'}</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش نزدیک‌ترین داده معتبر قبلی برای این بخش</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {parties.length ? (
          parties.map((party: any, index: number) => (
            <div key={`${party?.personId ?? party?.name ?? index}`} className={`grid gap-2 px-4 py-3 text-right sm:grid-cols-[140px_minmax(0,1fr)] ${index > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="text-[11px] font-black text-slate-500">{(index + 1).toLocaleString('fa-IR')}</div>
              <div className="text-[13px] font-semibold leading-7 text-slate-700">
                {String(party?.name ?? '—')} • {partyShareText(party)}
                {party?.isPrimary ? ' • طرف اصلی' : ''}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-[13px] font-semibold text-slate-500">داده‌ای ثبت نشده است.</div>
        )}
      </div>
    </section>
  );
}

function DeliveryDateSection({ payload }: { payload: Record<string, unknown> }) {
  const resolvedDate = [payload.deliveryDate, payload.previousDate, payload.nextDate]
    .map((item) => String(item ?? '').trim())
    .find(Boolean) ?? '—';

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <FileClock className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">اطلاعات تاریخ تحویل</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش نزدیک‌ترین داده معتبر قبلی برای این بخش</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-2 px-4 py-3 text-right sm:grid-cols-[140px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">تاریخ تحویل ثبت‌شده</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{resolvedDate}</div>
        </div>
      </div>
    </section>
  );
}

function LoanSection({ payload }: { payload: Record<string, unknown> }) {
  const paymentStatus = String(payload.paymentStatus ?? 'unselected');
  const paymentStatusLabel =
    paymentStatus === 'full'
      ? 'بانک تمام مبلغ وام را پرداخت کرده'
      : paymentStatus === 'less'
        ? 'بانک مبلغ کمتری از قرارداد پرداخت کرده'
        : paymentStatus === 'more'
          ? 'بانک مبلغ بیشتری از قرارداد پرداخت کرده'
          : paymentStatus === 'none'
            ? 'بانک هیچ مبلغی پرداخت نکرده است'
            : 'هنوز وضعیتی ثبت نشده است';
  const loanAmount = Number(payload.loanAmount ?? 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <WalletCards className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">اطلاعات وام</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش نزدیک‌ترین داده معتبر قبلی برای این بخش</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-2 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">وضعیت پرداخت</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{paymentStatusLabel}</div>
        </div>
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">مبلغ وام</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{loanAmount > 0 ? `${loanAmount.toLocaleString('fa-IR')} ریال` : '—'}</div>
        </div>
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">بانک عامل</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{String(payload.selectedBank ?? '—')}</div>
        </div>
      </div>
    </section>
  );
}

function GenericPayloadSection({ title, payload }: { title: string; payload: Record<string, unknown> }) {
  const entries = Object.entries(payload ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <ListChecks className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">{title}</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش نزدیک‌ترین داده معتبر قبلی برای این بخش</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {entries.length ? (
          entries.map(([key, value], index) => (
            <div key={key} className={`grid gap-2 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)] ${index > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="text-[11px] font-black text-slate-500">{key}</div>
              <div className="text-[13px] font-semibold leading-7 text-slate-700">
                {Array.isArray(value) ? value.map((item) => String(item)).join('، ') || '—' : String(value)}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-[13px] font-semibold text-slate-500">داده‌ای ثبت نشده است.</div>
        )}
      </div>
    </section>
  );
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
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
            <h3 className="mt-3 text-[20px] font-black text-slate-900">{data.title || CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title || tag}</h3>
            <p className="mt-2 text-[12px] font-bold leading-6 text-slate-500">منبع داده: {data.sourceLabel}</p>
          </div>
        </div>

        <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1">
          {tag === 'loan' ? <LoanSection payload={data.payload} /> : null}
          {tag === 'adjustment' ? <FinancialPreviewSection title="اطلاعات تعدیل" payload={data.payload} mode="adjustment" /> : null}
          {tag === 'contract-base-costs' ? <FinancialPreviewSection title="اطلاعات اصل قرارداد" payload={data.payload} mode="contract-base-costs" /> : null}
          {tag === 'side-costs' ? <FinancialPreviewSection title="اطلاعات هزینه های جانبی" payload={data.payload} mode="side-costs" /> : null}
          {tag === 'material-specs-change' ? <GenericPayloadSection title="اطلاعات پرونده تغییر مصالح و مشخصات" payload={data.payload} /> : null}
          {tag === 'unit-delivery-date' ? <DeliveryDateSection payload={data.payload} /> : null}
          {tag === 'first-party' || tag === 'second-party' ? <PartySection tag={tag} payload={data.payload} /> : null}
        </div>
      </div>
    </div>
  );
}
