'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import type {
  FirstPartyRelatedParticipant,
  FirstPartyRelatedParticipantRole,
  FirstPartySnapshot,
  RelatedParticipantOption,
} from './partiesTypes';

type ManagedRole = Extract<FirstPartyRelatedParticipantRole, 'representative' | 'board_member'>;
export type FirstPartyManagedRole = ManagedRole;

const ROLE_LABELS: Record<ManagedRole, string> = {
  representative: 'نماینده',
  board_member: 'عضو هیئت‌مدیره',
};

function createParticipantId() {
  return globalThis.crypto?.randomUUID?.() ?? `related-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FirstPartyRelationsDialog({
  open,
  parentSourceId,
  parentName,
  roles,
  participants,
  candidates,
  initialRole,
  onRegisterNew,
  onClose,
  onSave,
}: {
  open: boolean;
  parentSourceId: string;
  parentName: string;
  roles: ManagedRole[];
  participants: FirstPartyRelatedParticipant[];
  candidates: Record<ManagedRole, RelatedParticipantOption[]>;
  initialRole?: ManagedRole;
  onRegisterNew?: (role: ManagedRole) => void;
  onClose: () => void;
  onSave: (participants: FirstPartyRelatedParticipant[]) => void;
}) {
  const firstRole = roles[0] ?? 'representative';
  const [activeRole, setActiveRole] = useState<ManagedRole>(initialRole ?? firstRole);
  const [draftItems, setDraftItems] = useState<FirstPartyRelatedParticipant[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState('');
  const [quickEditItem, setQuickEditItem] = useState<FirstPartyRelatedParticipant | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveRole(initialRole && roles.includes(initialRole) ? initialRole : firstRole);
    setDraftItems(participants);
    setSubmitted(false);
    setQuery('');
    setQuickEditItem(null);
  }, [firstRole, initialRole, open, participants]);

  const activeItems = draftItems.filter((item) => item.role === activeRole);
  const selectedSourceIds = useMemo(() => new Set(draftItems.map((item) => `${item.role}:${item.sourceId}`)), [draftItems]);
  const filteredCandidates = candidates[activeRole].filter((item) => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');
    if (!normalizedQuery) return true;
    return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa-IR').includes(normalizedQuery);
  });
  const toggleCandidate = (candidate: RelatedParticipantOption) => {
    if (selectedSourceIds.has(`${activeRole}:${candidate.sourceId}`)) {
      setDraftItems((current) => current.filter((item) => !(item.role === activeRole && item.sourceId === candidate.sourceId)));
      return;
    }
    setDraftItems((current) => [
      ...current,
      {
        id: createParticipantId(),
        sourceId: candidate.sourceId,
        sourceDirectoryId: candidate.sourceDirectoryId ?? null,
        personType: 'natural',
        role: activeRole,
        name: candidate.name,
        parentParticipantId: null,
        parentSourceId,
        snapshot: candidate.snapshot ?? { fullName: candidate.name },
      },
    ]);
  };
  const invalidItems = draftItems.filter((item) => {
    const snapshot = item.snapshot ?? {};
    return !snapshot.fullName?.trim() || !snapshot.nationalId?.trim();
  });

  const updateSnapshot = (id: string, key: keyof FirstPartySnapshot, value: string) => {
    setDraftItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              name: key === 'fullName' ? value : item.name,
              snapshot: { ...(item.snapshot ?? {}), [key]: value },
            }
          : item,
      ),
    );
  };

  return (
    <>
    <ContractModal
      open={open}
      onClose={onClose}
      title={roles.includes('board_member') ? 'مدیریت نمایندگان و هیئت‌مدیره' : 'مدیریت نمایندگان'}
      description={`افراد وابسته به «${parentName}» فقط در همین پیش‌نویس قرارداد مدیریت می‌شوند.`}
      maxWidthClass="max-w-2xl"
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
              if (invalidItems.length) {
                setQuickEditItem(activeItems.find((item) => invalidItems.some((invalid) => invalid.id === item.id)) ?? invalidItems[0]);
                return;
              }
              onSave(draftItems);
            }}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)]"
          >
            ذخیره تغییرات
          </button>
        </>
      }
    >
      <div className="space-y-4" dir="rtl" lang="fa">
        {roles.length > 1 ? (
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="نوع فرد وابسته">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={activeRole === role}
                onClick={() => setActiveRole(role)}
                className={`h-11 rounded-[8px] border text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
                  activeRole === role
                    ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] text-[var(--theme-action-text)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        ) : null}

        <div className="hidden" role="tabpanel" aria-hidden="true">
          {activeItems.length ? (
            activeItems.map((item) => {
              const snapshot = item.snapshot ?? {};
              const missingName = submitted && !snapshot.fullName?.trim();
              const missingNationalId = submitted && !snapshot.nationalId?.trim();
              const missingContact = submitted && !snapshot.mobile?.trim() && !snapshot.email?.trim();
              return (
                <article key={item.id} className="rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                      <UserRound className="h-5 w-5" aria-hidden />
                    </span>
                    <strong className="min-w-0 flex-1 truncate text-sm text-slate-800">{item.name}</strong>
                    <button
                      type="button"
                      onClick={() => setDraftItems((current) => current.filter((candidate) => candidate.id !== item.id))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                      aria-label={`حذف ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RelationField label="نام و نام خانوادگی" required value={snapshot.fullName ?? ''} invalid={missingName} onChange={(value) => updateSnapshot(item.id, 'fullName', value)} />
                    <RelationField label="کد ملی" required value={snapshot.nationalId ?? ''} invalid={missingNationalId} onChange={(value) => updateSnapshot(item.id, 'nationalId', value)} />
                    <RelationField label="شماره موبایل" value={snapshot.mobile ?? ''} invalid={missingContact} onChange={(value) => updateSnapshot(item.id, 'mobile', value)} />
                    <RelationField label="ایمیل" value={snapshot.email ?? ''} invalid={missingContact} onChange={(value) => updateSnapshot(item.id, 'email', value)} />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
              هنوز {ROLE_LABELS[activeRole]}ی به این کارت اضافه نشده است.
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`جست‌وجوی ${ROLE_LABELS[activeRole]}`} className="h-11 rounded-[8px] pr-10 text-sm" />
          </div>
          {onRegisterNew ? <button type="button" onClick={() => onRegisterNew(activeRole)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-3 py-2 text-sm font-extrabold text-[var(--theme-action-text)]"><Plus className="h-4 w-4" aria-hidden />ثبت {ROLE_LABELS[activeRole]} جدید</button> : null}
        </div>

        {filteredCandidates.length ? (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="text-sm font-extrabold text-slate-700">افزودن از پروفایل کسب‌وکار</div>
            {filteredCandidates.map((candidate) => {
              const selected = selectedSourceIds.has(`${activeRole}:${candidate.sourceId}`);
              return (
              <button
                key={candidate.sourceId}
                type="button"
                onClick={() => toggleCandidate(candidate)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-[8px] border px-3 py-2 text-right text-sm font-bold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${selected ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded border text-xs ${selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'}`}>✓</span>
                <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                <span className="text-xs font-semibold text-slate-500">{candidate.description}</span>
              </button>
              );
            })}
          </div>
        ) : null}

        {submitted && invalidItems.length ? (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">
            نام، کد ملی و حداقل یک راه ارتباطی برای افراد وابسته الزامی است.
          </div>
        ) : null}
      </div>
    </ContractModal>
    <RelationQuickEditDialogV3
      open={quickEditItem !== null}
      item={quickEditItem}
      onClose={() => setQuickEditItem(null)}
      onSave={(itemId, snapshot) => {
        setDraftItems((current) => current.map((item) => (item.id === itemId ? { ...item, name: snapshot.fullName || item.name, snapshot } : item)));
        setQuickEditItem(null);
        setSubmitted(false);
      }}
    />
    </>
  );
}

function RelationQuickEditDialog({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: FirstPartyRelatedParticipant | null;
  onClose: () => void;
  onSave: (itemId: string, snapshot: FirstPartySnapshot) => void;
}) {
  const [snapshot, setSnapshot] = useState<FirstPartySnapshot>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    const fullName = item.snapshot?.fullName ?? item.name;
    const nameParts = fullName.trim().split(/\s+/);
    setSnapshot(item.snapshot ?? { fullName });
    setFirstName(nameParts[0] ?? '');
    setLastName(nameParts.slice(1).join(' '));
    setSubmitted(false);
  }, [item, open]);

  if (!item) return null;
  const missingName = !firstName.trim() || !lastName.trim();
  const missingNationalId = !snapshot.nationalId?.trim();
  const missingContact = !snapshot.mobile?.trim() && !snapshot.email?.trim();

  return (
    <>
    <ContractModal
      open={open}
      onClose={onClose}
      title="تکمیل اطلاعات فرد"
      description={`برای ادامه، اطلاعات ${item.name} را کامل کنید.`}
       maxWidthClass="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">بازگشت به فهرست</button>
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              if (missingName || missingNationalId) return;
              onSave(item.id, { ...snapshot, fullName: `${firstName.trim()} ${lastName.trim()}` });
            }}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)]"
          >
            تأیید اطلاعات
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2" dir="rtl" lang="fa">
        <RelationField label="نام و نام خانوادگی" required value={snapshot.fullName ?? ''} invalid={submitted && missingName} onChange={(value) => setSnapshot((current) => ({ ...current, fullName: value }))} />
        <RelationField label="کد ملی" required value={snapshot.nationalId ?? ''} invalid={submitted && missingNationalId} onChange={(value) => setSnapshot((current) => ({ ...current, nationalId: value }))} />
        <RelationField label="شماره موبایل" value={snapshot.mobile ?? ''} invalid={submitted && missingContact} onChange={(value) => setSnapshot((current) => ({ ...current, mobile: value }))} />
        <RelationField label="ایمیل" value={snapshot.email ?? ''} invalid={submitted && missingContact} onChange={(value) => setSnapshot((current) => ({ ...current, email: value }))} />
        {submitted && (missingName || missingNationalId || missingContact) ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2">نام، کد ملی و حداقل یک راه ارتباطی الزامی است.</div> : null}
      </div>
    </ContractModal>
    </>
  );
}

function RelationQuickEditDialogV2({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: FirstPartyRelatedParticipant | null;
  onClose: () => void;
  onSave: (itemId: string, snapshot: FirstPartySnapshot) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    const fullName = item.snapshot?.fullName ?? item.name;
    const parts = fullName.trim().split(/\s+/);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    setNationalId(item.snapshot?.nationalId ?? '');
    setSubmitted(false);
  }, [item, open]);

  if (!item) return null;
  const missingName = !firstName.trim() || !lastName.trim();
  const missingNationalId = !nationalId.trim();

  return (
    <ContractModal
      open={open}
      onClose={onClose}
       title="تکمیل اطلاعات فرد"
       description="نام و نام خانوادگی و کد ملی را کامل کنید."
      maxWidthClass="max-w-xl"
      footer={
        <>
           <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">بازگشت به فهرست</button>
           <button type="button" onClick={() => { setSubmitted(true); if (missingName || missingNationalId) return; onSave(item.id, { ...(item.snapshot ?? {}), fullName: `${firstName.trim()} ${lastName.trim()}`, nationalId }); }} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)]">تایید اطلاعات</button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2" dir="rtl" lang="fa">
         <RelationField label="نام" required value={firstName} invalid={submitted && !firstName.trim()} onChange={setFirstName} />
         <RelationField label="نام خانوادگی" required value={lastName} invalid={submitted && !lastName.trim()} onChange={setLastName} />
         <RelationField label="کد ملی" required value={nationalId} invalid={submitted && !nationalId.trim()} onChange={setNationalId} />
         {submitted && (missingName || missingNationalId) ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2">نام، نام خانوادگی و کد ملی الزامی است.</div> : null}
      </div>
    </ContractModal>
  );
}

function RelationQuickEditDialogV3({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: FirstPartyRelatedParticipant | null;
  onClose: () => void;
  onSave: (itemId: string, snapshot: FirstPartySnapshot) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    const parts = (item.snapshot?.fullName ?? item.name).trim().split(/\s+/);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    setNationalId(item.snapshot?.nationalId ?? '');
    setSubmitted(false);
  }, [item, open]);

  if (!item) return null;
  const missingName = !firstName.trim() || !lastName.trim();
  const missingNationalId = !nationalId.trim();

  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={'\u062a\u06a9\u0645\u06cc\u0644 \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0641\u0631\u062f'}
      description={'\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc \u0648 \u06a9\u062f \u0645\u0644\u06cc \u0631\u0627 \u06a9\u0627\u0645\u0644 \u06a9\u0646\u06cc\u062f.'}
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">
            {'\u0628\u0627\u0632\u06af\u0634\u062a \u0628\u0647 \u0641\u0647\u0631\u0633\u062a'}
          </button>
          <button type="button" onClick={() => { setSubmitted(true); if (missingName || missingNationalId) return; onSave(item.id, { ...(item.snapshot ?? {}), fullName: firstName.trim() + ' ' + lastName.trim(), nationalId }); }} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)]">
            {'\u062a\u0627\u06cc\u06cc\u062f \u0627\u0637\u0644\u0627\u0639\u0627\u062a'}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2" dir="rtl" lang="fa">
        <RelationField label={'\u0646\u0627\u0645'} required value={firstName} invalid={submitted && !firstName.trim()} onChange={setFirstName} />
        <RelationField label={'\u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc'} required value={lastName} invalid={submitted && !lastName.trim()} onChange={setLastName} />
        <RelationField label={'\u06a9\u062f \u0645\u0644\u06cc'} required value={nationalId} invalid={submitted && !nationalId.trim()} onChange={setNationalId} />
        {submitted && (missingName || missingNationalId) ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2">{'\u0646\u0627\u0645\u060c \u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc \u0648 \u06a9\u062f \u0645\u0644\u06cc \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a.'}</div> : null}
      </div>
    </ContractModal>
  );
}

function RelationField({
  label,
  value,
  required = false,
  invalid = false,
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-right text-xs font-bold text-slate-600">
      <span>
        {label}
        {required ? <span className="mr-1 text-rose-600">*</span> : null}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        className={`mt-1.5 h-11 rounded-[8px] text-sm ${invalid ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
      />
    </label>
  );
}
