'use client';

import { Plus, Star, Trash2, UserRound } from 'lucide-react';
import { FormBox } from './FormBox';
import { Input } from '@repo/ui';
import { getTypeLabel, PARTY_TOTALS, type PartyRow, type ShareMode } from './partiesTypes';

type PartySectionLayout = 'stack' | 'grid';
type PrimaryControl = 'button' | 'switch';

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
}) {
  const isSingleRow = rows.length <= 1;
  return (
    <div className="space-y-4">
      <FormBox title={title} description={description} invalid={invalid}>
        <div className={layout === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                className={`relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_22px_rgba(15,23,42,0.06)] ${
                  layout === 'grid' ? 'h-full' : ''
                }`}
              >
                {row.locked ? null : (
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100"
                    aria-label="حذف"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
                <div className="flex flex-col gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff9d72] text-white">
                      <UserRound className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-extrabold text-slate-800">{row.name}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {getTypeLabel(row.personType)}
                        </span>
                        {row.tags?.length
                          ? row.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                              >
                                {tag}
                              </span>
                            ))
                          : null}
                      </div>
                      {row.details?.length ? (
                        <div className="mt-1 space-y-0.5 text-[11px] font-semibold leading-5 text-slate-500">
                          {row.details.map((detail) => (
                            <div key={detail}>{detail}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-500">مقدار سهم</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-bold text-slate-700">
                          {shareMode === 'dang' ? 'دانگ' : 'درصد'}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={PARTY_TOTALS[shareMode]}
                          step="0.01"
                          value={row.shareValue === 0 ? '' : row.shareValue}
                          onChange={(event) => onShareChange(row.id, event.target.value)}
                          disabled={row.lockShare}
                          className="h-9 w-28 rounded-xl text-sm"
                          placeholder={shareMode === 'dang' ? 'مثلا 1.5' : 'مثلا 25'}
                        />
                      </div>
                    </div>

                    {primaryControl === 'switch' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">طرف اصلی</span>
                        <button
                          type="button"
                          onClick={() => onPrimaryChange(row.id)}
                          role="switch"
                          aria-checked={row.isPrimary}
                          disabled={isSingleRow}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                            row.isPrimary
                              ? 'border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)]'
                              : 'border-slate-200 bg-slate-100'
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
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[12px] font-bold transition-colors ${
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
                </div>
              </div>
            ))
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
