'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import {
  getSelectionCardFields,
  hasMissingPrimaryData,
  PartySelectionOptionCard,
  PartySelectionRegisterButton,
} from './PartySelectionOptionCard';
import { FirstPartyInfoEditDialog } from './FirstPartyInfoEditDialog';
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
  const [completeCandidate, setCompleteCandidate] = useState<RelatedParticipantOption | null>(null);
  const [editedSnapshots, setEditedSnapshots] = useState<Record<string, FirstPartySnapshot>>({});

  useEffect(() => {
    if (!open) return;
    setActiveRole(initialRole && roles.includes(initialRole) ? initialRole : firstRole);
    setDraftItems(participants);
    setSubmitted(false);
    setQuery('');
    setQuickEditItem(null);
    setCompleteCandidate(null);
    setEditedSnapshots({});
  }, [firstRole, initialRole, open, participants]);

  const activeItems = draftItems.filter((item) => item.role === activeRole);
  const selectedSourceIds = useMemo(
    () => new Set(draftItems.map((item) => `${item.role}:${item.sourceId}`)),
    [draftItems],
  );

  const resolveCandidate = (candidate: RelatedParticipantOption): RelatedParticipantOption => {
    const key = `${activeRole}:${candidate.sourceId}`;
    return editedSnapshots[key] ? { ...candidate, snapshot: editedSnapshots[key] } : candidate;
  };

  const filteredCandidates = candidates[activeRole]
    .filter((item) => {
      const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');
      if (!normalizedQuery) return true;
      return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa-IR').includes(normalizedQuery);
    })
    .map(resolveCandidate);

  const addCandidate = (candidate: RelatedParticipantOption) => {
    const resolved = resolveCandidate(candidate);
    if (hasMissingPrimaryData(resolved, 'natural_person')) return;
    if (selectedSourceIds.has(`${activeRole}:${resolved.sourceId}`)) {
      setDraftItems((current) => current.filter((item) => !(item.role === activeRole && item.sourceId === resolved.sourceId)));
      return;
    }
    setDraftItems((current) => [
      ...current,
      {
        id: createParticipantId(),
        sourceId: resolved.sourceId,
        sourceDirectoryId: resolved.sourceDirectoryId ?? null,
        personType: 'natural',
        role: activeRole,
        name: resolved.snapshot?.fullName || resolved.name,
        parentParticipantId: null,
        parentSourceId,
        snapshot: resolved.snapshot ?? { fullName: resolved.name },
      },
    ]);
  };

  const invalidItems = draftItems.filter((item) => {
    const snapshot = item.snapshot ?? {};
    return !snapshot.fullName?.trim() || !snapshot.nationalId?.trim();
  });

  const handleCandidateCompleteSave = (snapshot: FirstPartySnapshot) => {
    if (!completeCandidate) return;
    const key = `${activeRole}:${completeCandidate.sourceId}`;
    setEditedSnapshots((current) => ({ ...current, [key]: snapshot }));
    setCompleteCandidate(null);
    if (!selectedSourceIds.has(key)) {
      setDraftItems((current) => [
        ...current,
        {
          id: createParticipantId(),
          sourceId: completeCandidate.sourceId,
          sourceDirectoryId: completeCandidate.sourceDirectoryId ?? null,
          personType: 'natural',
          role: activeRole,
          name: snapshot.fullName || completeCandidate.name,
          parentParticipantId: null,
          parentSourceId,
          snapshot,
        },
      ]);
    }
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
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                if (invalidItems.length) {
                  setQuickEditItem(
                    activeItems.find((item) => invalidItems.some((invalid) => invalid.id === item.id)) ?? invalidItems[0],
                  );
                  return;
                }
                onSave(draftItems);
              }}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)]"
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
                  className={`h-11 rounded-lg border text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
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

          {activeItems.length ? (
            <div className="space-y-2">
              <div className="text-sm font-extrabold text-slate-700">{ROLE_LABELS[activeRole]}های انتخاب‌شده</div>
              {activeItems.map((item) => (
                <article key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] text-white">
                    <UserRound className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-900">{item.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {[item.snapshot?.nationalId, item.snapshot?.mobile, item.snapshot?.email].filter(Boolean).join(' / ') ||
                        ROLE_LABELS[activeRole]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraftItems((current) => current.filter((candidate) => candidate.id !== item.id))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                    aria-label={`حذف ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`جستجوی ${ROLE_LABELS[activeRole]}`}
                className="h-11 rounded-lg pl-10 text-sm"
              />
            </div>
            {onRegisterNew ? (
              <PartySelectionRegisterButton
                onClick={() => onRegisterNew(activeRole)}
                icon={<Plus className="h-4 w-4" aria-hidden />}
                label={`ثبت ${ROLE_LABELS[activeRole]} جدید`}
              />
            ) : null}
          </div>

          {filteredCandidates.length ? (
            <div className="space-y-2">
              <div className="text-sm font-extrabold text-slate-700">افزودن از پروفایل کسب‌وکار</div>
              {filteredCandidates.map((candidate) => {
                const selected = selectedSourceIds.has(`${activeRole}:${candidate.sourceId}`);
                const complete = !hasMissingPrimaryData(candidate, 'natural_person');
                return (
                  <PartySelectionOptionCard
                    key={candidate.sourceId}
                    name={candidate.name}
                    roleLabel={ROLE_LABELS[activeRole]}
                    personType={candidate.personType}
                    fields={getSelectionCardFields(candidate)}
                    complete={complete}
                    selected={selected}
                    onSelect={() => addCandidate(candidate)}
                    onCompleteInfo={() => setCompleteCandidate(candidate)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
              {query.trim()
                ? 'موردی مطابق جست‌وجو پیدا نشد.'
                : `${ROLE_LABELS[activeRole]} دیگری برای انتخاب وجود ندارد.`}
            </div>
          )}

          {submitted && invalidItems.length ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">
              نام و کد ملی برای افراد وابسته الزامی است.
            </div>
          ) : null}
        </div>
      </ContractModal>

      <FirstPartyInfoEditDialog
        open={quickEditItem !== null}
        kind="natural_person"
        name={quickEditItem?.name}
        roleLabel={ROLE_LABELS[activeRole]}
        initialSnapshot={quickEditItem?.snapshot}
        mode="complete"
        onClose={() => setQuickEditItem(null)}
        onSave={(snapshot) => {
          if (!quickEditItem) return;
          setDraftItems((current) =>
            current.map((item) =>
              item.id === quickEditItem.id ? { ...item, name: snapshot.fullName || item.name, snapshot } : item,
            ),
          );
          setQuickEditItem(null);
          setSubmitted(false);
        }}
      />

      <FirstPartyInfoEditDialog
        open={completeCandidate !== null}
        kind="natural_person"
        name={completeCandidate?.name}
        roleLabel={ROLE_LABELS[activeRole]}
        initialSnapshot={completeCandidate?.snapshot ?? (completeCandidate ? { fullName: completeCandidate.name } : null)}
        mode="complete"
        onClose={() => setCompleteCandidate(null)}
        onSave={(snapshot) => handleCandidateCompleteSave(snapshot)}
      />
    </>
  );
}
