'use client';

import { useState } from 'react';
import { ChevronLeft, CircleDollarSign, CirclePercent, Filter, Layers3 } from 'lucide-react';
import { BusinessSwitch, RuleFieldLabel, RuleTabButton } from '@repo/ui';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { PENALTY_ITEMS } from '../../contracts/new/_components/penaltiesConfig';
import { RuleTextInput as SharedRuleTextInput } from './RuleStylePrimitives';

type ForgiveScope = 'whole' | 'itemized';
type ForgiveValueMode = 'amount' | 'percent';

const WHOLE_CONTRACT_ENTRY = {
  id: 'whole-contract',
  title: 'بخشودگی کل قرارداد',
  description: 'در این حالت کل قرارداد به‌صورت یک‌جا بررسی می‌شود.',
};

const ITEMIZED_FORGIVENESS_ENTRIES = PENALTY_ITEMS.filter((item) => item.id !== 'discount-cancelled').map((item) => ({
  id: item.id,
  title: item.title.replace('?????', 'بخشودگی'),
  description: item.description
    .replace('??????? ?????? ?????', 'در این حالت بخشودگی به‌صورت موردی و برای هر قلم بررسی می‌شود')
    .replace('?? ???? ??????.', 'این مورد را مشخص کنید.'),
}));

function RuleTextInput({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return <SharedRuleTextInput value={value} onChange={onChange} placeholder={placeholder} suffix={suffix} />;
}

function TopCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start justify-between gap-4 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
    >
      <div className="flex-1">
        <h3 className="text-lg font-black text-[color:var(--text-strong)]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
      <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-[color:var(--text-muted)]" />
    </button>
  );
}

function ConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="space-y-3 px-6 py-6 text-right">
          <h3 className="text-2xl font-black text-[color:var(--text-strong)]">انتخاب ناحیه و نوع بخشودگی</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">ابتدا محدوده بخشودگی را انتخاب کنید، سپس جزئیات مربوط به آن را تنظیم کنید.</p>
        </div>
        <div className="flex items-center justify-end gap-8 border-t border-slate-100 px-6 py-5">
          <button type="button" onClick={onCancel} className="text-sm font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]">
            لغو
          </button>
          <button type="button" onClick={onConfirm} className="text-sm font-black text-[#ff5c5c] transition hover:text-[#ff8a8a]">
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

export function ForgivenessRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const [pendingScope, setPendingScope] = useState<ForgiveScope | null>(null);

  const scope = String(state.values.forgiveScope || 'whole') as ForgiveScope;
  const valueMode = String(state.values.forgiveValueMode || 'amount') as ForgiveValueMode;
  const entryId = String(state.values.forgiveEntryId || '');
  const selectedEntry =
    scope === 'whole'
      ? entryId === WHOLE_CONTRACT_ENTRY.id
        ? WHOLE_CONTRACT_ENTRY
        : null
      : ITEMIZED_FORGIVENESS_ENTRIES.find((item) => item.id === entryId) ?? null;

  if (!selectedEntry) {
    return (
      <>
        <ConfirmModal
          open={Boolean(pendingScope)}
          onCancel={() => setPendingScope(null)}
          onConfirm={() => {
            if (!pendingScope) return;
            onValueChange('forgiveScope', pendingScope);
            onValueChange('forgiveEntryId', pendingScope === 'whole' ? WHOLE_CONTRACT_ENTRY.id : '');
            setPendingScope(null);
          }}
        />

        <div className="space-y-5">
          <section className="overflow-hidden rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
            <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
              <RuleTabButton title="بخش‌بندی‌شده" icon={Filter} active={scope === 'itemized'} onClick={() => scope !== 'itemized' && setPendingScope('itemized')} />
              <RuleTabButton title="کل قرارداد" icon={Layers3} active={scope === 'whole'} onClick={() => scope !== 'whole' && setPendingScope('whole')} />
            </div>

            <div className="space-y-8 p-5">
              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر روزهای تاخیر برای بخشودگی" required />
                <RuleTextInput value={String(state.values.forgiveMaxDelayCount ?? '')} onChange={(value) => onValueChange('forgiveMaxDelayCount', value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">عدد موردنظر را وارد کنید تا مشخص شود بخشودگی برای چه تاخیری اعمال می‌شود.</p>
              </div>

              {scope === 'whole' ? (
                <TopCard title={WHOLE_CONTRACT_ENTRY.title} description={WHOLE_CONTRACT_ENTRY.description} onClick={() => onValueChange('forgiveEntryId', WHOLE_CONTRACT_ENTRY.id)} />
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {ITEMIZED_FORGIVENESS_ENTRIES.map((entry) => (
                    <TopCard key={entry.id} title={entry.title} description={entry.description} onClick={() => onValueChange('forgiveEntryId', entry.id)} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{selectedEntry.title}</h3>
          </div>
          <button
            type="button"
            onClick={() => onValueChange('forgiveEntryId', '')}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <RuleTabButton title="درصد" icon={CirclePercent} active={valueMode === 'percent'} onClick={() => onValueChange('forgiveValueMode', 'percent')} />
          <RuleTabButton title="مبلغ" icon={CircleDollarSign} active={valueMode === 'amount'} onClick={() => onValueChange('forgiveValueMode', 'amount')} />
        </div>

        <div className="space-y-8 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <h3 className="text-[20px] font-black text-[color:var(--text-strong)]">فعال‌سازی بخشودگی</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">این گزینه مشخص می‌کند که بخشودگی فعال باشد یا نه.</p>
            </div>
            <BusinessSwitch
              checked={Boolean(state.values.forgiveAllowed)}
              onChange={(value) => onValueChange('forgiveAllowed', value)}
              activeLabel="فعال"
              inactiveLabel="غیرفعال"
            />
          </div>

          {valueMode === 'amount' ? (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <RuleFieldLabel label="حداقل مبلغ بخشودگی" required />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="ریال" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل مبلغی که می‌تواند بخشوده شود را وارد کنید. مثال: 1,000,000</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر مبلغ بخشودگی" required />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="ریال" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر مبلغ قابل بخشش را وارد کنید. مثال: 10,000,000</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <RuleFieldLabel label="حداقل درصد بخشودگی" required />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل درصد قابل اعمال را وارد کنید. مثال: 10%</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر درصد بخشودگی" required />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر درصد قابل اعمال را وارد کنید. مثال: 50%</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[#415769] pt-6">
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">بخشودگی خارج از اختیار خریدار</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اگر این گزینه روشن باشد، بخشودگی برای موارد خارج از اختیار خریدار هم در نظر گرفته می‌شود.</p>
            </div>
            <BusinessSwitch
              checked={Boolean(state.values.forgiveOutsideBuyerControl)}
              onChange={(value) => onValueChange('forgiveOutsideBuyerControl', value)}
              activeLabel="فعال"
              inactiveLabel="غیرفعال"
            />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-[#415769] pt-6">
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">نیاز به تایید مدیریت</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اگر این گزینه فعال باشد، اعمال بخشودگی به تایید مدیریت نیاز دارد.</p>
            </div>
            <BusinessSwitch checked={Boolean(state.values.forgiveManagerApproval)} onChange={(value) => onValueChange('forgiveManagerApproval', value)} />
          </div>
        </div>
      </section>
    </div>
  );
}

