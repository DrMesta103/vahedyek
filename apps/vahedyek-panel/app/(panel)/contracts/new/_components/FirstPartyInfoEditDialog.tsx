'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Calendar, Check, Save, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import { FormDateInput } from './ContractFormPrimitives';
import type { FirstPartySnapshot, PartyOneMemberKind, PersonType } from './partiesTypes';

export type FirstPartyInfoEditKind = PartyOneMemberKind | 'natural_person' | 'business_natural' | 'business_legal';

type SnapshotKey = keyof FirstPartySnapshot;

type FieldDefinition = {
  key: SnapshotKey | 'firstName' | 'lastName';
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'date';
};

const ROLE_META: Record<FirstPartyInfoEditKind, { label: string; personType: PersonType }> = {
  natural_shareholder: { label: 'سهام‌دار حقیقی', personType: 'natural' },
  legal_shareholder: { label: 'سهام‌دار حقوقی', personType: 'legal' },
  business: { label: 'کسب‌وکار', personType: 'legal' },
  business_natural: { label: 'کسب‌وکار حقیقی', personType: 'natural' },
  business_legal: { label: 'کسب‌وکار حقوقی', personType: 'legal' },
  natural_person: { label: 'فرد حقیقی', personType: 'natural' },
};

function getFields(kind: FirstPartyInfoEditKind): FieldDefinition[] {
  if (kind === 'natural_shareholder' || kind === 'natural_person') {
    return [
      { key: 'firstName', label: 'نام', required: true },
      { key: 'lastName', label: 'نام خانوادگی', required: true },
      { key: 'nationalId', label: 'کد ملی', required: true },
      ...(kind === 'natural_shareholder'
        ? [
            { key: 'mobile' as const, label: 'شماره موبایل', type: 'tel' as const },
            { key: 'email' as const, label: 'ایمیل', type: 'email' as const },
          ]
        : []),
    ];
  }

  if (kind === 'legal_shareholder') {
    return [
      { key: 'legalName', label: 'نام قانونی شرکت', required: true },
      { key: 'tradeName', label: 'نام تجاری' },
      { key: 'nationalId', label: 'شناسه ملی', required: true },
      { key: 'registrationNumber', label: 'شماره ثبت شرکت', required: true },
      { key: 'registrationDate', label: 'تاریخ ثبت شرکت', required: true, type: 'date' },
      { key: 'economicCode', label: 'کد اقتصادی', required: true },
    ];
  }

  if (kind === 'business_natural') {
    return [
      { key: 'fullName', label: 'نام و نام خانوادگی مالک', required: true },
      { key: 'mobile', label: 'شماره موبایل مالک', type: 'tel' },
      { key: 'email', label: 'ایمیل مالک', type: 'email' },
    ];
  }

  return [
    { key: 'legalName', label: 'نام قانونی کسب‌وکار', required: true },
    { key: 'tradeName', label: 'نام تجاری', required: true },
    { key: 'nationalId', label: 'شناسه ملی', required: true },
    { key: 'contactName', label: 'نماینده کسب‌وکار', required: true },
  ];
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function buildSnapshotFromForm(
  kind: FirstPartyInfoEditKind,
  snapshot: FirstPartySnapshot,
  firstName: string,
  lastName: string,
): FirstPartySnapshot {
  if (kind === 'natural_shareholder' || kind === 'natural_person') {
    return {
      ...snapshot,
      fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
    };
  }
  return snapshot;
}

function getMissingLabels(
  kind: FirstPartyInfoEditKind,
  snapshot: FirstPartySnapshot,
  firstName: string,
  lastName: string,
) {
  const fields = getFields(kind);
  const missing: string[] = [];
  for (const field of fields) {
    if (!field.required) continue;
    if (field.key === 'firstName' && !firstName.trim()) missing.push(field.label);
    else if (field.key === 'lastName' && !lastName.trim()) missing.push(field.label);
    else if (field.key !== 'firstName' && field.key !== 'lastName' && !String(snapshot[field.key] ?? '').trim()) {
      missing.push(field.label);
    }
  }
  if (kind === 'business_natural') {
    const hasContact = Boolean(snapshot.mobile?.trim() || snapshot.email?.trim());
    if (!hasContact) missing.push('راه ارتباطی مالک');
  }
  return missing;
}

export function resolveFirstPartyEditKind(input: {
  partyOneMemberKind?: PartyOneMemberKind | null;
  personType?: PersonType;
}): FirstPartyInfoEditKind {
  if (input.partyOneMemberKind === 'natural_shareholder') return 'natural_shareholder';
  if (input.partyOneMemberKind === 'legal_shareholder') return 'legal_shareholder';
  if (input.partyOneMemberKind === 'business') {
    return input.personType === 'natural' ? 'business_natural' : 'business_legal';
  }
  if (input.personType === 'legal') return 'legal_shareholder';
  return 'natural_person';
}

export function FirstPartyInfoEditDialog({
  open,
  kind,
  name,
  roleLabel,
  initialSnapshot,
  mode = 'edit',
  onClose,
  onSave,
}: {
  open: boolean;
  kind: FirstPartyInfoEditKind;
  name?: string;
  roleLabel?: string;
  initialSnapshot?: FirstPartySnapshot | null;
  mode?: 'edit' | 'complete';
  onClose: () => void;
  onSave: (snapshot: FirstPartySnapshot) => void;
}) {
  const [snapshot, setSnapshot] = useState<FirstPartySnapshot>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fields = useMemo(() => getFields(kind), [kind]);
  const meta = ROLE_META[kind];
  const displayRole = roleLabel || meta.label;
  const isLegal = meta.personType === 'legal';
  const Icon = isLegal ? Building2 : UserRound;

  useEffect(() => {
    if (!open) return;
    const next = initialSnapshot ?? {};
    const fromName = splitFullName(next.fullName || name || '');
    setSnapshot(next);
    setFirstName(fromName.firstName);
    setLastName(fromName.lastName);
    setSubmitted(false);
  }, [initialSnapshot, name, open]);

  const missing = getMissingLabels(kind, snapshot, firstName, lastName);
  const complete = missing.length === 0;
  const title =
    mode === 'complete' || !complete
      ? kind === 'natural_person'
        ? 'تکمیل اطلاعات'
        : 'تکمیل اطلاعات طرف اول'
      : 'ویرایش اطلاعات طرف اول';

  const updateField = (key: SnapshotKey, value: string) => {
    setSnapshot((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    setSubmitted(true);
    if (missing.length) return;
    onSave(buildSnapshotFromForm(kind, snapshot, firstName, lastName));
  };

  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={title}
      description="تغییرات فقط در همین پیش‌نویس قرارداد ذخیره می‌شود و پروفایل کسب‌وکار را تغییر نمی‌دهد."
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] px-4 text-sm font-bold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--dark-teal)_78%,black)]"
          >
            <Save className="h-4 w-4" aria-hidden />
            ذخیره اطلاعات
          </button>
        </>
      }
    >
      <div className="space-y-4" dir="rtl" lang="fa">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isLegal
                  ? 'bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">{displayRole}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-500">نوع طرف قرارداد</p>
            </div>
          </div>

          <div className="text-left">
            {complete ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  تکمیل شده
                </span>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">اطلاعات الزامی کامل است.</p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  اطلاعات ناقص
                </span>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">برخی اطلاعات الزامی تکمیل نشده است.</p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const invalid =
              submitted &&
              field.required &&
              (field.key === 'firstName'
                ? !firstName.trim()
                : field.key === 'lastName'
                  ? !lastName.trim()
                  : !String(snapshot[field.key as SnapshotKey] ?? '').trim());

            return (
              <label key={field.key} className="block text-right text-sm font-bold text-slate-700">
                <span>
                  {field.label}
                  {field.required ? <span className="mr-1 text-rose-600">*</span> : null}
                </span>
                {field.key === 'firstName' ? (
                  <Input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    aria-invalid={invalid}
                    className={`mt-2 h-11 rounded-lg text-sm ${invalid ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
                  />
                ) : field.key === 'lastName' ? (
                  <Input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    aria-invalid={invalid}
                    className={`mt-2 h-11 rounded-lg text-sm ${invalid ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
                  />
                ) : field.type === 'date' ? (
                  <div className="mt-2">
                    <FormDateInput
                      value={String(snapshot[field.key as SnapshotKey] ?? '')}
                      onChange={(value) => updateField(field.key as SnapshotKey, value)}
                      placeholder="انتخاب تاریخ"
                      icon={Calendar}
                      invalid={invalid}
                    />
                  </div>
                ) : (
                  <Input
                    type={field.type ?? 'text'}
                    value={String(snapshot[field.key as SnapshotKey] ?? '')}
                    onChange={(event) => updateField(field.key as SnapshotKey, event.target.value)}
                    aria-invalid={invalid}
                    className={`mt-2 h-11 rounded-lg text-sm ${invalid ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
                  />
                )}
              </label>
            );
          })}

          {submitted && missing.length ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2" role="alert">
              موارد الزامی را کامل کنید: {missing.join('، ')}
            </div>
          ) : null}
        </div>
      </div>
    </ContractModal>
  );
}
