'use client';

import { Plus, Star } from 'lucide-react';
import { FormBox } from './FormBox';
import { Input } from '@repo/ui';
import { getTypeLabel, PARTY_TOTALS, type PartyRow, type ShareMode } from './partiesTypes';

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
}) {
  return (
    <div className="space-y-4">
      <FormBox title={title} description={description} invalid={invalid}>
        <div className="space-y-4">
          {rows.length ? (
            rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto] lg:items-center">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">{row.name}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                          {getTypeLabel(row.personType)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPrimaryChange(row.id)}
                      title="حساب اصلی"
                      aria-label="حساب اصلی"
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        row.isPrimary
                          ? 'border-amber-300 bg-amber-50 text-amber-600'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${row.isPrimary ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <Input
                      type="number"
                      min={0}
                      max={PARTY_TOTALS[shareMode]}
                      step="0.01"
                      value={row.shareValue === 0 ? '' : row.shareValue}
                      onChange={(event) => onShareChange(row.id, event.target.value)}
                      className="h-10 text-sm"
                      placeholder={shareMode === 'dang' ? 'مثلا 1.5' : 'مثلا 25'}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onRemove(row.id)}
                      className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">
              طرفی اضافه نشده است.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onOpenDialog}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)]"
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </button>
          </div>
        </div>
      </FormBox>
    </div>
  );
}
