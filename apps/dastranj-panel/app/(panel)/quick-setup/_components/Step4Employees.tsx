'use client';

import { FileSpreadsheet, Pencil, Plus, Trash2, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createEmployeeFromQuickSetupAction, deleteEmployeeFromQuickSetupAction } from '../../../lib/actions';
import type { QuickEmployeeSummary } from './quick-setup.types';

type Step4EmployeesProps = {
  employees: QuickEmployeeSummary[];
  onChange: (employees: QuickEmployeeSummary[]) => void;
};

function parseContactInput(value: string): { isValid: boolean; type?: 'phone' | 'email'; normalizedValue?: string; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: false };
  if (trimmed.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      ? { isValid: true, type: 'email', normalizedValue: trimmed }
      : { isValid: false, error: 'ایمیل معتبر نیست.' };
  }
  const normalized = trimmed.replace(/\D/g, '');
  return normalized.length >= 10 ? { isValid: true, type: 'phone', normalizedValue: trimmed } : { isValid: false, error: 'شماره موبایل معتبر نیست.' };
}

function isNationalIdValid(value: string) {
  return /^\d{10}$/.test(value.trim());
}

function EmployeeDialog({
  open,
  onClose,
  initialEmployee,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialEmployee?: QuickEmployeeSummary | null;
  onSubmit: (employee: QuickEmployeeSummary) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [contactInput, setContactInput] = useState(initialEmployee?.contact.value ?? '');
  const [firstName, setFirstName] = useState(initialEmployee?.firstName ?? '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName ?? '');
  const [nationalId, setNationalId] = useState(initialEmployee?.nationalId ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initialEmployee?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);
  const parsedContact = useMemo(() => parseContactInput(contactInput), [contactInput]);
  const nationalIdError = nationalId.trim() && !isNationalIdValid(nationalId) ? 'کد ملی باید 10 رقم باشد.' : '';

  if (!open) return null;

  const save = async () => {
    if (!parsedContact.isValid || !parsedContact.type || !parsedContact.normalizedValue || !firstName.trim() || !lastName.trim() || nationalIdError) return;
    setSaving(true);
    try {
      const result = await createEmployeeFromQuickSetupAction({
        id: initialEmployee?.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalId: nationalId.trim() || undefined,
        email: parsedContact.type === 'email' ? parsedContact.normalizedValue : undefined,
        mobile: parsedContact.type === 'phone' ? parsedContact.normalizedValue : undefined,
        avatarUrl: avatarUrl || undefined,
      });
      onSubmit({
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        nationalId: result.nationalId,
        contact: result.email ? { type: 'email', value: result.email } : { type: 'phone', value: result.mobile },
        avatarUrl: result.avatarUrl,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-6 text-right text-slate-100" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <button type="button" onClick={onClose} className="text-xl text-slate-400">×</button>
          <div>
            <div className="text-xl font-black text-white">{initialEmployee ? 'ویرایش کارمند' : 'افزودن کارمند'}</div>
            <div className="mt-1 text-sm text-slate-300">{step === 1 ? 'مرحله 1: ابتدا موبایل یا ایمیل کارمند را وارد کنید.' : 'مرحله 2: نام و نام خانوادگی کارمند را تکمیل کنید.'}</div>
          </div>
        </div>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block">
              <span className="text-sm font-bold text-white">ایمیل یا موبایل</span>
              <input value={contactInput} onChange={(event) => setContactInput(event.target.value)} placeholder="0912... یا name@example.com" className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-indigo-400" />
            </label>
            {contactInput.trim() && parsedContact.error ? <div className="text-xs text-rose-300">{parsedContact.error}</div> : null}
            <div className="flex justify-start"><button type="button" onClick={() => setStep(2)} disabled={!parsedContact.isValid} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">ادامه</button></div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2"><span className="text-sm font-bold text-white">نام</span><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-indigo-400" /></label>
              <label className="space-y-2"><span className="text-sm font-bold text-white">نام خانوادگی</span><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-indigo-400" /></label>
              <label className="space-y-2"><span className="text-sm font-bold text-white">کد ملی</span><input value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-indigo-400" /></label>
              <label className="space-y-2"><span className="text-sm font-bold text-white">آدرس تصویر پروفایل</span><input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-indigo-400" /></label>
            </div>
            {nationalIdError ? <div className="text-xs text-rose-300">{nationalIdError}</div> : null}
            <div className="flex justify-between gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-100">مرحله قبل</button>
              <button type="button" onClick={save} disabled={!firstName.trim() || !lastName.trim() || Boolean(nationalIdError) || saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'در حال ثبت...' : initialEmployee ? 'ذخیره تغییرات' : 'ثبت اطلاعات'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Step4Employees({ employees, onChange }: Step4EmployeesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<QuickEmployeeSummary | null>(null);

  const upsert = (employee: QuickEmployeeSummary) => {
    onChange(employees.some((item) => item.id === employee.id) ? employees.map((item) => item.id === employee.id ? employee : item) : [...employees, employee]);
  };

  const remove = async (id: string) => {
    await deleteEmployeeFromQuickSetupAction(id);
    onChange(employees.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">مرحله 4: ثبت کارمندان</h2>
        <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs text-fuchsia-200">Step 4</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right">
            <div className="text-base font-bold text-white">افزودن کاربر</div>
            <div className="mt-1 text-sm text-slate-400">ابتدا لیست خالی را می بینید و از طریق دیالوگ، موبایل و سپس نام و نام خانوادگی را ثبت می کنید.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setEditingEmployee(null); setIsAddOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm text-white transition-colors hover:bg-indigo-500"><Plus className="h-4 w-4" />افزودن کارمند</button>
            <button type="button" onClick={() => setIsExcelOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm text-slate-200 transition-colors hover:border-white/30"><FileSpreadsheet className="h-4 w-4" />افزودن با اکسل</button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {employees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-6 text-center text-sm text-slate-400">هنوز کارمندی ثبت نشده است.</div>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingEmployee(employee); setIsAddOpen(true); }} className="rounded-lg border border-white/10 p-2 text-slate-200"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(employee.id)} className="rounded-lg border border-rose-400/30 p-2 text-rose-300"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div><div className="font-bold text-white">{employee.firstName} {employee.lastName}</div><div className="text-xs text-slate-400">{employee.contact.value}</div></div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200"><User className="h-5 w-5" /></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EmployeeDialog open={isAddOpen} initialEmployee={editingEmployee} onClose={() => { setIsAddOpen(false); setEditingEmployee(null); }} onSubmit={upsert} />
      {isExcelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setIsExcelOpen(false)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 text-right" onClick={(event) => event.stopPropagation()}>
            <div className="text-xl font-black text-white">افزودن با اکسل</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">این قابلیت در مرحله بعدی فعال می شود.</p>
            <button type="button" onClick={() => setIsExcelOpen(false)} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white">متوجه شدم</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
