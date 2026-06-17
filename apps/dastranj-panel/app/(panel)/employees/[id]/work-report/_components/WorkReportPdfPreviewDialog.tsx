'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';
import { downloadPdfResult, type WorkReportPdfResult } from './work-report-pdf-export';

export function WorkReportPdfPreviewDialog({
  result,
  onClose,
}: {
  result: WorkReportPdfResult | null;
  onClose: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!result) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  useEffect(() => {
    if (!result) return;
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
  }, [result, onClose]);

  if (!result || typeof document === 'undefined') return null;

  return createPortal(
    <div className="employee-work-report-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="employee-work-report-dialog employee-work-report-pdf-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={result.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="employee-work-report-dialog-head">
          <div>
            <h3>{result.title}</h3>
            <p>پیش‌نمایش فایل PDF</p>
          </div>
          <div className="employee-work-report-pdf-dialog-actions">
            <button
              type="button"
              className="employee-work-report-export-btn is-compact"
              onClick={() => downloadPdfResult(result)}
            >
              <Download className="h-4 w-4" aria-hidden />
              دانلود PDF
            </button>
            <button type="button" className="employee-work-report-dialog-close" onClick={onClose} aria-label="بستن">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </header>

        <div className="employee-work-report-pdf-preview-frame">
          {previewUrl ? (
            <iframe title={result.title} src={previewUrl} className="employee-work-report-pdf-preview-iframe" />
          ) : (
            <p className="calendar-details-muted">در حال آماده‌سازی PDF...</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
