'use client';

import { useState, type ElementType } from 'react';
import { ChevronLeft, CircleDollarSign, CirclePercent, Filter, Layers3 } from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { PENALTY_ITEMS } from '../../contracts/new/_components/penaltiesConfig';
import { MiniToggle as SharedMiniToggle, RuleTextInput as SharedRuleTextInput, SegmentedToggle as SharedSegmentedToggle } from './RuleStylePrimitives';

type ForgiveScope = 'whole' | 'itemized';
type ForgiveValueMode = 'amount' | 'percent';

const WHOLE_CONTRACT_ENTRY = {
  id: 'whole-contract',
  title: 'Ø§Ø¹Ù…Ø§Ù„ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø±ÙˆÛŒ Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯',
  description: 'Ø¯Ø± Ø§ÛŒÙ† Ø¨Ø®Ø´ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø´Ø±Ø§ÛŒØ· Ùˆ Ù…ÛŒØ²Ø§Ù† Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø¬Ø±Ø§ÛŒÙ… Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ ØªØ¹ÛŒÛŒÙ† Ú©Ù†ÛŒØ¯.',
};

const ITEMIZED_FORGIVENESS_ENTRIES = PENALTY_ITEMS.filter((item) => item.id !== 'discount-cancelled').map((item) => ({
  id: item.id,
  title: item.title.replace('Ø¬Ø±ÛŒÙ…Ù‡', 'Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ'),
  description: item.description.replace('ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¬Ø±ÛŒÙ…Ù‡', 'Ø¯Ø± Ø§ÛŒÙ† Ø¨Ø®Ø´ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø´Ø±Ø§ÛŒØ· Ùˆ Ù…ÛŒØ²Ø§Ù† Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø¬Ø±ÛŒÙ…Ù‡').replace('Ø±Ø§ Ù…Ø´Ø®Øµ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.', 'Ø±Ø§ ØªØ¹ÛŒÛŒÙ† Ú©Ù†ÛŒØ¯.'),
}));

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

function MiniToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return <SharedMiniToggle checked={checked} onChange={onChange} />;
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
      <ChevronLeft className="mt-1 h-5 w-5 text-[color:var(--text-muted)]" />
      <div className="flex-1">
        <h3 className="text-lg font-black text-[color:var(--text-strong)]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
    </button>
  );
}

function TabButton({
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
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">Ø¨Ø§ ØªØ§ÛŒÛŒØ¯ Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§ØªØŒ Ø¯Ø± ØµÙˆØ±Øª ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ù…ÙˆØ±Ø¯ÛŒ Ø¯Ø± ØªØ¨ Ø¨Ø¹Ø¯ÛŒØŒ Ø§ÛŒÙ† ØªØ¨ ØºÛŒØ±ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
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

export function ForgivenessRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const [pendingScope, setPendingScope] = useState<ForgiveScope | null>(null);

  const scope = (String(state.values.forgiveScope || 'whole') as ForgiveScope);
  const valueMode = (String(state.values.forgiveValueMode || 'amount') as ForgiveValueMode);
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
              <TabButton title="Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ù…ÙˆØ±Ø¯ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯" icon={Filter} active={scope === 'itemized'} onClick={() => scope !== 'itemized' && setPendingScope('itemized')} />
              <TabButton title="Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø±ÙˆÛŒ Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯" icon={Layers3} active={scope === 'whole'} onClick={() => scope !== 'whole' && setPendingScope('whole')} />
            </div>

            <div className="space-y-8 p-5">
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ú©Ø«Ø± ØªØ¹Ø¯Ø§Ø¯ Ø¯ÙØ¹Ø§Øª ØªØ§Ø®ÛŒØ± Ø¯Ø± ÛŒÚ© Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯" />
                <RuleTextInput value={String(state.values.forgiveMaxDelayCount ?? '')} onChange={(value) => onValueChange('forgiveMaxDelayCount', value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ú©Ø«Ø± Ø¯ÙØ¹Ø§ØªÛŒ Ú©Ù‡ Ø¯Ø± ÛŒÚ© Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ùˆ Ø¯Ø± Ø·ÙˆÙ„ Ù¾Ø±Ø¯Ø§Ø®Øª Ø§Ù‚Ø³Ø§Ø· Ø§Ù†ÙˆØ§Ø¹ Ø³Ø±Ø±Ø³ÛŒØ¯Ù‡Ø§ØŒ Ù…Ø¬Ø§Ø² Ø¨Ù‡ ØªØ§Ø®ÛŒØ± Ùˆ Ù‚Ø§Ø¨Ù„ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø§Ø³Øª Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯. Ù…Ø«Ø§Ù„: Û³ ØªØ§Ø®ÛŒØ± Ù…Ø¬Ø§Ø².</p>
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
          <button
            type="button"
            onClick={() => onValueChange('forgiveEntryId', '')}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Ø¨Ø§Ø²Ú¯Ø´Øª
          </button>
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{selectedEntry.title}</h3>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          <TabButton title="Ø¯Ø±ØµØ¯" icon={CirclePercent} active={valueMode === 'percent'} onClick={() => onValueChange('forgiveValueMode', 'percent')} />
          <TabButton title="Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª" icon={CircleDollarSign} active={valueMode === 'amount'} onClick={() => onValueChange('forgiveValueMode', 'amount')} />
        </div>

        <div className="space-y-8 p-5">
          <div className="flex items-center justify-between gap-4">
            <SegmentedToggle
              checked={Boolean(state.values.forgiveAllowed)}
              onChange={(value) => onValueChange('forgiveAllowed', value)}
              activeLabel="Ù…Ø¬Ø§Ø²"
              inactiveLabel="ØºÛŒØ±Ù…Ø¬Ø§Ø²"
            />
            <div className="text-right">
              <h3 className="text-[20px] font-black text-[color:var(--text-strong)]">Ø¨Ù‡ Ø§Ø²Ø§ÛŒ Ù‡Ø± Ø¨Ø¯Ù‡ÛŒ/ÙØ§Ú©ØªÙˆØ±</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ø§Ú¯Ø± Ø§ÛŒÙ† Ú¯Ø²ÛŒÙ†Ù‡ Ù…Ø¬Ø§Ø² Ø¨Ø§Ø´Ø¯ØŒ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ù…Ø¨Ù„Øº Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø¬Ø±ÛŒÙ…Ù‡ Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ ØªØ¹ÛŒÛŒÙ† Ú©Ù†ÛŒØ¯.</p>
            </div>
          </div>

          {valueMode === 'amount' ? (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡ Ù‚Ø§Ø¨Ù„ Ø¨Ø®Ø´Ø´" />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="ØªÙˆÙ…Ø§Ù†" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø¨Ù„ØºÛŒ Ú©Ù‡ Ø¯Ø± ØµÙˆØ±Øª Ø§Ø¹Ù…Ø§Ù„ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ú©Ø§Ù‡Ø´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯. Ù…Ø«Ø§Ù„: Û±,Û°Û°Û°,Û°Û°Û°</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ú©Ø«Ø± Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡ Ù‚Ø§Ø¨Ù„ Ø¨Ø®Ø´Ø´" />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="ØªÙˆÙ…Ø§Ù†" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ú©Ø«Ø± Ù…Ø¨Ù„ØºÛŒ Ú©Ù‡ Ù…Ø¬Ø§Ø² Ø¨Ù‡ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø§Ø³Øª. Ù…Ø«Ø§Ù„: Û±Û°,Û°Û°Û°,Û°Û°Û°</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 border-t border-[#415769] pt-6">
              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ù‚Ù„ Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡ Ù‚Ø§Ø¨Ù„ Ø¨Ø®Ø´Ø´" />
                <RuleTextInput value={String(state.values.forgiveMinValue ?? '')} onChange={(value) => onValueChange('forgiveMinValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ù‚Ù„ Ø¯Ø±ØµØ¯ÛŒ Ú©Ù‡ Ø¯Ø± ØµÙˆØ±Øª Ø§Ø¹Ù…Ø§Ù„ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ú©Ø§Ù‡Ø´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯. Ù…Ø«Ø§Ù„: Û±Û° Ø¯Ø±ØµØ¯</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ø­Ø¯Ø§Ú©Ø«Ø± Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡ Ù‚Ø§Ø¨Ù„ Ø¨Ø®Ø´Ø´" />
                <RuleTextInput value={String(state.values.forgiveMaxValue ?? '')} onChange={(value) => onValueChange('forgiveMaxValue', value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø­Ø¯Ø§Ú©Ø«Ø± Ø¯Ø±ØµØ¯ÛŒ Ú©Ù‡ Ù…Ø¬Ø§Ø² Ø¨Ù‡ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø§Ø³Øª. Ù…Ø«Ø§Ù„: Û³Û° Ø¯Ø±ØµØ¯</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[#415769] pt-6">
            <SegmentedToggle
              checked={Boolean(state.values.forgiveOutsideBuyerControl)}
              onChange={(value) => onValueChange('forgiveOutsideBuyerControl', value)}
              activeLabel="Ù…Ø¬Ø§Ø²"
              inactiveLabel="ØºÛŒØ±Ù…Ø¬Ø§Ø²"
            />
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">ØªØ§Ø®ÛŒØ± Ø®Ø§Ø±Ø¬ Ø§Ø² Ø§Ø®ØªÛŒØ§Ø± Ø®Ø±ÛŒØ¯Ø§Ø±</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ø¯Ø± ØµÙˆØ±Øª ÙØ¹Ø§Ù„ Ø¨ÙˆØ¯Ù†ØŒ Ø¯Ø± Ø´Ø±Ø§ÛŒØ·ÛŒ Ú©Ù‡ ØªØ§Ø®ÛŒØ± Ø®Ø§Ø±Ø¬ Ø§Ø² Ø§Ø®ØªÛŒØ§Ø± Ø®Ø±ÛŒØ¯Ø§Ø± ØªØ´Ø®ÛŒØµ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯ Ø§Ù…Ú©Ø§Ù† Ø§Ø¹Ù…Ø§Ù„ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒ Ø¬Ø±ÛŒÙ…Ù‡ ÙØ±Ø§Ù‡Ù… Ø®ÙˆØ§Ù‡Ø¯ Ø¨ÙˆØ¯.</p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-[#415769] pt-6">
            <MiniToggle checked={Boolean(state.values.forgiveManagerApproval)} onChange={(value) => onValueChange('forgiveManagerApproval', value)} />
            <div className="text-right">
              <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">ØªØ§ÛŒÛŒØ¯ Ù…Ø¯ÛŒØ± Ø¨Ø±Ø§ÛŒ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒâ€ŒÙ‡Ø§ÛŒ Ø¨Ø²Ø±Ú¯</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ø§Ú¯Ø± ÙØ¹Ø§Ù„ Ø¨Ø§Ø´Ø¯ØŒ Ø¨Ø®Ø´ÙˆØ¯Ú¯ÛŒâ€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù„Ø§ØªØ± Ø§Ø² ÛŒÚ© Ø­Ø¯ Ù…Ø´Ø®Øµ ÙÙ‚Ø· Ø¨Ø§ ØªØ§ÛŒÛŒØ¯ Ù†Ù‚Ø´â€ŒÙ‡Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØªÛŒ Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

