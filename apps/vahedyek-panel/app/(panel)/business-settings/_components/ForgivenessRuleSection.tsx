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
  title: 'اعمال بخشودگی روی کل قرارداد',
  description: 'در این بخش می‌توانید شرایط و میزان بخشودگی جرایم را برای کل قرارداد تعیین کنید.',
};

const ITEMIZED_FORGIVENESS_ENTRIES = PENALTY_ITEMS.filter((item) => item.id !== 'discount-cancelled').map((item) => ({
  id: item.id,
  title: item.title.replace('جریمه', 'بخشودگی'),
  description: item.description
    .replace('تنظیمات محاسبه جریمه', 'در این بخش می‌توانید شرایط و میزان بخشودگی جریمه')
    .replace('را مشخص می‌کند.', 'را تعیین کنید.'),
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
      className="flex items-start justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
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
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="space-y-3 px-6 py-6 text-right">
          <h3 className="text-2xl font-black text-[color:var(--text-strong)]">تغییر بخش و غیرفعال‌سازی</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">با تایید این عملیات، در صورت فعال‌سازی موردی در تب بعدی، این تب غیرفعال می‌شود.</p>
        </div>
        <div className="flex items-center justify-end gap-8 border-t border-slate-100 px-6 py-5">
          <button type="button" onClick={onCancel} className="text-sm font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]">
            لغو
          </button>
          <button type="button" onClick={onConfirm} className="text-sm font-black text-[#ff5c5c] transition hover:text-[#ff8a8a]">
            تایید
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
          <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
            <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
              <RuleTabButton title="بخشودگی موردی قرارداد" icon={Filter} active={scope === 'itemized'} onClick={() => scope !== 'itemized' && setPendingScope('itemized')} />
              <RuleTabButton title="بخشودگی روی کل قرارداد" icon={Layers3} active={scope === 'whole'} onClick={() => scope !== 'whole' && setPendingScope('whole')} />
            </div>

            <div className="space-y-8 p-5">
              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر تعداد دفعات تاخیر در یک قرارداد" required />
                <RuleTextInput value={String(state.values.forgiveMaxDelayCount ?? '')} onChange={(value) => onValueChange('forgiveMaxDelayCount', value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر دفعاتی که در یک قرارداد و در طول پرداخت اقساط انواع سررسیدها، مجاز به تاخیر و قابل بخشودگی است را وارد کنید. مثال: ۳ تاخیر مجاز.</p>
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
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
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

      <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <RuleTabButton title="درصد" icon={CirclePercent} active={valueMode === 'percent'} onClick={() => onValueChange('forgiveValueMode', 'percent')} />
          <RuleTabButton title="مبلغ ثابت" icon={CircleDollarSign} active={valueMode === 'amount'} onClick={() => onValueChange('forgiveValueMode', 'amount')} />
        </div>

        <div className="space-y-8 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <h3 className="text-[20px] font-black text-[color:var(--text-strong)]">به ازای هر بدهی/فاکتور</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اگر این گزینه مجاز باشد، می‌توانید مبلغ بخشودگی جریمه را برای این قرارداد تعیین کنید.</p>
            </div>
            <BusinessSwitch
              checked={Boolean(state.values.forgiveAllowed)}
              onChange={(value) => onValueChange('forgiveAllowed', value)}
              activeLabel="مجاز"
              inactiveLabel="غیرمجاز"
            />
          </div>

          {valueMode === 'amount' ? (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <RuleFieldLabel label="حداقل مبلغ جریمه قابل بخشش" required />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل مبلغی که در صورت اعمال بخشودگی می‌تواند کاهش داده شود. مثال: ۱,۰۰۰,۰۰۰</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر مبلغ جریمه قابل بخشش" required />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر مبلغی که مجاز به بخشودگی است. مثال: ۱۰,۰۰۰,۰۰۰</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <RuleFieldLabel label="حداقل درصد جریمه قابل بخشش" required />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل درصدی که در صورت اعمال بخشودگی می‌تواند کاهش داده شود. مثال: ۱۰ درصد</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="حداکثر درصد جریمه قابل بخشش" required />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر درصدی که مجاز به بخشودگی است. مثال: ۳۰ درصد</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[#415769] pt-6">
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">تاخیر خارج از اختیار خریدار</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در صورت فعال بودن، در شرایطی که تاخیر خارج از اختیار خریدار تشخیص داده شود امکان اعمال بخشودگی جریمه فراهم خواهد بود.</p>
            </div>
            <BusinessSwitch
              checked={Boolean(state.values.forgiveOutsideBuyerControl)}
              onChange={(value) => onValueChange('forgiveOutsideBuyerControl', value)}
              activeLabel="مجاز"
              inactiveLabel="غیرمجاز"
            />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-[#415769] pt-6">
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">تایید مدیر برای بخشودگی‌های بزرگ</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اگر فعال باشد، بخشودگی‌های بالاتر از یک حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.</p>
            </div>
            <BusinessSwitch checked={Boolean(state.values.forgiveManagerApproval)} onChange={(value) => onValueChange('forgiveManagerApproval', value)} />
          </div>
        </div>
      </section>
    </div>
  );
}
