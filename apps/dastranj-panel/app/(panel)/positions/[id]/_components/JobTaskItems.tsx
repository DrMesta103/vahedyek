'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

export type JobTaskItem = {
  title: string;
  description: string;
  type: string;
  frequency: string;
  priority: string;
  expectedOutput: string;
  displayOrder: number;
};

const emptyTask = (displayOrder: number): JobTaskItem => ({ title: '', description: '', type: 'CORE', frequency: 'ONGOING', priority: 'MEDIUM', expectedOutput: '', displayOrder });

function normalize(value: unknown): JobTaskItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, displayOrder) => typeof item === 'string'
    ? { ...emptyTask(displayOrder), title: item }
    : { ...emptyTask(displayOrder), ...(item && typeof item === 'object' ? item : {}), displayOrder });
}

export function JobTaskItems({ name, title, value, readOnly }: { name: string; title: string; value: unknown; readOnly: boolean }) {
  const [items, setItems] = useState(() => normalize(value));
  const serialized = useMemo(() => JSON.stringify(items.map((item, displayOrder) => ({ ...item, displayOrder }))), [items]);
  const update = (index: number, patch: Partial<JobTaskItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const move = (index: number, offset: number) => setItems((current) => { const target = index + offset; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });

  return <fieldset className="org-job-tasks full-span" disabled={readOnly}>
    <legend>{title}</legend><input type="hidden" name={name} value={serialized}/>
    {items.map((item, index) => <article key={index}>
      <label><span>عنوان *</span><input value={item.title} maxLength={200} onChange={(event) => update(index, { title: event.target.value })}/></label>
      <label><span>نوع</span><select value={item.type} onChange={(event) => update(index, { type: event.target.value })}><option value="CORE">اصلی</option><option value="SUPPORT">پشتیبان</option><option value="MANAGEMENT">مدیریتی</option><option value="REPORTING">گزارشی</option></select></label>
      <label><span>تناوب</span><select value={item.frequency} onChange={(event) => update(index, { frequency: event.target.value })}><option value="ONGOING">مستمر</option><option value="DAILY">روزانه</option><option value="WEEKLY">هفتگی</option><option value="MONTHLY">ماهانه</option><option value="PERIODIC">دوره‌ای</option><option value="ON_DEMAND">حسب نیاز</option></select></label>
      <label><span>اولویت</span><select value={item.priority} onChange={(event) => update(index, { priority: event.target.value })}><option value="LOW">کم</option><option value="MEDIUM">متوسط</option><option value="HIGH">زیاد</option><option value="CRITICAL">حیاتی</option></select></label>
      <label className="full-span"><span>توضیح</span><textarea rows={2} value={item.description} maxLength={2000} onChange={(event) => update(index, { description: event.target.value })}/></label>
      <label className="full-span"><span>خروجی مورد انتظار</span><textarea rows={2} value={item.expectedOutput} maxLength={2000} onChange={(event) => update(index, { expectedOutput: event.target.value })}/></label>
      {!readOnly&&<div className="org-job-task-actions"><button type="button" onClick={()=>move(index,-1)} disabled={index===0} aria-label={`انتقال ${item.title||'وظیفه'} به بالا`}><ArrowUp/></button><button type="button" onClick={()=>move(index,1)} disabled={index===items.length-1} aria-label={`انتقال ${item.title||'وظیفه'} به پایین`}><ArrowDown/></button><button type="button" className="is-danger" onClick={()=>setItems((current)=>current.filter((_,itemIndex)=>itemIndex!==index))} aria-label={`حذف ${item.title||'وظیفه'}`}><Trash2/></button></div>}
    </article>)}
    {!items.length&&<p className="org-muted">هنوز وظیفه‌ای ثبت نشده است.</p>}
    {!readOnly&&<button type="button" className="org-add-task" onClick={()=>setItems((current)=>[...current,emptyTask(current.length)])}><Plus/>افزودن وظیفه</button>}
  </fieldset>;
}
