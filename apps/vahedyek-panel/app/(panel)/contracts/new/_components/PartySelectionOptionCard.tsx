'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Building2, Check, ChevronLeft, UserRound } from 'lucide-react';
import type { FirstPartySnapshot, PartyOneMemberKind, PersonType, RelatedParticipantOption } from './partiesTypes';

export type SelectionCompletenessKind = PartyOneMemberKind | 'natural_person';

export type SelectionCardField = {
  label: string;
  value: string;
};

export function optionKey(item: RelatedParticipantOption) {
  return `${item.personType}:${item.sourceId}`;
}

export function hasMissingPrimaryData(item: RelatedParticipantOption, kind: SelectionCompletenessKind) {
  const snapshot = item.snapshot ?? {};
  const required: Array<keyof FirstPartySnapshot> =
    kind === 'natural_shareholder' || kind === 'natural_person'
      ? ['fullName', 'nationalId']
      : kind === 'legal_shareholder'
        ? ['legalName', 'nationalId', 'registrationNumber', 'registrationDate', 'economicCode']
        : ['legalName', 'tradeName', 'nationalId', 'contactName'];
  return required.some((key) => !String(snapshot[key] ?? '').trim());
}

function extractContactFromDescription(description?: string) {
  if (!description?.trim()) return { mobile: '', email: '', companyName: '' };
  const parts = description
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  let mobile = '';
  let email = '';
  let companyName = '';
  for (const part of parts) {
    if (!email && part.includes('@')) {
      email = part;
      continue;
    }
    if (!mobile && /^(\+98|0)?9\d{9}$/.test(part.replace(/[\s-]/g, ''))) {
      mobile = part;
      continue;
    }
    if (!companyName && !part.includes('@') && !/^\d+$/.test(part)) {
      companyName = part;
    }
  }
  return { mobile, email, companyName };
}

export function getSelectionCardFields(item: RelatedParticipantOption): SelectionCardField[] {
  const snapshot = item.snapshot ?? {};
  const fromDescription = extractContactFromDescription(item.description);

  if (item.personType === 'natural') {
    const mobile = snapshot.mobile?.trim() || fromDescription.mobile;
    const email = snapshot.email?.trim() || fromDescription.email;
    return [
      { label: 'موبایل', value: mobile || '—' },
      { label: 'ایمیل', value: email || '—' },
    ];
  }

  const companyName = snapshot.legalName?.trim() || item.name.trim() || fromDescription.companyName;
  const tradeName = snapshot.tradeName?.trim();
  const nationalId = snapshot.nationalId?.trim();

  return [
    { label: tradeName ? 'نام تجاری' : 'نام شرکت', value: tradeName || companyName || '—' },
    { label: 'شناسه ملی', value: nationalId || '—' },
  ];
}

export function PartySelectionOptionCard({
  name,
  roleLabel,
  personType,
  fields,
  complete,
  selected,
  onSelect,
  onCompleteInfo,
}: {
  name: string;
  roleLabel: string;
  personType: PersonType;
  fields: SelectionCardField[];
  complete: boolean;
  selected: boolean;
  onSelect: () => void;
  onCompleteInfo: () => void;
}) {
  const Icon = personType === 'legal' ? Building2 : UserRound;

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3.5 transition-colors ${
        selected
          ? 'border-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_6%,white)]'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
          complete ? 'bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)]' : 'bg-[#ff9d72]'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-extrabold text-slate-900">{name}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              personType === 'legal'
                ? 'bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {roleLabel}
          </span>
        </div>

        {fields.length ? (
          <div className="mt-2 space-y-1">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-wrap items-baseline gap-x-1.5 text-[12px] leading-5">
                <span className="font-semibold text-slate-400">{field.label}:</span>
                <span className="font-bold text-slate-700" dir={field.label === 'ایمیل' || field.label === 'موبایل' ? 'ltr' : undefined}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden />
              تکمیل شده
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                اطلاعات ناقص
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCompleteInfo();
                }}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-sky-600 transition-colors hover:text-sky-700"
              >
                تکمیل اطلاعات
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!complete) return;
          onSelect();
        }}
        disabled={!complete}
        aria-pressed={selected}
        aria-label={complete ? `انتخاب ${name}` : `ابتدا اطلاعات ${name} را تکمیل کنید`}
        title={complete ? undefined : 'ابتدا اطلاعات را تکمیل کنید'}
        className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_30%,transparent)] ${
          selected
            ? 'border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] text-white'
            : complete
              ? 'border-slate-300 bg-white text-transparent hover:border-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)]'
              : 'cursor-not-allowed border-slate-200 bg-slate-50 text-transparent opacity-60'
        }`}
      >
        <Check className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function PartySelectionRegisterButton({
  label,
  loading = false,
  onClick,
  icon,
}: {
  label: string;
  loading?: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_8%,white)] px-4 text-sm font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)] transition-colors hover:bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}
