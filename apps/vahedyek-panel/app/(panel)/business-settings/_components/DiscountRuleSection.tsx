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
  activeLabel = 'ÙØ¹Ø§Ù„',
  inactiveLabel = 'ØºÛŒØ±ÙØ¹Ø§Ù„',
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
          {configured ? <span className="rounded-full border border-[color:var(--theme-action-border)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø§Ù†Ø¬Ø§Ù…â€ŒØ´Ø¯Ù‡</span> : null}
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
          <h3 className="text-2xl font-black text-[color:var(--text-strong)]">ØªØºÛŒÛŒØ± Ø¨Ø®Ø´ Ùˆ ØºÛŒØ±ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">Ø¨Ø§ ØªØ§ÛŒÛŒØ¯ Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§ØªØŒ Ø¯Ø± ØµÙˆØ±Øª ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ù…ÙˆØ±Ø¯ÛŒ Ø¯Ø± ØªØ¨ Ø¨Ø¹Ø¯ÛŒØŒ Ø¢ÛŒØªÙ… Ù‚Ø¨Ù„ÛŒ ØºÛŒØ±ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
        </div>
        <div className="flex items-center justify-end gap-8 border-t border-slate-100 px-6 py-5">
          <button type="button" onClick={onCancel} className="text-sm font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--text-strong)]">
            Ù„ØºÙˆ
          </button>
          <button type="button" onClick={onConfirm} className="text-sm font-black text-[#ff5c5c] transition hover:text-[#ff8a8a]">
            ØªØ§ÛŒÛŒØ¯
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
  const scope = (String(state.values.discountScope || 'whole') as DiscountScope);
  const entryId = String(state.values.discountEntryId || '');
  const valueMode = (String(state.values.discountValueMode || 'percent') as DiscountValueMode);
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
                Ø¨Ø§Ø²Ú¯Ø´Øª
              </button>
              <div className="text-right">
                <h3 className="text-xl font-black text-[color:var(--text-strong)]">Ø§Ø¹Ù…Ø§Ù„ ØªØ®ÙÛŒÙ Ø±ÙˆÛŒ Ù…Ø¨Ù„Øº Ù¾Ø§ÛŒÙ‡ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯</h3>
              </div>
            </div>
          </section>

          <section className="overflow-visible rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
            <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
              <ValueModeTab
                title="ØªØ®ÙÛŒÙ Ø±ÙˆÛŒ Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯"
                icon={Layers3}
                active={scope === 'whole'}
                onClick={() => {
                  if (scope !== 'whole') setPendingScope('whole');
                }}
              />
              <ValueModeTab
                title="ØªØ®ÙÛŒÙ Ù…ÙˆØ±Ø¯ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯"
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

  const detailTitle = selectedGroup === 'early-payment' ? 'ØªØ®ÙÛŒÙ Ù…Ø´ÙˆÙ‚ Ù¾Ø±Ø¯Ø§Ø®Øª Ø²ÙˆØ¯ØªØ± Ø§Ø² Ù…ÙˆØ¹Ø¯' : selectedEntry?.title ?? '';

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
            Ø¨Ø§Ø²Ú¯Ø´Øª
          </button>
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{detailTitle}</h3>
            {selectedEntry?.description ? <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{selectedEntry.description}</p> : null}
          </div>
        </div>
      </section>

      <section className="overflow-visible rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <ValueModeTab title="Ù…Ø¨Ù„Øº" icon={CircleDollarSign} active={valueMode === 'amount'} onClick={() => onValueChange('discountValueMode', 'amount')} />
          <ValueModeTab title="Ø¯Ø±ØµØ¯" icon={CirclePercent} active={valueMode === 'percent'} onClick={() => onValueChange('discountValueMode', 'percent')} />
        </div>

        <div className="space-y-8 p-5">
          {valueMode === 'amount' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø¨Ù„Øº ØªØ®ÙÛŒÙ" />
                <RuleTextInput value={String(state.values.discountMinValue ?? '')} onChange={(value) => onValueChange('discountMinValue', value)} suffix="ØªÙˆÙ…Ø§Ù†" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø¨Ù„ØºÛŒ Ú©Ù‡ Ø¯Ø± ØµÙˆØ±Øª Ø§Ø¹Ù…Ø§Ù„ ØªØ®ÙÛŒÙ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ú©Ø§Ù‡Ø´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯. Ù…Ø«Ø§Ù„: Û³Û°,Û°Û°Û° ØªÙˆÙ…Ø§Ù†</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ú©Ø«Ø± Ù…Ø¨Ù„Øº ØªØ®ÙÛŒÙ" />
                <RuleTextInput value={String(state.values.discountMaxValue ?? '')} onChange={(value) => onValueChange('discountMaxValue', value)} suffix="ØªÙˆÙ…Ø§Ù†" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ú©Ø«Ø± Ù…Ø¨Ù„ØºÛŒ Ú©Ù‡ Ù…Ø¬Ø§Ø² Ø¨Ù‡ ØªØ®ÙÛŒÙ Ø§Ø³Øª. Ù…Ø«Ø§Ù„: Û³Û°Û°,Û°Û°Û° ØªÙˆÙ…Ø§Ù†</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ù‚Ù„ Ø¯Ø±ØµØ¯ ØªØ®ÙÛŒÙ" />
                <RuleTextInput value={String(state.values.discountMinValue ?? '')} onChange={(value) => onValueChange('discountMinValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ù‚Ù„ Ø¯Ø±ØµØ¯ÛŒ Ú©Ù‡ Ø¯Ø± ØµÙˆØ±Øª Ø§Ø¹Ù…Ø§Ù„ ØªØ®ÙÛŒÙ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ú©Ø§Ù‡Ø´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯. Ù…Ø«Ø§Ù„: Û² Ø¯Ø±ØµØ¯</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ú©Ø«Ø± Ø¯Ø±ØµØ¯ ØªØ®ÙÛŒÙ" />
                <RuleTextInput value={String(state.values.discountMaxValue ?? '')} onChange={(value) => onValueChange('discountMaxValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ú©Ø«Ø± Ø¯Ø±ØµØ¯ÛŒ Ú©Ù‡ Ù…Ø¬Ø§Ø² Ø¨Ù‡ ØªØ®ÙÛŒÙ Ø§Ø³Øª. Ù…Ø«Ø§Ù„: Û´ Ø¯Ø±ØµØ¯</p>
              </div>
            </div>
          )}

          <div className="border-t border-[#415769] pt-6">
            <button
              type="button"
              onClick={() => onValueChange('discountConditionConfigured', !Boolean(state.values.discountConditionConfigured))}
              className="flex w-full items-center justify-between rounded-[18px] rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
            >
              <ChevronLeft className="h-5 w-5 text-[color:var(--text-muted)]" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="rounded-full border border-[color:var(--theme-action-border)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø§Ù†Ø¬Ø§Ù…â€ŒØ´Ø¯Ù‡</span>
                  <h3 className="text-lg font-black text-[color:var(--text-strong)]">Ø´Ø±Ø· ØªØ®ÙÛŒÙ Ùˆ Ø®ÙˆØ´â€ŒØ­Ø³Ø§Ø¨ÛŒ ØªØ®ÙÛŒÙ</h3>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ø¯Ø± Ø§ÛŒÙ† Ø¨Ø®Ø´ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ù…Ø´Ø®Øµ Ú©Ù†ÛŒØ¯ Ú©Ù‡ ØªØ­Øª Ú†Ù‡ Ø´Ø±Ø§ÛŒØ·ÛŒ Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡ÛŒØ¯ ØªØ®ÙÛŒÙ Ø¨Ø±Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø± Ø¯Ø± Ù†Ø¸Ø± Ø¨Ú¯ÛŒØ±ÛŒØ¯.</p>
              </div>
            </button>
          </div>

          <div className="space-y-5 border-t border-[#415769] pt-6">
            <div className="flex items-start justify-between gap-4">
              <MiniToggle checked={managerApproval} onChange={(value) => onValueChange('discountManagerApproval', value)} />
              <div className="text-right">
                <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">ØªØ§ÛŒÛŒØ¯ Ù…Ø¯ÛŒØ± Ø¨Ø±Ø§ÛŒ ØªØ®ÙÛŒÙâ€ŒÙ‡Ø§ÛŒ Ø¨Ø²Ø±Ú¯</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ø¯Ø± ØµÙˆØ±Øª ÙØ¹Ø§Ù„ Ø¨ÙˆØ¯Ù†ØŒ ØªØ®ÙÛŒÙâ€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù„Ø§ØªØ± Ø§Ø² ÛŒÚ© Ø­Ø¯ Ù…Ø´Ø®Øµ ÙÙ‚Ø· Ø¨Ø§ ØªØ§ÛŒÛŒØ¯ Ù†Ù‚Ø´â€ŒÙ‡Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØªÛŒ Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>
            </div>

            {managerApproval ? (
              <div className="space-y-4">
                <FieldLabel label="Ø¢Ø³ØªØ§Ù†Ù‡ ØªØ§ÛŒÛŒØ¯ Ù…Ø¯ÛŒØ±" />
                <RuleTextInput
                  value={String(state.values.discountApprovalThreshold ?? '')}
                  onChange={(value) => onValueChange('discountApprovalThreshold', value)}
                  suffix={valueMode === 'percent' ? '%' : 'ØªÙˆÙ…Ø§Ù†'}
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø§Ú¯Ø± Ù…Ù‚Ø¯Ø§Ø± ØªØ®ÙÛŒÙ Ø§Ø² Ø§ÛŒÙ† Ø­Ø¯ Ø¹Ø¨ÙˆØ± Ú©Ù†Ø¯ØŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø§ÛŒØ¯ ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ± ÛŒØ§ ÙˆØ§Ø­Ø¯ Ù…Ø§Ù„ÛŒ ØªØ§ÛŒÛŒØ¯ Ø´ÙˆØ¯.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

