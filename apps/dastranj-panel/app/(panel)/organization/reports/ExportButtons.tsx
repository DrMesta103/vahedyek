'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export function ExportButtons({ query }: { query: string }) {
  const [error, setError] = useState<string | null>(null);
  async function download(format: 'excel' | 'pdf', report: 'current' | 'capacity' | 'changes') {
    setError(null);
    try {
      const response = await fetch(`/api/organization/reports/export?format=${format}&report=${report}&${query}`);
      if (!response.ok) throw new Error('خروجی گزارش دریافت نشد. لطفاً دوباره تلاش کنید.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `organization-${report}.${format === 'excel' ? 'xls' : 'pdf'}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'خروجی گزارش دریافت نشد.'); }
  }
  return <div className="org-export-actions"><select aria-label="نوع گزارش" id="organization-report-kind" defaultValue="current"><option value="current">گزارش جاری سازمان</option><option value="capacity">گزارش ظرفیت</option><option value="changes">گزارش تغییرات</option></select><button type="button" onClick={() => download('excel', (document.getElementById('organization-report-kind') as HTMLSelectElement).value as 'current' | 'capacity' | 'changes')}><Download />Excel</button><button type="button" onClick={() => download('pdf', (document.getElementById('organization-report-kind') as HTMLSelectElement).value as 'current' | 'capacity' | 'changes')}><Download />PDF</button>{error && <p role="alert" className="org-export-error">{error}</p>}</div>;
}
