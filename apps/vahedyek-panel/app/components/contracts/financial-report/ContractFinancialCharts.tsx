'use client';

import type { ReactNode } from 'react';
import type { ChartTone, InstallmentChartDatum, PaymentTrendPoint } from '../../../lib/contractFinancialChartUtils';

type PaymentBreakdownChart = {
  confirmedPaidRial: number;
  pendingReviewRial: number;
  remainingDebtRial: number;
  settled: boolean;
  note?: string | null;
};

type InstallmentStatusChart = {
  items: InstallmentChartDatum[];
  totalCount: number;
  emptyMessage: string;
  note?: string | null;
};

type PaymentTrendChart = {
  points: PaymentTrendPoint[];
  approvedReceiptCount: number;
  missingTimelineCount: number;
  emptyMessage: string;
  note?: string | null;
};

type PenaltyChart = {
  calculatedRial: number | null;
  appliedRial: number;
  paidRial: number;
  forgivenRial: number | null;
  remainingRial: number;
  totalCount: number;
  emptyMessage: string;
  note?: string | null;
};

export type ContractFinancialChartsProps = {
  payment: PaymentBreakdownChart;
  installments: InstallmentStatusChart;
  trend: PaymentTrendChart;
  penalties: PenaltyChart;
  className?: string;
};

function formatMoneyRial(valueRial: number | null | undefined) {
  if (valueRial == null) return 'نامشخص';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

function formatCount(value: number) {
  return `${Math.max(0, value).toLocaleString('fa-IR')} مورد`;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function toneColor(tone: ChartTone) {
  if (tone === 'emerald') return '#2846a0';
  if (tone === 'amber') return '#f4c542';
  if (tone === 'rose') return '#f97316';
  if (tone === 'cyan') return '#6ea9df';
  return '#8b5cf6';
}

function lightToneClasses(tone: ChartTone) {
  if (tone === 'emerald') return 'border-slate-200 bg-white text-slate-900';
  if (tone === 'amber') return 'border-slate-200 bg-white text-slate-900';
  if (tone === 'rose') return 'border-slate-200 bg-white text-slate-900';
  if (tone === 'cyan') return 'border-slate-200 bg-white text-slate-900';
  return 'border-slate-200 bg-white text-slate-900';
}

function ChartCard({
  title,
  description,
  children,
  note,
}: {
  title: string;
  description: string;
  children: ReactNode;
  note?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm md:p-5">
      <div className="border-b border-slate-100 pb-3">
        <div className="text-[14px] font-black text-slate-900">{title}</div>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
      {note ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-[11px] font-semibold leading-6 text-slate-500">
          {note}
        </div>
      ) : null}
    </section>
  );
}

function EmptyChartState({ message, tone = 'slate' }: { message: string; tone?: ChartTone }) {
  return (
    <div className={cn('rounded-2xl border border-dashed px-4 py-8 text-center text-[12px] font-semibold leading-6', lightToneClasses(tone))}>
      {message}
    </div>
  );
}

function buildRingGradient(segments: Array<{ value: number; color: string }>) {
  const nonZeroSegments = segments.filter((segment) => segment.value > 0);
  const total = nonZeroSegments.reduce((sum, segment) => sum + segment.value, 0);
  if (!total) return '';

  const separator = nonZeroSegments.length > 1 ? 2.8 : 0;
  let angle = -90;

  return nonZeroSegments
    .map((segment) => {
      const sliceAngle = (segment.value / total) * 360;
      const start = angle;
      const end = angle + sliceAngle;
      const visibleEnd = Math.max(start, end - separator);
      angle = end;
      return `${segment.color} ${start}deg ${visibleEnd}deg, rgba(255,255,255,0) ${visibleEnd}deg ${end}deg`;
    })
    .join(', ');
}

function RingSummaryChart({
  segments,
  centerValue,
  centerLabel,
  centerHint,
}: {
  segments: Array<{ key: string; value: number; tone: ChartTone }>;
  centerValue: string;
  centerLabel: string;
  centerHint?: string;
}) {
  const gradient = buildRingGradient(
    segments.map((segment) => ({
      value: Math.max(0, segment.value),
      color: toneColor(segment.tone),
    })),
  );

  if (!gradient) {
    return (
      <div className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-full border border-dashed border-slate-200 px-6 text-center text-[12px] font-semibold leading-6 text-slate-500">
        هنوز داده مالی کافی برای این نمودار ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[200px] w-[200px]">
      <div className="absolute inset-0 rounded-full bg-slate-50" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `conic-gradient(${gradient})`,
          WebkitMask:
            'radial-gradient(circle at center, transparent 0 62px, rgba(0,0,0,1) 64px, rgba(0,0,0,1) 98px, transparent 100px)',
          mask:
            'radial-gradient(circle at center, transparent 0 62px, rgba(0,0,0,1) 64px, rgba(0,0,0,1) 98px, transparent 100px)',
        }}
      />
      <div className="absolute inset-[38px] flex flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-center">
        <strong className="text-[28px] font-black leading-none text-slate-950">{centerValue}</strong>
        <span className="mt-2 text-[12px] font-bold text-slate-500">{centerLabel}</span>
        {centerHint ? <span className="mt-1 text-[10px] font-semibold text-slate-400">{centerHint}</span> : null}
      </div>
    </div>
  );
}

function LegendRow({
  label,
  value,
  tone,
  suffix,
}: {
  label: string;
  value: string;
  tone: ChartTone;
  suffix?: string;
}) {
  return (
    <div className={cn('rounded-xl border px-3 py-3', lightToneClasses(tone))}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: toneColor(tone) }} aria-hidden />
          <span className="text-[11px] font-black">{label}</span>
        </div>
        <div className="text-left">
          <div className="text-[13px] font-black tabular-nums">{value}</div>
          {suffix ? <div className="mt-0.5 text-[10px] font-semibold opacity-75">{suffix}</div> : null}
        </div>
      </div>
    </div>
  );
}

function PaymentBreakdownCard({ chart }: { chart: PaymentBreakdownChart }) {
  const total = chart.confirmedPaidRial + chart.pendingReviewRial + chart.remainingDebtRial;
  const hasNoApprovedPayment = chart.confirmedPaidRial <= 0 && chart.pendingReviewRial <= 0;
  const confirmedPercent = total > 0 ? Math.round((chart.confirmedPaidRial / total) * 100) : 0;

  return (
    <ChartCard
      title="پرداخت‌شده و مانده بدهی"
      description="پرداخت تأییدشده، مبلغ در انتظار بررسی و مانده بدهی همین قرارداد را جدا از هم نشان می‌دهد."
      note={chart.note}
    >
      {total <= 0 ? (
        <EmptyChartState message="اطلاعات کافی برای نمایش این نمودار در حال حاضر وجود ندارد." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500">جمع قابل نمایش</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatMoneyRial(total)}</div>
              </div>
              {chart.settled ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-900">
                  این قرارداد از نظر مالی تسویه شده است.
                </span>
              ) : hasNoApprovedPayment ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-700">
                  هنوز پرداخت تأییدشده‌ای برای این قرارداد ثبت نشده است.
                </span>
              ) : null}
            </div>
            <div className="mt-5">
              <RingSummaryChart
                centerValue={`${confirmedPercent.toLocaleString('fa-IR')}٪`}
                centerLabel="پرداخت قطعی"
                centerHint="سهم پرداخت تأییدشده"
                segments={[
                  { key: 'confirmed', value: chart.confirmedPaidRial, tone: 'emerald' },
                  { key: 'pending', value: chart.pendingReviewRial, tone: 'amber' },
                  { key: 'remaining', value: chart.remainingDebtRial, tone: 'rose' },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <LegendRow label="پرداخت تأییدشده" value={formatMoneyRial(chart.confirmedPaidRial)} tone="emerald" />
            <LegendRow
              label="در انتظار بررسی"
              value={formatMoneyRial(chart.pendingReviewRial)}
              tone="amber"
              suffix="در تسویه قطعی لحاظ نشده است"
            />
            <LegendRow label="مانده بدهی" value={formatMoneyRial(chart.remainingDebtRial)} tone="rose" />
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function InstallmentStatusCard({ chart }: { chart: InstallmentStatusChart }) {
  const dominantItem = chart.items.reduce(
    (best, item) => (item.count > best.count ? item : best),
    chart.items[0] ?? { key: 'paid', label: 'اقساط', count: 0, tone: 'slate' as ChartTone },
  );

  return (
    <ChartCard
      title="وضعیت اقساط قرارداد"
      description="تعداد اقساط پرداخت‌شده، آینده، معوق و ناقص را روی همان برنامه پرداخت قرارداد نشان می‌دهد."
      note={chart.note}
    >
      {chart.totalCount <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500">تعداد اقساط قابل نمایش</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatCount(chart.totalCount)}</div>
              </div>
            </div>
            <div className="mt-5">
              <RingSummaryChart
                centerValue={chart.totalCount.toLocaleString('fa-IR')}
                centerLabel="قسط"
                centerHint={dominantItem.count > 0 ? `بیشترین سهم: ${dominantItem.label}` : undefined}
                segments={chart.items.map((item) => ({
                  key: item.key,
                  value: item.count,
                  tone: item.tone,
                }))}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {chart.items.map((item) => (
              <LegendRow key={item.key} label={item.label} value={formatCount(item.count)} tone={item.tone} />
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function PaymentTrendCard({ chart }: { chart: PaymentTrendChart }) {
  const maxAmount = chart.points.reduce((max, point) => Math.max(max, point.amountRial), 0);
  const hasUsableData = chart.points.length > 0 && maxAmount > 0;

  return (
    <ChartCard
      title="روند پرداخت در طول زمان"
      description="فقط بر اساس پرداخت‌های تأییدشده ساخته می‌شود و روند وصول ماهانه همین قرارداد را نمایش می‌دهد."
      note={chart.note}
    >
      {chart.approvedReceiptCount <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : !hasUsableData ? (
        <EmptyChartState message="اطلاعات کافی برای نمایش این نمودار در حال حاضر وجود ندارد." tone="amber" />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500">بازه‌های زمانی پرداخت تأییدشده</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatCount(chart.points.length)}</div>
              </div>
              {chart.missingTimelineCount > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-900">
                  برای {chart.missingTimelineCount.toLocaleString('fa-IR')} رسید تاریخ معتبر پیدا نشد.
                </span>
              ) : null}
            </div>
            <div className="mt-5 overflow-x-auto">
              <div
                className="flex min-h-[220px] items-end gap-3"
                style={{ minWidth: `${Math.max(chart.points.length * 84, 320)}px` }}
              >
                {chart.points.map((point) => {
                  const height = maxAmount > 0 ? Math.max(Math.round((point.amountRial / maxAmount) * 150), 18) : 18;
                  return (
                    <div key={point.key} className="flex min-w-[68px] flex-1 flex-col items-center justify-end gap-3">
                      <div className="text-center text-[10px] font-black leading-5 text-slate-700">
                        {formatMoneyRial(point.amountRial)}
                      </div>
                      <div className="flex h-[160px] items-end">
                        <div
                          className="w-12 rounded-t-2xl bg-[#6ea9df]"
                          style={{ height: `${height}px` }}
                        />
                      </div>
                      <div className="text-center text-[10px] font-bold leading-5 text-slate-500">{point.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function PenaltyCard({ chart }: { chart: PenaltyChart }) {
  const settlementBase = Math.max(chart.appliedRial, chart.paidRial + chart.remainingRial + (chart.forgivenRial ?? 0));
  const resolvedPenaltyRial = chart.paidRial + (chart.forgivenRial ?? 0);
  const resolvedPercent = settlementBase > 0 ? Math.round((resolvedPenaltyRial / settlementBase) * 100) : 0;

  return (
    <ChartCard
      title="وضعیت جریمه‌ها"
      description="جریمه‌ها را جدا از اصل بدهی نشان می‌دهد و بین جریمه پرداخت‌شده، بخشوده‌شده و مانده باز تفکیک می‌گذارد."
      note={chart.note}
    >
      {chart.totalCount <= 0 && chart.appliedRial <= 0 && chart.remainingRial <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500">جریمه اعمال‌شده</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatMoneyRial(chart.appliedRial)}</div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">{formatCount(chart.totalCount)}</div>
            </div>
            <div className="mt-5">
              <RingSummaryChart
                centerValue={`${resolvedPercent.toLocaleString('fa-IR')}٪`}
                centerLabel="وضعیت جریمه"
                centerHint="پرداخت یا بخشودگی"
                segments={[
                  { key: 'paid', value: chart.paidRial, tone: 'emerald' },
                  { key: 'forgiven', value: chart.forgivenRial ?? 0, tone: 'cyan' },
                  { key: 'remaining', value: chart.remainingRial, tone: 'rose' },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <LegendRow
              label="جریمه محاسبه‌شده"
              value={formatMoneyRial(chart.calculatedRial)}
              tone="slate"
              suffix={chart.calculatedRial == null ? 'در داده فعلی تفکیک نشده است' : undefined}
            />
            <LegendRow label="جریمه اعمال‌شده" value={formatMoneyRial(chart.appliedRial)} tone="amber" />
            <LegendRow label="جریمه پرداخت‌شده" value={formatMoneyRial(chart.paidRial)} tone="emerald" />
            <LegendRow
              label="جریمه بخشوده‌شده"
              value={formatMoneyRial(chart.forgivenRial)}
              tone="cyan"
              suffix={chart.forgivenRial == null ? 'در داده فعلی موجود نیست' : undefined}
            />
            <div className="sm:col-span-2 xl:col-span-4">
              <LegendRow label="جریمه باقی‌مانده" value={formatMoneyRial(chart.remainingRial)} tone="rose" />
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

export default function ContractFinancialCharts({
  payment,
  installments,
  trend,
  penalties,
  className,
}: ContractFinancialChartsProps) {
  return (
    <div className={cn('grid gap-5 xl:grid-cols-2', className)}>
      <PaymentBreakdownCard chart={payment} />
      <InstallmentStatusCard chart={installments} />
      <PaymentTrendCard chart={trend} />
      <PenaltyCard chart={penalties} />
    </div>
  );
}
