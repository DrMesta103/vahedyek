'use client';

import { useState, useTransition } from 'react';
import { Copy, Eye, Pencil, Power, Trash2 } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { clonePolicyAction, deletePolicyAction, togglePolicyActiveAction } from '../../../lib/actions';

export type PolicyCardItem = { id: string; title: string; description: string | null; calendarLabel: string; familyLabel: string; variantLabel: string; isActive: boolean; groupCount: number; employeeCount: number; summary: string };

export function PolicyCard({ item, editHref }: { item: PolicyCardItem; editHref: string }) {
  const [active, setActive] = useState(item.isActive);
  const [pending, startTransition] = useTransition();
  const toggle = (next: boolean) => {
    if (!next && !window.confirm(`سیاست «${item.title}» غیرفعال شود؟ گروه‌های فعلی حذف نمی‌شوند.`)) return;
    const formData = new FormData(); formData.set('id', item.id); formData.set('isActive', String(next)); setActive(next);
    startTransition(() => void togglePolicyActiveAction(formData).catch(() => setActive(!next)));
  };
  const clone = () => { const title = window.prompt('عنوان نسخهٔ جدید:', `${item.title} - کپی`); if (!title?.trim()) return; startTransition(() => void clonePolicyAction({ id: item.id, title: title.trim() }).catch((error) => window.alert(error instanceof Error ? error.message : 'کپی انجام نشد.'))); };
  return <article className="module-grid-card policy-card">
    <div className="module-grid-card-top"><div className="module-grid-card-body">
      <div className="flex items-center gap-2"><h3>{item.title}</h3><span className={`module-status-pill ${active ? 'is-active' : 'is-inactive'}`}>{active ? 'فعال' : 'غیرفعال'}</span></div>
      <p>{item.description?.trim() ? item.description : 'توضیحات ثبت نشده است'}</p><p>تقویم: {item.calendarLabel || 'ثبت نشده'} · {item.familyLabel} · {item.variantLabel}</p>
    </div><div className="module-grid-card-top-actions">
      <label className="request-reason-toggle module-grid-card-toggle" aria-label={active ? 'غیرفعال کردن سیاست' : 'فعال کردن سیاست'}><input type="checkbox" checked={active} disabled={pending} onChange={(event) => toggle(event.target.checked)} /><span className="request-reason-toggle-track" aria-hidden /></label>
      <CardMenu items={[
        { kind: 'link', href: editHref, label: 'جزئیات', icon: <Eye className="h-4 w-4" /> },
        { kind: 'link', href: editHref, label: 'ویرایش', icon: <Pencil className="h-4 w-4" /> },
        { kind: 'action', label: 'ایجاد نسخهٔ مشابه', icon: <Copy className="h-4 w-4" />, onClick: clone },
        { kind: 'action', label: active ? 'غیرفعال‌سازی' : 'فعال‌سازی', icon: <Power className="h-4 w-4" />, onClick: () => toggle(!active) },
        { kind: 'submit', label: 'حذف', tone: 'danger', icon: <Trash2 className="h-4 w-4" />, action: deletePolicyAction, hiddenFields: { id: item.id }, confirm: { title: 'حذف سیاست کاری', description: `آیا از حذف «${item.title}» مطمئن هستید؟`, confirmLabel: 'بله، حذف شود', cancelLabel: 'انصراف' } },
      ]} />
    </div></div>
    <div className="module-card-metrics"><div className="module-metric-panel"><span>گروه‌های متصل</span><strong>{item.groupCount.toLocaleString('fa-IR')}</strong></div><div className="module-metric-panel"><span>کارکنان تحت پوشش</span><strong>{item.employeeCount.toLocaleString('fa-IR')}</strong></div><div className="module-metric-panel"><span>خلاصه قواعد</span><strong>{item.summary}</strong></div></div>
  </article>;
}
