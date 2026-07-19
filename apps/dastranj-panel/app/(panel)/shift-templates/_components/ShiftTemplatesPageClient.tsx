'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, GitBranch, Hourglass, Search, Timer } from 'lucide-react';
import { ModuleAddTile } from '../../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { SHIFT_TEMPLATE_CATEGORIES, templateTypeToCalendarShiftType, type ShiftTemplateCategory } from '../../../lib/shift-template-map';
import { CreateShiftTemplateDialog } from './CreateShiftTemplateDialog';
import { ShiftTemplateCard, type ShiftTemplateListItem } from './ShiftTemplateCard';
import { ShiftTemplateDetailDialog } from './ShiftTemplateDetailDialog';

const CATEGORY_ICONS = { fixed: Clock3, 'float-day': Hourglass, 'float-abs': Timer, split: GitBranch } as const;

type RawItem = {
  id: string; title: string; description: string | null; type: string; weekDays: unknown; isActive: boolean; config: unknown;
  timeSummary: string; breakSummary: string; usageCount: number; isUsed: boolean; usageUnknown: boolean; usageCalendars: Array<{ id: string; title: string }>; updatedAt: Date;
};

type Props = { items: RawItem[]; canManage: boolean; error?: string | null };

function normalizeItems(items: RawItem[]): ShiftTemplateListItem[] {
  return items.map((item) => ({
    id: item.id, title: item.title, description: item.description,
    shiftType: templateTypeToCalendarShiftType(item.type as never),
    weekDays: Array.isArray(item.weekDays) ? item.weekDays.filter((day): day is string => typeof day === 'string') : [],
    isActive: item.isActive,
    config: item.config && typeof item.config === 'object' && !Array.isArray(item.config) ? item.config as Record<string, unknown> : {},
    timeSummary: item.timeSummary, breakSummary: item.breakSummary, usageCount: item.usageCount, isUsed: item.isUsed, usageUnknown: item.usageUnknown,
    usageCalendars: item.usageCalendars, updatedAt: item.updatedAt.toISOString(),
  }));
}

function Inner({ items, canManage, error }: Props) {
  const router = useRouter();
  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ShiftTemplateCategory | 'all'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [usage, setUsage] = useState<'all' | 'used' | 'unused'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'clone'>('create');
  const [selected, setSelected] = useState<ShiftTemplateListItem | null>(null);
  const [detail, setDetail] = useState<ShiftTemplateListItem | null>(null);
  const [initialType, setInitialType] = useState<ShiftTemplateCategory | null>(null);

  const filtered = useMemo(() => normalizedItems.filter((item) => {
    if (type !== 'all' && item.shiftType !== type) return false;
    if (status === 'active' && !item.isActive) return false;
    if (status === 'inactive' && item.isActive) return false;
    if (usage === 'used' && !item.isUsed) return false;
    if (usage === 'unused' && (item.isUsed || item.usageUnknown)) return false;
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return true;
    const typeLabel = SHIFT_TEMPLATE_CATEGORIES.find((category) => category.id === item.shiftType)?.label ?? '';
    return [item.title, item.description ?? '', typeLabel].some((value) => value.includes(normalizedQuery));
  }), [normalizedItems, query, status, type, usage]);

  const openDialog = (mode: 'create' | 'edit' | 'clone', item: ShiftTemplateListItem | null = null, preferredType: ShiftTemplateCategory | null = null) => {
    if (mode === 'edit' && item?.usageCount) {
      const confirmed = window.confirm('این قالب قبلاً در تقویم‌های کاری استفاده شده است. تغییرات این قالب روی استفاده‌های قبلی اعمال نمی‌شود و فقط در استفاده‌های بعدی قابل استفاده خواهد بود.');
      if (!confirmed) return;
    }
    setDialogMode(mode); setSelected(item); setInitialType(preferredType ?? item?.shiftType ?? null); setDialogOpen(true);
  };

  if (error) return <div className="shift-template-fetch-error" role="alert"><strong>{error}</strong><button type="button" onClick={() => window.location.reload()}>تلاش مجدد</button></div>;

  return <>
    <ModulePageHeader title="الگوها و قالب‌های شیفت" subtitle="قالب‌های زمانی مورد استفاده در تقویم، گروه‌های کاری و محاسبات حضور و غیاب را مدیریت کنید." addLabel={canManage ? 'افزودن قالب شیفت' : undefined} onAddClick={canManage ? () => openDialog('create') : undefined} />
    <div className="shift-templates-toolbar">
      <label className="shift-templates-search" aria-label="جستجوی نام قالب شیفت"><Search className="h-4 w-4" aria-hidden /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی نام قالب شیفت..." /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="فیلتر وضعیت"><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
      <select value={usage} onChange={(event) => setUsage(event.target.value as typeof usage)} aria-label="فیلتر استفاده"><option value="all">همه استفاده‌ها</option><option value="used">استفاده‌شده</option><option value="unused">بدون استفاده</option></select>
    </div>
    <section className="shift-template-section"><header className="shift-template-section-header"><h2>قالب‌های سازمان من</h2><p>قالب‌هایی که برای برنامه‌ریزی زمان کار و استفاده در بخش‌های عملیاتی سازمان تعریف شده‌اند.</p></header>
      <div className="shift-template-categories" role="tablist" aria-label="نوع قالب شیفت">
        <button type="button" role="tab" aria-selected={type === 'all'} className={`shift-template-category-card${type === 'all' ? ' is-active' : ''}`} onClick={() => setType('all')}><span className="shift-template-category-card-copy"><strong>همه قالب‌ها</strong><span>نمایش تمام قالب‌های سازمان</span></span></button>
        {SHIFT_TEMPLATE_CATEGORIES.filter((category) => category.id !== 'rotate').map((category) => { const Icon = CATEGORY_ICONS[category.id]; return <button key={category.id} type="button" role="tab" aria-selected={type === category.id} className={`shift-template-category-card is-${category.tone}${type === category.id ? ' is-active' : ''}`} onClick={() => setType(category.id)}><span className={`shift-template-category-card-icon is-${category.tone}`}><Icon className="h-5 w-5" /></span><span className="shift-template-category-card-copy"><strong>{category.label}</strong><span>{category.description}</span></span></button>; })}
      </div>
      <div className="module-page-grid shift-templates-grid">
        {filtered.map((item) => <ShiftTemplateCard key={item.id} item={item} canManage={canManage} onDetail={() => setDetail(item)} onEdit={() => openDialog('edit', item)} onClone={() => openDialog('clone', item)} />)}
        {!filtered.length ? <div className="shift-template-empty-state"><strong>{query.trim() || status !== 'all' || usage !== 'all' ? 'نتیجه‌ای برای فیلترهای انتخاب‌شده پیدا نشد.' : 'هنوز قالب شیفت اختصاصی تعریف نشده است.'}</strong><span>از الگوهای پایه سیستم استفاده کنید یا یک قالب جدید برای سازمان خود بسازید.</span>{canManage ? <button type="button" onClick={() => openDialog('create')}>افزودن قالب شیفت</button> : null}</div> : canManage ? <ModuleAddTile onClick={() => openDialog('create')} label="برای افزودن قالب شیفت جدید کلیک کنید." /> : null}
      </div>
    </section>
      <section className="shift-template-section shift-template-blueprints"><header className="shift-template-section-header"><h2>الگوهای پایه سیستم</h2><p>از این الگوها برای ساخت قالب شیفت اختصاصی سازمان استفاده کنید.</p></header><div className="module-page-grid shift-templates-grid">{SHIFT_TEMPLATE_CATEGORIES.filter((category) => category.id !== 'rotate').map((category) => { const Icon = CATEGORY_ICONS[category.id]; return <article key={category.id} className="module-grid-card shift-template-blueprint-card"><span className={`shift-template-category-card-icon is-${category.tone}`}><Icon className="h-5 w-5" /></span><h3>الگوی پایه {category.label}</h3><p>{category.description}</p><span className="module-status-pill is-active">قابل استفاده برای ساخت</span>{canManage ? <button type="button" className="calendar-create-submit" onClick={() => { setType(category.id); openDialog('create', null, category.id); }}>ساخت قالب از این الگو</button> : null}</article>; })}<article className="module-grid-card shift-template-blueprint-card is-coming-soon"><h3>الگوی پایه شیفت چرخشی</h3><p>موتور عملیاتی چرخش هنوز در دست توسعه است و در این مرحله قابل ساخت نیست.</p><span className="module-status-pill is-inactive">در دست توسعه</span></article></div></section>
    <CreateShiftTemplateDialog open={dialogOpen} initialShiftType={initialType} onClose={() => { setDialogOpen(false); setSelected(null); }} onSaved={() => { setDialogOpen(false); setSelected(null); router.refresh(); }} mode={dialogMode} template={selected} />
    <ShiftTemplateDetailDialog item={detail} canManage={canManage} onClose={() => setDetail(null)} onEdit={() => { if (canManage && detail) openDialog('edit', detail); setDetail(null); }} onClone={() => { if (canManage && detail) openDialog('clone', detail); setDetail(null); }} />
  </>;
}

export function ShiftTemplatesPageClient(props: Props) { return <Suspense fallback={<div className="shift-template-loading" role="status">در حال بارگذاری قالب‌های شیفت...</div>}><Inner {...props} /></Suspense>; }
