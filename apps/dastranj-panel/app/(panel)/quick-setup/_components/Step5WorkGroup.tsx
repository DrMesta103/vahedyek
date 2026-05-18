'use client';

import { BriefcaseBusiness, CheckCircle2, MapPin, Shield, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createWorkGroupFromQuickSetupAction } from '../../../lib/actions';
import type { QuickWorkGroupSummary } from './quick-setup.types';

type LocationOption = { id: string; name: string; description: string; radius: number };
type EmployeeOption = { id: string; name: string; contactValue: string };
type PolicyOption = { id: string; name: string; calendarName: string; isActive: boolean; yearUsed: string };
type SelectedEmployee = { id: string; name: string; selectedRole: 'employee' | 'lead' | 'manager' };

type Draft = {
  title: string;
  tagInput: string;
  tags: string[];
  selectedLocationId: string;
  selectedEmployees: SelectedEmployee[];
  employeeSearch: string;
  selectedPolicyIds: string[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function FlowSection({
  title,
  index,
  enabled,
  expanded,
  onToggle,
  icon,
  children,
}: {
  title: string;
  index: number;
  enabled: boolean;
  expanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl border bg-slate-950/25', enabled ? 'border-white/10' : 'border-white/5 opacity-55')}>
      <button type="button" onClick={onToggle} disabled={!enabled} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-right sm:px-5">
        <span className="text-xs text-slate-400">{expanded ? 'بستن' : 'مشاهده جزئیات'}</span>
        <span className="flex items-center gap-3">
          <span className="text-base font-bold text-white">{title}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">{icon}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-slate-300">{index}</span>
        </span>
      </button>
      {expanded ? <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5">{children}</div> : null}
    </section>
  );
}

export default function Step5WorkGroup({
  initialWorkGroup,
  locations,
  employees,
  policies,
  onSave,
}: {
  initialWorkGroup: QuickWorkGroupSummary | null;
  locations: LocationOption[];
  employees: EmployeeOption[];
  policies: PolicyOption[];
  onSave: (workGroup: QuickWorkGroupSummary) => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    title: initialWorkGroup?.title ?? '',
    tagInput: '',
    tags: [],
    selectedLocationId: locations[0]?.id ?? '',
    selectedEmployees: [],
    employeeSearch: '',
    selectedPolicyIds: [],
  });
  const [saved, setSaved] = useState(Boolean(initialWorkGroup));
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4>(1);
  const [titleConfirmed, setTitleConfirmed] = useState(Boolean(initialWorkGroup));
  const [locationConfirmed, setLocationConfirmed] = useState(Boolean(initialWorkGroup));
  const [membersConfirmed, setMembersConfirmed] = useState(Boolean(initialWorkGroup));

  const filteredEmployees = useMemo(() => {
    const q = draft.employeeSearch.trim();
    if (!q) return employees;
    return employees.filter((item) => item.name.includes(q) || item.contactValue.includes(q));
  }, [draft.employeeSearch, employees]);
  const isValid = draft.title.trim().length > 0 && Boolean(draft.selectedLocationId) && draft.selectedEmployees.length > 0 && draft.selectedPolicyIds.length > 0;

  const addTag = () => {
    const value = draft.tagInput.trim();
    if (!value || draft.tags.includes(value)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, value], tagInput: '' }));
    setSaved(false);
  };

  const addEmployee = (employee: EmployeeOption, selectedRole: SelectedEmployee['selectedRole']) => {
    setDraft((prev) => {
      if (prev.selectedEmployees.some((item) => item.id === employee.id)) return prev;
      return { ...prev, selectedEmployees: [...prev.selectedEmployees, { id: employee.id, name: employee.name, selectedRole }] };
    });
    setSaved(false);
  };

  const save = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const result = await createWorkGroupFromQuickSetupAction({
        title: draft.title.trim(),
        tags: draft.tags,
        locationId: draft.selectedLocationId,
        employeeIds: draft.selectedEmployees.map((item) => item.id),
        policyIds: draft.selectedPolicyIds,
      });
      setSaved(true);
      onSave(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
      <div className="text-right">
        <h2 className="text-base font-bold text-white">مرحله 5: ثبت گروه کاری</h2>
        <p className="mt-1 text-sm text-slate-400">عنوان، محل کار، اعضا و سیاست کاری گروه را به ترتیب تکمیل کنید.</p>
      </div>

      <FlowSection title="عنوان و لوگوی گروه کاری" index={1} enabled expanded={activeSection === 1} onToggle={() => setActiveSection(1)} icon={<BriefcaseBusiness className="h-5 w-5" />}>
        <div className="space-y-4 text-right">
          <label className="space-y-2 block"><span className="text-xs font-bold text-white">عنوان گروه</span><input value={draft.title} onChange={(e) => { setTitleConfirmed(false); setLocationConfirmed(false); setMembersConfirmed(false); setDraft((prev) => ({ ...prev, title: e.target.value })); }} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label>
          <div className="grid gap-2 md:grid-cols-[1fr_auto]"><input value={draft.tagInput} onChange={(e) => setDraft((prev) => ({ ...prev, tagInput: e.target.value }))} placeholder="برچسب گروه" className="rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" /><button type="button" onClick={addTag} className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white">افزودن برچسب</button></div>
          <div className="flex flex-wrap gap-2">{draft.tags.map((tag) => <button key={tag} type="button" onClick={() => setDraft((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }))} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{tag} ×</button>)}</div>
          <div className="flex justify-start"><button type="button" onClick={() => { if (!draft.title.trim()) return; setTitleConfirmed(true); setActiveSection(2); }} disabled={!draft.title.trim()} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400 disabled:opacity-50">تایید و ادامه</button></div>
        </div>
      </FlowSection>

      <FlowSection title="انتخاب محل های کار گروه" index={2} enabled={titleConfirmed} expanded={activeSection === 2} onToggle={() => titleConfirmed && setActiveSection(2)} icon={<MapPin className="h-5 w-5" />}>
        <div className="space-y-4">
          {locations.length === 0 ? <div className="text-sm text-amber-300">هنوز محل کاری در راه اندازی سریع ثبت نشده است.</div> : locations.map((location) => <button key={location.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, selectedLocationId: location.id }))} className={cn('w-full rounded-xl border p-4 text-right', draft.selectedLocationId === location.id ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40')}><div className="font-bold text-white">{location.name}</div><div className="mt-1 text-xs text-slate-400">{location.description} - شعاع {location.radius} متر</div></button>)}
          <div className="flex justify-start"><button type="button" onClick={() => { if (!draft.selectedLocationId) return; setLocationConfirmed(true); setActiveSection(3); }} disabled={!draft.selectedLocationId} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400 disabled:opacity-50">تایید و ادامه</button></div>
        </div>
      </FlowSection>

      <FlowSection title="افزودن اعضای گروه کاری" index={3} enabled={locationConfirmed} expanded={activeSection === 3} onToggle={() => locationConfirmed && setActiveSection(3)} icon={<Users className="h-5 w-5" />}>
        <div className="space-y-4 text-right">
          <input value={draft.employeeSearch} onChange={(e) => setDraft((prev) => ({ ...prev, employeeSearch: e.target.value }))} placeholder="جستجوی کارمند" className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" />
          <div className="grid gap-3 md:grid-cols-2">{filteredEmployees.map((employee) => <div key={employee.id} className="rounded-xl border border-white/10 bg-slate-800/40 p-3"><div className="font-bold text-white">{employee.name}</div><div className="text-xs text-slate-400">{employee.contactValue}</div><div className="mt-3 flex flex-wrap gap-2">{(['employee', 'lead', 'manager'] as const).map((role) => <button key={role} type="button" onClick={() => addEmployee(employee, role)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{role === 'employee' ? 'کارمند' : role === 'lead' ? 'سرگروه' : 'مدیر'}</button>)}</div></div>)}</div>
          {draft.selectedEmployees.length ? <div className="space-y-2">{draft.selectedEmployees.map((employee) => <div key={employee.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-sm text-slate-200"><button type="button" onClick={() => setDraft((prev) => ({ ...prev, selectedEmployees: prev.selectedEmployees.filter((item) => item.id !== employee.id) }))}>حذف</button><span>{employee.name}</span></div>)}</div> : null}
          <div className="flex justify-start"><button type="button" onClick={() => { if (!draft.selectedEmployees.length) return; setMembersConfirmed(true); setActiveSection(4); }} disabled={!draft.selectedEmployees.length} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400 disabled:opacity-50">تایید و ادامه</button></div>
        </div>
      </FlowSection>

      <FlowSection title="انتخاب سیاست کاری گروه" index={4} enabled={membersConfirmed} expanded={activeSection === 4} onToggle={() => membersConfirmed && setActiveSection(4)} icon={<Shield className="h-5 w-5" />}>
        <div className="space-y-4 text-right">
          {policies.length === 0 ? <div className="text-sm text-amber-300">هنوز سیاست کاری ای در راه اندازی سریع ثبت نشده است.</div> : policies.map((policy) => <button key={policy.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, selectedPolicyIds: prev.selectedPolicyIds.includes(policy.id) ? prev.selectedPolicyIds.filter((id) => id !== policy.id) : [...prev.selectedPolicyIds, policy.id] }))} className={cn('w-full rounded-xl border p-4 text-right', draft.selectedPolicyIds.includes(policy.id) ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40')}><div className="font-bold text-white">{policy.name}</div><div className="mt-1 text-xs text-slate-400">تقویم: {policy.calendarName} - سال {policy.yearUsed}</div></button>)}
          <div className="flex justify-start"><button type="button" onClick={save} disabled={!isValid || saving} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400 disabled:opacity-50">{saving ? 'در حال ثبت...' : 'تایید و ادامه'}</button></div>
        </div>
      </FlowSection>

      <div className="flex items-center justify-between gap-3 pt-2">
        {!saved ? <div className="text-xs text-slate-400">پس از تکمیل بخش ها، گروه کاری را ثبت کنید تا راه اندازی سریع تمام شود.</div> : <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300"><CheckCircle2 className="h-3 w-3" />گروه کاری ذخیره شد</div>}
      </div>
    </section>
  );
}
