'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import type {
  FirstPartyRelatedParticipant,
  FirstPartyRelatedParticipantRole,
  FirstPartySnapshot,
  RelatedParticipantOption,
} from './partiesTypes';

type ManagedRole = Extract<FirstPartyRelatedParticipantRole, 'representative' | 'board_member'>;

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
  onClose,
  onSave,
}: {
  open: boolean;
  parentSourceId: string;
  parentName: string;
  roles: ManagedRole[];
  participants: FirstPartyRelatedParticipant[];
  candidates: Record<ManagedRole, RelatedParticipantOption[]>;
  onClose: () => void;
  onSave: (participants: FirstPartyRelatedParticipant[]) => void;
}) {
  const firstRole = roles[0] ?? 'representative';
  const [activeRole, setActiveRole] = useState<ManagedRole>(firstRole);
  const [draftItems, setDraftItems] = useState<FirstPartyRelatedParticipant[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveRole(firstRole);
    setDraftItems(participants);
    setSubmitted(false);
  }, [firstRole, open, participants]);

  const activeItems = draftItems.filter((item) => item.role === activeRole);
  const selectedSourceIds = useMemo(() => new Set(draftItems.map((item) => `${item.role}:${item.sourceId}`)), [draftItems]);
  const availableCandidates = candidates[activeRole].filter((item) => !selectedSourceIds.has(`${activeRole}:${item.sourceId}`));
  const invalidItems = draftItems.filter((item) => {
    const snapshot = item.snapshot ?? {};
    return !snapshot.fullName?.trim() || !snapshot.nationalId?.trim() || (!snapshot.mobile?.trim() && !snapshot.email?.trim());
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
              if (invalidItems.length) return;
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

        <div className="space-y-3" role="tabpanel">
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

        {availableCandidates.length ? (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="text-sm font-extrabold text-slate-700">افزودن از پروفایل کسب‌وکار</div>
            {availableCandidates.map((candidate) => (
              <button
                key={candidate.sourceId}
                type="button"
                onClick={() =>
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
                  ])
                }
                className="flex min-h-11 w-full items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-right text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)]"
              >
                <Plus className="h-4 w-4 text-emerald-700" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                <span className="text-xs font-semibold text-slate-500">{candidate.description}</span>
              </button>
            ))}
          </div>
        ) : null}

        {submitted && invalidItems.length ? (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">
            نام، کد ملی و حداقل یک راه ارتباطی برای افراد وابسته الزامی است.
          </div>
        ) : null}
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
