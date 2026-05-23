'use client';

import { BriefcaseBusiness, Camera, CheckCircle2, MapPin, Shield, Users, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createWorkGroupFromQuickSetupAction } from '../../../lib/actions';
import type { QuickWorkGroupSummary } from './quick-setup.types';

type LocationOption = { id: string; name: string; description: string; radius: number };
type EmployeeOption = { id: string; name: string; contactValue: string };
type PolicyOption = { id: string; name: string; calendarName: string; isActive: boolean; yearUsed: string };
type SelectedEmployee = { id: string; name: string; selectedRole: 'employee' | 'lead' | 'manager' };

type Draft = {
  title: string;
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
    <section className={cn('rounded-xl border bg-slate-950/25', enabled ? 'border-white/10' : 'border-white/5 opacity-55')}>
      <button type="button" onClick={onToggle} disabled={!enabled} className="flex w-full flex-row-reverse items-center justify-between gap-4 px-4 py-4 text-right sm:px-5">
        <span className="text-xs text-slate-400">{expanded ? 'بستن' : 'مشاهده جزئیات'}</span>
        <span className="flex items-center gap-3">
          <span className="text-base font-bold text-white">{title}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">{icon}</span>
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
    selectedLocationId: locations[0]?.id ?? '',
    selectedEmployees: [],
    employeeSearch: '',
    selectedPolicyIds: policies[0] ? [policies[0].id] : [],
  });
  const [saved, setSaved] = useState(Boolean(initialWorkGroup));
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4>(1);
  const [titleConfirmed, setTitleConfirmed] = useState(Boolean(initialWorkGroup));
  const [locationConfirmed, setLocationConfirmed] = useState(Boolean(initialWorkGroup));
  const [membersConfirmed, setMembersConfirmed] = useState(Boolean(initialWorkGroup));
  const [groupLogoUrl, setGroupLogoUrl] = useState('');

  const filteredEmployees = useMemo(() => {
    const q = draft.employeeSearch.trim();
    const selectedIds = new Set(draft.selectedEmployees.map((item) => item.id));
    const pool = employees.filter((item) => !selectedIds.has(item.id));
    if (!q) return pool;
    return pool.filter((item) => item.name.includes(q) || item.contactValue.includes(q));
  }, [draft.employeeSearch, draft.selectedEmployees, employees]);
  const isValid = draft.title.trim().length > 0 && Boolean(draft.selectedLocationId) && draft.selectedEmployees.length > 0 && draft.selectedPolicyIds.length > 0;

  useEffect(() => {
    if (!draft.selectedLocationId && locations[0]?.id) {
      setDraft((prev) => ({ ...prev, selectedLocationId: locations[0].id }));
    }
  }, [draft.selectedLocationId, locations]);

  useEffect(() => {
    if (!draft.selectedPolicyIds.length && policies[0]?.id) {
      setDraft((prev) => ({ ...prev, selectedPolicyIds: [policies[0].id] }));
    }
  }, [draft.selectedPolicyIds.length, policies]);

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setGroupLogoUrl(String(reader.result ?? ''));
    reader.readAsDataURL(file);
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
        tags: [],
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
    <section className="space-y-5 rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
      <div className="text-right">
        <h2 className="text-base font-bold text-white">مرحله 5: ثبت گروه کاری</h2>
        <p className="mt-1 text-sm text-slate-400">عنوان، محل کار، اعضا و سیاست کاری گروه را به ترتیب تکمیل کنید.</p>
      </div>

      <FlowSection title="عنوان و لوگوی گروه کاری" index={1} enabled expanded={activeSection === 1} onToggle={() => setActiveSection(1)} icon={<BriefcaseBusiness className="h-5 w-5" />}>
        <div className="space-y-5 text-right">
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow-inner">
                {groupLogoUrl ? <img src={groupLogoUrl} alt="" className="h-full w-full object-cover" /> : <Users className="h-9 w-9" />}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-500">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
          <label className="space-y-2 block">
            <span className="text-sm font-bold text-white">عنوان گروه کاری <span className="text-rose-400">*</span></span>
            <input
              value={draft.title}
              onChange={(e) => {
                setTitleConfirmed(false);
                setLocationConfirmed(false);
                setMembersConfirmed(false);
                setDraft((prev) => ({ ...prev, title: e.target.value }));
              }}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!draft.title.trim()) return;
                setTitleConfirmed(true);
                setActiveSection(2);
              }}
              disabled={!draft.title.trim()}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection title="انتخاب محل های کار گروه" index={2} enabled={titleConfirmed} expanded={activeSection === 2} onToggle={() => titleConfirmed && setActiveSection(2)} icon={<MapPin className="h-5 w-5" />}>
        <div className="space-y-4">
          {locations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-center text-sm text-amber-300">هنوز محل کاری در راه اندازی سریع ثبت نشده است.</div>
          ) : (
            locations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, selectedLocationId: location.id }))}
                className={cn(
                  'w-full rounded-xl border p-4 text-right transition-colors',
                  draft.selectedLocationId === location.id ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40 hover:border-white/20',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-white">{location.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{location.description}</div>
                    <div className="mt-2 text-xs text-slate-400">شعاع مجاز: {location.radius} متر</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
              </button>
            ))
          )}
          <div className="flex justify-end">
            <button type="button" onClick={() => { if (!draft.selectedLocationId) return; setLocationConfirmed(true); setActiveSection(3); }} disabled={!draft.selectedLocationId} className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection title="افزودن اعضای گروه کاری" index={3} enabled={locationConfirmed} expanded={activeSection === 3} onToggle={() => locationConfirmed && setActiveSection(3)} icon={<Users className="h-5 w-5" />}>
        <div className="space-y-4 text-right">
          <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-black text-white">فهرست کارمندان</div>
                <div className="mt-1 text-sm text-slate-400">کارمندهای موجود را از لیست انتخاب کنید و نقش هر کدام را مشخص کنید.</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input value={draft.employeeSearch} onChange={(e) => setDraft((prev) => ({ ...prev, employeeSearch: e.target.value }))} placeholder="جستجوی کارمند" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500" />
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max flex-nowrap gap-3">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => addEmployee(employee, 'employee')}
                className="group relative flex w-28 flex-none flex-col items-center gap-2 rounded-xl border border-white/10 bg-slate-800/40 p-3 text-right transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="w-full truncate text-center text-xs font-bold text-white">{employee.name}</div>
              </button>
            ))}
            </div>
          </div>

          {draft.selectedEmployees.length ? (
            <div className="space-y-3">
              {draft.selectedEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-bold text-white">{employee.name}</div>
                      <div className="text-xs text-slate-400">{employee.selectedRole === 'employee' ? 'بدون گروه کاری' : employee.selectedRole === 'lead' ? 'سرگروه' : 'مدیر'}</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, selectedEmployees: prev.selectedEmployees.filter((item) => item.id !== employee.id) }))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/30 text-rose-300 transition-colors hover:bg-rose-500/10"
                    aria-label="حذف عضو"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-slate-400">هنوز عضوی به گروه کاری اضافه نشده است.</div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={() => { if (!draft.selectedEmployees.length) return; setMembersConfirmed(true); setActiveSection(4); }} disabled={!draft.selectedEmployees.length} className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection title="انتخاب سیاست کاری گروه" index={4} enabled={membersConfirmed} expanded={activeSection === 4} onToggle={() => membersConfirmed && setActiveSection(4)} icon={<Shield className="h-5 w-5" />}>
        <div className="space-y-4 text-right">
          {policies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">هنوز سیاست کاری ای در راه اندازی سریع ثبت نشده است.</div>
          ) : (
            policies.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    selectedPolicyIds: prev.selectedPolicyIds.includes(policy.id) ? prev.selectedPolicyIds.filter((id) => id !== policy.id) : [...prev.selectedPolicyIds, policy.id],
                  }))
                }
                className={cn(
                  'w-full rounded-xl border p-4 text-right transition-colors',
                  draft.selectedPolicyIds.includes(policy.id) ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40 hover:border-white/20',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{policy.name}</div>
                    <div className="mt-1 text-xs text-slate-400">تقویم: {policy.calendarName} - سال {policy.yearUsed}</div>
                    <div className="mt-1 text-xs text-slate-500">{policy.isActive ? 'سیاست فعال' : 'سیاست غیرفعال'}</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
              </button>
            ))
          )}
          <div className="flex justify-end">
            <button type="button" onClick={save} disabled={!isValid || saving} className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50">
              {saving ? 'در حال ثبت...' : 'تایید و ادامه'}
            </button>
          </div>
        </div>
      </FlowSection>

      <div className="flex items-center justify-between gap-3 pt-2">
        {!saved ? <div className="text-xs text-slate-400">پس از تکمیل بخش ها، گروه کاری را ثبت کنید تا راه اندازی سریع تمام شود.</div> : <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300"><CheckCircle2 className="h-3 w-3" />گروه کاری ذخیره شد</div>}
      </div>
    </section>
  );
}
