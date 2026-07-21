'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import { getPartyOneSnapshotMissingFields, type FirstPartySnapshot, type PartyRow } from './partiesTypes';

type SnapshotKey = keyof FirstPartySnapshot;

type FieldDefinition = {
  key: SnapshotKey;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
};

function getFields(row: PartyRow): FieldDefinition[] {
  if (row.partyOneMemberKind === 'natural_shareholder') {
    return [
      { key: 'fullName', label: 'نام و نام خانوادگی', required: true },
      { key: 'mobile', label: 'شماره موبایل', type: 'tel' },
      { key: 'email', label: 'ایمیل', type: 'email' },
    ];
  }

  if (row.partyOneMemberKind === 'legal_shareholder') {
    return [
      { key: 'legalName', label: 'نام قانونی شرکت', required: true },
      { key: 'tradeName', label: 'نام تجاری' },
      { key: 'nationalId', label: 'شناسه ملی', required: true },
      { key: 'registrationNumber', label: 'شماره ثبت شرکت', required: true },
      { key: 'registrationDate', label: 'تاریخ ثبت شرکت', required: true },
      { key: 'economicCode', label: 'کد اقتصادی', required: true },
    ];
  }

  if (row.personType === 'natural') {
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

export function FirstPartyMemberEditDialog({
  open,
  row,
  onClose,
  onSave,
}: {
  open: boolean;
  row: PartyRow | null;
  onClose: () => void;
  onSave: (snapshot: FirstPartySnapshot) => void;
}) {
  const [snapshot, setSnapshot] = useState<FirstPartySnapshot>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !row) return;
    setSnapshot(row.snapshot ?? {});
    setSubmitted(false);
  }, [open, row]);

  const fields = useMemo(() => (row ? getFields(row) : []), [row]);
  const missing = row ? getPartyOneSnapshotMissingFields({ ...row, snapshot }) : [];
  const hasMissingContact = Boolean(
    row?.partyOneMemberKind === 'business' && row.personType === 'natural' && missing.includes('راه ارتباطی مالک'),
  );

  if (!row) return null;

  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={getPartyOneSnapshotMissingFields(row).length ? 'تکمیل اطلاعات طرف اول' : 'ویرایش اطلاعات طرف اول'}
      description="تغییرات فقط در همین پیش‌نویس قرارداد ذخیره می‌شود و پروفایل کسب‌وکار را تغییر نمی‌دهد."
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              if (missing.length) return;
              onSave(snapshot);
            }}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)]"
          >
            ذخیره اطلاعات
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2" dir="rtl" lang="fa">
        {fields.map((field) => {
          const value = snapshot[field.key] ?? '';
          const invalid = field.required ? !value.trim() : (field.key === 'mobile' || field.key === 'email') && hasMissingContact;
          return (
            <label key={field.key} className="block text-right text-sm font-bold text-slate-700">
              <span>
                {field.label}
                {field.required ? <span className="mr-1 text-rose-600">*</span> : null}
              </span>
              <Input
                type={field.type ?? 'text'}
                value={value}
                onChange={(event) => setSnapshot((current) => ({ ...current, [field.key]: event.target.value }))}
                aria-invalid={invalid}
                className={`mt-2 h-11 rounded-[8px] text-sm ${invalid ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
              />
            </label>
          );
        })}
        {submitted && missing.length ? (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2" role="alert">
            موارد الزامی را کامل کنید: {missing.join('، ')}
          </div>
        ) : null}
      </div>
    </ContractModal>
  );
}
