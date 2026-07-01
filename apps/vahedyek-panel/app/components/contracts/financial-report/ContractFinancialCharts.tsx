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
  paymentBars?: Array<{
    key: string;
    label: string;
    paidHeight: number;
    plannedHeight: number;
    paidRial: number;
    plannedRial: number;
  }>;
};

function formatMoneyRial(valueRial: number | null | undefined) {
  if (valueRial == null) return '??????';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ????`;
}

function formatCount(value: number) {
  return `${Math.max(0, value).toLocaleString('fa-IR')} ????`;
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
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 text-right shadow-sm md:p-5">
      <div className="border-b border-slate-100 pb-3">
        <div className="text-[14px] font-black text-slate-900">{title}</div>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
      {note ? (
        <div className="mt-4 rounded-[8px] border border-dashed border-slate-200 px-3 py-2.5 text-[11px] font-semibold leading-6 text-slate-500">
          {note}
        </div>
      ) : null}
    </section>
  );
}

function EmptyChartState({ message, tone = 'slate' }: { message: string; tone?: ChartTone }) {
  return (
    <div className={cn('rounded-[8px] border border-dashed px-4 py-8 text-center text-[12px] font-semibold leading-6', lightToneClasses(tone))}>
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
  size = 200,
}: {
  segments: Array<{ key: string; value: number; tone: ChartTone }>;
  centerValue: string;
  centerLabel: string;
  centerHint?: string;
  size?: number;
}) {
  const gradient = buildRingGradient(
    segments.map((segment) => ({
      value: Math.max(0, segment.value),
      color: toneColor(segment.tone),
    })),
  );

  if (!gradient) {
    return (
      <div
        className="mx-auto flex items-center justify-center rounded-full border border-dashed border-slate-200 px-6 text-center text-[12px] font-semibold leading-6 text-slate-500"
        style={{ width: size, height: size }}
      >
        ???? ???? ???? ???? ???? ??? ?????? ??? ???? ???.
      </div>
    );
  }

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-slate-50" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `conic-gradient(${gradient})`,
          WebkitMask: `radial-gradient(circle at center, transparent 0 ${Math.round(size * 0.31)}px, rgba(0,0,0,1) ${Math.round(size * 0.33)}px, rgba(0,0,0,1) ${Math.round(size * 0.49)}px, transparent ${Math.round(size * 0.5)}px)`,
          mask: `radial-gradient(circle at center, transparent 0 ${Math.round(size * 0.31)}px, rgba(0,0,0,1) ${Math.round(size * 0.33)}px, rgba(0,0,0,1) ${Math.round(size * 0.49)}px, transparent ${Math.round(size * 0.5)}px)`,
        }}
      />
      <div
        className="absolute flex flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-center"
        style={{ inset: Math.round(size * 0.19) }}
      >
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
    <div className={cn('rounded-[8px] border px-3 py-3', lightToneClasses(tone))}>
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

function MiniMetric({
  label,
  value,
  note,
  tone = 'slate',
}: {
  label: string;
  value: string;
  note?: string;
  tone?: ChartTone;
}) {
  return (
    <div className={cn('rounded-[8px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]', lightToneClasses(tone))}>
      <div className="text-[10px] font-black opacity-80">{label}</div>
      <div className="mt-1 text-[14px] font-black leading-6">{value}</div>
      {note ? <p className="mt-1 text-[10px] font-semibold leading-5 opacity-75">{note}</p> : null}
    </div>
  );
}

function StatusMetricCard({
  label,
  value,
  note,
  tone = 'slate',
}: {
  label: string;
  value: string;
  note: string;
  tone?: ChartTone;
}) {
  return (
    <div
      className={cn(
        'rounded-[8px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.88))] px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]',
        tone === 'emerald' && 'border-emerald-100',
        tone === 'amber' && 'border-amber-100',
        tone === 'rose' && 'border-rose-100',
        tone === 'cyan' && 'border-sky-100',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500">{label}</div>
          <div className="mt-2 text-[22px] font-black leading-none text-slate-950">{value}</div>
        </div>
        <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: toneColor(tone) }} aria-hidden />
      </div>
      <p className="mt-4 text-[11px] font-semibold leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function PaymentBreakdownCard({ chart }: { chart: PaymentBreakdownChart }) {
  const total = chart.confirmedPaidRial + chart.pendingReviewRial + chart.remainingDebtRial;
  const hasNoApprovedPayment = chart.confirmedPaidRial <= 0 && chart.pendingReviewRial <= 0;
  const settlementStatus = chart.settled ? '????? ???' : chart.remainingDebtRial > 0 ? '????? ?????' : '?? ??? ?????';
  const settlementTone: ChartTone = chart.settled ? 'emerald' : chart.remainingDebtRial > 0 ? 'rose' : 'amber';

  return (
    <ChartCard
      title="?????????? ? ????? ????"
      description="?????? ????????? ???? ?? ?????? ????? ? ????? ???? ???? ??????? ?? ??? ?? ?? ???? ??????."
      note={chart.note}
    >
      {total <= 0 ? (
        <EmptyChartState message="??????? ???? ???? ????? ??? ?????? ?? ??? ???? ???? ?????." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)] xl:items-start">
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <StatusMetricCard
              label="????? ?????"
              value={settlementStatus}
              note={chart.settled ? '??? ??????? ?????? ???? ????? ??? ???.' : '??? ??????? ???????? ?? ??? ????? ???? ???????.'}
              tone={settlementTone}
            />
            <StatusMetricCard
              label="?????????? ????"
              value={formatMoneyRial(chart.confirmedPaidRial)}
              note="??? ??????? ???????? ?? ??? ??? ???? ???????."
              tone="emerald"
            />
            <StatusMetricCard
              label="???? ?????"
              value={formatMoneyRial(chart.pendingReviewRial)}
              note="????? ?????????? ?? ????? ??? ??? ???."
              tone="cyan"
            />
            <StatusMetricCard
              label="?????"
              value={formatMoneyRial(chart.remainingDebtRial)}
              note="??? ??? ?????? ????? ?? ??? ??? ??????."
              tone="rose"
            />
          </div>

          <div className="self-start rounded-[8px] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-rose-400" aria-hidden />
                  Status Overview
                </div>
                <div className="mt-2 text-[18px] font-black text-slate-950">{formatMoneyRial(total)}</div>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">???? ?? ??????? ?? ????? ??????????? ????? ? ?????.</p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <RingSummaryChart
                size={190}
                centerValue={total.toLocaleString('fa-IR')}
                centerLabel="????"
                centerHint="???? ??"
                segments={[
                  { key: 'confirmed', value: chart.confirmedPaidRial, tone: 'emerald' },
                  { key: 'pending', value: chart.pendingReviewRial, tone: 'amber' },
                  { key: 'remaining', value: chart.remainingDebtRial, tone: 'rose' },
                ]}
              />
            </div>

            <div className="mt-4 rounded-[8px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold leading-6 text-slate-600">
              ??? ??????? ???????? ?? ???????? ????? ????? ???? ??????? ? ????? ????? ?? ????? ??? ????? ???? ??? ???.
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function InstallmentStatusCard({ chart }: { chart: InstallmentStatusChart }) {
  const dominantItem = chart.items.reduce(
    (best, item) => (item.count > best.count ? item : best),
    chart.items[0] ?? { key: 'paid', label: '?????', count: 0, tone: 'slate' as ChartTone },
  );
  const visibleSeries = chart.items.filter((item) => item.count > 0);
  const chartSeries = visibleSeries.length > 0 ? visibleSeries : chart.items;
  const installmentMax = Math.max(...chartSeries.map((item) => item.count), 0);

  return (
    <ChartCard
      title="????? ????? ???????"
      description="????? ????? ??????????? ?????? ???? ? ???? ?? ??? ???? ?????? ?????? ??????? ???? ??????."
      note={chart.note}
    >
      {chart.totalCount <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : (
        <div className="space-y-4">
          <div className="project-report-summary-strip">
            <div className="project-report-legend-summary">
              <strong>????? ?????</strong>
              <span>{formatCount(chart.totalCount)}</span>
              <p>???? ?????? ?? ?? ?????? ???? ???? ???????</p>
            </div>
            <div className="project-report-legend-summary">
              <strong>????? ????</strong>
              <span>{dominantItem.label}</span>
              <p>{formatCount(dominantItem.count)}</p>
            </div>
            <div className="project-report-legend-summary">
              <strong>????? ????</strong>
              <span>{visibleSeries.length.toLocaleString('fa-IR')}</span>
              <p>????????? ?? ?? ???? ???? ???? ?????</p>
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.86))] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-500">????? ???? ?????</div>
                <div className="mt-1 text-[20px] font-black text-slate-950">{formatCount(chart.totalCount)}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {chart.items.map((item) => (
                  <span
                    key={item.key}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]',
                      lightToneClasses(item.tone),
                    )}
                  >
                    <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: toneColor(item.tone) }} aria-hidden />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[8px] border border-slate-200/70 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:p-5">
              <div className="h-[240px] rounded-[8px] bg-[linear-gradient(180deg,rgba(248,250,252,0.56),rgba(255,255,255,0.22))] px-3 py-4 sm:px-4">
                <div className="relative h-full">
                  <div className="absolute inset-x-0 top-0 space-y-[34px]">
                    <div className="h-px bg-slate-200/80" />
                    <div className="h-px bg-slate-200/80" />
                    <div className="h-px bg-slate-200/80" />
                  </div>
                  <div className="relative flex h-full items-end justify-center gap-4 sm:gap-6">
                    {chartSeries.map((item) => {
                      const height = installmentMax > 0 ? Math.max(16, Math.round((item.count / installmentMax) * 158)) : 16;
                      const barColor = toneColor(item.tone);
                      const percent = chart.totalCount > 0 ? Math.round((item.count / chart.totalCount) * 100) : 0;

                      return (
                        <div key={item.key} className="flex min-w-[84px] flex-1 flex-col items-center justify-end gap-2 sm:min-w-[104px]">
                          <div className="flex min-h-[34px] items-end justify-center text-center text-[10px] font-black leading-4 text-slate-700">
                            <span>{formatCount(item.count)}</span>
                            <span className="ml-1 text-slate-400">({percent.toLocaleString('fa-IR')}%)</span>
                          </div>
                          <div className="flex h-[158px] items-end">
                            <div
                              className="w-[34px] rounded-[8px] shadow-[0_16px_22px_rgba(37,99,235,0.14)] sm:w-[38px]"
                              style={{
                                height: `${height}px`,
                                backgroundImage: `linear-gradient(180deg, ${barColor} 0%, ${barColor}dd 55%, ${barColor}99 100%)`,
                              }}
                            />
                          </div>
                          <div className="text-center text-[10px] font-bold leading-5 text-slate-500">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {chart.items.map((item) => (
                <MiniMetric key={item.key} label={item.label} value={formatCount(item.count)} tone={item.tone} />
              ))}
            </div>

            <div className="mt-4 rounded-[8px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold leading-6 text-slate-600">
              ??? ?????? ????? ?? ??????? Bar Chart ????? ?????? ?? ????? ????????? ?????? ? ???????? ?? ?? ???? ??????? ???.
            </div>
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
      title="???? ?????? ?? ??? ????"
      description="??? ?? ???? ?????????? ???????? ????? ?????? ? ???? ???? ?????? ???? ??????? ?? ????? ??????."
      note={chart.note}
    >
      {chart.approvedReceiptCount <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : !hasUsableData ? (
        <EmptyChartState message="??????? ???? ???? ????? ??? ?????? ?? ??? ???? ???? ?????." tone="amber" />
      ) : (
        <div className="space-y-4">
          <div className="rounded-[8px] border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500">???????? ????? ?????? ????????</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatCount(chart.points.length)}</div>
              </div>
              {chart.missingTimelineCount > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-900">
                  ???? {chart.missingTimelineCount.toLocaleString('fa-IR')} ???? ????? ????? ???? ???.
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
                          className="w-12 rounded-[8px] bg-[#6ea9df]"
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
      title="????? ????????"
      description="???????? ?? ??? ?? ??? ???? ???? ?????? ? ??? ????? ??????????? ?????????? ? ????? ??? ????? ????????."
      note={chart.note}
    >
      {chart.totalCount <= 0 && chart.appliedRial <= 0 && chart.remainingRial <= 0 ? (
        <EmptyChartState message={chart.emptyMessage} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-[8px] border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500">????? ?????????</div>
                <div className="mt-1 text-[18px] font-black text-slate-950">{formatMoneyRial(chart.appliedRial)}</div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">{formatCount(chart.totalCount)}</div>
            </div>
            <div className="mt-5">
              <RingSummaryChart
                centerValue={`${resolvedPercent.toLocaleString('fa-IR')}%`}
                centerLabel="????? ?????"
                centerHint="?????? ?? ???????"
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
              label="????? ??????????"
              value={formatMoneyRial(chart.calculatedRial)}
              tone="slate"
              suffix={chart.calculatedRial == null ? '?? ???? ???? ????? ???? ???' : undefined}
            />
            <LegendRow label="????? ?????????" value={formatMoneyRial(chart.appliedRial)} tone="amber" />
            <LegendRow label="????? ??????????" value={formatMoneyRial(chart.paidRial)} tone="emerald" />
            <LegendRow
              label="????? ??????????"
              value={formatMoneyRial(chart.forgivenRial)}
              tone="cyan"
              suffix={chart.forgivenRial == null ? '?? ???? ???? ????? ????' : undefined}
            />
            <div className="sm:col-span-2 xl:col-span-4">
              <LegendRow label="????? ??????????" value={formatMoneyRial(chart.remainingRial)} tone="rose" />
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



