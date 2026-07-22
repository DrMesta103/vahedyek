'use client';

import { Download, LoaderCircle, Printer } from 'lucide-react';
import { useState } from 'react';

type PdfRow = { Report: string; Title: string; Description: string; Status: string; Date: string; Source: string; Details: string };
type PdfPayload = { employeeName: string; generatedAt: string; rows: PdfRow[] };
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function downloadPersianPdf(payload: PdfPayload, employeeId: string) {
  const host = document.createElement('section'); host.dir = 'rtl'; host.lang = 'fa';
  host.style.cssText = 'position:fixed;right:-10000px;top:0;width:794px;padding:48px;background:#fff;color:#17223b;font-family:iran,Tahoma,Arial,sans-serif;line-height:1.8;';
  const rows = payload.rows.map(row => `<tr><td>${escapeHtml(row.Report)}</td><td><strong>${escapeHtml(row.Title)}</strong><br><small>${escapeHtml(row.Description)}</small></td><td>${escapeHtml(row.Status)}</td><td>${escapeHtml(row.Date || '—')}</td><td>${escapeHtml(row.Source)}</td></tr>`).join('');
  host.innerHTML = `<h1 style="font-size:26px;margin:0 0 8px">گزارش‌ها و تحلیل‌های ${escapeHtml(payload.employeeName)}</h1><p style="color:#64748b;margin:0 0 24px">تاریخ تولید: ${escapeHtml(new Date(payload.generatedAt).toLocaleString('fa-IR'))}</p><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th>گزارش</th><th>شرح</th><th>وضعیت</th><th>تاریخ</th><th>منبع</th></tr></thead><tbody>${rows || '<tr><td colspan="5">برای فیلتر جاری داده‌ای وجود ندارد.</td></tr>'}</tbody></table>`;
  host.querySelectorAll('th,td').forEach(cell => (cell as HTMLElement).style.cssText = 'border:1px solid #dbe2ea;padding:8px;text-align:right;vertical-align:top;');
  document.body.appendChild(host);
  try {
    await document.fonts.ready;
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('../../../../../lib/simple-pdf');
    const canvas = await html2canvas(host, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth(); const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = canvas.height * pageWidth / canvas.width; const image = canvas.toDataURL('image/jpeg', .94);
    let remaining = imageHeight; let position = 0; pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight); remaining -= pageHeight;
    while (remaining > 0) { position = remaining - imageHeight; pdf.addPage(); pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight); remaining -= pageHeight; }
    const url = URL.createObjectURL(pdf.output('blob')); const link = document.createElement('a'); link.href = url; link.download = `employee-report-${employeeId}.pdf`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } finally { host.remove(); }
}

export function EmployeeReportsActions({ employeeId, query }: { employeeId: string; query: string }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const exportHref = (format: 'excel' | 'pdf') => `/api/employees/${employeeId}/reports/export?${query}${query ? '&' : ''}format=${format}`;
  const exportPdf = async () => { setPdfLoading(true); try { const response = await fetch(exportHref('pdf')); if (!response.ok) throw new Error(await response.text()); await downloadPersianPdf(await response.json() as PdfPayload, employeeId); } catch (error) { window.alert(error instanceof Error && error.message ? error.message : 'فایل خروجی تولید نشد.'); } finally { setPdfLoading(false); } };
  return <div className="employee-reports-actions" aria-label="خروجی گزارش"><a href={exportHref('excel')}><Download aria-hidden />Excel</a><button type="button" onClick={exportPdf} disabled={pdfLoading}>{pdfLoading ? <LoaderCircle className="employee-reports-spinner" aria-hidden /> : <Download aria-hidden />}PDF</button><button type="button" onClick={() => window.print()}><Printer aria-hidden />چاپ</button></div>;
}
