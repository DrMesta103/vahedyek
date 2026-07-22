'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ChevronDown, ChevronLeft, ChevronUp, Network, Search, TableProperties, UserRound, UsersRound } from 'lucide-react';
import { createPositionAction, deleteOrganizationUnitAction, setOrganizationUnitStatusAction, setPositionStatusAction } from '../../../lib/actions';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { CreateOrganizationUnitDialog } from './CreateOrganizationUnitDialog';

type Assignment = { id: string; startDate: string | null; employee: { id: string; firstName: string; lastName: string; personnelCode: string | null } };
type Position = { id: string; title: string; code: string | null; capacity: number; status: string; assignedCount: number; remainingCapacity: number; capacityStatus: string; assignments: Assignment[] };
export type OrganizationUnitListItem = {
  id: string; title: string; code: string | null; type: string; status: string; description: string | null;
  parentId: string | null; updatedAt: string; parent: { id: string; title: string } | null;
  manager: { id: string; firstName: string; lastName: string; personnelCode: string | null } | null;
  childCount: number; employeeCount: number; positionCount: number; vacantPositionCount: number; positions: Position[];
};
type Access = { canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean; canViewPosition: boolean; canCreatePosition: boolean; canUpdatePosition: boolean; canArchivePosition: boolean; canViewAssignments: boolean };
type CreateOptions = {
  units: Array<{ id: string; title: string; code:string|null; parentId:string|null }>;
  employees: Array<{ id: string; firstName: string; lastName: string; personnelCode: string | null }>;
  templates: Array<{ id:string; name:string; description:string|null; version:number; units:Array<{ id:string; parentTemplateUnitId:string|null; name:string; type:string; description:string|null; status:string; positions:Array<{ id:string; title:string; code:string|null; capacity:number; status:string }> }> }>;
  autoCode: { available:boolean; patternName:string|null; preview:string|null };
};

const statusLabels: Record<string, string> = { ACTIVE: 'فعال', INACTIVE: 'غیرفعال', ARCHIVED: 'آرشیوی' };
const capacityLabels: Record<string, string> = { WITHOUT_ASSIGNEE: 'بدون متصدی', HAS_AVAILABLE_CAPACITY: 'ظرفیت خالی', FULL: 'تکمیل ظرفیت', OVER_CAPACITY: 'مغایرت ظرفیت', DISABLED: 'غیرفعال', ARCHIVED: 'آرشیوی' };
const typeLabels: Record<string, string> = { DEPARTMENT: 'واحد', DIVISION: 'مدیریت', TEAM: 'تیم', BRANCH: 'شعبه' };

export function OrganizationUnitsPageClient({ items, access, createOptions }: { items: OrganizationUnitListItem[]; access: Access; createOptions: CreateOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(() => searchParams.get('create') === '1' && access.canCreate);
  const [query, setQuery] = useState('');
  const [unitStatus, setUnitStatus] = useState('ALL');
  const [unitType, setUnitType] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [managerFilter, setManagerFilter] = useState('ALL');
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(()=>searchParams.get('parent')||undefined);
  const [positionUnitId, setPositionUnitId] = useState<string | null>(()=>access.canCreatePosition?searchParams.get('positionUnit'):null);
  const [positionTitle, setPositionTitle] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [positionCapacity, setPositionCapacity] = useState(1);
  const [positionStatus, setPositionStatus] = useState<'ACTIVE'|'INACTIVE'>('ACTIVE');
  const [positionSuccess, setPositionSuccess] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [savingPosition, setSavingPosition] = useState(false);

  const closeCreate = () => { setCreateOpen(false); if (searchParams.get('create') === '1') router.replace('/organization-units'); };

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => item.status === 'ACTIVE').length,
    children: items.filter((item) => item.parentId).length,
    positions: items.reduce((sum, item) => sum + item.positionCount, 0),
    withoutAssignee: items.reduce((sum, item) => sum + item.positions.filter((position) => position.assignedCount === 0).length, 0),
    vacant: items.reduce((sum, item) => sum + item.vacantPositionCount, 0),
    employees: items.reduce((sum, item) => sum + item.employeeCount, 0),
    withoutManager: items.filter((item) => !item.manager).length,
  }), [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fa');
    return items.filter((item) => {
      const searchable = [item.title, item.code, item.parent?.title, item.manager && `${item.manager.firstName} ${item.manager.lastName}`, ...item.positions.flatMap((position) => [position.title, position.code])].filter(Boolean).join(' ').toLocaleLowerCase('fa');
      if (needle && !searchable.includes(needle)) return false;
      if (unitStatus !== 'ALL' && item.status !== unitStatus) return false;
      if (unitType !== 'ALL' && item.type !== unitType) return false;
      if (positionFilter === 'HAS' && item.positionCount === 0) return false;
      if (positionFilter === 'NONE' && item.positionCount > 0) return false;
      if (positionFilter === 'UNASSIGNED' && !item.positions.some((position) => position.assignedCount === 0)) return false;
      if (positionFilter === 'AVAILABLE' && !item.positions.some((position) => position.remainingCapacity > 0)) return false;
      if (positionFilter === 'FULL' && !item.positions.some((position) => position.remainingCapacity === 0)) return false;
      if (managerFilter === 'HAS' && !item.manager) return false;
      if (managerFilter === 'NONE' && item.manager) return false;
      return true;
    });
  }, [items, managerFilter, positionFilter, query, unitStatus, unitType]);

  const availableTypes = useMemo(() => Array.from(new Set(items.map((item) => item.type))).sort(), [items]);

  const visible = useMemo(() => view === 'list' ? filtered : filtered.filter((item) => !item.parentId || !filtered.some((parent) => parent.id === item.parentId)), [filtered, view]);
  const toggle = (id: string) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const togglePositions = (id: string) => setExpandedPositions((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const openPosition = (unitId: string) => { setPositionUnitId(unitId); setPositionTitle(''); setPositionCode(''); setPositionCapacity(1); setPositionStatus('ACTIVE'); setPositionError(null); setPositionSuccess(null); };
  const savePosition = async () => {
    if (!positionUnitId || savingPosition) return;
    setSavingPosition(true); setPositionError(null);
    try { await createPositionAction({ organizationUnitId: positionUnitId, title: positionTitle, code: positionCode, capacity: positionCapacity, status: positionStatus }); setPositionUnitId(null); setPositionSuccess('سمت سازمانی با موفقیت ثبت شد.'); router.replace('/organization-units'); router.refresh(); }
    catch (error) { setPositionError(error instanceof Error ? error.message : 'ثبت سمت انجام نشد.'); }
    finally { setSavingPosition(false); }
  };

  const renderUnit = (item: OrganizationUnitListItem, depth = 0, lineage = new Set<string>()): React.ReactNode => {
    if (lineage.has(item.id)) return null;
    const nextLineage = new Set(lineage).add(item.id);
    const isExpanded = expanded.has(item.id);
    const positionsOpen = expandedPositions.has(item.id);
    const children = view === 'tree' ? filtered.filter((child) => child.parentId === item.id) : [];
    const canExpandTree = view === 'tree' && children.length > 0;
    return <div key={item.id} className="org-structure-node" style={{ '--org-depth': depth } as React.CSSProperties}>
      <article className="org-structure-row">
        {canExpandTree ? <button className="org-expand-button" type="button" onClick={() => toggle(item.id)} aria-expanded={isExpanded} aria-label={`${isExpanded ? 'بستن' : 'باز کردن'} زیرواحدهای ${item.title}`}>{isExpanded ? <ChevronUp /> : <ChevronDown />}</button> : <span className="org-expand-placeholder" aria-hidden />}
        <div className="org-unit-identity"><Link href={`/organization-units/${item.id}`}><strong>{item.title}</strong></Link><span>{item.code || 'بدون کد'} · {typeLabels[item.type] || item.type}</span></div>
        <div className="org-unit-parent"><small>واحد بالادست</small><span>{item.parent?.title || 'ریشه سازمان'}</span></div>
        <div className="org-unit-manager"><small>مدیر</small><span>{item.manager ? `${item.manager.firstName} ${item.manager.lastName}` : 'بدون مدیر'}</span></div>
        <div className="org-unit-metrics"><span title="زیرواحد"><Network />{item.childCount}</span><span title="سمت"><UserRound />{item.positionCount}</span><span title="کارمند فعال"><UsersRound />{item.employeeCount}</span></div>
        <span className={`org-status-badge is-${item.status.toLowerCase()}`}>{statusLabels[item.status] || item.status}</span>
        <time>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date(item.updatedAt))}</time>
        <div className="org-row-actions">
          {item.positionCount > 0 && <button type="button" onClick={() => togglePositions(item.id)} aria-expanded={positionsOpen}>{positionsOpen ? 'بستن سمت‌ها' : 'مشاهده سمت‌ها'}</button>}
          {access.canCreate && item.status !== 'ARCHIVED' && <button type="button" onClick={() => { setDefaultParentId(item.id); setCreateOpen(true); }}>افزودن زیرواحد</button>}
          <Link href={`/organization-units/${item.id}`}>مشاهده پروفایل</Link>{access.canCreatePosition && item.status === 'ACTIVE' && <button type="button" onClick={() => openPosition(item.id)}>افزودن سمت</button>}{access.canUpdate && item.status !== 'ARCHIVED' && <><Link href={`/organization-units/${item.id}/edit`} aria-label={`ویرایش ${item.title}`}>ویرایش</Link><form action={setOrganizationUnitStatusAction}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value={item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}/><button type="submit">{item.status === 'ACTIVE' ? 'غیرفعال' : 'فعال'}</button></form><form action={setOrganizationUnitStatusAction} onSubmit={(event)=>{if(!window.confirm('وابستگی‌های فعال بررسی می‌شوند. آیا از آرشیو این واحد مطمئن هستید؟'))event.preventDefault()}}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value="ARCHIVED"/><button type="submit">آرشیو</button></form></>}
          {access.canDelete && item.status !== 'ARCHIVED' && <form action={deleteOrganizationUnitAction} onSubmit={(event) => { if (!window.confirm(`آیا از حذف دائمی واحد «${item.title}» مطمئن هستید؟`)) event.preventDefault(); }}><input type="hidden" name="id" value={item.id}/><button className="is-danger" type="submit">حذف</button></form>}
        </div>
      </article>
      {positionsOpen && <section className="org-position-panel">
        {item.positions.length ? item.positions.map((position) => <article key={position.id} className="org-position-row">
          <div><strong>{position.title}</strong><span>{position.code || 'بدون کد'}</span></div>
          <span>ظرفیت: {position.capacity.toLocaleString('fa-IR')}</span><span>منصوب: {position.assignedCount.toLocaleString('fa-IR')}</span><span>باقی‌مانده: {position.remainingCapacity.toLocaleString('fa-IR')}</span>
          <span className={`org-capacity-badge is-${position.capacityStatus.toLowerCase()}`}>{capacityLabels[position.capacityStatus]}</span>
          <div className="org-position-actions"><Link href={`/positions/${position.id}`}>پروفایل سمت</Link>{access.canUpdatePosition && position.status !== 'ARCHIVED' && <form action={setPositionStatusAction}><input type="hidden" name="id" value={position.id}/><input type="hidden" name="status" value={position.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}/><button type="submit">{position.status === 'ACTIVE' ? 'غیرفعال' : 'فعال'}</button></form>}{access.canArchivePosition && position.status !== 'ARCHIVED' && <form action={setPositionStatusAction} onSubmit={(event)=>{if(!window.confirm('سمت دارای انتصاب فعال آرشیو نمی‌شود. ادامه می‌دهید؟'))event.preventDefault()}}><input type="hidden" name="id" value={position.id}/><input type="hidden" name="status" value="ARCHIVED"/><button type="submit">آرشیو</button></form>}</div>
          {access.canViewAssignments?<details><summary>مشاهده افراد منصوب‌شده</summary>{position.assignments.length ? position.assignments.map((assignment) => <Link key={assignment.id} href={`/employees/${assignment.employee.id}`}>{assignment.employee.firstName} {assignment.employee.lastName} · {assignment.employee.personnelCode || 'بدون کد'} · {assignment.startDate || 'تاریخ ثبت نشده'}<ChevronLeft /></Link>) : <p>فرد فعالی به این سمت منصوب نشده است.</p>}</details>:<p className="org-muted">اطلاعات هویتی افراد با مجوز فعلی قابل مشاهده نیست.</p>}
        </article>) : <p className="org-inline-empty">برای این واحد هنوز سمتی تعریف نشده است.</p>}
      </section>}
      {view === 'tree' && isExpanded && children.map((child) => renderUnit(child, depth + 1, nextLineage))}
    </div>;
  };

  return <>
    {positionSuccess&&<div className="org-success" role="status">{positionSuccess}</div>}
    <header className="org-page-header"><div><h1>واحدها و سمت‌های سازمانی</h1><p>ساختار سازمان، واحدها، زیرواحدها، سمت‌ها و افراد منصوب‌شده را مدیریت کنید.</p></div>{access.canCreate && <button className="module-page-add-btn" onClick={() => setCreateOpen(true)}><span aria-hidden>+</span>افزودن واحد سازمانی</button>}</header>
    <section className="org-summary-grid" aria-label="آمار ساختار سازمانی">
      {[['کل واحدها', stats.total], ['واحد فعال', stats.active], ['زیرواحدها', stats.children], ['کل سمت‌ها', stats.positions], ['سمت بدون متصدی', stats.withoutAssignee], ['سمت با ظرفیت خالی', stats.vacant], ['کارکنان منصوب‌شده', stats.employees], ['واحد بدون مدیر', stats.withoutManager]].map(([label, count]) => <article key={label}><span>{label}</span><strong>{Number(count).toLocaleString('fa-IR')}</strong></article>)}
    </section>
    <section className="org-controls"><label className="org-search"><Search/><span className="sr-only">جستجو</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو بر اساس نام واحد، سمت، کد واحد یا مدیر واحد..."/></label><select aria-label="وضعیت واحد" value={unitStatus} onChange={(event) => setUnitStatus(event.target.value)}><option value="ALL">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option><option value="ARCHIVED">آرشیوی</option></select><select aria-label="نوع واحد" value={unitType} onChange={(event) => setUnitType(event.target.value)}><option value="ALL">همه نوع‌ها</option>{availableTypes.map((type) => <option key={type} value={type}>{typeLabels[type] || type}</option>)}</select><select aria-label="وضعیت سمت" value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}><option value="ALL">همه سمت‌ها</option><option value="HAS">دارای سمت</option><option value="NONE">بدون سمت</option><option value="UNASSIGNED">بدون متصدی</option><option value="AVAILABLE">ظرفیت خالی</option><option value="FULL">تکمیل ظرفیت</option></select><select aria-label="مدیریت" value={managerFilter} onChange={(event) => setManagerFilter(event.target.value)}><option value="ALL">همه مدیران</option><option value="HAS">دارای مدیر</option><option value="NONE">بدون مدیر</option></select><div className="org-view-switch"><button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><TableProperties/>فهرست</button><button className={view === 'tree' ? 'is-active' : ''} onClick={() => setView('tree')} aria-pressed={view === 'tree'}><Network/>درخت</button></div></section>
    {!items.length ? <section className="org-empty-state"><Building2/><h2>هنوز واحد سازمانی تعریف نشده است.</h2>{access.canCreate && <button onClick={() => setCreateOpen(true)}>افزودن واحد سازمانی</button>}</section> : !filtered.length ? <section className="org-empty-state"><Search/><h2>نتیجه‌ای با این جستجو و فیلترها پیدا نشد.</h2><button onClick={() => { setQuery(''); setUnitStatus('ALL'); setUnitType('ALL'); setPositionFilter('ALL'); setManagerFilter('ALL'); }}>پاک‌کردن فیلترها</button></section> : <section className="org-structure-list">{visible.map((item) => renderUnit(item))}</section>}
    {createOpen&&<CreateOrganizationUnitDialog open onClose={() => { setDefaultParentId(undefined); closeCreate(); }} units={createOptions.units} employees={createOptions.employees} templates={createOptions.templates} autoCode={createOptions.autoCode} defaultParentId={defaultParentId}/>}
    <PanelFormModal open={Boolean(positionUnitId)} title="افزودن سمت سازمانی" lead="عنوان، کد، ظرفیت و وضعیت اولیه سمت را وارد کنید." onClose={() => setPositionUnitId(null)} error={positionError} footer={<PanelFormModalActions submitLabel="ثبت سمت" saving={savingPosition} disabled={!positionTitle.trim()} onSubmit={() => void savePosition()} onCancel={() => setPositionUnitId(null)}/>}><label className="calendar-create-field"><span>عنوان سمت</span><input value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} maxLength={200} autoFocus/></label><label className="calendar-create-field"><span>کد سمت</span><input value={positionCode} onChange={(event) => setPositionCode(event.target.value)}/></label><label className="calendar-create-field"><span>ظرفیت</span><input type="number" min="0" max="2147483647" value={positionCapacity} onChange={(event) => setPositionCapacity(Number(event.target.value))}/></label><label className="calendar-create-field"><span>وضعیت اولیه</span><select value={positionStatus} onChange={(event)=>setPositionStatus(event.target.value as 'ACTIVE'|'INACTIVE')}><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option></select></label></PanelFormModal>
  </>;
}
