'use client';

import type { ReactNode } from 'react';
import { BusinessSwitch, RuleFieldLabel, TagPills } from '@repo/ui';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { RuleTextInput as SharedRuleTextInput } from './RuleStylePrimitives';
import { SettingsFieldAlignmentTag } from '../../contracts/new/_components/SettingsFieldAlignmentTag';
import { getDomainFieldHint, type DomainFieldHint } from '../../../lib/contractSettingsHints/domainFieldHints';

type InterestMode = 'simple-interest' | 'compound-interest' | 'remaining-debt-interest';

const ROUND_RULE_OPTIONS = ['0.0', '0.00', 'تا 100', 'تا 1000'] as const;
const COMPOUND_PERIOD_OPTIONS = ['روزانه', 'ماهانه', 'فصلی', 'سالانه'] as const;
const MODE_OPTIONS: Array<{ value: InterestMode; label: string }> = [
  { value: 'simple-interest', label: 'سود ساده' },
  { value: 'compound-interest', label: 'سود مرکب' },
  { value: 'remaining-debt-interest', label: 'سود بر مانده بدهی' },
];

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

function SwitchRow({
  title,
  description,
  checked,
  onChange,
  alignmentTag,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  alignmentTag?: ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-[color:var(--border-soft)] pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">{title}</h3>
            {alignmentTag}
          </div>
          <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
        </div>
        <BusinessSwitch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}

function getModeConfig(mode: InterestMode) {
  switch (mode) {
    case 'simple-interest':
      return {
        aprKey: 'interestApr',
        penaltyKey: 'interestPenaltyEnabled',
        roundKey: 'interestRoundRule',
        reducingKey: 'interestReducingPrincipal',
        togetherKey: 'interestTogetherPayment',
        endKey: 'interestPrincipalAtEnd',
        title: 'سود ساده',
        description: 'در این حالت سود فقط بر اصل مبلغ محاسبه می‌شود.',
      };
    case 'compound-interest':
      return {
        aprKey: 'interestAprCompound',
        periodKey: 'interestCompoundPeriod',
        penaltyKey: 'interestPenaltyEnabledCompound',
        roundKey: 'interestRoundRuleCompound',
        reducingKey: 'interestReducingPrincipalCompound',
        togetherKey: 'interestTogetherPaymentCompound',
        endKey: 'interestPrincipalAtEndCompound',
        title: 'سود مرکب',
        description: 'در این حالت سود روی اصل و سودهای قبلی هم محاسبه می‌شود.',
      };
    case 'remaining-debt-interest':
      return {
        aprKey: 'interestAprRemaining',
        penaltyKey: 'interestPenaltyEnabledRemaining',
        roundKey: 'interestRoundRuleRemaining',
        reducingKey: 'interestReducingPrincipalRemaining',
        togetherKey: 'interestTogetherPaymentRemaining',
        endKey: 'interestPrincipalAtEndRemaining',
        title: 'سود بر مانده بدهی',
        description: 'در این حالت سود فقط بر مانده بدهی محاسبه می‌شود.',
      };
  }
}

export function InterestRuleSection({
  state,
  onValueChange,
  fieldHints = {},
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
  fieldHints?: Record<string, DomainFieldHint>;
}) {
  const mode = (state.activeTab || 'simple-interest') as InterestMode;
  const config = getModeConfig(mode);
  const tag = (key: string) => {
    const hint = getDomainFieldHint(fieldHints, key);
    return <SettingsFieldAlignmentTag status={hint.status} settingsLabel={hint.settingsLabel} />;
  };

  return (
    <section className="overflow-hidden rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
      <div className="border-b border-[color:var(--border-soft)] px-5 py-4">
        <div className="mb-2 flex flex-wrap items-center justify-end gap-2">{tag('activeTab')}</div>
        <TagPills
          options={MODE_OPTIONS}
          value={mode}
          onChange={(value) => onValueChange('activeTab', value)}
          wrap={false}
          className="justify-end overflow-x-auto pb-1"
        />
      </div>

      <div className="space-y-8 p-5">
        <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">{config.description}</p>
        <div className="border-t border-[color:var(--border-soft)]" />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <RuleFieldLabel label="نرخ سود سالانه (APR)" required />
            {tag(config.aprKey)}
          </div>
          <RuleTextInput value={String(state.values[config.aprKey] ?? '')} onChange={(value) => onValueChange(config.aprKey, value)} suffix="%" />
          <p className="text-right text-sm text-[color:var(--text-muted)]">این نرخ مبنای محاسبه سود است. مقدار را به‌صورت درصد وارد کنید.</p>
        </div>

        {mode === 'compound-interest' ? (
          <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <RuleFieldLabel label="مدت محاسبه سود" required />
              {tag(config.periodKey!)}
            </div>
            <TagPills
              options={COMPOUND_PERIOD_OPTIONS.map((option) => ({ value: option, label: option }))}
              value={String(state.values[config.periodKey!] || COMPOUND_PERIOD_OPTIONS[0])}
              onChange={(value) => onValueChange(config.periodKey!, value)}
              wrap={false}
              className="justify-end overflow-x-auto pb-1"
            />
            <p className="text-right text-sm text-[color:var(--text-muted)]">
              مدت محاسبه را بر اساس دوره‌ای که انتخاب کرده‌اید وارد کنید.
            </p>
          </div>
        ) : null}

        <SwitchRow
          title="سود بر اصل وام"
          description="این روش سود را فقط بر اصل مبلغ وام محاسبه می‌کند."
          checked={Boolean(state.values[config.penaltyKey])}
          onChange={(value) => onValueChange(config.penaltyKey, value)}
          alignmentTag={tag(config.penaltyKey)}
        />

        <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <h3 className="text-right text-[18px] font-black text-[color:var(--text-strong)]">جزئیات سود مرکب</h3>
            {tag(config.roundKey)}
          </div>
          <TagPills
            options={ROUND_RULE_OPTIONS.map((option) => ({ value: option, label: option }))}
            value={String(state.values[config.roundKey] || ROUND_RULE_OPTIONS[0])}
            onChange={(value) => onValueChange(config.roundKey, value)}
            wrap={false}
            className="justify-end overflow-x-auto pb-1"
          />
          <p className="text-right text-sm text-[color:var(--text-muted)]">
            در سود مرکب، دوره‌های محاسبه و ترکیب سود را مشخص کنید.
          </p>
        </div>

        <SwitchRow
          title="نرخ سود بر مانده"
          description="این حالت سود را بر مانده بدهی محاسبه می‌کند."
          checked={Boolean(state.values[config.reducingKey])}
          onChange={(value) => onValueChange(config.reducingKey, value)}
          alignmentTag={tag(config.reducingKey)}
        />

        <SwitchRow
          title="دوره‌های محاسبه"
          description="دوره‌های محاسبه و ترکیب سود را تعیین کنید."
          checked={Boolean(state.values[config.togetherKey])}
          onChange={(value) => onValueChange(config.togetherKey, value)}
          alignmentTag={tag(config.togetherKey)}
        />

        <SwitchRow
          title="جزئیات محاسبه بر مانده بدهی"
          description="مبنای محاسبه سود در مانده بدهی را دقیق تعیین کنید."
          checked={Boolean(state.values[config.endKey])}
          onChange={(value) => onValueChange(config.endKey, value)}
          alignmentTag={tag(config.endKey)}
        />
      </div>
    </section>
  );
}

