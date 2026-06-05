'use client';

import { BriefcaseBusiness, Camera, CheckCircle2, MapPin, Shield, Users, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { createWorkGroupFromQuickSetupAction } from '../../../lib/actions';
import type { QuickWorkGroupDraft, QuickWorkGroupSummary } from './quick-setup.types';

type LocationOption = { id: string; name: string; description: string; radius: number };
type EmployeeOption = { id: string; name: string; contactValue: string };
type PolicyOption = { id: string; name: string; description?: string; calendarName: string; isActive: boolean; yearUsed: string; isDefault?: boolean };
type SelectedEmployee = { id: string; name: string; selectedRole: 'employee' | 'lead' | 'manager' };

type Draft = QuickWorkGroupDraft;

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
  draft,
  initialSection = 1,
  onDraftChange,
  onGoToPolicyStep,
  onGoToLocationStep,
  onBack,
  onSave,
}: {
  initialWorkGroup: QuickWorkGroupSummary | null;
  locations: LocationOption[];
  employees: EmployeeOption[];
  policies: PolicyOption[];
  draft: Draft;
  initialSection?: 1 | 2 | 3 | 4;
  onDraftChange: (draft: Draft) => void;
  onGoToPolicyStep: () => void;
  onGoToLocationStep: () => void;
  onBack: () => void;
  onSave: (workGroup: QuickWorkGroupSummary) => void;
}) {
  const [saved, setSaved] = useState(Boolean(initialWorkGroup));
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4>(initialSection);
  const [section1Complete, setSection1Complete] = useState(Boolean(initialWorkGroup));
  const [section2Complete, setSection2Complete] = useState(Boolean(initialWorkGroup));
  const [section3Complete, setSection3Complete] = useState(Boolean(initialWorkGroup));
  const [section4Complete, setSection4Complete] = useState(Boolean(initialWorkGroup));
  const [errors, setErrors] = useState<{ title?: string; policy?: string; location?: string; members?: string; save?: string }>({});

  const filteredEmployees = useMemo(() => {
    const q = draft.employeeSearch.trim();
    const selectedIds = new Set(draft.selectedEmployees.map((item) => item.id));
    const pool = employees.filter((item) => !selectedIds.has(item.id));
    if (!q) return pool;
    return pool.filter((item) => item.name.includes(q) || item.contactValue.includes(q));
  }, [draft.employeeSearch, draft.selectedEmployees, employees]);
  const selectedPolicy = useMemo(() => policies.find((item) => item.id === draft.selectedPolicyIds[0]) ?? null, [draft.selectedPolicyIds, policies]);
  const selectedLocation = useMemo(() => locations.find((item) => item.id === draft.selectedLocationId) ?? null, [draft.selectedLocationId, locations]);
  const isValid = draft.title.trim().length > 0 && Boolean(selectedLocation) && Boolean(selectedPolicy) && draft.selectedEmployees.length > 0;
  const canSave = isValid && !saving;

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onDraftChange({ ...draft, logoUrl: String(reader.result ?? '') });
      setSaved(false);
      setErrors((prev) => ({ ...prev, save: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const addEmployee = (employee: EmployeeOption, selectedRole: SelectedEmployee['selectedRole']) => {
    if (draft.selectedEmployees.some((item) => item.id === employee.id)) return;
    onDraftChange({ ...draft, selectedEmployees: [...draft.selectedEmployees, { id: employee.id, name: employee.name, selectedRole }] });
    setSaved(false);
    setErrors((prev) => ({ ...prev, members: undefined, save: undefined }));
  };

  const updateDraft = (patch: Partial<Draft>) => {
    onDraftChange({ ...draft, ...patch });
    setSaved(false);
    setErrors((prev) => ({
      ...prev,
      save: undefined,
      ...(patch.title !== undefined ? { title: undefined } : {}),
      ...(patch.selectedPolicyIds !== undefined ? { policy: undefined } : {}),
      ...(patch.selectedLocationId !== undefined ? { location: undefined } : {}),
      ...(patch.selectedEmployees !== undefined ? { members: undefined } : {}),
    }));
    if (patch.title !== undefined) {
      setSection1Complete(false);
      setSection2Complete(false);
      setSection3Complete(false);
      setSection4Complete(false);
    } else if (patch.selectedPolicyIds !== undefined) {
      setSection2Complete(false);
      setSection3Complete(false);
      setSection4Complete(false);
    } else if (patch.selectedLocationId !== undefined) {
      setSection3Complete(false);
      setSection4Complete(false);
    } else if (patch.selectedEmployees !== undefined) {
      setSection4Complete(false);
    }
  };

  const validateSection = (section: 1 | 2 | 3 | 4) => {
    if (section === 1) {
      if (!draft.title.trim()) {
        setErrors((prev) => ({ ...prev, title: 'عنوان گروه کاری را وارد کنید.' }));
        return false;
      }
      return true;
    }
    if (section === 2) {
      if (!draft.selectedPolicyIds.length) {
        setErrors((prev) => ({ ...prev, policy: 'سیاست کاری این گروه را انتخاب کنید.' }));
        return false;
      }
      return true;
    }
    if (section === 3) {
      if (!draft.selectedLocationId) {
        setErrors((prev) => ({ ...prev, location: 'حداقل یک محل کار برای این گروه انتخاب کنید.' }));
        return false;
      }
      return true;
    }
    if (!draft.selectedEmployees.length) {
      setErrors((prev) => ({ ...prev, members: 'حداقل یک عضو برای گروه اضافه کنید.' }));
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!section1Complete || !section2Complete || !section3Complete || !section4Complete || !isValid) {
      if (!section1Complete) validateSection(1);
      if (!section2Complete) validateSection(2);
      if (!section3Complete) validateSection(3);
      if (!section4Complete) validateSection(4);
      return;
    }
    setSaving(true);
    setErrors((prev) => ({ ...prev, save: undefined }));
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
    } catch {
      setErrors((prev) => ({ ...prev, save: 'گروه کاری ذخیره نشد. دوباره تلاش کنید.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5 rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-5" dir="rtl">
      <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-indigo-300" />
          مرحله ۵ از ۵ — گروه‌های کاری
        </div>
        <h2 className="mt-3 text-xl font-black text-white">تعریف گروه کاری</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
          برای شروع استفاده از دستانژ، یک گروه کاری بسازید و محل کار، اعضا و سیاست کاری آن را مشخص کنید. هر گروه کاری می‌تواند محل، اعضا و سیاست کاری مخصوص خود را داشته باشد.
        </p>
        <p className="mt-3 text-xs leading-6 text-slate-400">گروه کاری، محل کار و سیاست را به‌ترتیب تکمیل کنید و در پایان راه‌اندازی سریع را تمام کنید.</p>
      </div>

      <FlowSection
        title="اطلاعات پایه گروه کاری"
        index={1}
        enabled
        expanded={activeSection === 1}
        onToggle={() => setActiveSection(1)}
        icon={<BriefcaseBusiness className="h-5 w-5" />}
      >
        <div className="space-y-5 text-right">
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow-inner">
                {draft.logoUrl ? <img src={draft.logoUrl} alt="" className="h-full w-full object-cover" /> : <Users className="h-9 w-9" />}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-500">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-white">
              عنوان گروه کاری <span className="text-rose-400">*</span>
            </span>
            <input
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="مثلاً تیم اداری، فروشگاه مرکزی یا برنامه‌نویسان فرانت‌اند"
              className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-400"
            />
            <div className="text-xs leading-6 text-slate-400">نامی برای گروه وارد کنید؛ این نام بعداً در مدیریت گروه‌ها قابل ویرایش است.</div>
            {errors.title ? <div className="text-xs font-bold text-rose-300">{errors.title}</div> : null}
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!validateSection(1)) return;
                setSection1Complete(true);
                setActiveSection(2);
              }}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection
        title="سیاست کاری گروه"
        index={2}
        enabled={section1Complete}
        expanded={activeSection === 2}
        onToggle={() => section1Complete && setActiveSection(2)}
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="space-y-4 text-right">
          <p className="text-sm leading-7 text-slate-300">
            سیاست کاری مشخص می‌کند تردد، مرخصی، اضافه‌کاری و درخواست‌های این گروه چگونه مدیریت شوند.
          </p>

          {policies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">
              هنوز سیاست کاری تعریف نشده است. ابتدا سیاست کاری را انتخاب یا تعریف کنید.
            </div>
          ) : (
            <div className="grid gap-3">
              {policies.map((policy) => {
                const selected = draft.selectedPolicyIds.includes(policy.id);
                return (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => updateDraft({ selectedPolicyIds: [policy.id] })}
                    className={cn(
                      'w-full rounded-xl border p-4 text-right transition-colors',
                      selected ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40 hover:border-white/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="font-bold text-white">{policy.name}</div>
                        <div className="text-xs text-slate-400">{policy.description || 'توضیحات ثبت نشده است'}</div>
                        <div className="text-xs text-slate-400">
                          تقویم: {policy.calendarName} | سال کاری: {policy.yearUsed}
                        </div>
                      </div>
                      {selected ? <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200"><CheckCircle2 className="h-5 w-5" /></div> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200"><Shield className="h-5 w-5" /></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {errors.policy ? <div className="text-xs font-bold text-rose-300">{errors.policy}</div> : null}

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={onGoToPolicyStep}
              className="rounded-full border border-indigo-400/40 px-4 py-2.5 text-sm font-bold text-indigo-100 transition-colors hover:bg-indigo-500/10"
            >
              تعریف سیاست کاری
            </button>
            <button
              type="button"
              onClick={() => {
                if (!validateSection(2)) return;
                setSection2Complete(true);
                setActiveSection(3);
              }}
              disabled={!section1Complete}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection
        title="محل کار گروه"
        index={3}
        enabled={section2Complete}
        expanded={activeSection === 3}
        onToggle={() => section2Complete && setActiveSection(3)}
        icon={<MapPin className="h-5 w-5" />}
      >
        <div className="space-y-4 text-right">
          <p className="text-sm leading-7 text-slate-300">
            محلی را انتخاب کنید که اعضای این گروه در آن فعالیت می‌کنند. ثبت تردد اعضای گروه بر اساس محل(های) مجاز انجام می‌شود.
          </p>

          {locations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">
              هنوز محل کاری تعریف نشده است. ابتدا محل کار را اضافه کنید.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {locations.map((location) => {
                const selected = draft.selectedLocationId === location.id;
                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => updateDraft({ selectedLocationId: location.id })}
                    className={cn(
                      'rounded-xl border p-4 text-right transition-colors',
                      selected ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40 hover:border-white/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="font-bold text-white">{location.name}</div>
                        <div className="text-xs text-slate-400">{location.description}</div>
                        <div className="text-xs text-slate-400">شعاع مجاز: {location.radius} متر</div>
                      </div>
                      {selected ? <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200"><CheckCircle2 className="h-5 w-5" /></div> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200"><MapPin className="h-5 w-5" /></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {errors.location ? <div className="text-xs font-bold text-rose-300">{errors.location}</div> : null}

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={onGoToLocationStep}
              className="rounded-full border border-indigo-400/40 px-4 py-2.5 text-sm font-bold text-indigo-100 transition-colors hover:bg-indigo-500/10"
            >
              افزودن محل کار
            </button>
            <button
              type="button"
              onClick={() => {
                if (!validateSection(3)) return;
                setSection3Complete(true);
                setActiveSection(4);
              }}
              disabled={!section2Complete}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      <FlowSection
        title="اعضای گروه کاری"
        index={4}
        enabled={section3Complete}
        expanded={activeSection === 4}
        onToggle={() => section3Complete && setActiveSection(4)}
        icon={<Users className="h-5 w-5" />}
      >
        <div className="space-y-4 text-right">
          <div className="rounded-xl border border-white/10 bg-slate-900/45 p-4">
            <div>
              <div className="text-base font-black text-white">فهرست کارمندان</div>
              <div className="mt-1 text-sm text-slate-400">کارمندهای موجود را انتخاب کنید و به گروه کاری اضافه کنید.</div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={draft.employeeSearch}
                onChange={(e) => updateDraft({ employeeSearch: e.target.value })}
                placeholder="جستجوی کارمند"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <MinimalScroll variant="horizontal" className="pb-2">
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
          </MinimalScroll>

          {draft.selectedEmployees.length ? (
            <div className="space-y-3">
              {draft.selectedEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-bold text-white">{employee.name}</div>
                      <div className="text-xs text-slate-400">
                        {employee.selectedRole === 'employee' ? 'عضو گروه' : employee.selectedRole === 'lead' ? 'سرگروه' : 'مدیر'}
                      </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateDraft({ selectedEmployees: draft.selectedEmployees.filter((item) => item.id !== employee.id) })}
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

          {errors.members ? <div className="text-xs font-bold text-rose-300">{errors.members}</div> : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!validateSection(4)) return;
                setSection4Complete(true);
              }}
              disabled={!section3Complete || !draft.selectedEmployees.length}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      </FlowSection>

      {errors.save ? <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-right text-sm text-rose-100">{errors.save}</div> : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
        <div className="text-xs leading-6 text-slate-400">
          این مرحله آخر است. پس از ثبت گروه کاری، راه‌اندازی سریع کامل می‌شود و می‌توانید بعداً از بخش مدیریت گروه‌ها آن را ویرایش کنید.
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
          >
            مرحله قبل
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canSave || !section1Complete || !section2Complete || !section3Complete || !section4Complete}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'در حال ثبت...' : 'ثبت گروه کاری و اتمام راه‌اندازی'}
          </button>
        </div>
      </div>

      {saved ? (
        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          گروه کاری ذخیره شد
        </div>
      ) : null}
    </section>
  );
}
