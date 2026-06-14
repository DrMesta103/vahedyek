'use client';

import { useMemo, useState } from 'react';
import { Calculator, Download, Eye, Info, ListTree } from 'lucide-react';
import type { PayrollPreviewSummary } from '../../../../../lib/payroll-preview-calculation';
import { formatFaNumber } from '../../../../../lib/format-fa';
import {
  downloadPdfResult,
  generatePayrollPreviewPdf,
  generateWorkReportPdf,
  type WorkReportPdfResult,
} from './work-report-pdf-export';
import { WorkReportPdfPreviewDialog } from './WorkReportPdfPreviewDialog';
import { WorkReportPayrollDetailsDialog } from './WorkReportPayrollDetailsDialog';
import type { EmployeeWorkReportData } from '../../../../../lib/employee-work-report';

function formatMoney(amount: number) {
  return `${formatFaNumber(Math.round(amount))} ریال`;
}

export function WorkReportPayrollPreviewPanel({ report }: { report: EmployeeWorkReportData }) {
  const [mode, setMode] = useState<'without' | 'with'>('without');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<WorkReportPdfResult | null>(null);
  const [pdfBusy, setPdfBusy] = useState<'work-report' | 'payroll' | null>(null);

  const preview: PayrollPreviewSummary = useMemo(
    () => (mode === 'with' ? report.payrollPreviewWithInsuranceTax : report.payrollPreviewWithoutInsuranceTax),
    [mode, report.payrollPreviewWithInsuranceTax, report.payrollPreviewWithoutInsuranceTax],
  );

  const runPdfAction = async (
    kind: 'work-report' | 'payroll',
    action: 'preview' | 'download',
  ) => {
    setPdfBusy(kind);
    try {
      const result =
        kind === 'work-report'
          ? await generateWorkReportPdf(report)
          : await generatePayrollPreviewPdf(report, mode === 'with');

      if (action === 'preview') {
        setPdfPreview(result);
      } else {
        downloadPdfResult(result);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا در تولید PDF.';
      window.alert(message);
    } finally {
      setPdfBusy(null);
    }
  };

  return (
    <>
      <section className="employee-work-report-payroll-card employee-work-report-payroll-card-top employee-work-report-payroll-card-compact">
        <header className="employee-work-report-payroll-head">
          <div className="employee-work-report-payroll-head-copy">
            <div className="employee-work-report-payroll-title-row">
              <h2>پیش‌نمایش حقوق غیرنهایی</h2>
              <Calculator className="h-4 w-4 opacity-70" aria-hidden />
            </div>
            <p className="employee-work-report-payroll-note">
              <Info className="h-3.5 w-3.5" aria-hidden />
              این محاسبه صرفاً بر اساس کارکرد، قرارداد و درخواست‌های ثبت‌شده تا این لحظه است و فیش حقوقی نهایی محسوب نمی‌شود.
            </p>
          </div>
        </header>

        <div className="employee-work-report-payroll-compact-toolbar">
          <div className="employee-work-report-payroll-mode-tabs is-chip" role="tablist" aria-label="حالت محاسبه">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'without'}
              className={['employee-work-report-payroll-mode-tab', mode === 'without' ? 'is-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('without')}
            >
              بدون بیمه و مالیات
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'with'}
              className={['employee-work-report-payroll-mode-tab', mode === 'with' ? 'is-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setMode('with')}
            >
              با بیمه و مالیات
            </button>
          </div>

          <button type="button" className="employee-work-report-payroll-more-btn" onClick={() => setDetailsOpen(true)}>
            <ListTree className="h-4 w-4" aria-hidden />
            جزئیات بیشتر
          </button>
        </div>

        <div className="employee-work-report-payroll-totals is-compact">
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

        <div className="employee-work-report-payroll-pdf-groups">
          <div className="employee-work-report-payroll-pdf-group">
            <span>گزارش کارکرد</span>
            <div className="employee-work-report-export-actions is-inline">
              <button
                type="button"
                className="employee-work-report-export-btn"
                disabled={pdfBusy !== null}
                onClick={() => void runPdfAction('work-report', 'preview')}
              >
                <Eye className="h-4 w-4" aria-hidden />
                {pdfBusy === 'work-report' ? 'در حال تولید...' : 'پیش‌نمایش PDF'}
              </button>
              <button
                type="button"
                className="employee-work-report-export-btn"
                disabled={pdfBusy !== null}
                onClick={() => void runPdfAction('work-report', 'download')}
              >
                <Download className="h-4 w-4" aria-hidden />
                دانلود PDF
              </button>
            </div>
          </div>

          <div className="employee-work-report-payroll-pdf-group">
            <span>پیش‌نمایش حقوق ({preview.modeLabel})</span>
            <div className="employee-work-report-export-actions is-inline">
              <button
                type="button"
                className="employee-work-report-export-btn"
                disabled={pdfBusy !== null}
                onClick={() => void runPdfAction('payroll', 'preview')}
              >
                <Eye className="h-4 w-4" aria-hidden />
                {pdfBusy === 'payroll' ? 'در حال تولید...' : 'پیش‌نمایش PDF'}
              </button>
              <button
                type="button"
                className="employee-work-report-export-btn"
                disabled={pdfBusy !== null}
                onClick={() => void runPdfAction('payroll', 'download')}
              >
                <Download className="h-4 w-4" aria-hidden />
                دانلود PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <WorkReportPayrollDetailsDialog preview={detailsOpen ? preview : null} onClose={() => setDetailsOpen(false)} />
      <WorkReportPdfPreviewDialog result={pdfPreview} onClose={() => setPdfPreview(null)} />
    </>
  );
}
