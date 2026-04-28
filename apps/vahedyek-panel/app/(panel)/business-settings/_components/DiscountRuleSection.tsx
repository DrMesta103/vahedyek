'use client';

import { useEffect, useState, type ElementType } from 'react';
import { ChevronLeft, CircleDollarSign, CirclePercent, Filter, Layers3 } from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { DISCOUNT_GROUPS, ITEMIZED_DISCOUNT_ENTRIES, WHOLE_DISCOUNT_ENTRY } from '../../contracts/new/_components/discountsConfig';
import { MiniToggle as SharedMiniToggle, RuleTextInput as SharedRuleTextInput, SegmentedToggle as SharedSegmentedToggle } from './RuleStylePrimitives';

type DiscountGroupId = 'contract-base' | 'early-payment';
type DiscountScope = 'whole' | 'itemized';
type DiscountValueMode = 'amount' | 'percent';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function SegmentedToggle({
  checked,
  onChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return <SharedSegmentedToggle checked={checked} onChange={onChange} activeLabel={activeLabel} inactiveLabel={inactiveLabel} />;
}

function FieldLabel({ label, required = true }: { label: string; required?: boolean }) {
  return (
    <label className="mb-3 block text-right text-[13px] font-bold text-slate-700">
      {label}
      {required ? <span className="mr-1 text-[#ff6b7a]">*</span> : null}
    </label>
  );
}

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

function MiniToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return <SharedMiniToggle checked={checked} onChange={onChange} />;
}

function TopCard({
  title,
  description,
  configured = true,
  onClick,
}: {
  title: string;
  description: string;
  configured?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
    >
      <ChevronLeft className="mt-1 h-5 w-5 text-[color:var(--text-muted)]" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <h3 className="text-lg font-black text-[color:var(--text-strong)]">{title}</h3>
          {configured ? <span className="rounded-full border border-[color:var(--theme-action-border)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">تنظیمات انجام‌شده</span> : null}
        </div>
        <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
    </button>
  );
}

function ValueModeTab({
  title,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-w-[200px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition',
        active ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800',
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border transition',
          active ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-slate-200 bg-white text-slate-500',
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-sm font-bold">{title}</span>
      <span className={cn('absolute inset-x-4 bottom-0 h-[2px] transition', active ? 'bg-[#a6e8ef]' : 'bg-transparent group-hover:bg-slate-200')} />
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
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">با تایید این عملیات، در صورت فعال‌سازی موردی در تب بعدی، آیتم قبلی غیرفعال می‌شود.</p>
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

export function DiscountRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const [pendingScope, setPendingScope] = useState<DiscountScope | null>(null);

  const selectedGroup = (state.activeChip || '') as DiscountGroupId | '';
  const scope = String(state.values.discountScope || 'whole') as DiscountScope;
  const entryId = String(state.values.discountEntryId || '');
  const valueMode = String(state.values.discountValueMode || 'percent') as DiscountValueMode;
  const managerApproval = Boolean(state.values.discountManagerApproval);

  useEffect(() => {
    if (!state.values.discountScope) onValueChange('discountScope', 'whole');
    if (!state.values.discountValueMode) onValueChange('discountValueMode', 'percent');
  }, [onValueChange, state.values.discountScope, state.values.discountValueMode]);

  const selectedEntry =
    scope === 'whole'
      ? entryId === WHOLE_DISCOUNT_ENTRY.id
        ? WHOLE_DISCOUNT_ENTRY
        : null
      : ITEMIZED_DISCOUNT_ENTRIES.find((item) => item.id === entryId) ?? null;

  if (!selectedGroup) {
    return (
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {DISCOUNT_GROUPS.map((group) => (
            <TopCard
              key={group.id}
              title={group.title}
              description={group.description}
              configured={group.configured}
              onClick={() => {
                onValueChange('activeChip', group.id);
                if (group.id === 'contract-base') {
                  onValueChange('discountScope', scope || 'whole');
                  onValueChange('discountEntryId', '');
                } else {
                  onValueChange('discountScope', 'itemized');
                  onValueChange('discountEntryId', 'early-payment');
                }
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (selectedGroup === 'contract-base' && !selectedEntry) {
    return (
      <>
        <ConfirmModal
          open={Boolean(pendingScope)}
          onCancel={() => setPendingScope(null)}
          onConfirm={() => {
            if (!pendingScope) return;
            onValueChange('discountScope', pendingScope);
            onValueChange('discountEntryId', pendingScope === 'whole' ? WHOLE_DISCOUNT_ENTRY.id : 'installments');
            setPendingScope(null);
          }}
        />

        <div className="space-y-5">
          <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onValueChange('activeChip', '')}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
              >
                <ChevronLeft className="h-4 w-4" />
                بازگشت
              </button>
              <div className="text-right">
                <h3 className="text-xl font-black text-[color:var(--text-strong)]">اعمال تخفیف روی مبلغ پایه قرارداد</h3>
              </div>
            </div>
          </section>

          <section className="overflow-visible rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
            <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
              <ValueModeTab
                title="تخفیف روی کل قرارداد"
                icon={Layers3}
                active={scope === 'whole'}
                onClick={() => {
                  if (scope !== 'whole') setPendingScope('whole');
                }}
              />
              <ValueModeTab
                title="تخفیف موردی قرارداد"
                icon={Filter}
                active={scope === 'itemized'}
                onClick={() => {
                  if (scope !== 'itemized') setPendingScope('itemized');
                }}
              />
            </div>

            <div className="grid gap-3 p-5 lg:grid-cols-2">
              {scope === 'whole' ? (
                <TopCard
                  title={WHOLE_DISCOUNT_ENTRY.title}
                  description={WHOLE_DISCOUNT_ENTRY.description}
                  configured={WHOLE_DISCOUNT_ENTRY.configured}
                  onClick={() => onValueChange('discountEntryId', WHOLE_DISCOUNT_ENTRY.id)}
                />
              ) : (
                ITEMIZED_DISCOUNT_ENTRIES.map((entry) => (
                  <TopCard
                    key={entry.id}
                    title={entry.title}
                    description={entry.description}
                    configured
                    onClick={() => onValueChange('discountEntryId', entry.id)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </>
    );
  }

  const detailTitle = selectedGroup === 'early-payment' ? 'تخفیف مشوق پرداخت زودتر از موعد' : selectedEntry?.title ?? '';

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (selectedGroup === 'contract-base' && selectedEntry) {
                onValueChange('discountEntryId', '');
                return;
              }
              onValueChange('activeChip', '');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت
          </button>
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{detailTitle}</h3>
            {selectedEntry?.description ? <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{selectedEntry.description}</p> : null}
          </div>
        </div>
      </section>

      <section className="overflow-visible rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <ValueModeTab title="مبلغ" icon={CircleDollarSign} active={valueMode === 'amount'} onClick={() => onValueChange('discountValueMode', 'amount')} />
          <ValueModeTab title="درصد" icon={CirclePercent} active={valueMode === 'percent'} onClick={() => onValueChange('discountValueMode', 'percent')} />
        </div>

        <div className="space-y-8 p-5">
          {valueMode === 'amount' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="حداقل مبلغ تخفیف" />
                <RuleTextInput value={String(state.values.discountMinValue ?? '')} onChange={(value) => onValueChange('discountMinValue', value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل مبلغی که در صورت اعمال تخفیف می‌تواند کاهش داده شود. مثال: ۳۰,۰۰۰ تومان</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="حداکثر مبلغ تخفیف" />
                <RuleTextInput value={String(state.values.discountMaxValue ?? '')} onChange={(value) => onValueChange('discountMaxValue', value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر مبلغی که مجاز به تخفیف است. مثال: ۳۰۰,۰۰۰ تومان</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="حداقل درصد تخفیف" />
                <RuleTextInput value={String(state.values.discountMinValue ?? '')} onChange={(value) => onValueChange('discountMinValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداقل درصدی که در صورت اعمال تخفیف می‌تواند کاهش داده شود. مثال: ۲ درصد</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="حداکثر درصد تخفیف" />
                <RuleTextInput value={String(state.values.discountMaxValue ?? '')} onChange={(value) => onValueChange('discountMaxValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">حداکثر درصدی که مجاز به تخفیف است. مثال: ۴ درصد</p>
              </div>
            </div>
          )}

          <div className="border-t border-[#415769] pt-6">
            <button
              type="button"
              onClick={() => onValueChange('discountConditionConfigured', !Boolean(state.values.discountConditionConfigured))}
              className="flex w-full items-center justify-between rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
            >
              <ChevronLeft className="h-5 w-5 text-[color:var(--text-muted)]" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="rounded-full border border-[color:var(--theme-action-border)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">تنظیمات انجام‌شده</span>
                  <h3 className="text-lg font-black text-[color:var(--text-strong)]">شرط تخفیف و خوش‌حسابی تخفیف</h3>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در این بخش می‌توانید مشخص کنید که تحت چه شرایطی می‌خواهید تخفیف برای کاربر در نظر بگیرید.</p>
              </div>
            </button>
          </div>

          <div className="space-y-5 border-t border-[#415769] pt-6">
            <div className="flex items-start justify-between gap-4">
              <MiniToggle checked={managerApproval} onChange={(value) => onValueChange('discountManagerApproval', value)} />
              <div className="text-right">
                <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">تایید مدیر برای تخفیف‌های بزرگ</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">در صورت فعال بودن، تخفیف‌های بالاتر از یک حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.</p>
              </div>
            </div>

            {managerApproval ? (
              <div className="space-y-4">
                <FieldLabel label="آستانه تایید مدیر" />
                <RuleTextInput
                  value={String(state.values.discountApprovalThreshold ?? '')}
                  onChange={(value) => onValueChange('discountApprovalThreshold', value)}
                  suffix={valueMode === 'percent' ? '%' : 'تومان'}
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">اگر مقدار تخفیف از این حد عبور کند، درخواست باید توسط مدیر یا واحد مالی تایید شود.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
