'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PayrollPreviewLineItem, PayrollPreviewSummary } from '../../../../../lib/payroll-preview-calculation';
import { formatFaNumber } from '../../../../../lib/format-fa';
import { WorkReportCalculationDetailDialog } from './WorkReportCalculationDetailDialog';

function formatMoney(amount: number) {
  return `${formatFaNumber(Math.round(amount))} ریال`;
}

function PayrollLineRow({
  item,
  onShowDetails,
}: {
  item: PayrollPreviewLineItem;
  onShowDetails: (item: PayrollPreviewLineItem) => void;
}) {
  return (
    <div className="employee-work-report-payroll-line">
      <div className="employee-work-report-payroll-line-main">
        <span>{item.label}</span>
        <strong>{formatMoney(item.amount)}</strong>
      </div>
      <button type="button" className="employee-work-report-payroll-detail-btn" onClick={() => onShowDetails(item)}>
        جزئیات محاسبه
      </button>
    </div>
  );
}

export function WorkReportPayrollDetailsDialog({
  preview,
  onClose,
}: {
  preview: PayrollPreviewSummary | null;
  onClose: () => void;
}) {
  const [detailItem, setDetailItem] = useState<PayrollPreviewLineItem | null>(null);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !detailItem) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [preview, onClose, detailItem]);

  if (!preview || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="employee-work-report-dialog-backdrop" role="presentation" onClick={onClose}>
        <div
          className="employee-work-report-dialog employee-work-report-payroll-details-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="جزئیات پیش‌نمایش حقوق"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="employee-work-report-dialog-head">
            <div>
              <h3>جزئیات پیش‌نمایش حقوق</h3>
              <p>{preview.modeLabel}</p>
            </div>
            <button type="button" className="employee-work-report-dialog-close" onClick={onClose} aria-label="بستن">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </header>

          <div className="employee-work-report-dialog-body">
            {preview.note ? <p className="employee-work-report-payroll-mode-note">{preview.note}</p> : null}
            {preview.warnings.length > 0 ? (
              <ul className="employee-work-report-payroll-warnings">
                {preview.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}

            <div className="employee-work-report-payroll-totals">
              <div>
                <span>مزد مبنا</span>
                <strong>{formatMoney(preview.wageBaseAmount)}</strong>
              </div>
              <div>
                <span>جمع حقوق دریافتی</span>
                <strong>{formatMoney(preview.totalEarnings)}</strong>
              </div>
              <div>
                <span>جمع کسورات</span>
                <strong>{formatMoney(preview.totalDeductions)}</strong>
              </div>
              <div className="is-net">
                <span>خالص پرداختی</span>
                <strong>{formatMoney(preview.netPayable)}</strong>
              </div>
            </div>

            <div className="employee-work-report-payroll-columns">
              <div className="employee-work-report-payroll-section">
                <h3>دریافتی‌ها</h3>
                {preview.earnings.length > 0 ? (
                  preview.earnings.map((item) => (
                    <PayrollLineRow key={item.id} item={item} onShowDetails={setDetailItem} />
                  ))
                ) : (
                  <p className="calendar-details-muted">موردی برای نمایش وجود ندارد.</p>
                )}
              </div>

              <div className="employee-work-report-payroll-section">
                <h3>کسورات</h3>
                {preview.deductions.length > 0 ? (
                  preview.deductions.map((item) => (
                    <PayrollLineRow key={item.id} item={item} onShowDetails={setDetailItem} />
                  ))
                ) : (
                  <p className="calendar-details-muted">کسورتی ثبت نشده است.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WorkReportCalculationDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </>,
    document.body,
  );
}
