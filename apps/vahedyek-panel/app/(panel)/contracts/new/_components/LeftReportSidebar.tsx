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

function FinancialDonut({
  slices,
  contractTotal,
  allocatedAmount,
}: {
  slices: Array<{ id: string; name: string; value: number; color: string }>;
  contractTotal: number;
  allocatedAmount: number;
}) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return <div className="contract-flow-report-chart-empty">هنوز داده مالی کافی ثبت نشده است</div>;
  }

  const size = 220;
  const center = size / 2;
  const radius = 87;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 7 : 0;
  const innerRadius = 23;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const paidPercent = contractTotal > 0 ? Math.min(Math.round((allocatedAmount / contractTotal) * 100), 100) : 0;
  const chartKey = slices.map((item) => `${item.id}:${item.value}`).join('|');
  let offset = 0;
  let separatorOffset = 0;

  return (
    <div className="contract-flow-report-chart-wrap">
      <div key={chartKey} className="contract-flow-report-chart contract-flow-report-chart-animated">
        <svg viewBox={`0 0 ${size} ${size}`} className="contract-flow-report-chart-svg" aria-hidden="true">
          <defs>
            <radialGradient id="report-orbit-depth" cx="50%" cy="50%" r="72%">
              <stop offset="0%" stopColor="#050712" />
              <stop offset="32%" stopColor="#0b0f1c" />
              <stop offset="68%" stopColor="#111427" />
              <stop offset="100%" stopColor="#060711" />
            </radialGradient>
            <radialGradient id="report-orbit-warm-core" cx="50%" cy="50%" r="58%">
              <stop offset="0%" stopColor="#ffb74a" stopOpacity="1" />
              <stop offset="48%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.4" />
            </radialGradient>
            {slices.map((item) => (
              <radialGradient key={`orbit-gradient-${item.id}`} id={`orbit-gradient-${item.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`} cx="50%" cy="50%" r="72%">
                <stop offset="42%" stopColor={item.color} stopOpacity="0.22" />
                <stop offset="72%" stopColor={item.color} stopOpacity="0.86" />
                <stop offset="100%" stopColor={item.color} />
              </radialGradient>
            ))}
            {slices.map((item) => (
              <filter key={`orbit-shadow-${item.id}`} id={`orbit-shadow-${item.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`} x="-80%" y="-80%" width="260%" height="260%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.4" floodColor={item.color} floodOpacity="0.72" />
              </filter>
            ))}
          </defs>

          <circle cx={center} cy={center} r="105" fill="url(#report-orbit-depth)" />
          <circle cx={center} cy={center} r="100" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
          <circle cx={center} cy={center} r="51" fill="none" stroke="url(#report-orbit-warm-core)" strokeWidth="19" className="contract-flow-report-warm-ring" />
          <circle cx={center} cy={center} r="35" fill="#050712" />

          <g className="contract-flow-report-separators" transform={`rotate(-90 ${center} ${center})`}>
            {slices.map((item) => {
              const angle = (separatorOffset / total) * Math.PI * 2;
              separatorOffset += item.value;
              const x1 = center + Math.cos(angle) * 63;
              const y1 = center + Math.sin(angle) * 63;
              const x2 = center + Math.cos(angle) * 99;
              const y2 = center + Math.sin(angle) * 99;

              return <line key={`sep-${item.id}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>

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
                    stroke={`url(#orbit-gradient-${item.id.replace(/[^a-zA-Z0-9_-]/g, '-')})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={segment.dashoffset}
                    filter={`url(#orbit-shadow-${item.id.replace(/[^a-zA-Z0-9_-]/g, '-')})`}
                    className="contract-flow-report-chart-segment"
                  />
                </g>
              );
            })}
          </g>

          <g transform={`rotate(-90 ${center} ${center})`}>
            <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4" />
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(paidPercent / 100) * innerCircumference} ${innerCircumference}`}
              strokeDashoffset="0"
              className="contract-flow-report-inner-progress"
            />
          </g>
        </svg>
        <div className="contract-flow-report-chart-center">
          <strong>{new Intl.NumberFormat('fa-IR').format(paidPercent)}%</strong>
          <span>سهم</span>
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
            <FinancialDonut slices={paidSlices} contractTotal={contractTotal} allocatedAmount={allocatedAmount} />
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
