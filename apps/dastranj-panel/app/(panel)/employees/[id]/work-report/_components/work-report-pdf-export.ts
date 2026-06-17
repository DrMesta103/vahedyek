import type { EmployeeWorkReportData } from '../../../../../lib/employee-work-report';
import { formatFaNumber } from '../../../../../lib/format-fa';
import { PERSIAN_MONTH_NAMES } from '../../../../../lib/calendar-dates';

export type WorkReportPdfResult = {
  blob: Blob;
  filename: string;
  title: string;
};

function formatMinutes(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours <= 0) return `${formatFaNumber(rest, { useGrouping: false })} دقیقه`;
  if (rest <= 0) return `${formatFaNumber(hours, { useGrouping: false })} ساعت`;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت و ${formatFaNumber(rest, { useGrouping: false })} دقیقه`;
}

function formatMoney(amount: number) {
  return `${formatFaNumber(Math.round(amount))} ریال`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPrintHtml(title: string, body: string, watermark: string) {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: Tahoma, Arial, sans-serif; color: #111827; margin: 24px; line-height: 1.6; background: #ffffff; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    h2 { font-size: 16px; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .meta { color: #4b5563; font-size: 13px; margin-bottom: 16px; }
    .watermark { color: #b45309; background: #fffbeb; border: 1px solid #fcd34d; padding: 8px 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: right; }
    th { background: #f3f4f6; }
    .totals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .totals div { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; }
    .totals span { display: block; color: #6b7280; font-size: 12px; }
    .totals strong { font-size: 14px; }
    ul { margin: 0; padding-right: 18px; }
  </style>
</head>
<body>
  <div class="watermark">${escapeHtml(watermark)}</div>
  ${body}
</body>
</html>`;
}

async function renderHtmlToPdfBlob(html: string, filename: string, title: string): Promise<WorkReportPdfResult> {
  if (typeof document === 'undefined') {
    throw new Error('تولید PDF فقط در مرورگر امکان‌پذیر است.');
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const frameWindow = iframe.contentWindow;
  if (!doc || !frameWindow) {
    document.body.removeChild(iframe);
    throw new Error('امکان آماده‌سازی PDF وجود ندارد.');
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, 400);
    iframe.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    iframe.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('خطا در بارگذاری محتوای PDF.'));
    };
  });

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('../../../../../lib/simple-pdf');

  const canvas = await html2canvas(doc.body, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: doc.body.scrollWidth,
    windowHeight: doc.body.scrollHeight,
  });

  document.body.removeChild(iframe);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return {
    blob: pdf.output('blob'),
    filename,
    title,
  };
}

export function downloadPdfResult(result: WorkReportPdfResult) {
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function buildWorkReportHtml(report: EmployeeWorkReportData) {
  const monthName = PERSIAN_MONTH_NAMES[report.period.month - 1] ?? '';
  const rows = report.days
    .map(
      (day) => `<tr>
        <td>${escapeHtml(day.jalaliDate)}</td>
        <td>${escapeHtml(day.weekday)}</td>
        <td>${escapeHtml(day.status)}</td>
        <td>${escapeHtml(formatMinutes(day.workedMinutes))}</td>
        <td>${escapeHtml(formatMinutes(day.requiredMinutes))}</td>
        <td>${escapeHtml(formatMinutes(day.overtimeMinutes))}</td>
        <td>${escapeHtml(formatMinutes(day.leaveMinutes))}</td>
        <td>${escapeHtml(day.contractLabel ?? '—')}</td>
      </tr>`,
    )
    .join('');

  const warnings = report.warnings.length
    ? `<h2>هشدارها</h2><ul>${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
    : '';

  const body = `
    <h1>گزارش کارکرد ${escapeHtml(report.exportMetadata.employeeName)}</h1>
    <div class="meta">
      <div>دوره: ${escapeHtml(monthName)} ${formatFaNumber(report.period.year, { useGrouping: false })}</div>
      <div>قرارداد: ${escapeHtml(report.exportMetadata.contractLabel ?? 'ثبت نشده')}</div>
      <div>سیاست: ${escapeHtml(report.exportMetadata.policyLabel ?? 'ثبت نشده')}</div>
      <div>تقویم: ${escapeHtml(report.exportMetadata.calendarLabel ?? 'ثبت نشده')}</div>
      <div>تاریخ تولید: ${escapeHtml(new Date(report.exportMetadata.generatedAt).toLocaleString('fa-IR'))}</div>
    </div>
    <h2>خلاصه ماهانه</h2>
    <div class="totals">
      <div><span>موظفی کل</span><strong>${escapeHtml(formatMinutes(report.summary.requiredMinutes))}</strong></div>
      <div><span>کارکرد واقعی</span><strong>${escapeHtml(formatMinutes(report.summary.workedMinutes))}</strong></div>
      <div><span>حضور</span><strong>${escapeHtml(formatMinutes(report.summary.presenceMinutes))}</strong></div>
      <div><span>غیبت</span><strong>${escapeHtml(formatMinutes(report.summary.absenceMinutes))}</strong></div>
      <div><span>اضافه‌کاری</span><strong>${escapeHtml(formatMinutes(report.summary.overtimeMinutes))}</strong></div>
      <div><span>شب‌کاری</span><strong>${escapeHtml(formatMinutes(report.summary.nightWorkMinutes))}</strong></div>
      <div><span>مرخصی</span><strong>${escapeHtml(formatMinutes(report.summary.leaveMinutes))}</strong></div>
      <div><span>تردد ناقص</span><strong>${formatFaNumber(report.summary.incompleteAttendanceCount, { useGrouping: false })} روز</strong></div>
    </div>
    ${warnings}
    <h2>گزارش روزانه</h2>
    <table>
      <thead>
        <tr>
          <th>تاریخ</th><th>روز</th><th>وضعیت</th><th>کارکرد</th><th>موظفی</th><th>اضافه‌کاری</th><th>مرخصی</th><th>قرارداد</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  return buildPrintHtml(`گزارش کارکرد ${report.exportMetadata.employeeName}`, body, 'غیرنهایی / صرفاً جهت پیش‌نمایش');
}

function buildPayrollPreviewHtml(report: EmployeeWorkReportData, withInsuranceTax: boolean) {
  const preview = withInsuranceTax ? report.payrollPreviewWithInsuranceTax : report.payrollPreviewWithoutInsuranceTax;
  const earningsRows = preview.earnings
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(formatMoney(item.amount))}</td><td>${escapeHtml(item.details.formula)}</td></tr>`,
    )
    .join('');
  const deductionRows = preview.deductions
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(formatMoney(item.amount))}</td><td>${escapeHtml(item.details.formula)}</td></tr>`,
    )
    .join('');

  const body = `
    <h1>پیش‌نمایش حقوق ${escapeHtml(report.exportMetadata.employeeName)}</h1>
    <div class="meta">
      <div>دوره: ${escapeHtml(report.exportMetadata.periodLabel)}</div>
      <div>حالت: ${escapeHtml(preview.modeLabel)}</div>
      <div>قرارداد: ${escapeHtml(report.exportMetadata.contractLabel ?? 'ثبت نشده')}</div>
      <div>تاریخ تولید: ${escapeHtml(new Date(report.exportMetadata.generatedAt).toLocaleString('fa-IR'))}</div>
    </div>
    ${preview.note ? `<p>${escapeHtml(preview.note)}</p>` : ''}
    <div class="totals">
      <div><span>مزد مبنا</span><strong>${escapeHtml(formatMoney(preview.wageBaseAmount))}</strong></div>
      <div><span>جمع دریافتی</span><strong>${escapeHtml(formatMoney(preview.totalEarnings))}</strong></div>
      <div><span>جمع کسورات</span><strong>${escapeHtml(formatMoney(preview.totalDeductions))}</strong></div>
      <div><span>خالص پرداختی</span><strong>${escapeHtml(formatMoney(preview.netPayable))}</strong></div>
    </div>
    <h2>دریافتی‌ها</h2>
    <table><thead><tr><th>عنوان</th><th>مبلغ</th><th>فرمول</th></tr></thead><tbody>${earningsRows}</tbody></table>
    <h2>کسورات</h2>
    <table><thead><tr><th>عنوان</th><th>مبلغ</th><th>فرمول</th></tr></thead><tbody>${deductionRows}</tbody></table>
  `;

  return buildPrintHtml(`پیش‌نمایش حقوق ${report.exportMetadata.employeeName}`, body, 'غیرنهایی / صرفاً جهت پیش‌نمایش');
}

function buildWorkReportFilename(report: EmployeeWorkReportData) {
  const monthName = PERSIAN_MONTH_NAMES[report.period.month - 1] ?? 'month';
  return `work-report-${report.exportMetadata.employeeName}-${monthName}-${report.period.year}.pdf`.replace(/\s+/g, '-');
}

function buildPayrollPreviewFilename(report: EmployeeWorkReportData, withInsuranceTax: boolean) {
  const mode = withInsuranceTax ? 'with-tax' : 'without-tax';
  return `payroll-preview-${report.exportMetadata.employeeName}-${report.period.year}-${report.period.month}-${mode}.pdf`.replace(/\s+/g, '-');
}

export async function generateWorkReportPdf(report: EmployeeWorkReportData): Promise<WorkReportPdfResult> {
  const html = buildWorkReportHtml(report);
  return renderHtmlToPdfBlob(html, buildWorkReportFilename(report), `گزارش کارکرد ${report.exportMetadata.employeeName}`);
}

export async function generatePayrollPreviewPdf(
  report: EmployeeWorkReportData,
  withInsuranceTax: boolean,
): Promise<WorkReportPdfResult> {
  const html = buildPayrollPreviewHtml(report, withInsuranceTax);
  return renderHtmlToPdfBlob(
    html,
    buildPayrollPreviewFilename(report, withInsuranceTax),
    `پیش‌نمایش حقوق ${report.exportMetadata.employeeName}`,
  );
}
