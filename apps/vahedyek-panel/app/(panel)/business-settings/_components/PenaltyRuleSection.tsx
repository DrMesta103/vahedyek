'use client';

import type { ElementType } from 'react';
import {
  ArrowUpRight,
  BadgePercent,
  ChevronLeft,
  CircleDollarSign,
  CirclePercent,
  TrendingUp,
} from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { PENALTY_ITEMS } from '../../contracts/new/_components/penaltiesConfig';
import { RuleTextInput as SharedRuleTextInput, SegmentedToggle as SharedSegmentedToggle } from './RuleStylePrimitives';

type PenaltyMode = 'fixed' | 'debt-percent' | 'contract-percent' | 'progressive';
type RoundRule = '0.0' | '0.00' | 'Ú©Ø³Ø± 100' | 'Ú©Ø³Ø± 1000';
type ExtraFeeType = 'Ø¯Ø±ØµØ¯' | 'Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª';

const PERIOD_OPTIONS = ['Ø±ÙˆØ²Ø§Ù†Ù‡', 'Ù…Ø§Ù‡Ø§Ù†Ù‡', 'Ø³Ø§Ù„Ø§Ù†Ù‡'] as const;
const ROUND_RULE_OPTIONS: RoundRule[] = ['0.0', '0.00', 'Ú©Ø³Ø± 100', 'Ú©Ø³Ø± 1000'];
const EXTRA_FEE_TYPES: ExtraFeeType[] = ['Ø¯Ø±ØµØ¯', 'Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª'];

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
  icon: ElementType;
}> = [
  {
    id: 'fixed',
    title: 'Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø±ÙˆØ²/Ù…Ø§Ù‡',
    description: 'Ø¯Ø± Ø§ÛŒÙ† Ø±ÙˆØ´ Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø±ÙˆØ²ØŒ Ù…Ø§Ù‡ ÛŒØ§ Ø³Ø§Ù„ ØªØ§Ø®ÛŒØ± Ù…Ø¨Ù„Øº Ø«Ø§Ø¨ØªÛŒ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø¬Ø±ÛŒÙ…Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.',
    icon: CircleDollarSign,
  },
  {
    id: 'debt-percent',
    title: 'Ø¯Ø±ØµØ¯ÛŒ Ø§Ø² Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ Ù…Ø¹ÙˆÙ‚',
    description: 'Ø¯Ø± Ø§ÛŒÙ† Ø±ÙˆØ´ Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø¯Ø±ØµØ¯ÛŒ Ø§Ø² Ù…Ø§Ù†Ø¯Ù‡ Ø¨Ø¯Ù‡ÛŒ Ø®Ø±ÛŒØ¯Ø§Ø± Ù…Ø­Ø§Ø³Ø¨Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.',
    icon: BadgePercent,
  },
  {
    id: 'contract-percent',
    title: 'Ø¯Ø±ØµØ¯ÛŒ Ø§Ø² Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯',
    description: 'Ø¯Ø± Ø§ÛŒÙ† Ø±ÙˆØ´ Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø¯Ø±ØµØ¯ÛŒ Ø§Ø² Ù…Ø¨Ù„Øº Ú©Ù„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.',
    icon: CirclePercent,
  },
  {
    id: 'progressive',
    title: 'Ø¬Ø±ÛŒÙ…Ù‡ ØªØµØ§Ø¹Ø¯ÛŒ Ø¨Ø§ Ø±ÙˆØ²Ù‡Ø§ÛŒ ØªØ§Ø®ÛŒØ±',
    description: 'Ø¯Ø± Ø§ÛŒÙ† Ø±ÙˆØ´ Ø¨Ø§ Ø§ÙØ²Ø§ÛŒØ´ Ù…Ø¯Øª ØªØ§Ø®ÛŒØ±ØŒ Ù†Ø±Ø® Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø¨Ø§Ø²Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ù…Ø§Ù†ÛŒ Ø§ÙØ²Ø§ÛŒØ´ Ù¾ÛŒØ¯Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.',
    icon: ArrowUpRight,
  },
];

const PROGRESSIVE_DEFAULT_ROWS = [
  { fromKey: 'penaltyProgressiveRow1From', toKey: 'penaltyProgressiveRow1To', rateKey: 'penaltyProgressiveRow1Rate', from: '1', to: '4', rate: '0.5' },
  { fromKey: 'penaltyProgressiveRow2From', toKey: 'penaltyProgressiveRow2To', rateKey: 'penaltyProgressiveRow2Rate', from: '5', to: '6', rate: '0.5' },
  { fromKey: 'penaltyProgressiveRow3From', toKey: 'penaltyProgressiveRow3To', rateKey: 'penaltyProgressiveRow3Rate', from: '7', to: '45', rate: '3.3' },
  { fromKey: 'penaltyProgressiveRow4From', toKey: 'penaltyProgressiveRow4To', rateKey: 'penaltyProgressiveRow4Rate', from: '', to: '', rate: '' },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
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

function ChoicePills({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded-full border px-5 py-2 text-sm font-bold transition',
            value === option ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50',
          )}
        >
          {value === option ? <span className="ml-2">âœ“</span> : null}
          {option}
        </button>
      ))}
    </div>
  );
}

function PenaltyModeTab({
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
        'group relative flex min-w-[168px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition',
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

function ProgressRow({
  from,
  to,
  rate,
  onChange,
}: {
  from: string;
  to: string;
  rate: string;
  onChange: (field: 'from' | 'to' | 'rate', value: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_24px_170px_170px] lg:items-end">
      <div className="space-y-3">
        <FieldLabel label="Ù†Ø±Ø® Ø¬Ø±ÛŒÙ…Ù‡" />
        <RuleTextInput value={rate} onChange={(value) => onChange('rate', value)} suffix="%" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">Ù…Ø«Ø§Ù„: Û°.ÛµÙª</p>
      </div>
      <div className="hidden pb-8 text-center text-2xl text-[color:var(--text-muted)] lg:block">-</div>
      <div className="space-y-3">
        <FieldLabel label="ØªØ§" />
        <RuleTextInput value={to} onChange={(value) => onChange('to', value)} placeholder="ØªØ§ Ø±ÙˆØ²" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">Ù…Ø«Ø§Ù„: ØªØ§ ÛµÛ° Ø±ÙˆØ² ØªØ§Ø®ÛŒØ±</p>
      </div>
      <div className="space-y-3">
        <FieldLabel label="Ø§Ø²" />
        <RuleTextInput value={from} onChange={(value) => onChange('from', value)} placeholder="Ø§Ø² Ø±ÙˆØ²" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">Ù…Ø«Ø§Ù„: Ø§Ø² Û± Ø±ÙˆØ² ØªØ§Ø®ÛŒØ±</p>
      </div>
    </div>
  );
}

function ExtraFeeCard({
  enabled,
  feeType,
  amount,
  roundRule,
  onEnabledChange,
  onFeeTypeChange,
  onAmountChange,
  onRoundRuleChange,
}: {
  enabled: boolean;
  feeType: ExtraFeeType;
  amount: string;
  roundRule: string;
  onEnabledChange: (value: boolean) => void;
  onFeeTypeChange: (value: ExtraFeeType) => void;
  onAmountChange: (value: string) => void;
  onRoundRuleChange: (value: string) => void;
}) {
  return (
    <section className="space-y-5 rounded-[22px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 text-right">
          <h3 className="text-xl font-black text-[color:var(--text-strong)]">Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">Ù…Ø¨Ù„Øº ÛŒØ§ Ø¯Ø±ØµØ¯ Ø«Ø§Ø¨ØªÛŒ Ú©Ù‡ Ø¹Ù„Ø§ÙˆÙ‡ Ø¨Ø± Ø¬Ø±ÛŒÙ…Ù‡ ØªØ§Ø®ÛŒØ± Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø´Ø±Ø· Ù…Ø¹ÙˆÙ‚ Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
        </div>

        <SegmentedToggle checked={enabled} onChange={onEnabledChange} />
      </div>

      {enabled ? (
        <div className="space-y-5">
          <div className="space-y-4">
            <h4 className="text-right text-lg font-black text-[color:var(--text-strong)]">Ù…Ø´Ø®Øµ Ú©Ù†ÛŒØ¯ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø¯Ø±ØµØ¯ Ù…ÛŒâ€ŒØ¨Ø§Ø´Ø¯ ÛŒØ§ Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª</h4>
            <SegmentedToggle
              checked={feeType === 'Ø¯Ø±ØµØ¯'}
              onChange={(value) => onFeeTypeChange(value ? 'Ø¯Ø±ØµØ¯' : 'Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª')}
              activeLabel="Ø¯Ø±ØµØ¯"
              inactiveLabel="Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª"
            />
          </div>

          <div className="space-y-4">
            <FieldLabel label="Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø§Ù„Ø§Ø³Ø±ÛŒ" />
            <RuleTextInput value={amount} onChange={onAmountChange} suffix={feeType === 'Ø¯Ø±ØµØ¯' ? '%' : 'ØªÙˆÙ…Ø§Ù†'} />
            <p className="text-right text-sm text-[color:var(--text-muted)]">Ø§ÛŒÙ† Ù…Ø¨Ù„Øº ÛŒÚ©â€ŒØ¨Ø§Ø± Ù‡Ù†Ú¯Ø§Ù… Ø§ÙˆÙ„ÛŒÙ† ØªØ§Ø®ÛŒØ± Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø³Ø±Ø±Ø³ÛŒØ¯ Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
          </div>

          <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
            <h4 className="text-right text-lg font-black text-[color:var(--text-strong)]">Ù‚Ø§Ø¹Ø¯Ù‡ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ù…Ø¨Ù„Øº Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯</h4>
            <ChoicePills options={ROUND_RULE_OPTIONS} value={roundRule} onChange={onRoundRuleChange} />
            <p className="text-right text-sm text-[color:var(--text-muted)]">Ù…Ø´Ø®Øµ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø¹Ø¯Ø¯ Ù†Ù‡Ø§ÛŒÛŒ Ù‡Ø²ÛŒÙ†Ù‡ Ø¯ÛŒØ±Ú©Ø±Ø¯ Ø¨Ù‡ Ú†Ù‡ ÙˆØ§Ø­Ø¯ÛŒ Ú¯Ø±Ø¯ Ø´ÙˆØ¯ Ù…Ø«Ù„ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ø¨Ù‡ Û±Û°Û° ÛŒØ§ Û±Û°Û°Û° ØªÙˆÙ…Ø§Ù†.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getModeValues(mode: PenaltyMode) {
  switch (mode) {
    case 'fixed':
      return {
        periodKey: 'penaltyFixedPeriod',
        amountKey: 'penaltyFixedAmount',
        graceKey: 'penaltyFixedGraceDays',
        extraEnabledKey: 'penaltyFixedExtraFeeEnabled',
        extraTypeKey: 'penaltyFixedExtraFeeType',
        extraAmountKey: 'penaltyFixedExtraFeeAmount',
        extraRoundKey: 'penaltyFixedExtraFeeRound',
      };
    case 'debt-percent':
      return {
        periodKey: 'penaltyDebtPeriod',
        percentKey: 'penaltyDebtPercent',
        bankKey: 'penaltyDebtBankPercent',
        graceKey: 'penaltyDebtGraceDays',
        roundKey: 'penaltyDebtRound',
        extraEnabledKey: 'penaltyDebtExtraFeeEnabled',
        extraTypeKey: 'penaltyDebtExtraFeeType',
        extraAmountKey: 'penaltyDebtExtraFeeAmount',
        extraRoundKey: 'penaltyDebtExtraFeeRound',
      };
    case 'contract-percent':
      return {
        periodKey: 'penaltyContractPeriod',
        percentKey: 'penaltyContractPercent',
        bankKey: 'penaltyContractBankPercent',
        graceKey: 'penaltyContractGraceDays',
        roundKey: 'penaltyContractRound',
        extraEnabledKey: 'penaltyContractExtraFeeEnabled',
        extraTypeKey: 'penaltyContractExtraFeeType',
        extraAmountKey: 'penaltyContractExtraFeeAmount',
        extraRoundKey: 'penaltyContractExtraFeeRound',
      };
    case 'progressive':
      return {
        periodKey: 'penaltyProgressivePeriod',
        bankKey: 'penaltyProgressiveBankPercent',
        graceKey: 'penaltyProgressiveGraceDays',
        roundKey: 'penaltyProgressiveRound',
        extraEnabledKey: 'penaltyProgressiveExtraFeeEnabled',
        extraTypeKey: 'penaltyProgressiveExtraFeeType',
        extraAmountKey: 'penaltyProgressiveExtraFeeAmount',
        extraRoundKey: 'penaltyProgressiveExtraFeeRound',
      };
  }
}

export function PenaltyRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const activeMode = (state.activeTab || 'fixed') as PenaltyMode;
  const selectedPenalty = PENALTY_ITEMS.find((item) => item.id === state.activeChip);
  const currentMode = MODE_OPTIONS.find((item) => item.id === activeMode) ?? MODE_OPTIONS[0];
  const keys = getModeValues(currentMode.id);

  const applyProgressiveSuggestion = () => {
    PROGRESSIVE_DEFAULT_ROWS.forEach((row) => {
      onValueChange(row.fromKey, row.from);
      onValueChange(row.toKey, row.to);
      onValueChange(row.rateKey, row.rate);
    });
  };

  if (!selectedPenalty) {
    return (
      <section className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {PENALTY_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onValueChange('activeChip', item.id);
                onValueChange('activeTab', 'fixed');
              }}
              className="flex items-start justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
            >
              <ChevronLeft className="mt-1 h-5 w-5 text-[color:var(--text-muted)]" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <h3 className="text-lg font-black text-[color:var(--text-strong)]">{item.title}</h3>
                  <span className="rounded-full border border-[#11b5c9] px-3 py-1 text-xs font-bold text-[#11d1e6]">ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø§Ù†Ø¬Ø§Ù…â€ŒØ´Ø¯Ù‡</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onValueChange('activeChip', '')}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ Ù„ÛŒØ³Øª Ø¬Ø±Ø§ÛŒÙ…
          </button>

          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{selectedPenalty.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{selectedPenalty.description}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="flex flex-wrap border-b border-slate-100">
          {MODE_OPTIONS.map((mode) => (
            <PenaltyModeTab
              key={mode.id}
              title={mode.title}
              icon={mode.icon}
              active={currentMode.id === mode.id}
              onClick={() => onValueChange('activeTab', mode.id)}
            />
          ))}
        </div>

        <div className="space-y-8 p-5">
          <p className="text-center text-base leading-8 text-[color:var(--text-strong)]">{currentMode.description}</p>

          <section className="space-y-5">
            <div className="text-right">
              <h2 className="text-[17px] font-black text-[color:var(--text-strong)]">Ø¯ÙˆØ±Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¬Ø±ÛŒÙ…Ù‡</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">Ù…Ø´Ø®Øµ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø± Ø§Ø³Ø§Ø³ ØªØ§Ø®ÛŒØ± Ø±ÙˆØ²Ø§Ù†Ù‡ØŒ Ù…Ø§Ù‡Ø§Ù†Ù‡ ÛŒØ§ Ø³Ø§Ù„Ø§Ù†Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø´ÙˆØ¯.</p>
            </div>

            <ChoicePills
              options={PERIOD_OPTIONS}
              value={String(state.values[keys.periodKey] || PERIOD_OPTIONS[0])}
              onChange={(value) => onValueChange(keys.periodKey, value)}
            />
          </section>

          {currentMode.id === 'fixed' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="Ù…Ø¨Ù„Øº Ø«Ø§Ø¨Øª Ø¬Ø±ÛŒÙ…Ù‡" />
                <RuleTextInput value={String(state.values[keys.amountKey!] ?? '')} onChange={(value) => onValueChange(keys.amountKey!, value)} suffix="ØªÙˆÙ…Ø§Ù†" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ù…Ø¨Ù„ØºÛŒ Ú©Ù‡ Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø¯ÙˆØ±Ù‡ ØªØ§Ø®ÛŒØ± Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø¬Ø±ÛŒÙ…Ù‡ Ø¯Ø± Ù†Ø¸Ø± Ú¯Ø±ÙØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ù…Ù‡Ù„Øª ØªÙ†ÙØ³ (Ø¨Ø¯ÙˆÙ† Ø¬Ø±ÛŒÙ…Ù‡)" />
                <RuleTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">ØªØ¹Ø¯Ø§Ø¯ Ø±ÙˆØ²Ù‡Ø§ÛŒÛŒ Ú©Ù‡ Ù¾Ø³ Ø§Ø² Ø³Ø±Ø±Ø³ÛŒØ¯ Ø¨Ø¯ÙˆÙ† Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ù‡ Ø®Ø±ÛŒØ¯Ø§Ø± Ù…Ù‡Ù„Øª Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'debt-percent' || currentMode.id === 'contract-percent' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡" />
                <RuleTextInput value={String(state.values[keys.percentKey!] ?? '')} onChange={(value) => onValueChange(keys.percentKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡â€ŒØ§ÛŒ Ú©Ù‡ Ø¨Ø±Ø§ÛŒ Ø¯ÙˆØ±Ù‡ Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ø¯Ø±ØµØ¯ Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ" />
                <RuleTextInput value={String(state.values[keys.bankKey!] ?? '')} onChange={(value) => onValueChange(keys.bankKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø¯Ø± Ø§ÛŒÙ† Ø¨Ø®Ø´ Ù…Ù†Ø¸ÙˆØ± Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒâ€ŒØ§ÛŒ Ú©Ù‡ Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡ÛŒØ¯ Ø¨Ù‡ Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡ Ø§Ø¶Ø§ÙÙ‡ Ø´ÙˆØ¯ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ù…Ù‡Ù„Øª ØªÙ†ÙØ³ (Ø¨Ø¯ÙˆÙ† Ø¬Ø±ÛŒÙ…Ù‡)" />
                <RuleTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">ØªØ¹Ø¯Ø§Ø¯ Ø±ÙˆØ²Ù‡Ø§ÛŒÛŒ Ú©Ù‡ Ù¾Ø³ Ø§Ø² Ø³Ø±Ø±Ø³ÛŒØ¯ Ù‚Ø³Ø· Ø¨Ø¯ÙˆÙ† Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¬Ø±ÛŒÙ…Ù‡ Ù…Ù‡Ù„Øª Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>

              <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
                <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">Ù‚Ø§Ø¹Ø¯Ù‡ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡</h3>
                <ChoicePills options={ROUND_RULE_OPTIONS} value={String(state.values[keys.roundKey!] || ROUND_RULE_OPTIONS[0])} onChange={(value) => onValueChange(keys.roundKey!, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ù…Ø´Ø®Øµ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø¹Ø¯Ø¯ Ù†Ù‡Ø§ÛŒÛŒ Ø¬Ø±ÛŒÙ…Ù‡ Ù¾Ø³ Ø§Ø² Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¨Ù‡ Ú†Ù‡ ÙˆØ§Ø­Ø¯ÛŒ Ú¯Ø±Ø¯ Ø´ÙˆØ¯ Ù…Ø«Ù„ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ø¨Ù‡ Û±Û°Û° ÛŒØ§ Û±Û°Û°Û° ØªÙˆÙ…Ø§Ù†.</p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'progressive' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="Ø¯Ø±ØµØ¯ Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ" />
                <RuleTextInput value={String(state.values[keys.bankKey!] ?? '')} onChange={(value) => onValueChange(keys.bankKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ø¯Ø± Ø§ÛŒÙ† Ø¨Ø®Ø´ Ù…Ù‚Ø¯Ø§Ø± Ø³ÙˆØ¯ Ø¨Ø§Ù†Ú©ÛŒ Ú©Ù‡ Ø¨Ù‡ Ø¯Ø±ØµØ¯ Ø¬Ø±ÛŒÙ…Ù‡ Ø§Ø¶Ø§ÙÙ‡ Ø´ÙˆØ¯ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯ ØªØ§ Ø¨Ù‡ ØµÙˆØ±Øª Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø´ÙˆØ¯.</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="Ù…Ù‡Ù„Øª ØªÙ†ÙØ³ (Ø¨Ø¯ÙˆÙ† Ø¬Ø±ÛŒÙ…Ù‡)" />
                <RuleTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">ØªØ¹Ø¯Ø§Ø¯ Ø±ÙˆØ²Ù‡Ø§ÛŒÛŒ Ú©Ù‡ Ù¾Ø³ Ø§Ø² Ø³Ø±Ø±Ø³ÛŒØ¯ Ø¨Ø¯ÙˆÙ† Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ù‡ Ø®Ø±ÛŒØ¯Ø§Ø± Ù…Ù‡Ù„Øª Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.</p>
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={applyProgressiveSuggestion}
                    className="text-sm font-bold text-[#11d1e6] transition hover:text-[#5de6f4]"
                  >
                    ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒ
                  </button>

                  <div className="text-right">
                    <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">Ø¬Ø¯ÙˆÙ„ Ø¬Ø±ÛŒÙ…Ù‡â€ŒÙ‡Ø§ÛŒ ØªØµØ§Ø¹Ø¯ÛŒ</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">ØªÙˆØ¬Ù‡ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´ÛŒØ¯ Ú©Ù‡ Ù…ÛŒØ²Ø§Ù† Ù†Ø±Ø® Ø¬Ø±ÛŒÙ…Ù‡ Ø¨Ø§ Ù‡Ù…â€ŒÙ¾ÙˆØ´Ø§Ù†ÛŒ Ù†Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {PROGRESSIVE_DEFAULT_ROWS.map((row) => (
                    <ProgressRow
                      key={row.fromKey}
                      from={String(state.values[row.fromKey] ?? '')}
                      to={String(state.values[row.toKey] ?? '')}
                      rate={String(state.values[row.rateKey] ?? '')}
                      onChange={(field, value) =>
                        onValueChange(field === 'from' ? row.fromKey : field === 'to' ? row.toKey : row.rateKey, value)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
                <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">Ù‚Ø§Ø¹Ø¯Ù‡ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ù…Ø¨Ù„Øº Ø¬Ø±ÛŒÙ…Ù‡</h3>
                <ChoicePills options={ROUND_RULE_OPTIONS} value={String(state.values[keys.roundKey!] || ROUND_RULE_OPTIONS[0])} onChange={(value) => onValueChange(keys.roundKey!, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">Ù…Ø´Ø®Øµ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ø¹Ø¯Ø¯ Ù†Ù‡Ø§ÛŒÛŒ Ø¬Ø±ÛŒÙ…Ù‡ Ù¾Ø³ Ø§Ø² Ù…Ø­Ø§Ø³Ø¨Ù‡ Ø¨Ù‡ Ú†Ù‡ ÙˆØ§Ø­Ø¯ÛŒ Ú¯Ø±Ø¯ Ø´ÙˆØ¯ Ù…Ø«Ù„ Ú¯Ø±Ø¯ Ú©Ø±Ø¯Ù† Ø¨Ù‡ Û±Û°Û° ÛŒØ§ Û±Û°Û°Û° ØªÙˆÙ…Ø§Ù†.</p>
              </div>
            </div>
          ) : null}

          <ExtraFeeCard
            enabled={Boolean(state.values[keys.extraEnabledKey])}
            feeType={String(state.values[keys.extraTypeKey] || EXTRA_FEE_TYPES[0]) as ExtraFeeType}
            amount={String(state.values[keys.extraAmountKey] ?? '')}
            roundRule={String(state.values[keys.extraRoundKey] || ROUND_RULE_OPTIONS[0])}
            onEnabledChange={(value) => onValueChange(keys.extraEnabledKey, value)}
            onFeeTypeChange={(value) => onValueChange(keys.extraTypeKey, value)}
            onAmountChange={(value) => onValueChange(keys.extraAmountKey, value)}
            onRoundRuleChange={(value) => onValueChange(keys.extraRoundKey, value)}
          />
        </div>
      </section>
    </div>
  );
}


