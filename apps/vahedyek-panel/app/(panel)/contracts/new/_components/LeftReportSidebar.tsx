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

function FinancialDonut({
  slices,
}: {
  slices: Array<{ id: string; name: string; value: number; color: string }>;
}) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return <div className="contract-flow-report-chart-empty">هنوز داده مالی کافی ثبت نشده است</div>;
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
    <div className="contract-flow-report-chart-wrap">
      <div className="contract-flow-report-chart" style={{ backgroundImage: `conic-gradient(${gradient})` }}>
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
