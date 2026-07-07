'use client';

import type { CSSProperties } from 'react';
import { isFinancialLineHeaderCategoryId } from '../../../../lib/financialUtils';
import type { ContractFinancialData, ContractStatus } from '../../../../types/contract';

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

      return `${item.color} ${start}deg ${visibleEnd}deg, transparent ${visibleEnd}deg ${end}deg`;
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
  const ringBackground = `conic-gradient(${buildRingGradient(slices)})`;
  const size = 220;

  const ringStyle = {
    background: ringBackground,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    WebkitMask: `radial-gradient(circle at center, transparent 0px, transparent 58px, rgba(0,0,0,0.1) 103px, rgba(0,0,0,1) 89px, rgba(0,0,0,1) 110px, black 108px, black 89px, transparent 110px)`,
    mask: `radial-gradient(circle at center, transparent 0px, transparent 58px, rgba(0,0,0,0.1) 103px, rgba(0,0,0,1) 89px, rgba(0,0,0,1) 110px, black 108px, black 89px, transparent 110px)`,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  } as CSSProperties;

  return (
    <div className="contract-flow-report-chart-wrap" style={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}>
      <div key={chartKey} className="color-ring" style={ringStyle} />
      <div
        className="contract-flow-report-chart-center"
        style={{
          width: '88px',
          height: '88px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          pointerEvents: 'none',
          background: 'transparent',
          borderRadius: '50%',
        }}
      >
        <strong style={{ fontSize: '16px' }}>{new Intl.NumberFormat('fa-IR').format(allocatedPercent)}%</strong>
        <span>تخصیص</span>
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
  contractNumber?: string | null;
  contractStatus?: ContractStatus | null;
}

export function LeftReportSidebar({
  reportData,
  contractTotal,
  paidSlices,
  allocatedAmount,
  dueAmount,
  remainder,
  contractNumber,
  contractStatus,
}: LeftReportSidebarProps) {
  void dueAmount;
  void contractNumber;
  void contractStatus;

  const isOverContractLimit = remainder < 0;
  const financialLineRows = (reportData?.categories ?? []).filter(
    (item) => isFinancialLineHeaderCategoryId(item.id) && item.capAmount > 0,
  );

  return (
    <aside className="contract-flow-report-sidebar shrink-0">
      <div className="contract-flow-report-panel">
        <div className="contract-flow-report-header">
          <div className="contract-flow-report-title-row">
            <h2>گزارش مالی</h2>
          </div>
        </div>

        <div className="contract-flow-report-body">
          <div className="contract-flow-report-grid contract-flow-report-grid-compact">
            <div className="contract-flow-report-card contract-flow-report-card-summary">
              <div className="contract-flow-report-card-label">جمع کل قرارداد</div>
              <div className="contract-flow-report-card-summary-value">{formatCurrency(contractTotal)}</div>
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
              <strong className={isOverContractLimit ? 'contract-flow-report-card-head-value-negative' : undefined}>{formatCurrency(remainder)}</strong>
            </div>
            <div className="contract-flow-report-legend">
              {paidSlices.slice(0, 5).map((item) => (
                <div key={item.id} className="contract-flow-report-legend-row">
                  <span className="contract-flow-report-legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="contract-flow-report-legend-name">{item.name}</span>
                  <strong>{formatCurrency(item.value)}</strong>
                </div>
              ))}
              {!paidSlices.length ? <div className="contract-flow-report-empty">بعد از ورود اطلاعات مالی، گزارش اینجا کامل می‌شود.</div> : null}
            </div>
          </div>

          <div className="contract-flow-report-card">
            <div className="contract-flow-report-card-head">
              <span>ردیف‌های مالی</span>
              <strong>{financialLineRows.length ? `${new Intl.NumberFormat('fa-IR').format(financialLineRows.length)} مورد` : 'بدون داده'}</strong>
            </div>
            <div className="contract-flow-report-legend">
              {financialLineRows.map((item) => (
                <div key={item.id} className="contract-flow-report-legend-row">
                  <span className="contract-flow-report-legend-name">{item.name}</span>
                  <strong>{formatCurrency(item.capAmount)}</strong>
                </div>
              ))}
              {!financialLineRows.length ? <div className="contract-flow-report-empty">ردیف مالی اضافه‌شده‌ای هنوز ثبت نشده است.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
