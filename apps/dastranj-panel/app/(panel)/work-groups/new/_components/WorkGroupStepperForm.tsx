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
        <h3>Ø§ÙØ²ÙˆØ¯Ù† {employee.name}</h3>
        {employee.currentGroupName ? (
          <div className="work-group-modal-warning">
            <AlertTriangle />
            <span>
              Ø§ÛŒÙ† Ú©Ø§Ø±Ù…Ù†Ø¯ Ø¯Ø± Ø­Ø§Ù„ Ø­Ø§Ø¶Ø± Ø¹Ø¶Ùˆ Â«{employee.currentGroupName}Â» Ø§Ø³Øª. Ø¨Ø§ Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø± Ø²Ù…Ø§Ù† Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ØŒ Ø§Ø² Ú¯Ø±ÙˆÙ‡ Ù‚Ø¨Ù„ÛŒ Ø®Ø§Ø±Ø¬ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ
              Ø³ÛŒØ§Ø³Øª Ú©Ø§Ø±ÛŒ Ø§ÛŒÙ† Ú¯Ø±ÙˆÙ‡ Ø¨Ø±Ø§ÛŒ Ø§Ùˆ Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
            </span>
          </div>
        ) : null}
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <div className="work-group-modal-presets">
          <button type="button" className="is-active" onClick={() => setDate(today)}>
            Ø§Ù…Ø±ÙˆØ²
            <Check />
          </button>
          <button type="button" onClick={() => setDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`)}>
            Ø´Ø±ÙˆØ¹ Ù…Ø§Ù‡
          </button>
          <button type="button" onClick={() => setDate(`${new Date().getFullYear()}-01-01`)}>
            Ø´Ø±ÙˆØ¹ Ø³Ø§Ù„
          </button>
        </div>
        <div className="work-group-modal-actions">
          <button type="button" className="work-group-modal-submit" onClick={() => onConfirm(date)}>
            ØªØ§ÛŒÛŒØ¯ Ùˆ Ø§ÙØ²ÙˆØ¯Ù†
          </button>
          <button type="button" className="work-group-modal-cancel" onClick={onCancel}>
            Ø§Ù†ØµØ±Ø§Ù
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
            <span>Ø¹Ù†ÙˆØ§Ù† <b>*</b></span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ú¯Ø±ÙˆÙ‡ Ø§Ø¯Ø§Ø±ÛŒ" />
            <small>Ø¹Ù†ÙˆØ§Ù† Ú¯Ø±ÙˆÙ‡ Ú©Ø§Ø±ÛŒ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯</small>
          </label>
          <label className="work-group-field">
            <span>ØªÙˆØ¶ÛŒØ­Ø§Øª</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            <small>ØªÙˆØ¶ÛŒØ­Ø§Øª Ú©ÙˆØªØ§Ù‡ Ø¨Ø±Ø§ÛŒ Ú¯Ø±ÙˆÙ‡ Ú©Ø§Ø±ÛŒ</small>
          </label>
          <label className="work-group-field">
            <span>ØªÚ¯ Ù‡Ø§</span>
            <div className="work-group-tag-row" dir="rtl">
              <input
                dir="rtl"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag())}
                placeholder="Ø§ÙØ²ÙˆØ¯Ù† ØªÚ¯ Ø¬Ø¯ÛŒØ¯"
              />
              <button type="button" onClick={addTag}>
                <Plus />
                Ø§ÙØ²ÙˆØ¯Ù†
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
            ØªØ§ÛŒÛŒØ¯ Ùˆ Ø§Ø¯Ø§Ù…Ù‡
            <Check />
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="work-group-step-panel">
          <h2>Ù…Ø­Ù„ Ù‡Ø§ÛŒ Ú©Ø§Ø± Ú¯Ø±ÙˆÙ‡</h2>
          <div className="work-group-location-grid">
            {locations.map((location) => (
              <button key={location.id} type="button" className={cn('work-group-location-card', locationId === location.id && 'is-selected')} onClick={() => setLocationId(location.id)}>
                <strong>Ø¹Ù†ÙˆØ§Ù†: {location.title}</strong>
                <span>ØªÙˆØ¶ÛŒØ­Ø§Øª: {location.description || 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª'}</span>
                <span>Ø´Ø¹Ø§Ø¹ Ù…Ø¬Ø§Ø²: {location.radius}</span>
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
            ØªØ§ÛŒÛŒØ¯ Ùˆ Ø§Ø¯Ø§Ù…Ù‡
            <Check />
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="work-group-step-panel">
          <div className="work-group-dual-board">
            <div className="work-group-board">
              <h2>Ú¯Ø±ÙˆÙ‡ Ù‡Ø§ÛŒ Ú©Ø§Ø±ÛŒ</h2>
              <div className="work-group-board-tabs">
                <span>Ú¯Ø±ÙˆÙ‡ Ø§Ø¯Ø§Ø±ÛŒ ({selectedEmployees.length.toLocaleString('fa-IR')})</span>
                <span>Ú©Ø§Ø±Ù…Ù†Ø¯Ø§Ù† ({availableEmployees.length.toLocaleString('fa-IR')})</span>
              </div>
              <h3>Ú©Ø§Ø±Ù…Ù†Ø¯Ø§Ù†</h3>
              <SearchBox value={employeeSearch} onChange={setEmployeeSearch} placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ú©Ø§Ø±Ù…Ù†Ø¯Ø§Ù†" />
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
                      <span>{employee.currentGroupName ? `Ø¹Ø¶Ùˆ ${employee.currentGroupName}` : 'Ø¨Ø¯ÙˆÙ† Ú¯Ø±ÙˆÙ‡ Ú©Ø§Ø±ÛŒ'}</span>
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
              <h2>Ú©Ø§Ø±Ù…Ù†Ø¯Ø§Ù† Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ù‡</h2>
              <SearchBox value={selectedEmployeeSearch} onChange={setSelectedEmployeeSearch} placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ú©Ø§Ø±Ù…Ù†Ø¯Ø§Ù†" />
              {visibleSelectedEmployees.length ? (
                visibleSelectedEmployees.map((employee) => (
                  <div key={employee.id} className="work-group-selected-person-card">
                    <button type="button" onClick={() => setSelectedEmployees((current) => current.filter((item) => item.id !== employee.id))}>
                      <Trash2 />
                    </button>
                    <select value={employee.accessLevel} onChange={(event) => setSelectedEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, accessLevel: event.target.value as SelectedEmployee['accessLevel'] } : item))}>
                      <option value="employee">Ú©Ø§Ø±Ù…Ù†Ø¯</option>
                      <option value="lead">Ø³Ø±Ú¯Ø±ÙˆÙ‡</option>
                      <option value="manager">Ù…Ø¯ÛŒØ±</option>
                    </select>
                    <div>
                      <strong>{employee.name}</strong>
                      <span>ØªØ§Ø±ÛŒØ® Ø¹Ø¶ÙˆÛŒØª: {employee.joinedAt}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="work-group-board-empty">Ú©Ø§Ø±Ù…Ù†Ø¯ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ú¯Ø±ÙˆÙ‡ Ú©Ø§Ø±ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ù†Ú©Ø±Ø¯Ù‡ Ø§ÛŒØ¯.</div>
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
            ØªØ§ÛŒÛŒØ¯ Ùˆ Ø§Ø¯Ø§Ù…Ù‡
            <Check />
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="work-group-step-panel">
          <div className="work-group-dual-board">
            <div className="work-group-board">
              <h2>Ù‡Ù…Ù‡ Ø³ÛŒØ§Ø³Øª Ù‡Ø§ÛŒ Ú©Ø§Ø±ÛŒ</h2>
              <SearchBox value={policySearch} onChange={setPolicySearch} placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ø³ÛŒØ§Ø³Øª Ù‡Ø§ÛŒ Ú©Ø§Ø±ÛŒ" />
              <div className="work-group-policy-filters">
                <span>Ø³Ø§Ù„ Ù‚Ø¨Ù„</span>
                <span>Ø§Ù…Ø³Ø§Ù„</span>
                <span>Ø³Ø§Ù„ Ø¨Ø¹Ø¯</span>
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
                      <span>Ø³Ø§Ù„ Ú©Ø§Ø±ÛŒ: {policy.calendarYearLabel || 'Ù†Ø§Ù…Ø´Ø®Øµ'}</span>
                      <span>ØªÙˆØ¶ÛŒØ­Ø§Øª: {policy.description || 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª'}</span>
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
              <h2>Ø³ÛŒØ§Ø³Øª Ù‡Ø§ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ù‡</h2>
              <SearchBox value="" onChange={() => undefined} placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ø³ÛŒØ§Ø³Øª Ù‡Ø§ÛŒ Ú©Ø§Ø±ÛŒ" />
              {selectedPolicy ? (
                <div className="work-group-policy-card is-selected">
                  <button type="button" onClick={() => setSelectedPolicyId('')}>
                    <Trash2 />
                  </button>
                  <div>
                    <strong>{selectedPolicy.title}</strong>
                    <span>Ø³Ø§Ù„ Ú©Ø§Ø±ÛŒ: {selectedPolicy.calendarYearLabel || 'Ù†Ø§Ù…Ø´Ø®Øµ'}</span>
                    <span>ØªÙˆØ¶ÛŒØ­Ø§Øª: {selectedPolicy.description || 'Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª'}</span>
                  </div>
                </div>
              ) : (
                <div className="work-group-board-empty">Ù‡Ù†ÙˆØ² Ø³ÛŒØ§Ø³ØªÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.</div>
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
            Ø«Ø¨Øª Ù†Ù‡Ø§ÛŒÛŒ
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

