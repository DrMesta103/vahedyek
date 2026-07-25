'use client';

import { Building2, Trash2, UserRound } from 'lucide-react';
import type { FirstPartyRelatedParticipant, FirstPartyRelatedParticipantRole } from './partiesTypes';

const ROLE_LABELS: Record<FirstPartyRelatedParticipantRole, string> = {
  representative: 'نماینده',
  board_member: 'عضو هیئت‌مدیره',
  natural_shareholder: 'سهام‌دار حقیقی',
  legal_shareholder: 'سهام‌دار حقوقی',
};

export function FirstPartyRelatedParticipantsSection({
  participants,
  onRemove,
}: {
  participants: FirstPartyRelatedParticipant[];
  onRemove: (id: string) => void;
}) {
  return (
    <section className="space-y-3 rounded-[8px] border border-slate-200 bg-white/70 p-4" aria-labelledby="first-party-related-title">
      <div>
        <h3 id="first-party-related-title" className="text-sm font-extrabold text-slate-800">
          افراد وابسته به کسب‌وکار
        </h3>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
          نمایندگان و اعضای هیئت‌مدیره نقش وابسته دارند و سهم قراردادی یا وضعیت طرف اصلی دریافت نمی‌کنند.
        </p>
      </div>

      {participants.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {participants.map((participant) => {
            const isLegal = participant.personType === 'legal';
            const Icon = isLegal ? Building2 : UserRound;
            return (
              <article key={participant.id} className="flex min-w-0 items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isLegal ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800" title={participant.name}>
                    {participant.name}
                  </p>
                  <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {ROLE_LABELS[participant.role]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(participant.id)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  aria-label={`حذف ${participant.name} از این قرارداد`}
                  title="حذف از قرارداد"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-sm font-semibold text-slate-500">
          هنوز نماینده یا عضو هیئت‌مدیره‌ای به این قرارداد اضافه نشده است.
        </div>
      )}
    </section>
  );
}
