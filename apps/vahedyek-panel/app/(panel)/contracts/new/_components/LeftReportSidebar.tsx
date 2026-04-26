'use client';

import type { CSSProperties } from 'react';
import type { ContractFinancialData } from '../../../../types/contract';

function formatCurrency(value: number) {
  return `${Math.round(value || 0).toLocaleString('fa-IR')} تومان`;
}

function buildRingGradient(slices: Array<{ value: number; color: string }>) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) return '';

  const separator = slices.length > 1 ? 2.2 : 0;
  let angle = 0;

  return slices
    .map((item) => {
      const sliceAngle = (item.value / total) * 360;
      const start = angle;
      const end = angle + sliceAngle;
      const visibleEnd = Math.max(start, end - separator);
      angle = end;

      return `${item.color} ${start}deg ${visibleEnd}deg, #f3f4f6 ${visibleEnd}deg ${end}deg`;
    })
    .join(', ');
}

function FinancialLightRing({
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

  const allocatedPercent = contractTotal > 0 ? Math.min(Math.round((allocatedAmount / contractTotal) * 100), 100) : 0;
  const chartKey = slices.map((item) => `${item.id}:${item.value}`).join('|');
  const ringStyle = {
    '--report-ring-gradient': `conic-gradient(${buildRingGradient(slices)})`,
  } as CSSProperties;

  return (
    <div className="contract-flow-report-chart-wrap">
      <div key={chartKey} className="contract-flow-report-chart contract-flow-report-chart-animated" style={ringStyle}>
        <div className="contract-flow-report-chart-ring" aria-hidden="true" />
        <div className="contract-flow-report-chart-center">
          <strong>{new Intl.NumberFormat('fa-IR').format(allocatedPercent)}%</strong>
          <span>تخصیص</span>
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
  void reportData;
  void dueAmount;

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
          </div>

          <div className="contract-flow-report-card">
            <div className="contract-flow-report-card-head">
              <span>پراکندگی مالی</span>
              <strong>{paidSlices.length ? `${new Intl.NumberFormat('fa-IR').format(paidSlices.length)} دسته` : 'بدون داده'}</strong>
            </div>
            <FinancialLightRing slices={paidSlices} contractTotal={contractTotal} allocatedAmount={allocatedAmount} />
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
                <div className="contract-flow-report-empty">بعد از ورود اطلاعات مالی، گزارش اینجا کامل می‌شود.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
