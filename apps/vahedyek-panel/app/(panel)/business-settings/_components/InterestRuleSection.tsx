'use client';

import type { ElementType } from 'react';
import { BadgePercent, ChartNoAxesCombined, CircleDollarSign } from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { ChoicePills as SharedChoicePills, MiniToggle as SharedMiniToggle, RuleTextInput as SharedRuleTextInput } from './RuleStylePrimitives';

type InterestMode = 'simple-interest' | 'compound-interest' | 'remaining-debt-interest';

const ROUND_RULE_OPTIONS = ['0.0', '0.00', 'کسر 100', 'کسر 1000'] as const;
const COMPOUND_PERIOD_OPTIONS = ['روزانه', 'ماهانه', 'سه‌ماهه', 'سالانه'] as const;

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

function ChoicePills({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return <SharedChoicePills options={options} value={value} onChange={onChange} />;
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

function InterestTab({
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
    <div className="space-y-3 border-t border-slate-200 pt-5">
      <div className="flex items-start justify-between gap-4">
        <MiniToggle checked={checked} onChange={onChange} />
        <div className="text-right">
          <h3 className="text-[18px] font-black text-[color:var(--text-strong)]">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        </div>
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
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="flex flex-wrap border-b border-slate-100">
        <InterestTab title="سود بر مانده بدهی" icon={CircleDollarSign} active={mode === 'remaining-debt-interest'} onClick={() => onValueChange('activeTab', 'remaining-debt-interest')} />
        <InterestTab title="سود مرکب" icon={ChartNoAxesCombined} active={mode === 'compound-interest'} onClick={() => onValueChange('activeTab', 'compound-interest')} />
        <InterestTab title="سود ساده" icon={BadgePercent} active={mode === 'simple-interest'} onClick={() => onValueChange('activeTab', 'simple-interest')} />
      </div>

      <div className="space-y-8 p-5">
        <p className="text-right text-base leading-8 text-slate-700">{config.description}</p>
        <div className="border-t border-slate-200" />

        <div className="space-y-4">
          <FieldLabel label="نرخ سود سالیانه (APR)" />
          <RuleTextInput value={String(state.values[config.aprKey] ?? '')} onChange={(value) => onValueChange(config.aprKey, value)} suffix="%" />
          <p className="text-right text-sm text-slate-500">این نرخ برای محاسبه سود اقساط استفاده می‌شود. مقدار باید بین ۰ تا ۶۰ مثلا باشد.</p>
        </div>

        {mode === 'compound-interest' ? (
          <div className="space-y-4 border-t border-slate-200 pt-5">
            <FieldLabel label="انتخاب دوره محاسبه سود" />
            <ChoicePills
              options={COMPOUND_PERIOD_OPTIONS}
              value={String(state.values[config.periodKey!] || COMPOUND_PERIOD_OPTIONS[0])}
              onChange={(value) => onValueChange(config.periodKey!, value)}
            />
            <p className="text-right text-sm text-slate-500">دوره‌ای که سود مرکب بر اساس آن محاسبه می‌شود. انتخاب بازه کوتاه‌تر باعث افزایش سود نهایی می‌شود.</p>
          </div>
        ) : null}

        <SwitchRow
          title="اعمال جریمه بر مبلغ سود معوق"
          description="در صورت فعال‌بودن این گزینه، مبلغ سود مانند سایر بدهی‌ها مشمول جریمه تاخیر می‌شود که با توجه به تنظیمات جرایم اعمال می‌شود."
          checked={Boolean(state.values[config.penaltyKey])}
          onChange={(value) => onValueChange(config.penaltyKey, value)}
        />

        <div className="space-y-4 border-t border-slate-200 pt-5">
          <h3 className="text-right text-[18px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ سود</h3>
          <ChoicePills options={ROUND_RULE_OPTIONS} value={String(state.values[config.roundKey] || ROUND_RULE_OPTIONS[0])} onChange={(value) => onValueChange(config.roundKey, value)} />
          <p className="text-right text-sm text-[color:var(--text-muted)]">مشخص می‌کند عدد نهایی سود پس از محاسبه به چه واحدی گرد شود مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.</p>
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
