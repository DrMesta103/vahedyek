'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, FileClock, ListChecks, Scale, Users, WalletCards } from 'lucide-react';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import { APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE, APPENDIX_CONTRACT_BASE_TITLE } from '../../../lib/appendixPayloads';
import {
  GENERIC_CONDITION_APPENDIX_TAGS,
  GENERIC_DATE_APPENDIX_TAGS,
  GENERIC_FINANCIAL_APPENDIX_TAGS,
  normalizeTechnicalSpecGroups,
} from '../../../lib/appendixPayloads';
import { FINANCIAL_SUB_CATEGORY_IDS } from '../../../lib/financialLineShared';
import { isFinancialLineHeaderCategoryId } from '../../../lib/financialUtils';
import type { AppendixTagKey, ContractTerminationData, FinancialCategoryData, FinancialDueItemData } from '../../../types/contract';

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

function TechnicalSpecsPayloadSection({ payload }: { payload: Record<string, unknown> }) {
  const specs = normalizeTechnicalSpecGroups(payload.specs ?? payload.groups);

  if (!specs.length) {
    return <GenericPayloadSection title="اطلاعات پرونده مشخصات فنی پروژه" payload={payload} />;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <ListChecks className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">اطلاعات پرونده مشخصات فنی پروژه</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش ساختار گروهی ثبت‌شده در این متمم</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {specs.map((group, index) => (
          <div key={group.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-right">
                <div className="text-[13px] font-black text-slate-800">{group.title}</div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">
                  {group.selectedSpecIds.length.toLocaleString('fa-IR')} مشخصه انتخاب شده
                </div>
              </div>
              <div className="shrink-0 text-[11px] font-bold text-slate-400">{(index + 1).toLocaleString('fa-IR')}</div>
            </div>
          </div>
        ))}
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
          {tag === 'material-specs-change' ? <TechnicalSpecsPayloadSection payload={data.payload} /> : null}
          {tag === 'builder-penalty' ? <BuilderPenaltySection payload={data.payload} /> : null}
          {tag === 'builder-cancellation' ? <TerminationSection payload={data.payload} side="builder" /> : null}
          {tag === 'buyer-cancellation' ? <TerminationSection payload={data.payload} side="buyer" /> : null}
          {tag === 'penalty-waiver' ? <PenaltyWaiverSection payload={data.payload} /> : null}
          {tag === 'unit-delivery-date' ? <DeliveryDateSection payload={data.payload} /> : null}
          {tag === 'first-party' || tag === 'second-party' ? <PartySection tag={tag} payload={data.payload} /> : null}
          {GENERIC_FINANCIAL_APPENDIX_TAGS.includes(tag as (typeof GENERIC_FINANCIAL_APPENDIX_TAGS)[number]) ||
          GENERIC_CONDITION_APPENDIX_TAGS.includes(tag as (typeof GENERIC_CONDITION_APPENDIX_TAGS)[number]) ||
          GENERIC_DATE_APPENDIX_TAGS.includes(tag as (typeof GENERIC_DATE_APPENDIX_TAGS)[number]) ? (
            <GenericPayloadSection title={CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? 'اطلاعات متمم'} payload={data.payload} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function penaltyModeLabel(mode: string) {
  switch (mode) {
    case 'fixed':
      return 'مبلغ ثابت';
    case 'overdue':
      return 'درصدی از مانده بدهی معوق';
    case 'contract':
      return 'درصدی از کل قرارداد';
    case 'progressive':
      return 'جریمه تصاعدی';
    default:
      return '—';
  }
}

function penaltyPeriodLabel(period: string) {
  switch (period) {
    case 'daily':
      return 'روزانه';
    case 'monthly':
      return 'ماهانه';
    case 'yearly':
      return 'سالانه';
    default:
      return '—';
  }
}

function builderModeLabel(mode: string) {
  switch (mode) {
    case 'fixed':
      return 'مبلغ ثابت';
    case 'percent':
      return 'درصدی';
    case 'progressive':
      return 'تصاعدی';
    default:
      return '—';
  }
}

function renderValueRow(label: string, value: string) {
  return (
    <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
      <div className="text-[11px] font-black text-slate-500">{label}</div>
      <div className="text-[13px] font-semibold leading-7 text-slate-700">{value || '—'}</div>
    </div>
  );
}

function BuilderPenaltySection({ payload }: { payload: Record<string, unknown> }) {
  const unitEnabled = Boolean(payload.unitDeliveryDelayEnabled);
  const materialEnabled = Boolean(payload.materialSpecsChangeEnabled);
  const unitMode = String(payload.unitDeliveryDelayMode ?? 'fixed');
  const materialMode = String(payload.materialSpecsChangeMode ?? 'fixed');
  const unitPeriod = String(payload.unitDeliveryDelayPeriod ?? 'روزانه');
  const materialPeriod = String(payload.materialSpecsChangePeriod ?? 'روزانه');
  const includedTypes = Array.isArray(payload.materialSpecsChangeIncludedTypes) ? payload.materialSpecsChangeIncludedTypes : [];
  const importanceLevel = String(payload.materialSpecsChangeImportanceLevel ?? '').trim();

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <WalletCards className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">جرائم سازنده</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش ساختار ثبت‌شده در نسخه قبلی</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-2 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">تأخیر در تحویل واحد</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{unitEnabled ? 'فعال' : 'غیرفعال'}</div>
        </div>
        {unitEnabled ? (
          <>
            {renderValueRow('روش محاسبه', builderModeLabel(unitMode))}
            {renderValueRow('دوره', unitPeriod)}
          </>
        ) : null}
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">تغییرات مشخصات فنی پروژه</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{materialEnabled ? 'فعال' : 'غیرفعال'}</div>
        </div>
        {materialEnabled ? (
          <>
            {renderValueRow('روش محاسبه', builderModeLabel(materialMode))}
            {renderValueRow('دوره', materialPeriod)}
            {includedTypes.length ? renderValueRow('نوع تغییرات مشمول', includedTypes.map((item) => String(item)).join('، ')) : null}
            {importanceLevel ? renderValueRow('سطح اهمیت', importanceLevel) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

const BUILDER_TERMINATION_SECTION_LABELS: Record<string, string> = {
  lateInstallment: 'تاخیر در پرداخت اقساط',
  financialObligations: 'عدم انجام تعهدات مالی',
  documentDeficiencies: 'نقص مدارک / تعهدات',
  otherBreach: 'نقض سایر تعهدات قراردادی',
  notifications: 'اطلاع‌رسانی',
};

const BUYER_TERMINATION_SECTION_LABELS: Record<string, string> = {
  lateDelivery: 'تاخیر در تحویل واحد',
  specificationChanges: 'تغییر مشخصات',
  breachOfObligations: 'نقض تعهدات سازنده',
  physicalProgressDelay: 'تاخیر در تحقق مراحل پیشرفت پروژه',
  areaDiscrepancy: 'اختلاف متراژ واحد',
  notification: 'اطلاع‌رسانی',
};

function TerminationSection({ payload, side }: { payload: Record<string, unknown>; side: 'builder' | 'buyer' }) {
  const data = payload as unknown as ContractTerminationData;
  const enabledSections =
    side === 'builder'
      ? Object.entries(data.constructorTerms ?? {}).filter(([, section]) => Boolean(section?.ruleEnabled))
      : Object.entries(data.buyerTerms ?? {}).filter(([, section]) => Boolean(section?.ruleEnabled));
  const labels = enabledSections
    .map(([key]) => (side === 'builder' ? BUILDER_TERMINATION_SECTION_LABELS[key] : BUYER_TERMINATION_SECTION_LABELS[key]) ?? key)
    .filter(Boolean);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Scale className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">{side === 'builder' ? 'مشخصات فسخ سازنده' : 'مشخصات فسخ خریدار'}</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش ساختار ثبت‌شده در نسخه قبلی</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {renderValueRow('وضعیت کلی', data.terminationEnabled ? 'فعال' : 'غیرفعال')}
        {renderValueRow('تب فعال', data.terminationPartyTab === 'seller' ? 'فسخ سازنده' : 'فسخ خریدار')}
        {renderValueRow('بخش‌های فعال', `${enabledSections.length.toLocaleString('fa-IR')} مورد`)}
        {renderValueRow('فهرست بخش‌ها', labels.length ? labels.slice(0, 3).join('، ') : 'بدون بخش فعال')}
      </div>
    </section>
  );
}

function PenaltyWaiverSection({ payload }: { payload: Record<string, unknown> }) {
  const mode = String(payload.mode ?? 'fixed');
  const period = String(payload.period ?? 'monthly');
  const fixedAmount = String(payload.fixedAmount ?? '');
  const penaltyPercent = String(payload.penaltyPercent ?? '');
  const bankInterestPercent = String(payload.bankInterestPercent ?? '');
  const graceDays = String(payload.graceDays ?? '');
  const roundRule = String(payload.roundRule ?? '');
  const extraFeeEnabled = Boolean(payload.extraFeeEnabled);
  const extraFeeType = String(payload.extraFeeType ?? 'percent');
  const extraFeeAmount = String(payload.extraFeeAmount ?? '');
  const extraFeeRoundRule = String(payload.extraFeeRoundRule ?? '');
  const progressiveRows = Array.isArray(payload.progressiveRows) ? payload.progressiveRows : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <WalletCards className="h-4 w-4" />
        </span>
        <div className="text-right">
          <div className="text-[15px] font-black text-slate-900">جرائم کارفرما</div>
          <div className="text-[11px] font-semibold text-slate-500">نمایش ساختار ثبت‌شده در نسخه قبلی</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-2 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">روش محاسبه</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{penaltyModeLabel(mode)}</div>
        </div>
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">دوره</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{penaltyPeriodLabel(period)}</div>
        </div>
        {fixedAmount ? (
          <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-[11px] font-black text-slate-500">مبلغ ثابت</div>
            <div className="text-[13px] font-semibold leading-7 text-slate-700">{fixedAmount}</div>
          </div>
        ) : null}
        {penaltyPercent ? (
          <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-[11px] font-black text-slate-500">درصد جریمه</div>
            <div className="text-[13px] font-semibold leading-7 text-slate-700">{penaltyPercent}</div>
          </div>
        ) : null}
        {bankInterestPercent ? (
          <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-[11px] font-black text-slate-500">درصد سود بانکی</div>
            <div className="text-[13px] font-semibold leading-7 text-slate-700">{bankInterestPercent}</div>
          </div>
        ) : null}
        {mode === 'progressive' ? (
          <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-[11px] font-black text-slate-500">بازه‌های تصاعدی</div>
            <div className="text-[13px] font-semibold leading-7 text-slate-700">{progressiveRows.length.toLocaleString('fa-IR')} بازه</div>
          </div>
        ) : null}
        <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="text-[11px] font-black text-slate-500">مهلت تنفس</div>
          <div className="text-[13px] font-semibold leading-7 text-slate-700">{graceDays || '0'} روز</div>
        </div>
        {mode !== 'fixed' ? (
          <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-[11px] font-black text-slate-500">قاعده گرد کردن</div>
            <div className="text-[13px] font-semibold leading-7 text-slate-700">{roundRule || '—'}</div>
          </div>
        ) : null}
        {extraFeeEnabled ? (
          <>
            <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="text-[11px] font-black text-slate-500">هزینه دیرکرد</div>
              <div className="text-[13px] font-semibold leading-7 text-slate-700">{extraFeeType === 'fixed' ? 'مبلغ ثابت' : 'درصدی'}</div>
            </div>
            <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="text-[11px] font-black text-slate-500">مقدار هزینه دیرکرد</div>
              <div className="text-[13px] font-semibold leading-7 text-slate-700">{extraFeeAmount || '—'}</div>
            </div>
            <div className="grid gap-2 border-t border-slate-100 px-4 py-3 text-right sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="text-[11px] font-black text-slate-500">قاعده گرد کردن هزینه</div>
              <div className="text-[13px] font-semibold leading-7 text-slate-700">{extraFeeRoundRule || '—'}</div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
