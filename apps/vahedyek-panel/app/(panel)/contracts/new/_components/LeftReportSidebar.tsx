'use client';

import type { ContractFinancialData } from '../../../../types/contract';

type StatusTone = 'green' | 'amber' | 'slate' | 'blue';

type StepStatus = {
  label: string;
  detail: string;
  tone: StatusTone;
};

type SectionId = string;

function formatCurrency(value: number) {
  return `${Math.round(value || 0).toLocaleString('fa-IR')} تومان`;
}

function getDonutSegment({
  value,
  total,
  offset,
  circumference,
  gap,
}: {
  value: number;
  total: number;
  offset: number;
  circumference: number;
  gap: number;
}) {
  const rawLength = (value / total) * circumference;
  const visibleLength = Math.max(rawLength - gap, 0);

  return {
    dasharray: `${visibleLength} ${circumference - visibleLength}`,
    dashoffset: -offset,
    nextOffset: offset + rawLength,
  };
}

function getSliceFilterId(id: string) {
  return `report-slice-shadow-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function FinancialDonut({
  slices,
}: {
  slices: Array<{ id: string; name: string; value: number; color: string }>;
}) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return <div className="contract-flow-report-chart-empty">هنوز داده مالی کافی ثبت نشده است</div>;
  }

  const size = 140;
  const center = size / 2;
  const radius = 51;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 8 : 0;
  const chartKey = slices.map((item) => `${item.id}:${item.value}`).join('|');
  let offset = 0;

  return (
    <div className="contract-flow-report-chart-wrap">
      <div key={chartKey} className="contract-flow-report-chart contract-flow-report-chart-animated">
        <svg viewBox={`0 0 ${size} ${size}`} className="contract-flow-report-chart-svg" aria-hidden="true">
          <defs>
            {slices.map((item) => (
              <filter key={item.id} id={getSliceFilterId(item.id)} x="-35%" y="-35%" width="170%" height="170%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor={item.color} floodOpacity="0.32" />
              </filter>
            ))}
          </defs>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#ffffff" strokeWidth={strokeWidth + 8} />
          <g transform={`rotate(-90 ${center} ${center})`}>
            {slices.map((item) => {
              const segment = getDonutSegment({
                value: item.value,
                total,
                offset,
                circumference,
                gap,
              });
              offset = segment.nextOffset;

              return (
                <g key={item.id}>
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={strokeWidth + 5}
                    strokeLinecap="round"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={segment.dashoffset}
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={segment.dashoffset}
                    filter={`url(#${getSliceFilterId(item.id)})`}
                    className="contract-flow-report-chart-segment"
                  />
                </g>
              );
            })}
          </g>
        </svg>
        <div className="contract-flow-report-chart-center">
          <strong>{new Intl.NumberFormat('fa-IR').format(slices.length)}</strong>
          <span>دسته</span>
        </div>
      </div>
    </div>
  );
}

interface LeftReportSidebarProps {
  reportData: ContractFinancialData | null;
  contractTotal: number;
  paidSlices: Array<{ id: string; name: string; value: number; color: string }>;
  allocatedAmount: number;
  dueAmount: number;
  remainder: number;
}

export function LeftReportSidebar({
  reportData,
  contractTotal,
  paidSlices,
  allocatedAmount,
  dueAmount,
  remainder,
}: LeftReportSidebarProps) {
  return (
    <aside className="contract-flow-report-sidebar shrink-0">
      <div className="contract-flow-report-panel">
        <div className="contract-flow-report-header">
          <h2>گزارش زنده مالی</h2>
          <p>خلاصه‌ی لحظه‌ای از مبلغ قرارداد، تخصیص‌ها و سررسیدها</p>
        </div>

        <div className="contract-flow-report-body">
          <div className="contract-flow-report-card">
            <div className="contract-flow-report-card-label">جمع کل قرارداد</div>
            <div className="contract-flow-report-card-value">{formatCurrency(contractTotal)}</div>
          </div>

          <div className="contract-flow-report-grid">
            <div className="contract-flow-report-mini">
              <span>مبالغ دسته‌بندی‌شده</span>
              <strong>{formatCurrency(allocatedAmount)}</strong>
            </div>
            <div className="contract-flow-report-mini">
              <span>جمع سررسیدها</span>
              <strong>{formatCurrency(dueAmount)}</strong>
            </div>
          </div>

          <div className="contract-flow-report-card">
            <div className="contract-flow-report-card-head">
              <span>پراکندگی مالی</span>
              <strong>
                {paidSlices.length
                  ? `${new Intl.NumberFormat('fa-IR').format(paidSlices.length)} دسته`
                  : 'بدون داده'}
              </strong>
            </div>
            <FinancialDonut slices={paidSlices} />
          </div>

          <div className="contract-flow-report-card">
            <div className="contract-flow-report-card-head">
              <span>مانده تا سقف قرارداد</span>
              <strong>{formatCurrency(remainder)}</strong>
            </div>
            <div className="contract-flow-report-legend">
              {paidSlices.slice(0, 5).map((item) => (
                <div key={item.id} className="contract-flow-report-legend-row">
                  <span className="contract-flow-report-legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="contract-flow-report-legend-name">{item.name}</span>
                  <strong>{formatCurrency(item.value)}</strong>
                </div>
              ))}
              {!paidSlices.length ? (
                <div className="contract-flow-report-empty">
                  بعد از ورود اطلاعات مالی، گزارش اینجا کامل می‌شود.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
