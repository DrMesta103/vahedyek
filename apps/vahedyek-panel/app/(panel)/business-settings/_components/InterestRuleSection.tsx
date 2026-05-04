'use client';

import { BadgePercent, ChartNoAxesCombined, CircleDollarSign } from 'lucide-react';
import { BusinessSwitch, ChoicePills as UiChoicePills, RuleFieldLabel, RuleTabButton } from '@repo/ui';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { RuleTextInput as SharedRuleTextInput } from './RuleStylePrimitives';

type InterestMode = 'simple-interest' | 'compound-interest' | 'remaining-debt-interest';

const ROUND_RULE_OPTIONS = ['0.0', '0.00', 'کسر 100', 'کسر 1000'] as const;
const COMPOUND_PERIOD_OPTIONS = ['روزانه', 'ماهانه', 'سه‌ماهه', 'سالانه'] as const;

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

function InterestTagPills({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <UiChoicePills
      ariaLabel={ariaLabel}
      options={options.map((option) => ({ value: option, label: option }))}
      value={value}
      onChange={onChange}
      wrap
      className="justify-end flex-row-reverse"
    />
  );
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-3 border-t border-[color:var(--border-soft)] pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-right">
          <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">{title}</h3>
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
        description: 'در این روش سود به صورت درصد ثابت روی مبلغ قرارداد محاسبه می‌شود و در طول دوره تغییر نمی‌کند.',
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
        description: 'در این روش سود به همراه سود قبلی محاسبه می‌شود بنابراین سود با گذشت زمان افزایش پیدا می‌کند.',
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
        description: 'در این روش سود در هر دوره بر اساس مانده بدهی باقی‌مانده محاسبه می‌شود.',
      };
  }
}

export function InterestRuleSection({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const mode = (state.activeTab || 'simple-interest') as InterestMode;
  const config = getModeConfig(mode);

  return (
    <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
      <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
        <RuleTabButton
          title="سود بر مانده بدهی"
          icon={CircleDollarSign}
          active={mode === 'remaining-debt-interest'}
          onClick={() => onValueChange('activeTab', 'remaining-debt-interest')}
        />
        <RuleTabButton
          title="سود مرکب"
          icon={ChartNoAxesCombined}
          active={mode === 'compound-interest'}
          onClick={() => onValueChange('activeTab', 'compound-interest')}
        />
        <RuleTabButton title="سود ساده" icon={BadgePercent} active={mode === 'simple-interest'} onClick={() => onValueChange('activeTab', 'simple-interest')} />
      </div>

      <div className="space-y-8 p-5">
        <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">{config.description}</p>
        <div className="border-t border-[color:var(--border-soft)]" />

        <div className="space-y-4">
          <RuleFieldLabel label="نرخ سود سالیانه (APR)" required />
          <RuleTextInput value={String(state.values[config.aprKey] ?? '')} onChange={(value) => onValueChange(config.aprKey, value)} suffix="%" />
          <p className="text-right text-sm text-[color:var(--text-muted)]">این نرخ برای محاسبه سود اقساط استفاده می‌شود. مقدار باید بین ۰ تا ۶۰ مثلا باشد.</p>
        </div>

        {mode === 'compound-interest' ? (
          <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
            <RuleFieldLabel label="انتخاب دوره محاسبه سود" required />
            <InterestTagPills
              ariaLabel="دوره محاسبه سود مرکب"
              options={COMPOUND_PERIOD_OPTIONS}
              value={String(state.values[config.periodKey!] || COMPOUND_PERIOD_OPTIONS[0])}
              onChange={(value) => onValueChange(config.periodKey!, value)}
            />
            <p className="text-right text-sm text-[color:var(--text-muted)]">
              دوره‌ای که سود مرکب بر اساس آن محاسبه می‌شود. انتخاب بازه کوتاه‌تر باعث افزایش سود نهایی می‌شود.
            </p>
          </div>
        ) : null}

        <SwitchRow
          title="اعمال جریمه بر مبلغ سود معوق"
          description="در صورت فعال‌بودن این گزینه، مبلغ سود مانند سایر بدهی‌ها مشمول جریمه تاخیر می‌شود که با توجه به تنظیمات جرایم اعمال می‌شود."
          checked={Boolean(state.values[config.penaltyKey])}
          onChange={(value) => onValueChange(config.penaltyKey, value)}
        />

        <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
          <h3 className="text-right text-[18px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ سود</h3>
          <InterestTagPills
            ariaLabel="قاعده گرد کردن مبلغ سود"
            options={ROUND_RULE_OPTIONS}
            value={String(state.values[config.roundKey] || ROUND_RULE_OPTIONS[0])}
            onChange={(value) => onValueChange(config.roundKey, value)}
          />
          <p className="text-right text-sm text-[color:var(--text-muted)]">
            مشخص می‌کند عدد نهایی سود پس از محاسبه به چه واحدی گرد شود مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.
          </p>
        </div>

        <SwitchRow
          title="سهم اصل ثابت سود کاهشی"
          description="در این حالت، مبلغ باقی از اصل بدهی هر ماه کم می‌شود و سود هر قسط بر اساس مانده بدهی کاهش می‌یابد."
          checked={Boolean(state.values[config.reducingKey])}
          onChange={(value) => onValueChange(config.reducingKey, value)}
        />

        <SwitchRow
          title="پرداخت همزمان اصل و سود"
          description="در این روش در هر قسط شامل بخشی از اصل بدهی و سود مربوط به همان دوره است."
          checked={Boolean(state.values[config.togetherKey])}
          onChange={(value) => onValueChange(config.togetherKey, value)}
        />

        <SwitchRow
          title="پرداخت فقط سود تسویه اصل در پایان"
          description="در این روش در کل دوره فقط سود پرداخت می‌شود و مبلغ اصل بدهی در پایان دوره بصورت یکجا تسویه می‌شود."
          checked={Boolean(state.values[config.endKey])}
          onChange={(value) => onValueChange(config.endKey, value)}
        />
      </div>
    </section>
  );
}
