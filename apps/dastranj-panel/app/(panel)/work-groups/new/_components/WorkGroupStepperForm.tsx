'use client';

import { AlertTriangle, Camera, Check, Grid3X3, MapPin, Plus, Search, Trash2, UserRound, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createWorkGroupAction } from '../../../../lib/actions';

type LocationOption = {
  id: string;
  title: string;
  description: string;
  radius: number;
};

type EmployeeOption = {
  id: string;
  name: string;
  currentGroupName: string | null;
};

type PolicyOption = {
  id: string;
  title: string;
  description: string;
  calendarTitle: string;
  calendarYearLabel: string;
};

type SelectedEmployee = EmployeeOption & {
  joinedAt: string;
  accessLevel: 'employee' | 'lead' | 'manager';
  transferFromGroup: boolean;
};

const today = new Date().toISOString().slice(0, 10);

const criticalStyles = `
.work-group-create-page.module-page{width:min(100%,1040px);max-width:1040px}
.work-group-create-shell{display:grid!important;gap:18px;min-height:560px;border:1px solid rgba(148,163,184,.12);border-radius:18px;background:rgba(30,41,59,.9);padding:22px 16px}
.work-group-stepper{display:flex!important;flex-direction:row!important;align-items:flex-start;justify-content:center;gap:54px;direction:rtl}
.work-group-step{display:grid!important;justify-items:center;gap:8px;color:#94a3b8;font-size:12px;font-weight:700;border:0;background:transparent;padding:0;cursor:pointer;appearance:none}
.work-group-step span{display:grid!important;place-items:center;width:30px;height:30px;border:1px solid rgba(148,163,184,.55);border-radius:999px}
.work-group-step.is-active span{border-color:#5b50f2;background:#5b50f2;color:#fff}
.work-group-step.is-done span{border-color:#22a76f;background:#22a76f;color:#fff}
.work-group-step.is-active strong,.work-group-step.is-done strong{color:#f8fafc}
.work-group-step:disabled{cursor:not-allowed;opacity:.45}
.work-group-step-divider{height:1px;background:rgba(148,163,184,.16)}
.work-group-step-panel{position:relative;display:grid!important;gap:18px;min-height:430px;align-content:start}
.work-group-logo-picker{position:relative;display:grid;place-items:center;width:86px;margin-inline:auto;color:#94a3b8}
.work-group-logo-picker>svg{width:46px;height:46px}
.work-group-logo-picker span{position:absolute;bottom:-8px;right:17px;display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#5b50f2;color:#fff}
.work-group-field{display:grid!important;gap:8px;color:#f8fafc;font-size:13px;font-weight:800}
.work-group-field b{color:#f43f5e}
.work-group-field input,.work-group-field textarea,.work-group-tag-row input,.work-group-step-search input,.work-group-modal input{width:100%;border:1px solid rgba(148,163,184,.32);border-radius:10px;background:rgba(15,23,42,.42);color:#f8fafc;padding:0 14px;outline:none}
.work-group-field input,.work-group-tag-row input,.work-group-modal input{min-height:38px}
.work-group-field textarea{min-height:76px;padding-block:12px}
.work-group-field small{color:#94a3b8;font-size:11px;font-weight:500;text-align:left}
.work-group-tag-row{display:grid!important;grid-template-columns:92px minmax(0,1fr);gap:8px}
.work-group-tag-row button,.work-group-step-next{display:inline-flex!important;align-items:center;justify-content:center;gap:6px;min-height:34px;border:0;border-radius:999px;background:#5b50f2;color:#fff;padding:0 16px;font-size:12px;font-weight:800}
.work-group-tag-row button{border:1px solid rgba(91,80,242,.8);background:rgba(91,80,242,.12);color:#8b80ff}
.work-group-step-next{align-self:end;justify-self:end}
.work-group-step-next:disabled{cursor:not-allowed;opacity:.45}
`;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Stepper({
  step,
  completedSteps,
  onStepClick,
}: {
  step: number;
  completedSteps: number[];
  onStepClick: (target: number) => void;
}) {
  const steps = [
    { index: 1, label: 'اطلاعات پایه' },
    { index: 2, label: 'محل های کار' },
    { index: 3, label: 'کارمندان' },
    { index: 4, label: 'سیاست های کاری' },
  ];
  const accessibleUntil = Math.min(4, completedSteps.length + 1);

  return (
    <div className="work-group-stepper">
      {steps.map((item) => {
        const disabled = item.index > accessibleUntil && !completedSteps.includes(item.index);
        return (
          <button
            key={item.index}
            type="button"
            className={cn('work-group-step', item.index === step && 'is-active', completedSteps.includes(item.index) && 'is-done', disabled && 'is-locked')}
            disabled={disabled}
            onClick={() => onStepClick(item.index)}
          >
            <span>{item.index.toLocaleString('fa-IR')}</span>
            <strong>{item.label}</strong>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="work-group-step-search">
      <Search />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function ConfirmEmployeeDialog({
  employee,
  onCancel,
  onConfirm,
}: {
  employee: EmployeeOption;
  onCancel: () => void;
  onConfirm: (date: string) => void;
}) {
  const [date, setDate] = useState(today);

  return (
    <div className="work-group-modal-backdrop">
      <div className="work-group-modal" dir="rtl">
        <h3>افزودن {employee.name}</h3>
        {employee.currentGroupName ? (
          <div className="work-group-modal-warning">
            <AlertTriangle />
            <span>
              این کارمند در حال حاضر عضو «{employee.currentGroupName}» است. با افزودن در زمان انتخاب‌شده، از گروه قبلی خارج می‌شود و
              سیاست کاری این گروه برای او اعمال می‌شود.
            </span>
          </div>
        ) : null}
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <div className="work-group-modal-presets">
          <button type="button" className="is-active" onClick={() => setDate(today)}>
            امروز
            <Check />
          </button>
          <button type="button" onClick={() => setDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`)}>
            شروع ماه
          </button>
          <button type="button" onClick={() => setDate(`${new Date().getFullYear()}-01-01`)}>
            شروع سال
          </button>
        </div>
        <div className="work-group-modal-actions">
          <button type="button" className="work-group-modal-submit" onClick={() => onConfirm(date)}>
            تایید و افزودن
          </button>
          <button type="button" className="work-group-modal-cancel" onClick={onCancel}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkGroupStepperForm({
  locations,
  employees,
  policies,
}: {
  locations: LocationOption[];
  employees: EmployeeOption[];
  policies: PolicyOption[];
}) {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [locationId, setLocationId] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeSearch, setSelectedEmployeeSearch] = useState('');
  const [policySearch, setPolicySearch] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState<EmployeeOption | null>(null);

  const availableEmployees = useMemo(() => {
    const selectedIds = new Set(selectedEmployees.map((item) => item.id));
    const query = employeeSearch.trim();
    return employees
      .filter((item) => !selectedIds.has(item.id))
      .filter((item) => !query || item.name.includes(query) || (item.currentGroupName ?? '').includes(query));
  }, [employeeSearch, employees, selectedEmployees]);

  const visibleSelectedEmployees = useMemo(() => {
    const query = selectedEmployeeSearch.trim();
    return selectedEmployees.filter((item) => !query || item.name.includes(query));
  }, [selectedEmployeeSearch, selectedEmployees]);

  const visiblePolicies = useMemo(() => {
    const query = policySearch.trim();
    return policies.filter((item) => !query || item.title.includes(query) || item.calendarTitle.includes(query));
  }, [policies, policySearch]);

  const selectedPolicy = policies.find((item) => item.id === selectedPolicyId) ?? null;
  const accessibleUntil = Math.min(4, completedSteps.length + 1);

  const addTag = () => {
    const next = tagInput.trim();
    if (!next || tags.includes(next)) return;
    setTags((current) => [...current, next]);
    setTagInput('');
  };

  const addEmployee = (employee: EmployeeOption, joinedAt: string) => {
    setSelectedEmployees((current) => {
      if (current.some((item) => item.id === employee.id)) return current;
      return [
        ...current,
        {
          ...employee,
          joinedAt,
          accessLevel: 'employee',
          transferFromGroup: Boolean(employee.currentGroupName),
        },
      ];
    });
    setPendingEmployee(null);
  };

  const requestEmployee = (employee: EmployeeOption) => setPendingEmployee(employee);

  const markStepCompleted = (targetStep: number) => {
    setCompletedSteps((current) => (current.includes(targetStep) ? current : [...current, targetStep].sort((a, b) => a - b)));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep <= accessibleUntil || completedSteps.includes(targetStep)) setStep(targetStep);
  };

  const canContinueBase = title.trim().length > 0;
  const canContinueLocation = Boolean(locationId);
  const canContinueEmployees = selectedEmployees.length > 0;
  const canSubmit = canContinueBase && canContinueLocation && canContinueEmployees && Boolean(selectedPolicyId);

  return (
    <form action={createWorkGroupAction} className="work-group-create-shell" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      <input type="hidden" name="title" value={title} readOnly />
      <input type="hidden" name="description" value={description} readOnly />
      <input type="hidden" name="tags" value={tags.join(',')} readOnly />
      <input type="hidden" name="locationId" value={locationId} readOnly />
      <input type="hidden" name="policyId" value={selectedPolicyId} readOnly />
      {selectedEmployees.map((employee) => (
        <div key={employee.id} hidden>
          <input name="employeeIds" value={employee.id} readOnly />
          <input name={`accessLevel:${employee.id}`} value={employee.accessLevel} readOnly />
          <input name={`joinedAt:${employee.id}`} value={employee.joinedAt} readOnly />
          {employee.transferFromGroup ? <input name="transferEmployeeIds" value={employee.id} readOnly /> : null}
        </div>
      ))}

      <Stepper step={step} completedSteps={completedSteps} onStepClick={goToStep} />

      <div className="work-group-step-divider" />

      {step === 1 ? (
        <section className="work-group-step-panel">
          <div className="work-group-logo-picker">
            <UsersRound />
            <span>
              <Camera />
            </span>
          </div>
          <label className="work-group-field">
            <span>عنوان <b>*</b></span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="گروه اداری" />
            <small>عنوان گروه کاری را وارد کنید</small>
          </label>
          <label className="work-group-field">
            <span>توضیحات</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            <small>توضیحات کوتاه برای گروه کاری</small>
          </label>
          <label className="work-group-field">
            <span>تگ‌ها</span>
            <div className="work-group-tag-row" dir="rtl">
              <input
                dir="rtl"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag())}
                placeholder="افزودن تگ جدید"
              />
              <button type="button" onClick={addTag}>
                <Plus />
                افزودن
              </button>
            </div>
          </label>
          <div className="work-group-tag-list">
            {tags.map((tag) => (
              <button key={tag} type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))}>
                {tag}
                <Check />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="work-group-step-next"
            disabled={!canContinueBase}
            onClick={() => {
              markStepCompleted(1);
              setStep(2);
            }}
          >
            تایید و ادامه
            <Check />
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="work-group-step-panel">
          <h2>محل‌های کار گروه</h2>
          <div className="work-group-location-grid">
            {locations.map((location) => (
              <button key={location.id} type="button" className={cn('work-group-location-card', locationId === location.id && 'is-selected')} onClick={() => setLocationId(location.id)}>
                <strong>عنوان: {location.title}</strong>
                <span>توضیحات: {location.description || 'ثبت نشده است'}</span>
                <span>شعاع مجاز: {location.radius}</span>
                <MapPin />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="work-group-step-next"
            disabled={!canContinueLocation}
            onClick={() => {
              markStepCompleted(2);
              setStep(3);
            }}
          >
            تایید و ادامه
            <Check />
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="work-group-step-panel">
          <div className="work-group-dual-board">
            <div className="work-group-board">
              <h2>گروه‌های کاری</h2>
              <div className="work-group-board-tabs">
                <span>گروه اداری ({selectedEmployees.length.toLocaleString('fa-IR')})</span>
                <span>کارمندان ({availableEmployees.length.toLocaleString('fa-IR')})</span>
              </div>
              <h3>کارمندان</h3>
              <SearchBox value={employeeSearch} onChange={setEmployeeSearch} placeholder="جستجو در کارمندان" />
              <div
                className="work-group-person-list"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const employee = employees.find((item) => item.id === event.dataTransfer.getData('text/plain'));
                  if (employee) requestEmployee(employee);
                }}
              >
                {availableEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    className="work-group-person-card"
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData('text/plain', employee.id)}
                    onClick={() => requestEmployee(employee)}
                  >
                    <Plus />
                    <div>
                      <strong>{employee.name}</strong>
                      <span>{employee.currentGroupName ? `عضو ${employee.currentGroupName}` : 'بدون گروه کاری'}</span>
                    </div>
                    <UserRound />
                  </button>
                ))}
              </div>
            </div>

            <div
              className="work-group-board"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const employee = employees.find((item) => item.id === event.dataTransfer.getData('text/plain'));
                if (employee) requestEmployee(employee);
              }}
            >
              <h2>کارمندان انتخاب‌شده</h2>
              <SearchBox value={selectedEmployeeSearch} onChange={setSelectedEmployeeSearch} placeholder="جستجو در کارمندان" />
              {visibleSelectedEmployees.length ? (
                visibleSelectedEmployees.map((employee) => (
                  <div key={employee.id} className="work-group-selected-person-card">
                    <button type="button" onClick={() => setSelectedEmployees((current) => current.filter((item) => item.id !== employee.id))}>
                      <Trash2 />
                    </button>
                    <select value={employee.accessLevel} onChange={(event) => setSelectedEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, accessLevel: event.target.value as SelectedEmployee['accessLevel'] } : item))}>
                      <option value="employee">کارمند</option>
                      <option value="lead">سرگروه</option>
                      <option value="manager">مدیر</option>
                    </select>
                    <div>
                      <strong>{employee.name}</strong>
                      <span>تاریخ عضویت: {employee.joinedAt}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="work-group-board-empty">کارمندی برای این گروه کاری انتخاب نکرده‌اید.</div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="work-group-step-next"
            disabled={!canContinueEmployees}
            onClick={() => {
              markStepCompleted(3);
              setStep(4);
            }}
          >
            تایید و ادامه
            <Check />
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="work-group-step-panel">
          <div className="work-group-dual-board">
            <div className="work-group-board">
              <h2>همه سیاست‌های کاری</h2>
              <SearchBox value={policySearch} onChange={setPolicySearch} placeholder="جستجو در سیاست‌های کاری" />
              <div className="work-group-policy-filters">
                <span>سال قبل</span>
                <span>امسال</span>
                <span>سال بعد</span>
              </div>
              <div className="work-group-person-list">
                {visiblePolicies.map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    className="work-group-policy-card"
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData('text/plain', policy.id)}
                    onClick={() => setSelectedPolicyId(policy.id)}
                  >
                    <Plus />
                    <div>
                      <strong>{policy.title}</strong>
                      <span>سال کاری: {policy.calendarYearLabel || 'نامشخص'}</span>
                      <span>توضیحات: {policy.description || 'ثبت نشده است'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div
              className="work-group-board"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => setSelectedPolicyId(event.dataTransfer.getData('text/plain'))}
            >
              <h2>سیاست‌های انتخاب‌شده</h2>
              <SearchBox value="" onChange={() => undefined} placeholder="جستجو در سیاست‌های کاری" />
              {selectedPolicy ? (
                <div className="work-group-policy-card is-selected">
                  <button type="button" onClick={() => setSelectedPolicyId('')}>
                    <Trash2 />
                  </button>
                  <div>
                    <strong>{selectedPolicy.title}</strong>
                    <span>سال کاری: {selectedPolicy.calendarYearLabel || 'نامشخص'}</span>
                    <span>توضیحات: {selectedPolicy.description || 'ثبت نشده است'}</span>
                  </div>
                </div>
              ) : (
                <div className="work-group-board-empty">هنوز سیاستی انتخاب نشده است.</div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="work-group-step-next"
            disabled={!canSubmit}
            onClick={() => {
              markStepCompleted(4);
            }}
          >
            ثبت نهایی
            <Grid3X3 />
          </button>
        </section>
      ) : null}

      {pendingEmployee ? (
        <ConfirmEmployeeDialog
          employee={pendingEmployee}
          onCancel={() => setPendingEmployee(null)}
          onConfirm={(date) => addEmployee(pendingEmployee, date)}
        />
      ) : null}
    </form>
  );
}

