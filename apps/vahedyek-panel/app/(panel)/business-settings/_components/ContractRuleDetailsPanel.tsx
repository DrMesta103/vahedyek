'use client';

import { useEffect, useMemo, useState, type ElementType } from 'react';
import {
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  ClipboardPenLine,
  FileText,
  Layers3,
  Percent,
  Save,
  SlidersHorizontal,
  UserRoundCog,
  WalletCards,
} from 'lucide-react';
import { RULE_CONFIGS, type ContractRuleId, type ContractRuleState, type RuleField } from '../../../lib/businessContractRules';
import { normalizeKnownProgressivePenaltyValues } from '../../../lib/progressivePenalty';
import {
  BusinessSwitch,
  ChoicePills as UiChoicePills,
  Input,
  PersianDatePicker,
  RULE_PANEL_SELECT_CLASSNAME,
  RULE_PANEL_TEXT_INPUT_CLASSNAME,
  RuleAmountInput,
  RuleFieldLabel,
  RuleTabButton,
  TagPills,
} from '@repo/ui';
import { AdjustmentRuleSection } from './AdjustmentRuleSection';
import { DiscountRuleSection } from './DiscountRuleSection';
import { ForgivenessRuleSection } from './ForgivenessRuleSection';
import { InterestRuleSection } from './InterestRuleSection';
import { PenaltyRuleSection } from './PenaltyRuleSection';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function ContractRegistrationSwitch({
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
  return <BusinessSwitch checked={checked} onChange={onChange} activeLabel={activeLabel} inactiveLabel={inactiveLabel} />;
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return <RuleFieldLabel label={label} required={required} />;
}

function RuleTextInput({
  value,
  onChange,
  placeholder,
  suffix,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  icon?: ElementType;
}) {
  if (suffix === 'تومان' || suffix === '%') {
    return <RuleAmountInput value={value} onChange={onChange} placeholder={placeholder} suffix={suffix} />;
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={cn(RULE_PANEL_TEXT_INPUT_CLASSNAME, suffix || Icon ? '!pr-12' : '')}
      endAdornment={suffix ? <span className="text-xl font-black text-[color:var(--text-strong)]">{suffix}</span> : Icon ? <Icon className="h-5 w-5 text-[color:var(--text-muted)]" /> : undefined}
    />
  );
}

function RuleSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={RULE_PANEL_SELECT_CLASSNAME}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-[color:var(--surface)] text-[color:var(--text-strong)]">
          {option}
        </option>
      ))}
    </select>
  );
}

function RuleSwitchRow({
  title,
  checked,
  onChange,
  useContractRegistrationSwitch = false,
}: {
  title: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  useContractRegistrationSwitch?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-[color:var(--border-soft)] pt-6 lg:items-center lg:justify-between',
        useContractRegistrationSwitch ? 'lg:flex-row' : 'lg:flex-row-reverse',
      )}
    >
      <h4 className="w-full text-right text-[17px] font-black leading-8 text-[color:var(--text-strong)] lg:flex-1">{title}</h4>
      <ContractRegistrationSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

const TabButton = RuleTabButton;

function GenericFieldInput({
  field,
  value,
  onChange,
}: {
  field: RuleField;
  value: string | boolean;
  onChange: (nextValue: string | boolean) => void;
}) {
  if (field.type === 'switch') {
    return <RuleSwitchRow title={field.label} checked={Boolean(value)} onChange={onChange} />;
  }

  return (
    <div>
      <FieldLabel label={field.label} />
      {field.type === 'select' ? (
        <RuleSelect value={String(value)} options={field.options} onChange={onChange} />
      ) : (
        <RuleTextInput value={String(value)} onChange={onChange} placeholder={field.placeholder} />
      )}
    </div>
  );
}

function getTabIcon(ruleId: ContractRuleId, tabId: string): ElementType {
  if (ruleId === 'prepayment') {
    if (tabId === 'percent') return BadgePercent;
    if (tabId === 'fixed') return CircleDollarSign;
    if (tabId === 'combined') return SlidersHorizontal;
    return UserRoundCog;
  }

  if (ruleId === 'installments') {
    return tabId === 'regular' ? CalendarDays : ClipboardPenLine;
  }

  if (tabId === 'amount') return WalletCards;
  if (tabId === 'contract-percent') return Percent;
  if (tabId === 'combined') return Layers3;
  if (tabId === 'per-installment-fixed') return FileText;
  if (tabId.includes('percent')) return BadgePercent;
  if (tabId.includes('fixed') || tabId.includes('amount')) return CircleDollarSign;
  if (tabId.includes('combined') || tabId.includes('multi')) return SlidersHorizontal;
  return CircleDollarSign;
}

function getPrepaymentLead(tabId: string) {
  switch (tabId) {
    case 'percent':
      return 'در این روش مبلغ پیشنهادی پیش‌پرداخت به‌صورت یک درصد از مبلغ کل تعیین می‌شود.';
    case 'fixed':
      return 'در این روش مبلغ پیشنهادی پیش‌پرداخت به‌صورت یک مقدار ثابت تعیین می‌شود.';
    case 'combined':
      return 'در این روش، بخشی از پیش‌پرداخت به‌صورت درصدی از مبلغ کل قرارداد محاسبه می‌شود و علاوه بر آن یک مبلغ ثابت نیز تعیین می‌شود.';
    case 'sales':
      return 'در این روش، مدیر فروش می‌تواند بر اساس سیاست فروش پروژه، مبلغ پیش‌پرداخت پیشنهادی متفاوتی برای قرارداد ثبت کند.';
    default:
      return '';
  }
}

function getAdditionalCostsLead(tabId: string) {
  switch (tabId) {
    case 'amount':
      return 'در این روش یک مبلغ مشخص و ثابت بدون توجه به مبلغ قرارداد دریافت می‌شود.';
    case 'contract-percent':
      return 'هزینه بر اساس درصدی از مبلغ کل قرارداد محاسبه می‌شود.';
    case 'combined':
      return 'در این روش هزینه از دو بخش تشکیل می‌شود: یک مبلغ ثابت + درصدی از مبلغ قرارداد.';
    case 'per-installment-fixed':
      return 'برای هر قسط بر اساس مانده بدهی، یک مبلغ ثابت به عنوان هزینه اعمال می‌شود.';
    default:
      return '';
  }
}

function parsePercentValue(value: string | boolean | undefined) {
  if (typeof value !== 'string') return 0;
  const normalized = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
}

function getAdjustmentWeightsTotal(state: ContractRuleState) {
  return (
    parsePercentValue(state.values.adjustMultiHousingWeight) +
    parsePercentValue(state.values.adjustMultiLaborWeight) +
    parsePercentValue(state.values.adjustMultiMaterialWeight) +
    parsePercentValue(state.values.adjustMultiMaterialsOtherWeight) +
    parsePercentValue(state.values.adjustMultiWageWeight) +
    parsePercentValue(state.values.adjustMultiEnergyWeight) +
    parsePercentValue(state.values.adjustMultiGeneralPriceWeight)
  );
}

function applyPanelValue(
  setState: React.Dispatch<React.SetStateAction<ContractRuleState | null>>,
  key: string,
  value: string | boolean,
  options?: { normalizePenaltyRanges?: boolean },
) {
  setState((current) => {
    if (!current) return current;
    if (key === 'active') return { ...current, active: Boolean(value) };
    if (key === 'activeTab' && typeof value === 'string') return { ...current, activeTab: value };
    if (key === 'activeChip' && typeof value === 'string') return { ...current, activeChip: value };
    const values = {
      ...current.values,
      [key]: value,
    };
    return {
      ...current,
      values: options?.normalizePenaltyRanges ? normalizeKnownProgressivePenaltyValues(values) : values,
    };
  });
}

function PrepaymentTabContent({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const installmentWindowKeys: Record<string, string> = {
    percent: 'prePercentInstallmentWindow',
    fixed: 'preFixedInstallmentWindow',
    combined: 'preCombinedInstallmentWindow',
    sales: 'preSalesInstallmentWindow',
  };
  const installmentSwitchKeys: Record<string, string> = {
    percent: 'prePercentInstallmentEnabled',
    fixed: 'preFixedInstallmentEnabled',
    combined: 'preCombinedInstallmentEnabled',
    sales: 'preSalesInstallmentEnabled',
  };

  const activeTab = state.activeTab;
  const installmentKey = installmentSwitchKeys[activeTab];
  const installmentWindowKey = installmentWindowKeys[activeTab];
  const installmentEnabled = Boolean(state.values[installmentKey]);
  const installmentWindowOptions = ['در اختیار مدیر فروش', 'یک هفته', 'دو هفته', 'یک ماه', 'چهل و پنج روز', 'دو ماه'];
  const installmentWindowTagOptions = installmentWindowOptions.map((option) => ({ value: option, label: option }));

  return (
    <div className="space-y-8 text-right">
      <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">{getPrepaymentLead(activeTab)}</p>
      <div className="border-t border-[color:var(--border-soft)]" />

      {activeTab === 'percent' ? (
        <div className="space-y-4">
          <FieldLabel label="درصدی از مبلغ کل قرارداد" required />
          <RuleTextInput value={String(state.values.prePercent ?? '')} onChange={(value) => onValueChange('prePercent', value)} suffix="%" />
          <p className="text-sm text-[color:var(--text-muted)]">در این بخش حداقل درصدی از مبلغ کل قرارداد را که به‌عنوان پیش‌پرداخت دریافت می‌کنید، وارد کنید.</p>
        </div>
      ) : null}

      {activeTab === 'fixed' ? (
        <div className="space-y-4">
          <FieldLabel label="مبلغ ثابت" required />
          <RuleTextInput value={String(state.values.preFixedAmount ?? '')} onChange={(value) => onValueChange('preFixedAmount', value)} suffix="تومان" />
          <p className="text-sm text-[color:var(--text-muted)]">این مبلغ به‌عنوان پیش‌پرداخت پیشنهادی در زمان ثبت قرارداد استفاده می‌شود.</p>
        </div>
      ) : null}

      {activeTab === 'combined' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:[direction:rtl]">
          <div className="space-y-4">
            <FieldLabel label="درصدی از مبلغ کل قرارداد" required />
            <RuleTextInput value={String(state.values.preCombinedPercent ?? '')} onChange={(value) => onValueChange('preCombinedPercent', value)} suffix="%" />
            <p className="text-sm text-[color:var(--text-muted)]">در این بخش حداقل درصدی از مبلغ کل قرارداد را وارد کنید.</p>
          </div>

          <div className="space-y-4">
            <FieldLabel label="مبلغ ثابت" required />
            <RuleTextInput value={String(state.values.preCombinedAmount ?? '')} onChange={(value) => onValueChange('preCombinedAmount', value)} suffix="تومان" />
            <p className="text-sm text-[color:var(--text-muted)]">این مبلغ به‌عنوان بخش ثابت پیش‌پرداخت در زمان ثبت قرارداد استفاده می‌شود.</p>
          </div>
        </div>
      ) : null}

      {activeTab === 'sales' ? (
        <RuleSwitchRow
          title="امکان ثبت پیش‌پرداخت با توجه به سیاست مدیر فروش"
          checked={Boolean(state.values.preSalesEnabled)}
          onChange={(value) => onValueChange('preSalesEnabled', value)}
          useContractRegistrationSwitch
        />
      ) : null}

      <RuleSwitchRow
        title="امکان پرداخت اقساطی پیش‌پرداخت"
        checked={installmentEnabled}
        onChange={(value) => onValueChange(installmentKey, value)}
        useContractRegistrationSwitch
      />

      {installmentEnabled ? (
        <div className="space-y-5">
          <div className="text-right">
            <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">چارچوب زمانی پیشنهادی اقساط پیش‌پرداخت</h4>
            <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">اقساط ثابت (قسط هر دوره یک مبلغ)</p>
          </div>

          <div className="text-right">
            <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">حداکثر بازه پیشنهادی پس از ثبت قرارداد</h4>
          </div>

          <TagPills
            options={installmentWindowTagOptions}
            value={String(state.values[installmentWindowKey] || installmentWindowOptions[0])}
            onChange={(value) => onValueChange(installmentWindowKey, value)}
            className="justify-end flex-row-reverse"
          />
        </div>
      ) : null}
    </div>
  );
}

function InstallmentsTabContent({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const isRegular = state.activeTab === 'regular';
  const lastDueKey = isRegular ? 'regularLastDueDate' : 'irregularLastDueDate';
  const balloonEnabledKey = isRegular ? 'regularBalloonEnabled' : 'irregularBalloonEnabled';
  const balloonWindowKey = isRegular ? 'regularBalloonWindow' : 'irregularBalloonWindow';
  const balloonPercentKey = isRegular ? 'regularBalloonPercent' : 'irregularBalloonPercent';
  const intervalOptions = ['در بازه قابل تنظیم در زمان عقد قرارداد', 'دو هفته ای', 'ماهانه', 'دوماهه', 'سه ماهه', 'شش ماهه', 'سالانه'];
  const balloonOptions = ['ماه آخر', '۳ ماه آخر', '۵ ماه آخر', '۷ ماه آخر'];
  const balloonEnabled = Boolean(state.values[balloonEnabledKey]);
  const intervalTagOptions = intervalOptions.map((option) => ({ value: option, label: option }));
  const balloonTagOptions = balloonOptions.map((option) => ({ value: option, label: option }));

  return (
    <div className="space-y-8 text-right">
      {isRegular ? (
        <>
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">
            در این روش مبلغ پیشنهادی هر قسط ثابت است و در بازه‌های زمانی منظم نمایش داده می‌شود.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />

          <div className="space-y-5">
            <div className="text-right">
              <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">بازه زمانی اقساط</h4>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">فاصله زمانی پیشنهادی بین اقساط منظم را مشخص کنید.</p>
            </div>

            <UiChoicePills
              options={intervalTagOptions}
              value={String(state.values.regularInterval || intervalOptions[0])}
              onChange={(value) => onValueChange('regularInterval', value)}
              wrap
              className="justify-end flex-row-reverse"
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">
            در این روش زمان و مبلغ اقساط می‌تواند متناسب با شرایط قرارداد، به‌صورت شناور و غیرمنظم تعیین شود.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />
        </>
      )}

      <div className="space-y-4">
        <FieldLabel label="تاریخ آخرین قسط" />
        <PersianDatePicker
          value={String(state.values[lastDueKey] ?? '')}
          onChange={(value) => onValueChange(lastDueKey, value)}
          placeholder="YYYY/MM/DD"
          containerClassName="w-full"
          className={cn(RULE_PANEL_TEXT_INPUT_CLASSNAME, '!pr-11')}
        />
        <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">تاریخی که اقساط باید تا آن زمان به پایان برسند. تعداد و مبلغ اقساط بر اساس این تاریخ محاسبه می‌شود.</p>
      </div>

      <RuleSwitchRow
        title="امکان پرداخت بالونی"
        checked={balloonEnabled}
        onChange={(value) => onValueChange(balloonEnabledKey, value)}
        useContractRegistrationSwitch
      />

      {balloonEnabled ? (
        <div className="space-y-6">
          <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">
            پرداخت بالونی یعنی درصدی از اصل بدهی در یک یا چند قسط و در بازه زمانی مشخص، معمولا در اقساط پایانی، دریافت شود.
          </p>

          <div className="space-y-5">
            <div className="text-right">
              <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">بازه زمانی پیشنهادی پرداخت بالونی</h4>
              <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">این بازه فاصله زمانی پیشنهادی پرداخت بالونی را مشخص می‌کند.</p>
            </div>

            <UiChoicePills
              options={balloonTagOptions}
              value={String(state.values[balloonWindowKey] || balloonOptions[0])}
              onChange={(value) => onValueChange(balloonWindowKey, value)}
              wrap
              className="justify-end flex-row-reverse"
            />
          </div>

          <div className="space-y-4">
            <FieldLabel label="درصد پیشنهادی سهم پرداخت بالونی" required />
            <RuleTextInput value={String(state.values[balloonPercentKey] ?? '')} onChange={(value) => onValueChange(balloonPercentKey, value)} suffix="%" />
            <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">درصدی از مانده بدهی که باید به‌صورت بالونی دریافت شود را در این بخش وارد کنید.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type AdditionalCostItem = {
  id: string;
  title: string;
  description: string;
};

type DeedCostMode = 'buyer' | 'seller' | 'shared';

const SHARED_ADDITIONAL_COST_ITEMS = new Set(['deed', 'office', 'commission', 'attorney']);

const ADDITIONAL_COST_ITEMS: AdditionalCostItem[] = [
  { id: 'file-opening', title: 'تشکیل پرونده', description: 'هزینه‌ای که خریدار برای ایجاد پرونده و آماده‌سازی روند اداری پرداخت می‌کند.' },
  { id: 'processing', title: 'پردازش', description: 'هزینه‌ای که خریدار برای بررسی و ثبت مراحل مختلف قرارداد و عملیات اجرایی پرداخت می‌کند.' },
  { id: 'installment-management', title: 'مدیریت اقساط', description: 'هزینه‌ای که خریدار برای برنامه‌ریزی، پیگیری و مدیریت اقساط قرارداد پرداخت می‌کند.' },
  { id: 'services', title: 'خدمات', description: 'هزینه‌ای که خریدار برای خدمات جانبی مرتبط با قرارداد یا واحد، مانند تحویل، سرویس‌ها پرداخت می‌کند.' },
  { id: 'deed', title: 'سند', description: 'هزینه‌های مربوط به تنظیم و ثبت و پیوست‌های رسمی سند قرارداد یا سند مالکیت.' },
  { id: 'office', title: 'دفترخانه', description: 'هزینه‌های مربوط به ثبت رسمی قرارداد در دفترخانه یا انتقال سند.' },
  { id: 'commission', title: 'هزینه کمیسیون فروش', description: 'هزینه‌های مربوط به ثبت رسمی قرارداد در دفترخانه یا انتقال سند.' },
  { id: 'attorney', title: 'هزینه وکالت', description: 'هزینه‌های مربوط به ثبت رسمی قرارداد در دفترخانه یا انتقال سند.' },
  { id: 'custom', title: 'هزینه‌های سفارش', description: 'هزینه‌های جانبی که نام مشخصی ندارند و به‌صورت مبلغ ثابت یا درصدی تعیین شده و از خریدار دریافت می‌گردند.' },
  { id: 'expertise', title: 'کارشناسی', description: 'هزینه‌ای که خریدار برای ارزیابی کارشناسی مالی یا مدارک توسط کارشناس رسمی پرداخت می‌کند.' },
];

function AdditionalCostCard({
  item,
  onClick,
}: {
  item: AdditionalCostItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[104px] flex-col items-end justify-center border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-4 text-right [direction:rtl] transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
    >
      <div className="mb-3 flex w-full flex-row-reverse items-center justify-between text-right">
        <ChevronLeft className="h-5 w-5 text-[color:var(--text-muted)]" />
        <h3 className="text-lg font-black text-[color:var(--text-strong)]">{item.title}</h3>
      </div>
      <p className="text-sm leading-7 text-[color:var(--text-muted)]">{item.description}</p>
    </button>
  );
}

function AdditionalCostsTabContent({
  state,
  onValueChange,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
}) {
  const selectedItemId = state.activeChip || '';
  const selectedItem = ADDITIONAL_COST_ITEMS.find((item) => item.id === selectedItemId) ?? null;
  const taxEnabled = Boolean(state.values.costTaxEnabled);
  const sharedMode = (state.values.costSharedMode as DeedCostMode | undefined) ?? 'buyer';
  const isSharedCostItem = selectedItem ? SHARED_ADDITIONAL_COST_ITEMS.has(selectedItem.id) : false;

  if (!selectedItem) {
    return (
      <div className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-[color:var(--border-soft)] md:grid-cols-2">
        {ADDITIONAL_COST_ITEMS.map((item) => (
          <AdditionalCostCard key={item.id} item={item} onClick={() => onValueChange('activeChip', item.id)} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col items-end space-y-3 text-right">
            <h3 className="text-xl font-black text-[color:var(--text-strong)]">فعال‌سازی هزینه {selectedItem.title}</h3>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              {isSharedCostItem
                ? `در صورت فعال بودن، هزینه ${selectedItem.title} به قرارداد اضافه می‌شود. در غیر این صورت از محاسبه حذف می‌گردد.`
                : `با فعال‌سازی این گزینه هزینه‌های مربوط به ${selectedItem.title} به مبلغ کل قرارداد اضافه می‌شود.`}
            </p>
          </div>
          <div className="self-start lg:self-auto">
            <ContractRegistrationSwitch checked={state.active} onChange={(value) => onValueChange('active', value)} />
          </div>
        </div>
      </section>

      {isSharedCostItem ? (
        <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          <div className="space-y-0">
            <button
              type="button"
              onClick={() => onValueChange('costSharedMode', 'buyer')}
              className="flex w-full items-start gap-4 border-b border-[color:var(--border-soft)] px-5 py-5 text-right transition hover:bg-[color:var(--surface-soft)]"
            >
              <span className={cn('mt-1 h-5 w-5 rounded-full border-2', sharedMode === 'buyer' ? 'border-[#11b5c9]' : 'border-[color:var(--border-color)]')}>
                <span className={cn('m-[3px] block h-2.5 w-2.5 rounded-full', sharedMode === 'buyer' ? 'bg-[#11b5c9]' : 'bg-transparent')} />
              </span>
              <div className="flex-1">
                <div className="text-lg font-black text-[color:var(--text-strong)]">با خریدار است</div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">تمام هزینه‌های {selectedItem.title} توسط خریدار پرداخت می‌شود.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onValueChange('costSharedMode', 'seller')}
              className="flex w-full items-start gap-4 border-b border-[color:var(--border-soft)] px-5 py-5 text-right transition hover:bg-[color:var(--surface-soft)]"
            >
              <span className={cn('mt-1 h-5 w-5 rounded-full border-2', sharedMode === 'seller' ? 'border-[#11b5c9]' : 'border-[color:var(--border-color)]')}>
                <span className={cn('m-[3px] block h-2.5 w-2.5 rounded-full', sharedMode === 'seller' ? 'bg-[#11b5c9]' : 'bg-transparent')} />
              </span>
              <div className="flex-1">
                <div className="text-lg font-black text-[color:var(--text-strong)]">با سازنده است</div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">تمام هزینه‌های {selectedItem.title} بر عهده سازنده است و از مبلغ قابل پرداخت خریدار حذف می‌شود.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onValueChange('costSharedMode', 'shared')}
              className="flex w-full items-start gap-4 px-5 py-5 text-right transition hover:bg-[color:var(--surface-soft)]"
            >
              <span className={cn('mt-1 h-5 w-5 rounded-full border-2', sharedMode === 'shared' ? 'border-[#11b5c9]' : 'border-[color:var(--border-color)]')}>
                <span className={cn('m-[3px] block h-2.5 w-2.5 rounded-full', sharedMode === 'shared' ? 'bg-[#11b5c9]' : 'bg-transparent')} />
              </span>
              <div className="flex-1">
                <div className="text-lg font-black text-[color:var(--text-strong)]">اشتراک بین خریدار و سازنده</div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">هزینه {selectedItem.title} بین خریدار و سازنده تقسیم می‌شود. درصد سهم هر طرف را مشخص کنید.</p>
              </div>
            </button>
          </div>

          {sharedMode === 'shared' ? (
            <div className="space-y-6 border-t border-[color:var(--border-soft)] p-5">
              <div className="space-y-4">
                <FieldLabel label="درصد سهم پیش خریدار" required />
                <RuleTextInput value={String(state.values.costSharedBuyerPercent ?? '')} onChange={(value) => onValueChange('costSharedBuyerPercent', value)} suffix="%" />
                <div className="text-right text-sm text-[color:var(--text-muted)]">۰ / ۶</div>
                <p className="text-right text-sm text-[color:var(--text-muted)]">درصدی از هزینه {selectedItem.title} که خریدار باید پرداخت کند.</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="درصد سهم سازنده" required />
                <RuleTextInput value={String(state.values.costSharedSellerPercent ?? '')} onChange={(value) => onValueChange('costSharedSellerPercent', value)} suffix="%" />
                <div className="text-right text-sm text-[color:var(--text-muted)]">۰ / ۶</div>
                <p className="text-right text-sm text-[color:var(--text-muted)]">درصدی از هزینه {selectedItem.title} که سازنده پرداخت می‌کند. این مقدار باید مکمل سهم خریدار باشد.</p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isSharedCostItem ? (
      <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
        <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
          {RULE_CONFIGS['additional-costs'].tabs.map((tab) => (
            <TabButton
              key={tab.id}
              title={tab.title}
              icon={getTabIcon('additional-costs', tab.id)}
              active={state.activeTab === tab.id}
              onClick={() => onValueChange('activeTab', tab.id)}
            />
          ))}
        </div>

        <div className="space-y-8 p-5">
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">{getAdditionalCostsLead(state.activeTab)}</p>
          <div className="border-t border-[color:var(--border-soft)]" />

          {state.activeTab === 'amount' ? (
            <div className="space-y-4">
              <FieldLabel label="مبلغ متنظر" required />
              <RuleTextInput value={String(state.values.costAmountValue ?? '')} onChange={(value) => onValueChange('costAmountValue', value)} suffix="تومان" />
              <p className="text-right text-sm text-[color:var(--text-muted)]">مبلغ ثابت هزینه {selectedItem.title} را وارد کنید.</p>
            </div>
          ) : null}

          {state.activeTab === 'contract-percent' ? (
            <div className="space-y-4">
              <FieldLabel label="درصد متنظر" required />
              <RuleTextInput value={String(state.values.costPercentValue ?? '')} onChange={(value) => onValueChange('costPercentValue', value)} suffix="%" />
              <div className="text-right text-sm text-[color:var(--text-muted)]">۰ / ۶</div>
              <p className="text-right text-sm text-[color:var(--text-muted)]">این مقدار به صورت درصدی از مبلغ قرارداد محاسبه می‌شود و با تغییر مبلغ قرارداد به‌طور خودکار بروزرسانی می‌شود.</p>
            </div>
          ) : null}

          {state.activeTab === 'combined' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <FieldLabel label="مبلغ متنظر" required />
                <RuleTextInput value={String(state.values.costCombinedAmount ?? '')} onChange={(value) => onValueChange('costCombinedAmount', value)} suffix="تومان" />
                <p className="text-right text-sm text-[color:var(--text-muted)]">این مقدار به صورت حداقلی برای هزینه پرداخت مفروض شده و مستقل از درصدها یا شرایط دیگر است.</p>
              </div>
              <div className="space-y-4">
                <FieldLabel label="درصد متنظر" required />
                <RuleTextInput value={String(state.values.costCombinedPercent ?? '')} onChange={(value) => onValueChange('costCombinedPercent', value)} suffix="%" />
                <div className="text-right text-sm text-[color:var(--text-muted)]">۰ / ۶</div>
                <p className="text-right text-sm text-[color:var(--text-muted)]">این مقدار به صورت درصدی از مبلغ قرارداد محاسبه می‌شود و با تغییر مبلغ قرارداد به‌طور خودکار بروزرسانی می‌شود.</p>
              </div>
            </div>
          ) : null}

          {state.activeTab === 'per-installment-fixed' ? (
            <div className="space-y-4">
              <FieldLabel label="مبلغ ثابت به ازای هر قسط" required />
              <RuleTextInput value={String(state.values.costPerInstallmentValue ?? '')} onChange={(value) => onValueChange('costPerInstallmentValue', value)} suffix="تومان" />
              <p className="text-right text-sm text-[color:var(--text-muted)]">این هزینه به صورت مبلغ ثابت برای هر قسط تعیین می‌شود و در هر پرداخت جداگانه اعمال می‌گردد.</p>
            </div>
          ) : null}

            <RuleSwitchRow title="فعال کردن محاسبه مالیات برای هزینه‌های جانبی" checked={taxEnabled} onChange={(value) => onValueChange('costTaxEnabled', value)} useContractRegistrationSwitch />

          {taxEnabled ? (
            <div className="space-y-4">
              <FieldLabel label="نرخ مالیات" required />
              <RuleTextInput value={String(state.values.costTaxPercent ?? '')} onChange={(value) => onValueChange('costTaxPercent', value)} suffix="%" />
              <div className="text-right text-sm text-[color:var(--text-muted)]">۰ / ۶</div>
              <p className="text-right text-sm text-[color:var(--text-muted)]">درصد مالیات قابل اعمال روی هزینه {selectedItem.title} را وارد کنید.</p>
            </div>
          ) : null}
        </div>
      </section>
      ) : null}
    </div>
  );
}

export function ContractRuleDetailsPanel({ ruleId }: { ruleId: ContractRuleId }) {
  const rule = RULE_CONFIGS[ruleId];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractRuleState | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`/api/business-settings/contract-rules/${ruleId}`, { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [ruleId]);

  const currentTab = useMemo(() => {
    if (!state) return rule.tabs[0] ?? null;
    return rule.tabs.find((tab) => tab.id === state.activeTab) ?? rule.tabs[0] ?? null;
  }, [rule, state]);
  const hasSelectedAdditionalCost = ruleId === 'additional-costs' && Boolean(state?.activeChip);
  const activationHeaderLgRow =
    ruleId === 'prepayment' ||
    ruleId === 'installments' ||
    ruleId === 'adjustment' ||
    ruleId === 'discount' ||
    ruleId === 'forgiveness' ||
    ruleId === 'interest';

  const handleSave = async () => {
    if (!state) return;

    if (ruleId === 'adjustment' && state.activeTab === 'multi-indicator') {
      const total = getAdjustmentWeightsTotal(state);
      if (total > 100) {
        setError(`جمع درصد شاخص‌های تعدیل ${total}٪ است و نباید از ۱۰۰٪ بیشتر باشد.`);
        setMessage('');
        return;
      }
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const normalizedState =
        ruleId === 'penalty'
          ? { ...state, values: normalizeKnownProgressivePenaltyValues(state.values) }
          : state;
      setState(normalizedState);

      const response = await fetch(`/api/business-settings/contract-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات انجام نشد.');
      }

      setMessage('تنظیمات با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state || !currentTab) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          در حال بارگذاری تنظیمات...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        {!hasSelectedAdditionalCost ? (
          <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
            <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:[direction:rtl]">
              <div className="flex min-w-0 flex-1 flex-col justify-center space-y-3 text-right [direction:rtl] lg:items-start">
                <div className={cn('flex flex-nowrap items-end justify-start gap-3 text-right', activationHeaderLgRow ? 'w-full' : '')}>
                  {rule.detailsLabel &&
                  ruleId !== 'prepayment' &&
                  ruleId !== 'installments' &&
                  ruleId !== 'adjustment' &&
                  ruleId !== 'discount' &&
                  ruleId !== 'interest' ? (
                    <span className="rounded-xl bg-[color:var(--theme-accent-softer)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)]">{rule.detailsLabel}</span>
                  ) : null}
                  <h2 className="text-xl font-black text-[color:var(--text-strong)]">{rule.activationTitle}</h2>
                </div>
                <p className="w-full text-sm leading-7 text-[color:var(--text-muted)]">{rule.activationDescription}</p>
                {!state.active ? <p className="w-full text-sm text-[color:var(--text-muted)]">با فعال کردن این گزینه، جزئیات این بخش برای کاربر نمایش داده می‌شود.</p> : null}
              </div>

              <div className="shrink-0 self-end lg:self-auto">
                <ContractRegistrationSwitch checked={state.active} onChange={(value) => applyPanelValue(setState, 'active', value)} />
              </div>
            </div>
          </section>
        ) : null}

        {state.active ? (
          <>
            {rule.chips?.length && ruleId !== 'adjustment' ? (
              <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
                <div className="mb-4 text-right text-base font-black text-[color:var(--text-strong)]">بازه اثرگذاری</div>
                <UiChoicePills
                  options={rule.chips.map((chip) => ({ value: chip, label: chip }))}
                  value={String(state.activeChip || rule.chips[0])}
                  onChange={(value) => applyPanelValue(setState, 'activeChip', value)}
                  wrap
                  className="justify-end flex-row-reverse"
                />
              </section>
            ) : null}

            {ruleId === 'additional-costs' ? (
              <AdditionalCostsTabContent state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
            ) : ruleId === 'discount' ? (
              <DiscountRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
            ) : ruleId === 'forgiveness' ? (
              <ForgivenessRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
            ) : ruleId === 'interest' ? (
              <InterestRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
            ) : ruleId === 'penalty' ? (
              <PenaltyRuleSection
                state={state}
                onValueChange={(key, value) => applyPanelValue(setState, key, value, { normalizePenaltyRanges: true })}
              />
            ) : (
              <section className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
                {ruleId !== 'adjustment' ? (
                  <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
                    {rule.tabs.map((tab) => (
                      <TabButton
                        key={tab.id}
                        title={tab.title}
                        icon={getTabIcon(ruleId, tab.id)}
                        active={state.activeTab === tab.id}
                        onClick={() => applyPanelValue(setState, 'activeTab', tab.id)}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="space-y-8 p-5">
                  {ruleId === 'prepayment' ? (
                    <PrepaymentTabContent state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
                  ) : ruleId === 'adjustment' ? (
                    <AdjustmentRuleSection state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
                  ) : ruleId === 'installments' ? (
                    <InstallmentsTabContent state={state} onValueChange={(key, value) => applyPanelValue(setState, key, value)} />
                  ) : (
                    <>
                      <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-4 text-right">
                        <div className="mb-2 text-base font-black text-[color:var(--text-strong)]">{currentTab.title}</div>
                        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{currentTab.description}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {currentTab.fields.map((field) => (
                          <GenericFieldInput
                            key={field.key}
                            field={field}
                            value={state.values[field.key]}
                            onChange={(nextValue) => applyPanelValue(setState, field.key, nextValue)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        ) : null}

        {message ? (
          <section className="rounded-2xl border border-[#11b5c9]/50 bg-[#11b5c9]/10 p-4 text-sm text-[#8ef0ff]">
            <div className="inline-flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          </section>
        ) : null}

        {error ? <div className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</div> : null}
      </div>

      <div className="fixed inset-x-0 bottom-3 z-20 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="mx-auto flex max-w-6xl justify-center">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="pointer-events-auto inline-flex min-w-[54px] items-center justify-center gap-1 rounded-lg bg-[#11b5c9] px-3.5 py-1.5 text-sm font-black text-[#123b69] shadow-[0_10px_24px_rgba(17,181,201,0.28)] transition hover:bg-[#0da5b7] disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {saving ? 'در حال ذخیره...' : 'ثبت'}
          </button>
        </div>
      </div>
    </section>
  );
}
