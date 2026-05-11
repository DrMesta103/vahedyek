'use client';

import type { ElementType } from 'react';
import {
  ArrowUpRight,
  BadgePercent,
  ChevronLeft,
  CircleDollarSign,
  CirclePercent,
} from 'lucide-react';
import { BusinessSwitch, ChoicePills, Input, RULE_PANEL_TEXT_INPUT_CLASSNAME, RuleAmountInput, RuleFieldLabel, RuleTabButton } from '@repo/ui';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { PENALTY_ITEMS } from '../../contracts/new/_components/penaltiesConfig';

type PenaltyMode = 'fixed' | 'debt-percent' | 'contract-percent' | 'progressive';
type RoundRule = '0.0' | '0.00' | 'کسر 100' | 'کسر 1000';
type ExtraFeeType = 'درصد' | 'مبلغ ثابت';

const PERIOD_OPTIONS = ['روزانه', 'ماهانه', 'سالانه'] as const;
const ROUND_RULE_OPTIONS: RoundRule[] = ['0.0', '0.00', 'کسر 100', 'کسر 1000'];
const EXTRA_FEE_TYPES: ExtraFeeType[] = ['درصد', 'مبلغ ثابت'];

function RulePlainTextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${RULE_PANEL_TEXT_INPUT_CLASSNAME} disabled:bg-slate-50 disabled:text-slate-500`}
    />
  );
}

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
  icon: ElementType;
}> = [
  {
    id: 'fixed',
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این روش برای هر روز، ماه یا سال تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
    icon: CircleDollarSign,
  },
  {
    id: 'debt-percent',
    title: 'درصدی از مانده بدهی معوق',
    description: 'در این روش مبلغ جریمه بر اساس درصدی از مانده بدهی خریدار محاسبه می‌شود.',
    icon: BadgePercent,
  },
  {
    id: 'contract-percent',
    title: 'درصدی از کل قرارداد',
    description: 'در این روش مبلغ جریمه بر اساس درصدی از مبلغ کل قرارداد محاسبه می‌شود.',
    icon: CirclePercent,
  },
  {
    id: 'progressive',
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'در این روش با افزایش مدت تاخیر، نرخ جریمه بر اساس بازه‌های زمانی افزایش پیدا می‌کند.',
    icon: ArrowUpRight,
  },
];

const PROGRESSIVE_DEFAULT_ROWS = [
  { fromKey: 'penaltyProgressiveRow1From', toKey: 'penaltyProgressiveRow1To', rateKey: 'penaltyProgressiveRow1Rate', openEndedKey: 'penaltyProgressiveRow1OpenEnded', from: '1', to: '4', rate: '0.5' },
  { fromKey: 'penaltyProgressiveRow2From', toKey: 'penaltyProgressiveRow2To', rateKey: 'penaltyProgressiveRow2Rate', openEndedKey: 'penaltyProgressiveRow2OpenEnded', from: '5', to: '6', rate: '0.5' },
  { fromKey: 'penaltyProgressiveRow3From', toKey: 'penaltyProgressiveRow3To', rateKey: 'penaltyProgressiveRow3Rate', openEndedKey: 'penaltyProgressiveRow3OpenEnded', from: '7', to: '45', rate: '3.3' },
  { fromKey: 'penaltyProgressiveRow4From', toKey: 'penaltyProgressiveRow4To', rateKey: 'penaltyProgressiveRow4Rate', openEndedKey: 'penaltyProgressiveRow4OpenEnded', from: '46', to: '', rate: '' },
];

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
        <RuleFieldLabel label="نرخ جریمه" required />
        <RuleAmountInput value={rate} onChange={(value) => onChange('rate', value)} suffix="%" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: ۰.۵٪</p>
      </div>
      <div className="hidden pb-8 text-center text-2xl text-[color:var(--text-muted)] lg:block">-</div>
      <div className="space-y-3">
        <RuleFieldLabel label="تا" required />
        <RulePlainTextInput value={to} onChange={(value) => onChange('to', value)} placeholder="تا روز" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: تا ۵۰ روز تاخیر</p>
      </div>
      <div className="space-y-3">
        <RuleFieldLabel label="از" required />
        <RulePlainTextInput value={from} onChange={(value) => onChange('from', value)} placeholder="از روز" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: از ۱ روز تاخیر</p>
      </div>
    </div>
  );
}

function SmartProgressRow({
  from,
  to,
  rate,
  openEnded,
  onChange,
}: {
  from: string;
  to: string;
  rate: string;
  openEnded: boolean;
  onChange: (field: 'to' | 'rate' | 'openEnded', value: string | boolean) => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:grid-cols-[1fr_120px_170px_170px] lg:items-end">
      <div className="space-y-3">
        <RuleFieldLabel label="نرخ جریمه" required />
        <RuleAmountInput value={rate} onChange={(value) => onChange('rate', value)} suffix="%" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: 0.5٪ یا 1.25٪</p>
      </div>
      <label className="flex items-center justify-end gap-2 pb-8 text-xs font-bold text-[color:var(--text-muted)]">
        <input
          type="checkbox"
          checked={openEnded}
          onChange={(event) => onChange('openEnded', event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-cyan-600"
        />
        به بعد
      </label>
      <div className="space-y-3">
        <RuleFieldLabel label="تا" required />
        <RulePlainTextInput
          value={to}
          disabled={openEnded}
          onChange={(value) => onChange('to', value.replace(/\D/g, ''))}
          placeholder={openEnded ? 'به بعد' : 'تا روز'}
        />
        <p className="text-right text-xs text-[color:var(--text-muted)]">{openEnded ? 'این بازه آخرین ردیف است.' : 'فقط پایان بازه را وارد کنید.'}</p>
      </div>
      <div className="space-y-3">
        <RuleFieldLabel label="از" required />
        <RulePlainTextInput value={from} disabled onChange={() => undefined} placeholder="از روز" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">شروع بازه خودکار محاسبه می‌شود.</p>
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
          <h3 className="text-xl font-black text-[color:var(--text-strong)]">هزینه دیرکرد</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">مبلغ یا درصد ثابتی که علاوه بر جریمه تاخیر برای هر شرط معوق اعمال می‌شود.</p>
        </div>

        <BusinessSwitch checked={enabled} onChange={onEnabledChange} />
      </div>

      {enabled ? (
        <div className="space-y-5">
          <div className="space-y-4">
            <h4 className="text-right text-lg font-black text-[color:var(--text-strong)]">مشخص کنید بر اساس درصد می‌باشد یا مبلغ ثابت</h4>
            <BusinessSwitch
              checked={feeType === 'درصد'}
              onChange={(value) => onFeeTypeChange(value ? 'درصد' : 'مبلغ ثابت')}
              activeLabel="درصد"
              inactiveLabel="مبلغ ثابت"
            />
          </div>

          <div className="space-y-4">
            <RuleFieldLabel label="جریمه بالاسری" required />
            <RuleAmountInput value={amount} onChange={onAmountChange} suffix={feeType === 'درصد' ? '%' : 'تومان'} />
            <p className="text-right text-sm text-[color:var(--text-muted)]">این مبلغ یک‌بار هنگام اولین تاخیر برای هر سررسید اعمال می‌شود.</p>
          </div>

          <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
            <h4 className="text-right text-lg font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ هزینه دیرکرد</h4>
            <ChoicePills
              options={ROUND_RULE_OPTIONS.map((option) => ({ value: option, label: option }))}
              value={roundRule as RoundRule}
              onChange={(value) => onRoundRuleChange(value)}
              wrap
              className="justify-end flex-row-reverse"
              aria-label="قاعده گرد کردن هزینه دیرکرد"
            />
            <p className="text-right text-sm text-[color:var(--text-muted)]">مشخص می‌کند عدد نهایی هزینه دیرکرد به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.</p>
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
  let progressiveNextFrom = 1;
  const progressiveRows = PROGRESSIVE_DEFAULT_ROWS.map((row) => {
    const from = String(progressiveNextFrom);
    const to = String(state.values[row.toKey] ?? '');
    const openEnded = Boolean(state.values[row.openEndedKey]);
    const toNumber = Number(to.replace(/\D/g, ''));

    if (!openEnded && Number.isFinite(toNumber) && toNumber >= progressiveNextFrom) {
      progressiveNextFrom = toNumber + 1;
    }

    return {
      ...row,
      from,
      to,
      rate: String(state.values[row.rateKey] ?? ''),
      openEnded,
    };
  });
  const firstOpenEndedIndex = progressiveRows.findIndex((row) => row.openEnded);
  const visibleProgressiveRows =
    firstOpenEndedIndex >= 0 ? progressiveRows.slice(0, firstOpenEndedIndex + 1) : progressiveRows;

  const syncProgressiveRows = (updates: Partial<Record<string, string | boolean>>) => {
    const nextRows = PROGRESSIVE_DEFAULT_ROWS.map((row, index) => ({
      ...row,
      from: index === 0 ? '1' : String(updates[row.fromKey] ?? state.values[row.fromKey] ?? row.from ?? ''),
      to: String(updates[row.toKey] ?? state.values[row.toKey] ?? ''),
      rate: String(updates[row.rateKey] ?? state.values[row.rateKey] ?? ''),
      openEnded: Boolean(updates[row.openEndedKey] ?? state.values[row.openEndedKey]),
    }));

    let nextFrom = 1;
    let closed = false;
    nextRows.forEach((row) => {
      onValueChange(row.fromKey, String(nextFrom));
      if (closed) return;
      const isOpenEnded = Boolean(row.openEnded);
      onValueChange(row.openEndedKey, isOpenEnded);
      if (isOpenEnded) {
        onValueChange(row.toKey, '');
        closed = true;
        return;
      }
      const to = Number(String(row.to).replace(/\D/g, ''));
      if (Number.isFinite(to) && to >= nextFrom) nextFrom = to + 1;
    });
  };

  const applyProgressiveSuggestion = () => {
    PROGRESSIVE_DEFAULT_ROWS.forEach((row) => {
      onValueChange(row.fromKey, row.from);
      onValueChange(row.toKey, row.to);
      onValueChange(row.rateKey, row.rate);
      onValueChange(row.openEndedKey, false);
    });
  };

  if (!selectedPenalty) {
    return (
      <section className="space-y-5 rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
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
              <div className="flex-1">
                <div className="flex flex-col flex-nowrap items-start justify-center gap-3">
                  <h3 className="text-lg font-black text-[color:var(--text-strong)]">{item.title}</h3>
                  <span className="rounded-xl bg-[color:var(--theme-accent-softer)] px-3 py-1 text-xs font-bold text-[color:var(--text-muted)]">تنظیمات انجام‌شده</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{item.description}</p>
              </div>
              <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-[color:var(--text-muted)]" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{selectedPenalty.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{selectedPenalty.description}</p>
          </div>

          <button
            type="button"
            onClick={() => onValueChange('activeChip', '')}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت به لیست جرایم
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          {MODE_OPTIONS.map((mode) => (
            <RuleTabButton
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
              <h2 className="text-[17px] font-black text-[color:var(--text-strong)]">دوره محاسبه جریمه</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">مشخص می‌کند جریمه بر اساس تاخیر روزانه، ماهانه یا سالانه محاسبه شود.</p>
            </div>

            <ChoicePills
              options={PERIOD_OPTIONS.map((option) => ({ value: option, label: option }))}
              value={String(state.values[keys.periodKey] || PERIOD_OPTIONS[0]) as (typeof PERIOD_OPTIONS)[number]}
              onChange={(value) => onValueChange(keys.periodKey, value)}
              wrap
              className="justify-end flex-row-reverse"
              aria-label="دوره محاسبه جریمه"
            />
          </section>

          {currentMode.id === 'fixed' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <RuleFieldLabel label="مبلغ ثابت جریمه" required />
                <RuleAmountInput value={String(state.values[keys.amountKey!] ?? '')} onChange={(value) => onValueChange(keys.amountKey!, value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">مبلغی که برای هر دوره تاخیر به‌عنوان جریمه در نظر گرفته می‌شود.</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود.</p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'debt-percent' || currentMode.id === 'contract-percent' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <RuleFieldLabel label="درصد جریمه" required />
                <RuleAmountInput value={String(state.values[keys.percentKey!] ?? '')} onChange={(value) => onValueChange(keys.percentKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">درصد جریمه‌ای که برای دوره انتخاب‌شده اعمال می‌شود.</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="درصد سود بانکی" required />
                <RuleAmountInput value={String(state.values[keys.bankKey!] ?? '')} onChange={(value) => onValueChange(keys.bankKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">در این بخش منظور سود بانکی‌ای که می‌خواهید به درصد جریمه اضافه شود را وارد کنید.</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">تعداد روزهایی که پس از سررسید قسط بدون محاسبه جریمه مهلت داده می‌شود.</p>
              </div>

              <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
                <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ جریمه</h3>
                <ChoicePills
                  options={ROUND_RULE_OPTIONS.map((option) => ({ value: option, label: option }))}
                  value={String(state.values[keys.roundKey!] || ROUND_RULE_OPTIONS[0]) as RoundRule}
                  onChange={(value) => onValueChange(keys.roundKey!, value)}
                  wrap
                  className="justify-end flex-row-reverse"
                  aria-label="قاعده گرد کردن مبلغ جریمه"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.</p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'progressive' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <RuleFieldLabel label="درصد سود بانکی" required />
                <RuleAmountInput value={String(state.values[keys.bankKey!] ?? '')} onChange={(value) => onValueChange(keys.bankKey!, value)} suffix="%" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">در این بخش مقدار سود بانکی که به درصد جریمه اضافه شود را وارد کنید تا به صورت جداگانه محاسبه شود.</p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput value={String(state.values[keys.graceKey] ?? '')} onChange={(value) => onValueChange(keys.graceKey, value)} />
                <p className="text-right text-sm text-[color:var(--text-muted)]">تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود.</p>
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={applyProgressiveSuggestion}
                    className="text-sm font-bold text-[#11d1e6] transition hover:text-[#5de6f4]"
                  >
                    تنظیمات پیشنهادی
                  </button>

                  <div className="text-right">
                    <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">جدول جریمه‌های تصاعدی</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">توجه داشته باشید که میزان نرخ جریمه با هم‌پوشانی نداشته باشد.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {visibleProgressiveRows.map((row) => (
                    <SmartProgressRow
                      key={row.fromKey}
                      from={row.from}
                      to={row.to}
                      rate={row.rate}
                      openEnded={row.openEnded}
                      onChange={(field, value) => {
                        if (field === 'rate') {
                          onValueChange(row.rateKey, String(value));
                          return;
                        }
                        if (field === 'openEnded') {
                          syncProgressiveRows({ [row.openEndedKey]: Boolean(value), [row.toKey]: '' });
                          return;
                        }
                        syncProgressiveRows({ [row.toKey]: String(value), [row.openEndedKey]: false });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[color:var(--border-soft)] pt-5">
                <h3 className="text-right text-[17px] font-black text-[color:var(--text-strong)]">قاعده گرد کردن مبلغ جریمه</h3>
                <ChoicePills
                  options={ROUND_RULE_OPTIONS.map((option) => ({ value: option, label: option }))}
                  value={String(state.values[keys.roundKey!] || ROUND_RULE_OPTIONS[0]) as RoundRule}
                  onChange={(value) => onValueChange(keys.roundKey!, value)}
                  wrap
                  className="justify-end flex-row-reverse"
                  aria-label="قاعده گرد کردن مبلغ جریمه — تصاعدی"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.</p>
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
