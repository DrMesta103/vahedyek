'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PayrollPreviewLineItem } from '../../../../../lib/payroll-preview-calculation';

export function WorkReportCalculationDetailDialog({
  item,
  onClose,
}: {
  item: PayrollPreviewLineItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [item, onClose]);

  if (!item || typeof document === 'undefined') return null;

  return createPortal(
    <div className="employee-work-report-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="employee-work-report-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`جزئیات محاسبه ${item.label}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="employee-work-report-dialog-head">
          <div>
            <h3>{item.label}</h3>
            <p>{item.details.formula}</p>
          </div>
          <button type="button" className="employee-work-report-dialog-close" onClick={onClose} aria-label="بستن">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="employee-work-report-dialog-body">
          <div className="employee-work-report-dialog-row">
            <span>مبلغ</span>
            <strong>{item.amount.toLocaleString('fa-IR')} ریال</strong>
          </div>
          {item.calculationBase ? (
            <div className="employee-work-report-dialog-row">
              <span>مبنای محاسبه</span>
              <strong>{item.calculationBase}</strong>
            </div>
          ) : null}
          {item.coefficient != null ? (
            <div className="employee-work-report-dialog-row">
              <span>ضریب</span>
              <strong>{item.coefficient.toLocaleString('fa-IR')}</strong>
            </div>
          ) : null}
          {item.minutes != null ? (
            <div className="employee-work-report-dialog-row">
              <span>دقایق</span>
              <strong>{item.minutes.toLocaleString('fa-IR')}</strong>
            </div>
          ) : null}
          {item.details.contractLabel ? (
            <div className="employee-work-report-dialog-row">
              <span>قرارداد</span>
              <strong>{item.details.contractLabel}</strong>
            </div>
          ) : null}
          {item.details.sourceDates.length > 0 ? (
            <div className="employee-work-report-dialog-block">
              <span>روزهای مرتبط</span>
              <p>{item.details.sourceDates.join('، ')}</p>
            </div>
          ) : null}
          {item.details.components.length > 0 ? (
            <div className="employee-work-report-dialog-block">
              <span>اجزای فرمول</span>
              <ul>
                {item.details.components.map((component) => (
                  <li key={`${component.label}-${component.value}`}>
                    <em>{component.label}</em> {component.value}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="employee-work-report-dialog-flags">
            <span>شامل مزد مبنا: {item.includedInWageBase ? 'بله' : 'خیر'}</span>
            <span>شامل بیمه: {item.includedInInsuranceBase ? 'بله' : 'خیر'}</span>
            <span>شامل مالیات: {item.includedInTaxBase ? 'بله' : 'خیر'}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
