'use client';

import type { ReactNode } from 'react';
import { Building2, Plus, Star, Trash2, UserRound } from 'lucide-react';
import { FormBox } from './FormBox';
import { getTypeLabel, PARTY_TOTALS, type PartyRow, type ShareMode } from './partiesTypes';

type PartySectionLayout = 'stack' | 'grid';
type PrimaryControl = 'button' | 'switch';

function parseDetailLine(detail: string) {
  const separatorIndex = detail.indexOf(':');
  if (separatorIndex === -1) return { label: null as string | null, value: detail };
  return {
    label: detail.slice(0, separatorIndex).trim(),
    value: detail.slice(separatorIndex + 1).trim(),
  };
}

function getPartyAvatar(row: PartyRow) {
  const isLegal = row.personType === 'legal';
  const isBusiness = row.partyOneMemberKind === 'business';
  return {
    Icon: isLegal ? Building2 : UserRound,
    className:
      isLegal && isBusiness
        ? 'bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] text-white'
        : 'bg-[#ff9d72] text-white',
  };
}

export function PartySection({
  title,
  description,
  rows,
  shareMode,
  onShareChange,
  onPrimaryChange,
  onRemove,
  addButtonLabel,
  onOpenDialog,
  invalid = false,
  disableAdd = false,
  layout = 'stack',
  primaryControl = 'button',
  renderRowActions,
}: {
  title: string;
  description: string;
  rows: PartyRow[];
  shareMode: ShareMode;
  onShareChange: (id: string, value: string) => void;
  onPrimaryChange: (id: string) => void;
  onRemove: (id: string) => void;
  addButtonLabel: string;
  onOpenDialog: () => void;
  invalid?: boolean;
  disableAdd?: boolean;
  layout?: PartySectionLayout;
  primaryControl?: PrimaryControl;
  renderRowActions?: (row: PartyRow) => ReactNode;
}) {
  const isSingleRow = rows.length <= 1;
  const shareUnit = shareMode === 'dang' ? 'دانگ' : 'درصد';

  return (
    <div className="space-y-4">
      <FormBox title={title} description={description} invalid={invalid}>
        <div className={layout === 'grid' ? 'grid items-start gap-4 sm:grid-cols-2' : 'space-y-4'}>
          {rows.length ? (
            rows.map((row) => {
              const { Icon, className: avatarClassName } = getPartyAvatar(row);
              return (
                <article
                  key={row.id}
                  className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-5"
                >
                  {row.locked ? null : (
                    <button
                      type="button"
                      onClick={() => onRemove(row.id)}
                      className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                      aria-label="حذف"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}

                  <div className="flex min-w-0 items-start gap-3 pe-10">
                    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarClassName}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-extrabold text-slate-900">{row.name}</p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                          {getTypeLabel(row.personType)}
                        </span>
                        {row.tags?.length
                          ? row.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_6%,white)] px-2.5 py-0.5 text-[11px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]"
                              >
                                {tag}
                              </span>
                            ))
                          : null}
                      </div>

                      {row.details?.length ? (
                        <div className="mt-3 space-y-1.5">
                          {row.details.map((detail) => {
                            const { label, value } = parseDetailLine(detail);
                            return (
                              <div key={detail} className="flex flex-wrap items-baseline gap-x-1.5 text-[12px] leading-5">
                                {label ? <span className="font-semibold text-slate-400">{label}:</span> : null}
                                <span className="font-bold text-slate-800">{value || '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {renderRowActions ? <div className="mt-4">{renderRowActions(row)}</div> : null}

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="min-w-[10rem]">
                      <label className="mb-1.5 block text-[11px] font-bold text-slate-500" htmlFor={`party-share-${row.id}`}>
                        مقدار سهم
                      </label>
                      <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--dark-teal)_12%,transparent)]">
                        <span className="inline-flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-[12px] font-bold text-slate-600">
                          {shareUnit}
                        </span>
                        <input
                          id={`party-share-${row.id}`}
                          type="number"
                          min={0}
                          max={PARTY_TOTALS[shareMode]}
                          step="0.01"
                          value={row.shareValue === 0 ? '' : row.shareValue}
                          onChange={(event) => onShareChange(row.id, event.target.value)}
                          disabled={row.lockShare}
                          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                          placeholder={shareMode === 'dang' ? 'مثلاً ۱.۵' : 'مثلاً ۲۵'}
                        />
                      </div>
                    </div>

                    {primaryControl === 'switch' ? (
                      <div className="flex items-center gap-2.5 pb-1">
                        <span className="text-[12px] font-bold text-slate-600">طرف اصلی</span>
                        <button
                          type="button"
                          onClick={() => onPrimaryChange(row.id)}
                          role="switch"
                          aria-checked={row.isPrimary}
                          disabled={isSingleRow}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                            row.isPrimary
                              ? 'border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)]'
                              : 'border-slate-200 bg-slate-200'
                          } ${isSingleRow ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                              row.isPrimary ? 'translate-x-[-18px]' : 'translate-x-[-2px]'
                            }`}
                            aria-hidden
                          />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPrimaryChange(row.id)}
                        title="طرف اصلی"
                        aria-label="طرف اصلی"
                        disabled={isSingleRow}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-bold transition-colors ${
                          row.isPrimary
                            ? 'border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        } ${isSingleRow ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Star className={`h-4 w-4 ${row.isPrimary ? 'fill-current' : ''}`} aria-hidden />
                        طرف اصلی
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400 sm:col-span-2">
              طرفی اضافه نشده است.
            </div>
          )}

          {disableAdd ? null : (
            <div className={layout === 'grid' ? 'flex justify-end sm:col-span-2' : 'flex justify-end'}>
              <button
                type="button"
                onClick={onOpenDialog}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)]"
              >
                <Plus className="h-4 w-4" />
                {addButtonLabel}
              </button>
            </div>
          )}
        </div>
      </FormBox>
    </div>
  );
}
