'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  History,
  MoreHorizontal,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { AttachmentItem } from '../../actions/contractSteps789';
import type {
  ContractFinancialData,
  ContractPartiesData,
  ContractPenaltiesData,
  ContractSubjectData,
  ShareMode,
} from '../../types/contract';
import { buildFinancialSlices, computeContractTotalRial, type FinancialSlice } from '../../lib/contractDraftPreviewFinancial';

export type PreviewContractPayload = {
  subject: ContractSubjectData & {
    blockName?: string | null;
    floorName?: string | null;
    unitName?: string | null;
    unitUsage?: string | null;
  } | null;
  parties: ContractPartiesData | null;
  financial: ContractFinancialData | null;
  penalties: ContractPenaltiesData | null;
  terminationRules?: { buyerRules?: unknown } | null;
  extraCosts?: { payload?: unknown } | null;
  technicalSpecs?: { specs?: unknown } | null;
  attachments?: { documents?: AttachmentItem[]; notes?: string | null } | null;
};

export const EMPTY_PREVIEW_CONTRACT_PAYLOAD: PreviewContractPayload = {
  subject: null,
  parties: null,
  financial: null,
  penalties: null,
  terminationRules: null,
  extraCosts: null,
  technicalSpecs: null,
  attachments: null,
};

/** پاسخ خام getContractDetails یا GET /api/contracts/:id */
export function mapContractDetailsToPreviewPayload(contract: { data?: Record<string, unknown> } | null | undefined): PreviewContractPayload {
  const d = contract?.data ?? {};
  return {
    subject: (d.subject as PreviewContractPayload['subject']) ?? null,
    parties: (d.parties as PreviewContractPayload['parties']) ?? null,
    financial: (d.financial as PreviewContractPayload['financial']) ?? null,
    penalties: (d.penalties as PreviewContractPayload['penalties']) ?? null,
    terminationRules: (d.terminationRules as PreviewContractPayload['terminationRules']) ?? null,
    extraCosts: (d.extraCosts as PreviewContractPayload['extraCosts']) ?? null,
    technicalSpecs: (d.technicalSpecs as PreviewContractPayload['technicalSpecs']) ?? null,
    attachments: (d.attachments as PreviewContractPayload['attachments']) ?? null,
  };
}

function formatNumberFa(value: number) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(value));
}

function formatRial(value: number) {
  if (!value) return '—';
  return `${formatNumberFa(value)} ریال`;
}

function formatMoneyTomanFromRial(valueRial: number) {
  if (!valueRial) return '—';
  const toman = Math.round(valueRial / 10);
  return `${formatNumberFa(toman)} تومان`;
}

function getUnitUsageLabel(usage: string | null | undefined) {
  switch (usage) {
    case 'residential':
      return 'مسکونی';
    case 'commercial':
      return 'تجاری';
    case 'office':
      return 'اداری';
    case 'parking':
      return 'پارکینگ';
    case 'storage':
      return 'انباری';
    case 'amenity':
      return 'مشاعات';
    default:
      return '';
  }
}

function shareModeFa(mode: ShareMode | undefined): string {
  return mode === 'percent' ? 'درصد' : 'دانگ';
}

function contractorLabel(subject: ContractSubjectData | null): string {
  if (!subject?.contractor) return '—';
  const c = subject.contractor;
  const former = [c.formerFirstName, c.formerLastName].filter(Boolean).join(' ').trim();
  if (former) return former;
  if (c.type === 'self') return 'خود شخص';
  if (c.employeeId) return `کارمند (شناسه: ${c.employeeId.slice(0, 8)}…)`;
  return '—';
}

function contractTypeFa(t: ContractSubjectData['contractType'] | undefined) {
  if (t === 'pre-sale') return 'پیش‌فروش';
  if (t === 'sale') return 'فروش';
  return '—';
}

function PreviewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <span className="shrink-0 text-[12px] font-semibold text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

function TealSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      className="rounded-xl px-4 py-2.5 text-center text-[14px] font-extrabold text-white shadow-sm"
      style={{ background: 'linear-gradient(105deg, var(--dark-teal) 0%, color-mix(in srgb, var(--dark-teal) 82%, #0d9488) 100%)' }}
    >
      {children}
    </div>
  );
}

function PreviewDonut({ slices, totalRial }: { slices: FinancialSlice[]; totalRial: number }) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return (
      <div className="contract-draft-preview-chart-empty flex min-h-[200px] flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-200/90 bg-white/80 px-6 text-center text-sm font-semibold text-slate-500">
        دسته‌های مالی ثبت نشده‌اند.
      </div>
    );
  }

  let offset = 0;
  const gradient = slices
    .map((item) => {
      const start = Math.round((offset / total) * 100);
      offset += item.value;
      const end = Math.round((offset / total) * 100);
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="relative flex aspect-square w-full max-w-[240px] shrink-0 items-center justify-center">
      <div
        className="contract-draft-preview-donut"
        style={{ backgroundImage: `conic-gradient(${gradient})` }}
        aria-hidden
      />
      <div className="contract-draft-preview-donut-hole" dir="rtl">
        <span className="text-[11px] font-semibold text-slate-500">مبلغ کل قرارداد</span>
        <strong className="mt-1 text-center text-[15px] leading-tight text-slate-900 tabular-nums">{formatMoneyTomanFromRial(totalRial)}</strong>
        <span className="mt-1 text-[10px] font-medium text-slate-400">{formatRial(totalRial)}</span>
      </div>
    </div>
  );
}

function PreviewLegend({ slices, total }: { slices: FinancialSlice[]; total: number }) {
  if (!total) return null;
  return (
    <div dir="rtl" className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
      {slices.map((item) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div
            key={item.id}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-2xl border border-slate-100 bg-white/90 px-3 py-2 shadow-sm"
          >
            <span className="h-3 w-3 shrink-0 rounded-sm shadow-inner" style={{ backgroundColor: item.color }} aria-hidden />
            <span className="min-w-0 truncate text-right text-[12px] font-bold text-slate-800">{item.name}</span>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500" dir="ltr">
              {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(pct)}٪
            </span>
            <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-slate-700">{formatRial(item.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DocumentThumb({ item }: { item: AttachmentItem }) {
  const file = item.files?.[0] ?? item.file;
  const mime = file?.mimeType ?? '';
  const isImage = mime.startsWith('image/');
  const isPdf = mime.includes('pdf');

  return (
    <article
      dir="rtl"
      className="relative w-[140px] shrink-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_28%,transparent)]"
    >
      <div className="absolute left-2 top-2 flex gap-1 text-slate-400">
        <button type="button" className="rounded-lg p-1 hover:bg-slate-100" aria-label="گزینه‌ها">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="absolute right-2 top-2 rounded-lg bg-white/90 p-1 text-slate-400 shadow-sm">
        <MoreHorizontal className="h-3.5 w-3.5 rotate-90" aria-hidden />
      </div>
      <div className="mx-auto mt-7 aspect-square w-[88px] overflow-hidden rounded-xl bg-slate-200/90">
        {isImage && file?.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.dataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-500">
            {isPdf ? <FileText className="h-8 w-8" /> : <History className="h-8 w-8 opacity-70" />}
          </div>
        )}
      </div>
      <div className="px-2 pb-3 pt-2 text-center">
        <div className="line-clamp-2 text-[11px] font-extrabold leading-snug text-slate-800">{item.title || 'بدون عنوان'}</div>
        <div className="mt-1 text-[10px] font-semibold text-slate-500">{item.date?.trim() || '—'}</div>
      </div>
    </article>
  );
}

export type ContractDraftPreviewLayout = 'standalone' | 'embedded';

export function ContractDraftPreviewContent({
  payload,
  contractId,
  layout,
  onClose,
}: {
  payload: PreviewContractPayload;
  contractId?: string;
  layout: ContractDraftPreviewLayout;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'details' | 'text'>('details');

  const slices = useMemo(() => buildFinancialSlices(payload.financial), [payload.financial]);
  const totalRial = useMemo(() => computeContractTotalRial(payload.financial), [payload.financial]);
  const legendTotal = useMemo(() => slices.reduce((s, i) => s + i.value, 0), [slices]);

  const unitLabel = useMemo(() => {
    const u = payload.subject?.unitName ?? '—';
    const usage = getUnitUsageLabel(payload.subject?.unitUsage ?? null);
    return usage ? `${u} (${usage})` : u;
  }, [payload.subject]);

  const documentsGrouped = useMemo(() => {
    const docs = payload.attachments?.documents ?? [];
    const map = new Map<string, AttachmentItem[]>();
    for (const d of docs) {
      const cat = (d.category ?? '').trim() || 'سایر اسناد و پیوست‌ها';
      const list = map.get(cat) ?? [];
      list.push(d);
      map.set(cat, list);
    }
    return Array.from(map.entries());
  }, [payload.attachments]);

  const partyTwo = payload.parties?.partyTwo ?? [];

  const innerMaxWidthClass = layout === 'embedded' ? 'w-full max-w-none px-4 sm:px-5' : 'mx-auto w-[min(1120px,calc(100%-28px))]';

  const shell = (
    <div className={`${innerMaxWidthClass} ${layout === 'standalone' ? 'py-6' : 'pb-5 pt-2'}`}>
      {layout === 'standalone' && contractId ? (
        <header className="mb-6 flex flex-row-reverse flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push(`/contracts/${contractId}`)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
          >
            بازگشت
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-right">
            <div className="text-[12px] font-semibold text-slate-500">مشاهده پیش‌نویس قرارداد</div>
            <h1 className="mt-0.5 truncate text-xl font-black text-slate-900 md:text-[22px]">
              {payload.subject?.contractNumber ? <>شماره قرارداد {payload.subject.contractNumber}</> : <>پیش‌نویس بدون شماره</>}
            </h1>
          </div>
        </header>
      ) : null}

      {layout === 'embedded' ? (
        <header className="sticky top-0 z-[1] -mx-4 mb-5 flex flex-row-reverse flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-[var(--surface)]/98 px-4 py-4 backdrop-blur-sm sm:-mx-5 sm:px-5">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="بستن پیش‌نمایش"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <div className="text-[11px] font-semibold text-slate-500">پیش‌نمایش پیش‌نویس</div>
            <h1 className="mt-0.5 truncate text-lg font-black text-slate-900 md:text-xl">
              {payload.subject?.contractNumber ? <>شماره {payload.subject.contractNumber}</> : <>پیش‌نویس</>}
            </h1>
          </div>
        </header>
      ) : null}

      <section className="mb-6 rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)] md:p-7">
        <div className="flex flex-col items-stretch gap-8 lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-10">
          <PreviewDonut slices={slices} totalRial={totalRial} />
          <PreviewLegend slices={slices} total={legendTotal} />
        </div>
      </section>

      <div className="mb-6 flex justify-center gap-3" dir="rtl">
        <button
          type="button"
          onClick={() => setTab('details')}
          className={`min-w-[160px] rounded-full px-8 py-2.5 text-[13px] font-extrabold transition ${tab === 'details' ? 'text-white shadow-md' : 'border-2 bg-white shadow-sm text-[var(--dark-teal)]'}`}
          style={
            tab === 'details'
              ? { background: 'linear-gradient(100deg, var(--dark-teal), color-mix(in srgb, var(--dark-teal) 70%, #0f766e))' }
              : { borderColor: 'color-mix(in srgb, var(--dark-teal) 40%, transparent)' }
          }
        >
          جزئیات قرارداد
        </button>
        <button
          type="button"
          onClick={() => setTab('text')}
          className={`min-w-[160px] rounded-full px-8 py-2.5 text-[13px] font-extrabold transition ${tab === 'text' ? 'text-white shadow-md' : 'border-2 bg-white shadow-sm text-[var(--dark-teal)]'}`}
          style={
            tab === 'text'
              ? { background: 'linear-gradient(100deg, var(--dark-teal), color-mix(in srgb, var(--dark-teal) 70%, #0f766e))' }
              : { borderColor: 'color-mix(in srgb, var(--dark-teal) 40%, transparent)' }
          }
        >
          متن قرارداد
        </button>
      </div>

      {tab === 'text' ? (
        <section
          dir="rtl"
          className="rounded-[28px] border-2 bg-white/95 px-6 py-16 text-center shadow-sm"
          style={{ borderColor: 'color-mix(in srgb, var(--dark-teal) 32%, transparent)' }}
        >
          <FileText className="mx-auto h-11 w-11 text-[var(--dark-teal)] opacity-80" />
          <p className="mt-5 text-[15px] font-bold text-slate-700">متن نهایی قرارداد</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-slate-500">
            در این نما فقط پیش‌نویس فیلدها نمایش داده می‌شود. چاپ یا متن ادبی قرارداد در نسخه بعدی افزوده می‌شود.
          </p>
        </section>
      ) : (
        <section
          className="overflow-hidden rounded-[28px] border-2 bg-white/97 shadow-[0_24px_60px_-30px_rgba(15,118,110,0.35)]"
          style={{ borderColor: 'color-mix(in srgb, var(--dark-teal) 38%, transparent)' }}
        >
          <div className="border-b px-6 py-4 text-center" style={{ borderColor: 'color-mix(in srgb, var(--dark-teal) 22%, transparent)', background: 'color-mix(in srgb, var(--dark-teal) 9%, white)' }}>
            <h2 className="text-[16px] font-black text-[var(--dark-teal)]">جزئیات پیش‌نویس قرارداد</h2>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div className="space-y-3">
              <TealSectionHeader>موضوع قرارداد</TealSectionHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <PreviewField label="نام پیمانکار / امضاکننده" value={contractorLabel(payload.subject)} />
                <PreviewField label="نوع قرارداد" value={contractTypeFa(payload.subject?.contractType)} />
                <PreviewField label="شماره قرارداد" value={payload.subject?.contractNumber ?? '—'} />
                <PreviewField label="تاریخ قرارداد" value={payload.subject?.contractDate ?? '—'} />
                <PreviewField label="تاریخ تحویل واحد" value={payload.subject?.deliveryDate ?? '—'} />
                <PreviewField label="مبلغ قرارداد" value={formatMoneyTomanFromRial(totalRial)} />
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-white px-3 py-2 text-center text-[13px] font-extrabold text-[var(--dark-teal)] ring-1 ring-[color-mix(in_srgb,var(--dark-teal)_25%,transparent)]">
                  انتخاب واحد
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewField label="نام بلوک" value={payload.subject?.blockName ?? '—'} />
                  <PreviewField label="مشخصات واحد" value={unitLabel} />
                  <PreviewField label="طبقه" value={payload.subject?.floorName ?? '—'} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <TealSectionHeader>طرفین قرارداد</TealSectionHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <PreviewField label="نوع قدرالسهم طرف اول" value={shareModeFa(payload.parties?.partyOneMode)} />
                <PreviewField label="نوع قدرالسهم طرف دوم" value={shareModeFa(payload.parties?.partyTwoMode)} />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="mb-3 text-[12px] font-extrabold text-slate-600">طرفین قرارداد — طرف اول</div>
                {(payload.parties?.partyOne ?? []).length ? (
                  <div className="space-y-3">
                    {(payload.parties?.partyOne ?? []).map((p) => (
                      <div key={p.personId} dir="rtl" className="grid gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm sm:grid-cols-2">
                        <PreviewField label="نام" value={p.name} />
                        <PreviewField
                          label="سهم"
                          value={
                            <span dir="ltr" className="inline-block tabular-nums">
                              {p.share?.value != null ? formatNumberFa(Number(p.share.value)) : '—'} {p.share?.mode === 'percent' ? '%' : 'دانگ'}
                            </span>
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pb-2 text-center text-[12px] font-semibold text-slate-400">ثبت نشده</div>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="mb-3 text-[12px] font-extrabold text-slate-600">طرفین قرارداد — طرف دوم (خریداران)</div>
                {partyTwo.length ? (
                  <div className="space-y-3">
                    {partyTwo.map((p) => (
                      <div key={p.personId} dir="rtl" className="grid gap-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm sm:grid-cols-2">
                        <PreviewField label="خریدار" value={p.name} />
                        <PreviewField
                          label="مقدار سهم"
                          value={
                            <span dir="ltr" className="inline-block tabular-nums">
                              {p.share?.value != null ? formatNumberFa(Number(p.share.value)) : '—'} {p.share?.mode === 'percent' ? '%' : 'دانگ'}
                              {p.isPrimary ? <span className="mr-2 text-[11px] text-emerald-600">· اصلی</span> : null}
                            </span>
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm font-semibold text-slate-500">اطلاعات طرف دوم ثبت نشده است.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <TealSectionHeader>اسناد قرارداد</TealSectionHeader>
              {!documentsGrouped.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-[13px] font-semibold text-slate-500">
                  پیوستی برای نمایش ثبت نشده است.
                </div>
              ) : (
                documentsGrouped.map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <div className="text-right text-[12px] font-extrabold text-slate-600">
                      دسته‌بندی: <span className="text-[var(--dark-teal)]">{category}</span>
                    </div>
                    <div
                      dir="rtl"
                      className="flex gap-4 overflow-x-auto pb-3 pt-1 [-webkit-overflow-scrolling:touch]"
                      style={{ scrollbarGutter: 'stable' }}
                    >
                      {items.map((doc) => (
                        <DocumentThumb key={doc.id} item={doc} />
                      ))}
                    </div>
                  </div>
                ))
              )}
              {(payload.attachments?.notes ?? '').trim() ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-right">
                  <div className="text-[11px] font-bold text-slate-500">یادداشت پیوست‌ها</div>
                  <p className="mt-2 text-[13px] font-semibold leading-relaxed text-slate-800">{payload.attachments!.notes!.trim()}</p>
                </div>
              ) : null}
            </div>

            <details className="group rounded-2xl border border-slate-100 bg-slate-50/40 px-4 py-2 open:bg-white open:shadow-sm">
              <summary className="cursor-pointer list-none py-3 text-[13px] font-extrabold text-slate-700 marker:content-none">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                    سایر اطلاعات (مالی جزئی، جرائم، فسخ…)
                  </span>
                  <span className="text-[11px] font-bold text-[var(--dark-teal)] group-open:hidden">باز کن</span>
                  <span className="hidden text-[11px] font-bold text-[var(--dark-teal)] group-open:inline">ببند</span>
                </span>
              </summary>
              <div className="border-t border-slate-100 pb-5 pt-4">
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  <PreviewField label="نوع قیمت‌گذاری" value={payload.financial?.pricingType === 'metered' ? 'متری' : payload.financial ? 'ثابت' : '—'} />
                  <PreviewField label="زیربنا (متر)" value={payload.financial?.unitArea || '—'} />
                  <PreviewField label="پارکینگ (متر)" value={payload.financial?.parkingArea ?? '—'} />
                </div>

                <div className="space-y-3 text-[12px] font-semibold text-slate-600">
                  <div className="font-extrabold text-slate-800">جریمه‌ها</div>
                  <pre className="max-h-[200px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[11px]" dir="ltr">
                    {JSON.stringify(payload.penalties ?? null, null, 2)}
                  </pre>
                  <div className="font-extrabold text-slate-800">فسخ خریدار (خلاصه)</div>
                  <pre className="max-h-[200px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[11px]" dir="ltr">
                    {JSON.stringify(payload.terminationRules?.buyerRules ?? {}, null, 2)}
                  </pre>
                  <div className="font-extrabold text-slate-800">هزینه‌های جانبی و فنی</div>
                  <pre className="max-h-[160px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-[11px]" dir="ltr">
                    {JSON.stringify({ extra: payload.extraCosts?.payload ?? null, tech: payload.technicalSpecs?.specs ?? null }, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </section>
      )}
    </div>
  );

  if (layout === 'standalone') {
    return (
      <main dir="rtl" className="contract-draft-preview-root">
        {shell}
      </main>
    );
  }

  return (
    <div dir="rtl" className="contract-draft-preview-embedded bg-[var(--surface)]">
      {shell}
    </div>
  );
}
