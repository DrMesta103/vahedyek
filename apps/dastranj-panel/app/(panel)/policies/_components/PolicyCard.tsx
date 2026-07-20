'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Eye, Pencil, Power, Trash2, Users, X } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { clonePolicyAction, deletePolicyAction, togglePolicyActiveAction } from '../../../lib/actions';

export type PolicyCardItem = { id: string; title: string; description: string | null; calendarLabel: string; familyLabel: string; variantLabel: string; isActive: boolean; groupCount: number; employeeCount: number; summary: string[]; connectedGroups: Array<{ id: string; title: string; memberCount: number }> };

export function PolicyCard({ item, editHref, viewHref }: { item: PolicyCardItem; editHref: string; viewHref: string }) {
  const [active, setActive] = useState(item.isActive);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const toggle = (next: boolean) => {
    if (!next && !window.confirm(`سیاست «${item.title}» غیرفعال شود؟ گروه‌های فعلی حذف نمی‌شوند.`)) return;
    const formData = new FormData(); formData.set('id', item.id); formData.set('isActive', String(next)); setActive(next);
    setFeedback(null);
    startTransition(() => { void togglePolicyActiveAction(formData).then(() => {
      setFeedback({ tone: 'success', text: next ? 'سیاست کاری با موفقیت فعال شد.' : 'سیاست کاری با موفقیت غیرفعال شد.' });
      router.refresh();
    }).catch((error) => {
      setActive(!next);
      setFeedback({ tone: 'error', text: error instanceof Error ? error.message : 'تغییر وضعیت سیاست کاری انجام نشد. دوباره تلاش کنید.' });
    }); });
  };
  const clone = () => { const title = window.prompt('عنوان نسخهٔ جدید:', `${item.title} - کپی`); if (!title?.trim()) return; setFeedback(null); startTransition(() => { void clonePolicyAction({ id: item.id, title: title.trim() }).then(({ id }) => router.push(`/policies/work?policyId=${id}&mode=view&cloned=1`)).catch((error) => setFeedback({ tone: 'error', text: error instanceof Error ? error.message : 'کپی سیاست کاری انجام نشد. دوباره تلاش کنید.' })); }); };
  return <article className="module-grid-card policy-card">
    <div className="module-grid-card-top"><div className="module-grid-card-body">
      <div className="flex items-center gap-2"><h3>{item.title}</h3><span className={`module-status-pill ${active ? 'is-active' : 'is-inactive'}`}>{active ? 'فعال' : 'غیرفعال'}</span></div>
      <p>{item.description?.trim() ? item.description : 'توضیحات ثبت نشده است'}</p><p>تقویم: {item.calendarLabel || 'ثبت نشده'} · {item.familyLabel} · {item.variantLabel}</p>
    </div><div className="module-grid-card-top-actions">
      <label className="request-reason-toggle module-grid-card-toggle" aria-label={active ? 'غیرفعال کردن سیاست' : 'فعال کردن سیاست'}><input type="checkbox" checked={active} disabled={pending} onChange={(event) => toggle(event.target.checked)} /><span className="request-reason-toggle-track" aria-hidden /></label>
      <CardMenu items={[
        { kind: 'link', href: viewHref, label: 'مشاهده جزئیات', icon: <Eye className="h-4 w-4" /> },
        { kind: 'link', href: editHref, label: 'ویرایش', icon: <Pencil className="h-4 w-4" /> },
        { kind: 'action', label: 'مشاهده گروه‌های متصل', icon: <Users className="h-4 w-4" />, onClick: () => setGroupsOpen(true) },
        { kind: 'action', label: 'ایجاد نسخهٔ مشابه', icon: <Copy className="h-4 w-4" />, onClick: clone },
        { kind: 'action', label: active ? 'غیرفعال‌سازی' : 'فعال‌سازی', icon: <Power className="h-4 w-4" />, onClick: () => toggle(!active) },
        { kind: 'submit', label: 'حذف', tone: 'danger', icon: <Trash2 className="h-4 w-4" />, action: deletePolicyAction, hiddenFields: { id: item.id }, confirm: { title: 'حذف سیاست کاری', description: `آیا از حذف «${item.title}» مطمئن هستید؟`, confirmLabel: 'بله، حذف شود', cancelLabel: 'انصراف' } },
      ]} />
    </div></div>
    <div className="module-card-metrics"><div className="module-metric-panel"><span>گروه‌های متصل</span><strong>{item.groupCount.toLocaleString('fa-IR')}</strong></div><div className="module-metric-panel"><span>کارکنان تحت پوشش</span><strong>{item.employeeCount.toLocaleString('fa-IR')}</strong></div><div className="module-metric-panel policy-card-rule-summary"><span>خلاصه قواعد</span>{item.summary.map((line) => <small key={line}>{line}</small>)}</div></div>
    {groupsOpen ? <div className="policy-groups-dialog-backdrop" role="presentation" onClick={() => setGroupsOpen(false)}><section className="policy-groups-dialog" role="dialog" aria-modal="true" aria-labelledby={`policy-groups-${item.id}`} onClick={(event) => event.stopPropagation()}><header><h3 id={`policy-groups-${item.id}`}>گروه‌های متصل به «{item.title}»</h3><button type="button" onClick={() => setGroupsOpen(false)} aria-label="بستن"><X /></button></header><div className="policy-linked-groups">{item.connectedGroups.length ? item.connectedGroups.map((group) => <Link key={group.id} href={`/work-groups/${group.id}/edit`} className="policy-linked-group"><strong>{group.title}</strong><span>{group.memberCount.toLocaleString('fa-IR')} عضو جاری</span></Link>) : <p>این سیاست کاری هنوز به هیچ گروه کاری متصل نشده است.</p>}</div></section></div> : null}
    {feedback ? <p className={`policy-card-feedback is-${feedback.tone}`} role={feedback.tone === 'error' ? 'alert' : 'status'}>{feedback.text}</p> : null}
  </article>;
}
