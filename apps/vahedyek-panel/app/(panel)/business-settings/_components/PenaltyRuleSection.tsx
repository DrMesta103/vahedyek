'use client';

import type { ElementType } from 'react';
import { useState } from 'react';
import {
  ArrowUpRight,
  BadgePercent,
  ChevronLeft,
  CircleDollarSign,
  CirclePercent,
} from 'lucide-react';
import {
  BusinessSwitch,
  ChoicePills,
  Input,
  RULE_PANEL_TEXT_INPUT_CLASSNAME,
  RuleAmountInput,
  RuleFieldLabel,
  RuleTabButton,
} from '@repo/ui';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { hasPenaltyTypeSettings } from '../../../lib/businessContractRules';
import { PENALTY_ITEMS } from '../../contracts/new/_components/penaltiesConfig';

type PenaltyMode = 'fixed' | 'debt-percent' | 'contract-percent' | 'progressive';
type RoundRule = '0.0' | '0.00' | 'کسر 100' | 'کسر 1000';
type ExtraFeeType = 'درصد' | 'مبلغ ثابت';
type ProgressiveRowConfig = {
  fromKey: string;
  toKey: string;
  rateKey: string;
  from: string;
  to: string;
  rate: string;
  openEndedKey: string;
};

const PERIOD_OPTIONS = ['روزانه', 'ماهانه', 'سالانه'] as const;
const ROUND_RULE_OPTIONS: RoundRule[] = ['0.0', '0.00', 'کسر 100', 'کسر 1000'];
const EXTRA_FEE_TYPES: ExtraFeeType[] = ['درصد', 'مبلغ ثابت'];
const MAX_PROGRESSIVE_ROWS = 4;

function RulePlainTextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${RULE_PANEL_TEXT_INPUT_CLASSNAME} ${suffix ? 'pe-12' : ''} disabled:bg-slate-50 disabled:text-slate-500`}
      />
      {suffix ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-bold text-[color:var(--text-muted)]">
          {suffix}
        </span>
      ) : null}
    </div>
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

const PROGRESSIVE_DEFAULT_ROWS: ProgressiveRowConfig[] = [
  { fromKey: 'penaltyProgressiveRow1From', toKey: 'penaltyProgressiveRow1To', rateKey: 'penaltyProgressiveRow1Rate', openEndedKey: 'penaltyProgressiveRow1OpenEnded', from: '1', to: '30', rate: '' },
  { fromKey: 'penaltyProgressiveRow2From', toKey: 'penaltyProgressiveRow2To', rateKey: 'penaltyProgressiveRow2Rate', openEndedKey: 'penaltyProgressiveRow2OpenEnded', from: '', to: '', rate: '' },
  { fromKey: 'penaltyProgressiveRow3From', toKey: 'penaltyProgressiveRow3To', rateKey: 'penaltyProgressiveRow3Rate', openEndedKey: 'penaltyProgressiveRow3OpenEnded', from: '', to: '', rate: '' },
  { fromKey: 'penaltyProgressiveRow4From', toKey: 'penaltyProgressiveRow4To', rateKey: 'penaltyProgressiveRow4Rate', openEndedKey: 'penaltyProgressiveRow4OpenEnded', from: '', to: '', rate: '' },
];

function getStringValue(value: unknown) {
  return String(value ?? '').trim();
}

function hasRowContent(values: ContractRuleState['values'], row: ProgressiveRowConfig) {
  return Boolean(
    getStringValue(values[row.fromKey]) ||
      getStringValue(values[row.toKey]) ||
      getStringValue(values[row.rateKey]),
  );
}

function getNextFromValue(previousTo: string) {
  const parsed = Number(previousTo);
  if (!previousTo || !Number.isFinite(parsed)) return '';
  return String(parsed + 1);
}

function ProgressRow({
  from,
  to,
  rate,
  fromDisabled,
  onChange,
}: {
  from: string;
  to: string;
  rate: string;
  fromDisabled: boolean;
  onChange: (field: 'from' | 'to' | 'rate', value: string) => void;
}) {
  return (
    <div className="grid gap-4 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:grid-cols-[1fr_24px_170px_170px] lg:items-end">
      <div className="space-y-3">
        <RuleFieldLabel label="نرخ جریمه" required />
        <RuleAmountInput value={rate} onChange={(value) => onChange('rate', value)} suffix="%" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: ۰.۵٪</p>
      </div>
      <div className="hidden pb-8 text-center text-2xl text-[color:var(--text-muted)] lg:block">-</div>
      <div className="space-y-3">
        <RuleFieldLabel label="از" required />
        <RulePlainTextInput value={from} onChange={(value) => onChange('from', value)} placeholder="از روز" disabled={fromDisabled} suffix="روز" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">
          {fromDisabled ? 'این مقدار بر اساس بازه قبلی به‌صورت خودکار تعیین می‌شود.' : 'مثال: از ۱ روز تاخیر'}
        </p>
      </div>
      <div className="space-y-3">
        <RuleFieldLabel label="تا" required />
        <RulePlainTextInput value={to} onChange={(value) => onChange('to', value)} placeholder="تا روز" suffix="روز" />
        <p className="text-right text-xs text-[color:var(--text-muted)]">مثال: تا ۳۰ روز تاخیر</p>
      </div>
    </div>
  );
}

function SmartProgressRow({
  from,
  to,
  rate,
  openEnded,
  blocked,
  onChange,
}: {
  from: string;
  to: string;
  rate: string;
  openEnded: boolean;
  blocked: boolean;
  onChange: (field: 'to' | 'rate' | 'openEnded', value: string | boolean) => void;
}) {
  return (
    <div className={`grid gap-4 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4 lg:grid-cols-[1fr_120px_170px_170px] lg:items-end ${blocked ? 'opacity-60' : ''}`}>
      <div className="space-y-3">
        <RuleFieldLabel label="نرخ جریمه" required />
        <RuleAmountInput value={rate} onChange={(value) => onChange('rate', value)} suffix="%" />
        <p className="text-right text-xs leading-5 text-[color:var(--text-muted)]">مثال: 0.5%</p>
      </div>
      <label className="flex items-center justify-end gap-2 pb-8 text-xs font-bold text-[color:var(--text-muted)]">
        <input
          type="checkbox"
          checked={openEnded}
          disabled={blocked}
          onChange={(event) => onChange('openEnded', event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-cyan-600"
        />
        به بعد
      </label>
      <div className="space-y-3">
        <RuleFieldLabel label="از" required />
        <RulePlainTextInput value={from} disabled onChange={() => undefined} placeholder="از روز" suffix="روز" />
        <p className="text-right text-xs leading-5 text-[color:var(--text-muted)]">شروع بازه خودکار است.</p>
      </div>
      <div className="space-y-3">
        <RuleFieldLabel label="تا" required />
        <RulePlainTextInput
          value={to}
          disabled={openEnded || blocked}
          onChange={(value) => {
            const nextTo = value.replace(/\D/g, '');
            const fromNumber = Number(from);
            const toNumber = Number(nextTo);
            if (Number.isFinite(fromNumber) && fromNumber > 0 && Number.isFinite(toNumber) && toNumber < fromNumber) {
              onChange('to', String(fromNumber));
              return;
            }
            onChange('to', nextTo);
          }}
          placeholder={openEnded ? 'به بعد' : blocked ? 'غیرفعال' : 'تا روز'}
          suffix="روز"
        />
        <p className="text-right text-xs leading-5 text-[color:var(--text-muted)]">نباید از شروع کمتر باشد.</p>
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
    <section className="space-y-5 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 text-right">
          <h3 className="text-xl font-black text-[color:var(--text-strong)]">هزینه دیرکرد</h3>
          <p className="text-sm leading-7 text-[color:var(--text-muted)]">
            مبلغ یا درصد ثابتی که علاوه بر جریمه تاخیر برای هر شرط معوق اعمال می‌شود.
          </p>
        </div>

        <BusinessSwitch checked={enabled} onChange={onEnabledChange} />
      </div>

      {enabled ? (
        <div className="space-y-5">
          <div className="space-y-4">
            <h4 className="text-right text-lg font-black text-[color:var(--text-strong)]">
              مشخص کنید بر اساس درصد می‌باشد یا مبلغ ثابت
            </h4>
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
            <p className="text-right text-sm text-[color:var(--text-muted)]">
              این مبلغ یک‌بار هنگام اولین تاخیر برای هر سررسید اعمال می‌شود.
            </p>
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
            <p className="text-right text-sm text-[color:var(--text-muted)]">
              مشخص می‌کند عدد نهایی هزینه دیرکرد به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.
            </p>
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
  onSelectPenaltyType,
  onLeavePenaltyType,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
  onSelectPenaltyType: (typeId: string) => void;
  onLeavePenaltyType?: () => void;
}) {
  const activeMode = (state.activeTab || 'fixed') as PenaltyMode;
  const [browsingPenaltyList, setBrowsingPenaltyList] = useState(!state.activeChip);
  const selectedPenalty = browsingPenaltyList ? undefined : PENALTY_ITEMS.find((item) => item.id === state.activeChip);
  const currentMode = MODE_OPTIONS.find((item) => item.id === activeMode) ?? MODE_OPTIONS[0];
  const keys = getModeValues(currentMode.id);
  const activeRateCountLabel = `${MAX_PROGRESSIVE_ROWS} از ${MAX_PROGRESSIVE_ROWS} نرخ`;

  const syncNextRowFrom = (rowIndex: number, toValue: string) => {
    const nextRow = PROGRESSIVE_DEFAULT_ROWS[rowIndex + 1];
    if (!nextRow) return;
    if (!hasRowContent(state.values, nextRow)) return;
    onValueChange(nextRow.fromKey, getNextFromValue(toValue.trim()));
  };

  const handleProgressiveRowChange = (rowIndex: number, field: 'from' | 'to' | 'rate', value: string) => {
    const row = PROGRESSIVE_DEFAULT_ROWS[rowIndex];
    if (!row) return;

    if (field === 'rate') {
      onValueChange(row.rateKey, value);
      return;
    }

    if (field === 'to') {
      onValueChange(row.toKey, value);
      syncNextRowFrom(rowIndex, value);
      return;
    }

    if (rowIndex > 0) return;
    onValueChange(row.fromKey, value.trim());
  };

  const computedProgressiveRows = PROGRESSIVE_DEFAULT_ROWS.map((row, index) => {
    const previousOpenEnded = PROGRESSIVE_DEFAULT_ROWS.slice(0, index).some((previousRow) => Boolean(state.values[previousRow.openEndedKey]));
    const openEnded = Boolean(state.values[row.openEndedKey]) && !previousOpenEnded;
    const blocked = previousOpenEnded && !openEnded;
    const previousTo = index > 0 ? String(state.values[PROGRESSIVE_DEFAULT_ROWS[index - 1].toKey] ?? '') : '';
    const from = blocked ? '' : index === 0 ? String(state.values[row.fromKey] || row.from || '1') : getNextFromValue(previousTo);
    const to = blocked ? '' : String(state.values[row.toKey] ?? '');
    return { ...row, openEnded, blocked, from, to, rate: String(state.values[row.rateKey] ?? '') };
  });
  const firstOpenEndedIndex = computedProgressiveRows.findIndex((row) => row.openEnded);
  const visibleProgressiveRows =
    firstOpenEndedIndex >= 0 ? computedProgressiveRows.slice(0, firstOpenEndedIndex + 1) : computedProgressiveRows;

  if (!selectedPenalty) {
    return (
      <section className="space-y-5 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {PENALTY_ITEMS.map((item) => {
            const configured = hasPenaltyTypeSettings(state, item.id);
            return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectPenaltyType(item.id);
                setBrowsingPenaltyList(false);
              }}
              className="flex items-start justify-between gap-4 rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 text-right transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
            >
              <div className="flex-1">
                <div className="flex flex-col flex-nowrap items-start justify-center gap-3">
                  <h3 className="text-lg font-black text-[color:var(--text-strong)]">{item.title}</h3>
                  <span
                    className={`rounded-[8px] px-3 py-1 text-xs font-bold ${
                      configured
                        ? 'bg-[color:var(--theme-accent-softer)] text-[color:var(--text-muted)]'
                        : 'border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)]'
                    }`}
                  >
                    {configured ? 'تنظیمات انجام‌شده' : 'بدون تنظیم'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{item.description}</p>
              </div>
              <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-[color:var(--text-muted)]" />
            </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">{selectedPenalty.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{selectedPenalty.description}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onLeavePenaltyType?.();
              setBrowsingPenaltyList(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--theme-action-border)] hover:text-[color:var(--text-strong)]"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت به لیست جرایم
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
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
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                مشخص می‌کند جریمه بر اساس تاخیر روزانه، ماهانه یا سالانه محاسبه شود.
              </p>
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
                <RuleAmountInput
                  value={String(state.values[keys.amountKey!] ?? '')}
                  onChange={(value) => onValueChange(keys.amountKey!, value)}
                  suffix="تومان"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  مبلغی که برای هر دوره تاخیر به‌عنوان جریمه در نظر گرفته می‌شود.
                </p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput
                  value={String(state.values[keys.graceKey] ?? '')}
                  onChange={(value) => onValueChange(keys.graceKey, value)}
                  suffix="روز"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود.
                </p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'debt-percent' || currentMode.id === 'contract-percent' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <RuleFieldLabel label="درصد جریمه" required />
                <RuleAmountInput
                  value={String(state.values[keys.percentKey!] ?? '')}
                  onChange={(value) => onValueChange(keys.percentKey!, value)}
                  suffix="%"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  درصد جریمه‌ای که برای دوره انتخاب‌شده اعمال می‌شود.
                </p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="درصد سود بانکی" required />
                <RuleAmountInput
                  value={String(state.values[keys.bankKey!] ?? '')}
                  onChange={(value) => onValueChange(keys.bankKey!, value)}
                  suffix="%"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  در این بخش منظور سود بانکی‌ای که می‌خواهید به درصد جریمه اضافه شود را وارد کنید.
                </p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput
                  value={String(state.values[keys.graceKey] ?? '')}
                  onChange={(value) => onValueChange(keys.graceKey, value)}
                  suffix="روز"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  تعداد روزهایی که پس از سررسید قسط بدون محاسبه جریمه مهلت داده می‌شود.
                </p>
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
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.
                </p>
              </div>
            </div>
          ) : null}

          {currentMode.id === 'progressive' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <RuleFieldLabel label="درصد سود بانکی" required />
                <RuleAmountInput
                  value={String(state.values[keys.bankKey!] ?? '')}
                  onChange={(value) => onValueChange(keys.bankKey!, value)}
                  suffix="%"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  در این بخش مقدار سود بانکی که به درصد جریمه اضافه شود را وارد کنید تا به صورت جداگانه محاسبه شود.
                </p>
              </div>

              <div className="space-y-4">
                <RuleFieldLabel label="مهلت تنفس (بدون جریمه)" required />
                <RulePlainTextInput
                  value={String(state.values[keys.graceKey] ?? '')}
                  onChange={(value) => onValueChange(keys.graceKey, value)}
                  suffix="روز"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود.
                </p>
              </div>

              <div className="space-y-5 border-t border-[color:var(--border-soft)] pt-5">
                <div className="flex flex-col gap-4 lg:items-end">
                  <div className="w-full text-right">
                    <div className="flex items-center justify-start gap-2">
                      <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">جدول جریمه‌های تصاعدی</h3>
                      <span className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs font-bold text-[color:var(--text-muted)]">
                        {activeRateCountLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">
                      حداکثر ۴ نرخ قابل تعریف است. برای هر نرخ جدید، مقدار «از» بر اساس «تا» ردیف قبلی به‌صورت خودکار قفل می‌شود و با «به بعد» ردیف‌های بعدی دیگر نمایش داده نمی‌شوند.
                    </p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      {Array.from({ length: MAX_PROGRESSIVE_ROWS }, (_, index) => (
                        <span
                          key={index}
                          className="h-2.5 w-10 rounded-full bg-[color:var(--theme-action-border)] transition"
                        />
                      ))}
                    </div>
                  </div>

                </div>

                <div className="space-y-5">
                  {visibleProgressiveRows.map((row, rowIndex) => {
                    const actualIndex = computedProgressiveRows.findIndex((item) => item.fromKey === row.fromKey);
                    return (
                      <SmartProgressRow
                        key={row.fromKey}
                        from={row.from}
                        to={row.to}
                        rate={row.rate}
                        openEnded={row.openEnded}
                        blocked={row.blocked}
                        onChange={(field, value) => {
                          if (field === 'openEnded') {
                            const checked = Boolean(value);
                            onValueChange(row.openEndedKey, checked);
                            if (checked) onValueChange(row.toKey, '');
                            return;
                          }

                          handleProgressiveRowChange(actualIndex, field, String(value));
                        }}
                      />
                    );
                  })}
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
                  aria-label="قاعده گرد کردن مبلغ جریمه - تصاعدی"
                />
                <p className="text-right text-sm text-[color:var(--text-muted)]">
                  مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود، مثل گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.
                </p>
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


