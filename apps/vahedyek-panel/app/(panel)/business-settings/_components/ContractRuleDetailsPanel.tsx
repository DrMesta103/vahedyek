'use client';

import { useEffect, useMemo, useState, type ElementType, type ReactNode } from 'react';
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
  SlidersHorizontal,
  Trash2,
  UserRoundCog,
  WalletCards,
} from 'lucide-react';
import { RULE_CONFIGS, type ContractRuleId, type ContractRuleState, type RuleField } from '../../../lib/businessContractRules';
import type { PhysicalProgressScheduleSummary } from '../../../lib/physicalProgressScheduleLogic';
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
import { BusinessSettingsSubmitButton } from './BusinessSettingsSubmitButton';

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

function FieldLabel({ label, required = false, tooltip }: { label: string; required?: boolean; tooltip?: string }) {
  return (
    <div className="space-y-2">
      <RuleFieldLabel label={label} required={required} />
      {tooltip ? <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">{tooltip}</p> : null}
    </div>
  );
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
  tooltip,
}: {
  title: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  useContractRegistrationSwitch?: boolean;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-[color:var(--border-soft)] pt-6 lg:items-center lg:justify-between',
        useContractRegistrationSwitch ? 'lg:flex-row' : 'lg:flex-row-reverse',
      )}
    >
      <div className="w-full text-right lg:flex-1">
        <h4 className="text-[17px] font-black leading-8 text-[color:var(--text-strong)]">{title}</h4>
        {tooltip ? <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{tooltip}</p> : null}
      </div>
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
    if (tabId === 'regular') return CalendarDays;
    if (tabId === 'irregular') return ClipboardPenLine;
    return Layers3;
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

type ProgressPercentageRow = {
  id: string;
  triggerPercent: string;
  value: string;
};

type ProgressMilestoneRow = {
  id: string;
  milestoneKey: string;
  milestoneTitle: string;
  value: string;
};

type ProgressBlockOption = {
  id: string;
  name: string;
};

function createProgressPercentageRow(): ProgressPercentageRow {
  return {
    id: crypto.randomUUID(),
    triggerPercent: '',
    value: '',
  };
}

function createProgressMilestoneRow(title = ''): ProgressMilestoneRow {
  return {
    id: crypto.randomUUID(),
    milestoneKey: title,
    milestoneTitle: title,
    value: '',
  };
}

function buildPercentageRowsFromSchedule(schedule: PhysicalProgressScheduleSummary): ProgressPercentageRow[] {
  let cumulativePercent = 0;

  return schedule.stages.map((stage) => {
    cumulativePercent = Math.min(100, Math.round((cumulativePercent + stage.weight) * 100) / 100);
    return {
      id: crypto.randomUUID(),
      triggerPercent: String(cumulativePercent),
      value: '',
    };
  });
}

function buildMilestoneRowsFromSchedule(schedule: PhysicalProgressScheduleSummary): ProgressMilestoneRow[] {
  return schedule.stages.map((stage) => ({
    id: crypto.randomUUID(),
    milestoneKey: stage.title,
    milestoneTitle: stage.title,
    value: '',
  }));
}

function parseStringList(value: string | boolean | undefined) {
  if (typeof value !== 'string' || !value.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

function serializeStringList(items: string[]) {
  return JSON.stringify(items);
}

const INSTALLMENT_TOOLTIPS = {
  regularInterval: 'الگوی زمانی استاندارد اقساط منظم پروژه را مشخص می‌کند تا کارشناسان قرارداد از همان فاصله پیشنهادی استفاده کنند.',
  lastDueDate: 'تاریخی که کل برنامه اقساط باید حداکثر تا آن زمان تسویه شود و مبنای محاسبه تعداد یا توزیع اقساط قرار می‌گیرد.',
  balloonEnabled: 'اگر فعال شود، بخشی از مانده بدهی به‌صورت متمرکز در اقساط پایانی برنامه دریافت می‌شود.',
  balloonWindow: 'مشخص می‌کند سهم بالونی در کدام بخش انتهایی برنامه اقساط متمرکز شود.',
  balloonPercent: 'درصدی از مانده بدهی که قرار است به‌صورت بالونی و خارج از توزیع عادی اقساط دریافت شود.',
  progressAmountMode: 'تعیین می‌کند مبلغ هر قسط مبتنی بر پیشرفت، درصدی از مبلغ قرارداد باشد یا یک عدد ثابت.',
  progressCompletionAuthority: 'مرجعی که اعلام یا تایید او برای تحقق پیشرفت پروژه و فعال‌شدن قسط معتبر شناخته می‌شود.',
  progressAllowContractOverride: 'اگر فعال باشد، کارشناس مجاز می‌تواند این سیاست پروژه را در همان قرارداد خاص تغییر دهد.',
  progressMeasurementBasis: 'مشخص می‌کند سنجش پیشرفت برای فعال‌شدن اقساط بر اساس کل پروژه، یک بلوک، یک یا چند برنامه، یا مرحله‌های یک برنامه انجام شود.',
  progressSelectedBlockId: 'بلوک مرجعی که پیشرفت آن برای فعال‌سازی اقساط ملاک قرار می‌گیرد.',
  progressSelectedScheduleKeys: 'برنامه‌هایی که در مبنای سنجش «برنامه» باید به‌عنوان مرجع پیشرفت انتخاب شوند.',
  progressSelectedScheduleKey: 'برنامه پیشرفت فیزیکی مرجعی که مراحل یا وزن‌های آن برای این سیاست اقساط استفاده می‌شود.',
  progressTriggerPercent: 'درصد پیشرفتی از پروژه که با رسیدن به آن، قسط متناظر باید فعال شود.',
  progressAmountValue: 'مقدار قسطی که در اثر تحقق این شرط فعال می‌شود؛ بسته به روش محاسبه می‌تواند درصدی یا مبلغ ثابت باشد.',
  progressMilestone: 'مرحله فیزیکی مشخصی از پروژه که تحقق آن، محرک فعال‌شدن این قسط خواهد بود.',
} as const;

function parseGridRows<T>(value: string | boolean | undefined, fallbackFactory: () => T): T[] {
  if (typeof value !== 'string' || !value.trim()) return [fallbackFactory()];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? (parsed as T[]) : [fallbackFactory()];
  } catch {
    return [fallbackFactory()];
  }
}

function serializeGridRows<T>(rows: T[]) {
  return JSON.stringify(rows);
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-right">
      <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">{title}</h4>
      {hint ? <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}

function InlineTabButton({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex-1 rounded-t-md border-b-2 px-4 py-3 text-center text-sm font-bold transition',
        active
          ? 'border-[#065f46] bg-[color-mix(in_srgb,#065f46_10%,white)] text-[#065f46]'
          : 'border-transparent bg-transparent text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]',
      )}
    >
      {title}
    </button>
  );
}

function MiniRowButton({
  children,
  onClick,
  tone = 'neutral',
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'neutral' | 'danger';
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'rounded-md border px-3 py-1.5 text-sm font-medium transition',
        tone === 'danger'
          ? 'border-[#f3c7cf] bg-transparent text-[#be123c] hover:bg-[#fff1f2]'
          : 'border-[color:var(--border-soft)] bg-transparent text-[color:var(--text-strong)] hover:bg-[color:var(--surface-soft)]',
      )}
    >
      {children}
    </button>
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
  const isIrregular = state.activeTab === 'irregular';
  const isProgressBased = state.activeTab === 'progress-based';
  const lastDueKey = isRegular ? 'regularLastDueDate' : 'irregularLastDueDate';
  const balloonEnabledKey = isRegular ? 'regularBalloonEnabled' : 'irregularBalloonEnabled';
  const balloonWindowKey = isRegular ? 'regularBalloonWindow' : 'irregularBalloonWindow';
  const balloonPercentKey = isRegular ? 'regularBalloonPercent' : 'irregularBalloonPercent';
  const intervalOptions = ['در بازه قابل تنظیم در زمان عقد قرارداد', 'دو هفته ای', 'ماهانه', 'دوماهه', 'سه ماهه', 'شش ماهه', 'سالانه'];
  const balloonOptions = ['ماه آخر', '۳ ماه آخر', '۵ ماه آخر', '۷ ماه آخر'];
  const balloonEnabled = Boolean(state.values[balloonEnabledKey]);
  const intervalTagOptions = intervalOptions.map((option) => ({ value: option, label: option }));
  const balloonTagOptions = balloonOptions.map((option) => ({ value: option, label: option }));
  const progressAmountMode = String(state.values.progressAmountMode || 'درصدی از مبلغ قرارداد');
  const progressMeasurementBasis = String(state.values.progressMeasurementBasis || 'پروژه');
  const progressSelectedBlockId = String(state.values.progressSelectedBlockId || '');
  const progressSelectedScheduleKeys = useMemo(
    () => parseStringList(state.values.progressSelectedScheduleKeys),
    [state.values.progressSelectedScheduleKeys],
  );
  const progressSelectedScheduleKey = String(state.values.progressSelectedScheduleKey || '');
  const [progressBlocks, setProgressBlocks] = useState<ProgressBlockOption[]>([]);
  const [progressSchedules, setProgressSchedules] = useState<PhysicalProgressScheduleSummary[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const isStageMeasurement = progressMeasurementBasis === 'مرحله';
  const isProgramMeasurement = progressMeasurementBasis === 'برنامه';
  const isBlockMeasurement = progressMeasurementBasis === 'بلوک';
  const isProjectMeasurement = progressMeasurementBasis === 'پروژه';
  const activeMeasurementTitle = `تنظیمات مبتنی بر ${progressMeasurementBasis}`;
  const activeMeasurementHint = isProjectMeasurement
    ? 'تمام بخش‌های زیر بر اساس سنجش پیشرفت در سطح کل پروژه تنظیم می‌شوند.'
    : isBlockMeasurement
      ? 'تمام بخش‌های زیر بر اساس سنجش پیشرفت در سطح بلوک منتخب تنظیم می‌شوند.'
      : isProgramMeasurement
        ? 'تمام بخش‌های زیر بر اساس سنجش پیشرفت در سطح برنامه‌های منتخب تنظیم می‌شوند.'
        : 'تمام بخش‌های زیر بر اساس سنجش پیشرفت در سطح مرحله‌های برنامه منتخب تنظیم می‌شوند.';

  const percentageRows = useMemo(
    () =>
      parseGridRows<ProgressPercentageRow>(state.values.progressPercentageRows, createProgressPercentageRow).map((row) => ({
        id: row.id,
        triggerPercent: row.triggerPercent,
        value: row.value,
      })),
    [state.values.progressPercentageRows],
  );
  const milestoneRows = useMemo(
    () =>
      parseGridRows<ProgressMilestoneRow>(state.values.progressMilestoneRows, createProgressMilestoneRow).map((row) => ({
        id: row.id,
        milestoneKey: row.milestoneKey,
        milestoneTitle: row.milestoneTitle,
        value: row.value,
      })),
    [state.values.progressMilestoneRows],
  );
  const blockSchedules = useMemo(
    () => progressSchedules.filter((item) => item.blockId === progressSelectedBlockId),
    [progressSchedules, progressSelectedBlockId],
  );
  const blockDerivedSchedule = useMemo(
    () => [...blockSchedules].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null,
    [blockSchedules],
  );
  const selectedProgramSchedules = useMemo(
    () => progressSchedules.filter((item) => progressSelectedScheduleKeys.includes(item.scheduleKey)),
    [progressSchedules, progressSelectedScheduleKeys],
  );
  const selectedSchedule = useMemo(() => {
    if (isStageMeasurement) {
      return progressSchedules.find((item) => item.scheduleKey === progressSelectedScheduleKey) ?? null;
    }

    if (isBlockMeasurement) {
      return blockDerivedSchedule;
    }

    return null;
  }, [blockDerivedSchedule, isBlockMeasurement, isStageMeasurement, progressSchedules, progressSelectedScheduleKey]);
  const selectedScheduleStagePreview = useMemo(
    () =>
      (selectedSchedule?.stages ?? []).map((stage) => ({
        id: stage.id,
        title: stage.title,
        weight: stage.weight,
      })),
    [selectedSchedule],
  );

  useEffect(() => {
    if (!isProgressBased) return;

    let mounted = true;
    const loadSchedules = async () => {
      try {
        setScheduleLoading(true);
        const [scheduleResponse, blockResponse] = await Promise.all([
          fetch('/api/business-settings/project/physical-progress-schedules', { cache: 'no-store' }),
          fetch('/api/business-settings/project/blocks', { cache: 'no-store' }),
        ]);
        const schedulePayload = (await scheduleResponse.json().catch(() => ({}))) as { schedules?: PhysicalProgressScheduleSummary[] };
        const blockPayload = (await blockResponse.json().catch(() => ({}))) as { blocks?: Array<{ id: string; name: string }> };
        if (!scheduleResponse.ok || !blockResponse.ok) return;
        if (mounted) {
          setProgressSchedules(Array.isArray(schedulePayload.schedules) ? schedulePayload.schedules : []);
          setProgressBlocks(Array.isArray(blockPayload.blocks) ? blockPayload.blocks.map((block) => ({ id: block.id, name: block.name })) : []);
        }
      } finally {
        if (mounted) setScheduleLoading(false);
      }
    };

    void loadSchedules();
    return () => {
      mounted = false;
    };
  }, [isProgressBased]);

  const updatePercentageRows = (rows: ProgressPercentageRow[]) => onValueChange('progressPercentageRows', serializeGridRows(rows));
  const updateMilestoneRows = (rows: ProgressMilestoneRow[]) => onValueChange('progressMilestoneRows', serializeGridRows(rows));

  const valueColumnLabel =
    progressAmountMode === 'درصدی از مبلغ قرارداد' ? 'درصد از مبلغ قرارداد' : 'مبلغ ثابت';

  return (
    <div className="space-y-8 text-right">
      {isRegular ? (
        <>
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">
            در این روش مبلغ پیشنهادی هر قسط ثابت است و در بازه‌های زمانی منظم نمایش داده می‌شود.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />

          <div className="space-y-5">
            <SectionTitle title="بازه زمانی اقساط" hint="فاصله زمانی پیشنهادی بین اقساط منظم را مشخص کنید." />

            <UiChoicePills
              options={intervalTagOptions}
              value={String(state.values.regularInterval || intervalOptions[0])}
              onChange={(value) => onValueChange('regularInterval', value)}
              wrap
              className="justify-end flex-row-reverse"
            />
            <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">{INSTALLMENT_TOOLTIPS.regularInterval}</p>
          </div>
        </>
      ) : null}

      {isIrregular ? (
        <>
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">
            در این روش زمان و مبلغ اقساط می‌تواند متناسب با شرایط قرارداد، به‌صورت شناور و غیرمنظم تعیین شود.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />
        </>
      ) : null}

      {isProgressBased ? (
        <>
          <p className="text-right text-base leading-8 text-[color:var(--text-strong)]">
            در این مدل، محرک پرداخت وابسته به زمان نیست و اقساط زمانی فعال می‌شوند که پروژه به درصد مشخصی از پیشرفت یا به یک مرحله فیزیکی برسد.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />

          <div className="space-y-4">
            <FieldLabel label="مبنای سنجش پیشرفت" required tooltip={INSTALLMENT_TOOLTIPS.progressMeasurementBasis} />
            <div className="overflow-hidden rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
              <div className="flex w-full items-stretch border-b border-[color:var(--border-soft)]">
                {['پروژه', 'بلوک', 'برنامه', 'مرحله'].map((item) => (
                  <InlineTabButton
                    key={item}
                    title={item}
                    active={progressMeasurementBasis === item}
                    onClick={() => onValueChange('progressMeasurementBasis', item)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
            <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-right">
              <p className="text-sm font-black text-[#065f46]">{activeMeasurementTitle}</p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">{activeMeasurementHint}</p>
            </div>

            <div className="space-y-4">
              <FieldLabel label="روش محاسبه مبلغ" required tooltip={INSTALLMENT_TOOLTIPS.progressAmountMode} />
              <div className="flex justify-end">
                <BusinessSwitch
                  checked={progressAmountMode === 'درصدی از مبلغ قرارداد'}
                  onChange={(checked) => onValueChange('progressAmountMode', checked ? 'درصدی از مبلغ قرارداد' : 'مبلغ ثابت')}
                  activeLabel="درصدی از مبلغ قرارداد"
                  inactiveLabel="مبلغ ثابت"
                  className="business-switch progress-amount-mode-switch"
                />
              </div>
            </div>

            <div className="space-y-4">
              <FieldLabel label="مرجع اعلام/تأیید پیشرفت" required tooltip={INSTALLMENT_TOOLTIPS.progressCompletionAuthority} />
              <UiChoicePills
                options={['کارشناس پروژه', 'مدیر پروژه', 'گزارش رسمی پروژه'].map((item) => ({ value: item, label: item }))}
                value={String(state.values.progressCompletionAuthority || 'کارشناس پروژه')}
                onChange={(value) => onValueChange('progressCompletionAuthority', value)}
                wrap
                className="justify-end flex-row-reverse"
              />
            </div>

            {!isProjectMeasurement ? (
              <div className="space-y-4 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                <SectionTitle
                  title="اتصال به برنامه پیشرفت فیزیکی"
                  hint={
                    isBlockMeasurement
                      ? 'در این حالت، آخرین برنامه فعال بلوک منتخب به‌عنوان مرجع سنجش پیشرفت و مراحل فیزیکی استفاده می‌شود.'
                      : isProgramMeasurement
                        ? 'در این حالت، می‌توانید یک یا چند برنامه را انتخاب کنید و پیشرفت بر اساس همان برنامه‌ها سنجیده می‌شود.'
                        : 'در این حالت، ابتدا برنامه را انتخاب می‌کنید و سپس مرحله‌های همان برنامه را برای رصد و تعریف اقساط می‌بینید.'
                  }
                />

                {isBlockMeasurement ? (
                  <div className="space-y-4">
                    <FieldLabel label="بلوک منتخب" required tooltip={INSTALLMENT_TOOLTIPS.progressSelectedBlockId} />
                    <UiChoicePills
                      options={progressBlocks.map((block) => ({ value: block.id, label: block.name }))}
                      value={progressSelectedBlockId}
                      onChange={(value) => onValueChange('progressSelectedBlockId', value)}
                      wrap
                      className="justify-end flex-row-reverse"
                    />
                    <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                      {scheduleLoading
                        ? 'در حال دریافت بلوک‌ها و برنامه‌های پیشرفت فیزیکی...'
                        : progressSelectedBlockId
                          ? blockDerivedSchedule
                            ? 'آخرین برنامه فعال این بلوک به‌عنوان مرجع اقساط استفاده خواهد شد.'
                            : 'برای این بلوک هنوز برنامه پیشرفت فیزیکی ثبت نشده است.'
                          : 'ابتدا بلوک مرجع را انتخاب کنید.'}
                    </p>
                  </div>
                ) : isProgramMeasurement ? (
                  <div className="space-y-4">
                    <FieldLabel label="برنامه‌های منتخب" required tooltip={INSTALLMENT_TOOLTIPS.progressSelectedScheduleKeys} />
                    <div className="flex flex-wrap justify-end gap-2 rounded-md border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-3">
                      {progressSchedules.map((schedule) => {
                        const checked = progressSelectedScheduleKeys.includes(schedule.scheduleKey);
                        return (
                          <button
                            key={schedule.scheduleKey}
                            type="button"
                            className={cn(
                              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
                              checked
                                ? 'border-[#065f46] bg-[color-mix(in_srgb,#065f46_8%,white)] text-[#065f46]'
                                : 'border-[color:var(--border-soft)] bg-transparent text-[color:var(--text-strong)] hover:bg-[color:var(--surface-soft)]',
                            )}
                            onClick={() => {
                              const next = checked
                                ? progressSelectedScheduleKeys.filter((item) => item !== schedule.scheduleKey)
                                : [...progressSelectedScheduleKeys, schedule.scheduleKey];
                              onValueChange('progressSelectedScheduleKeys', serializeStringList(next));
                            }}
                          >
                            <span>{schedule.title}</span>
                            <span className="text-xs opacity-80">{schedule.blockName}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                      {scheduleLoading ? 'در حال دریافت برنامه‌های پیشرفت فیزیکی...' : 'هر برنامه منتخب، مرجع درصد پیشرفت خود را خواهد داشت.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FieldLabel label="برنامه منتخب" required tooltip={INSTALLMENT_TOOLTIPS.progressSelectedScheduleKey} />
                    <UiChoicePills
                      options={progressSchedules.map((schedule) => ({ value: schedule.scheduleKey, label: `${schedule.title} | ${schedule.blockName}` }))}
                      value={progressSelectedScheduleKey}
                      onChange={(value) => onValueChange('progressSelectedScheduleKey', value)}
                      wrap
                      className="justify-end flex-row-reverse"
                    />
                    <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                      {scheduleLoading ? 'در حال دریافت برنامه‌های پیشرفت فیزیکی...' : 'برنامه‌های پیشرفت فیزیکی از بخش تنظیمات پروژه خوانده می‌شوند.'}
                    </p>
                  </div>
                )}

                {isProgramMeasurement && selectedProgramSchedules.length ? (
                  <div className="space-y-4 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-[color:var(--text-strong)]">برنامه‌های منتخب</p>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                        {selectedProgramSchedules.length} برنامه برای سنجش پیشرفت این سیاست انتخاب شده است.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {selectedProgramSchedules.map((schedule) => (
                        <span
                          key={schedule.scheduleKey}
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs text-[color:var(--text-muted)]"
                        >
                          <span>{schedule.title}</span>
                          <span className="font-black text-[color:var(--text-strong)]">{schedule.blockName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedSchedule ? (
                  <div className="space-y-4 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-[color:var(--text-strong)]">{selectedSchedule.title}</p>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {selectedSchedule.stageCount} مرحله برای بلوک {selectedSchedule.blockName} | جمع وزن {selectedSchedule.totalWeight}٪
                        </p>
                      </div>
                      {isStageMeasurement ? (
                        <MiniRowButton onClick={() => updateMilestoneRows(buildMilestoneRowsFromSchedule(selectedSchedule))}>
                          همگام‌سازی مراحل
                        </MiniRowButton>
                      ) : (
                        <MiniRowButton onClick={() => updatePercentageRows(buildPercentageRowsFromSchedule(selectedSchedule))}>
                          ساخت ردیف‌ها از برنامه پروژه
                        </MiniRowButton>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {selectedScheduleStagePreview.map((stage) => (
                        <span
                          key={stage.id}
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs text-[color:var(--text-muted)]"
                        >
                          <span>{stage.title}</span>
                          <span className="font-black text-[color:var(--text-strong)]">{stage.weight}٪</span>
                        </span>
                      ))}
                    </div>

                    <p className="text-xs leading-7 text-[color:var(--text-muted)]">
                      {isStageMeasurement
                        ? 'در این حالت، اقساط از همان مراحل فیزیکی تعریف‌شده در برنامه پروژه تغذیه می‌شوند.'
                        : 'در این حالت، درصدهای محرک می‌توانند از وزن تجمعی مراحل برنامه پروژه ساخته شوند تا با ساختار واقعی پیشرفت پروژه هم‌خوان بمانند.'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-[color:var(--border-soft)] bg-transparent p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                    {isBlockMeasurement
                      ? 'برای اثر گرفتن این سیاست از پیشرفت بلوک، یک بلوک دارای برنامه فعال انتخاب کنید.'
                      : isProgramMeasurement
                        ? 'برای اثر گرفتن این سیاست از پیشرفت برنامه، یک یا چند برنامه ثبت‌شده را انتخاب کنید.'
                        : 'برای اثر گرفتن این سیاست از مرحله، ابتدا برنامه مرجع را انتخاب کنید.'}
                  </div>
                )}
              </div>
            ) : null}

            {isProjectMeasurement ? (
              <div className="rounded-md border border-[color:var(--border-soft)] bg-transparent p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                در این حالت، سنجش پیشرفت بر اساس کل پروژه و مجموع برنامه‌های ثبت‌شده انجام می‌شود؛ بنابراین نیازی به انتخاب برنامه وجود ندارد.
              </div>
            ) : null}

            {!isStageMeasurement ? (
              <div className="space-y-4">
                <SectionTitle
                  title="جدول اقساط مبتنی بر درصد پیشرفت"
                  hint={
                    !isProjectMeasurement && selectedSchedule
                      ? 'در هر ردیف مشخص کنید با رسیدن پروژه به چه درصدی از پیشرفت، چه مبلغی فعال شود. در صورت نیاز می‌توانید ردیف‌ها را از وزن تجمعی مراحل برنامه پروژه بسازید.'
                      : 'در هر ردیف مشخص کنید با رسیدن پروژه به چه درصدی از پیشرفت، چه مبلغی از قرارداد فعال شود.'
                  }
                />
                <div className="space-y-3 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                  {percentageRows.map((row, index) => (
                    <div key={row.id} className="space-y-3 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[color:var(--text-strong)]">مرحله پرداخت {index + 1}</span>
                        <MiniRowButton
                          tone="danger"
                          ariaLabel={`حذف مرحله پرداخت ${index + 1}`}
                          onClick={() => updatePercentageRows(percentageRows.length > 1 ? percentageRows.filter((item) => item.id !== row.id) : [createProgressPercentageRow()])}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </MiniRowButton>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:[direction:rtl]">
                        <div className="space-y-2">
                          <FieldLabel label="درصد پیشرفت محرک" required tooltip={INSTALLMENT_TOOLTIPS.progressTriggerPercent} />
                          <RuleTextInput
                            value={row.triggerPercent}
                            onChange={(value) =>
                              updatePercentageRows(percentageRows.map((item) => (item.id === row.id ? { ...item, triggerPercent: value } : item)))
                            }
                            suffix="%"
                          />
                        </div>

                        <div className="space-y-2">
                          <FieldLabel label={valueColumnLabel} required tooltip={INSTALLMENT_TOOLTIPS.progressAmountValue} />
                          <RuleTextInput
                            value={row.value}
                            onChange={(value) =>
                              updatePercentageRows(percentageRows.map((item) => (item.id === row.id ? { ...item, value } : item)))
                            }
                            suffix={progressAmountMode === 'درصدی از مبلغ قرارداد' ? '%' : 'تومان'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <MiniRowButton onClick={() => updatePercentageRows([...percentageRows, createProgressPercentageRow()])}>افزودن ردیف</MiniRowButton>
                  </div>
                </div>
              </div>
            ) : null}

            {isStageMeasurement ? (
              <div className="space-y-4">
                <SectionTitle
                  title="جدول اقساط مبتنی بر مرحله فیزیکی"
                  hint="هر ردیف به تحقق یک رویداد فیزیکی وابسته است؛ با ثبت آن رویداد، قسط متناظر فعال می‌شود."
                />
                <div className="space-y-3 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                  {milestoneRows.map((row, index) => (
                    <div key={row.id} className="space-y-3 rounded-md border border-[color:var(--border-soft)] bg-transparent p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[color:var(--text-strong)]">مرحله {index + 1}</span>
                        <MiniRowButton
                          tone="danger"
                          ariaLabel={`حذف مرحله ${index + 1}`}
                          onClick={() => updateMilestoneRows(milestoneRows.length > 1 ? milestoneRows.filter((item) => item.id !== row.id) : [createProgressMilestoneRow()])}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </MiniRowButton>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:[direction:rtl]">
                        <div className="space-y-2">
                          <FieldLabel label="مرحله فیزیکی" required tooltip={INSTALLMENT_TOOLTIPS.progressMilestone} />
                          {selectedSchedule?.stages.length ? (
                            <select
                              value={row.milestoneKey}
                              onChange={(event) =>
                                updateMilestoneRows(
                                  milestoneRows.map((item) =>
                                    item.id === row.id
                                      ? { ...item, milestoneKey: event.target.value, milestoneTitle: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              className={RULE_PANEL_SELECT_CLASSNAME}
                            >
                              <option value="">انتخاب مرحله</option>
                              {selectedSchedule.stages.map((stage) => (
                                <option key={stage.id} value={stage.title} className="bg-[color:var(--surface)] text-[color:var(--text-strong)]">
                                  {stage.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <RuleTextInput
                              value={row.milestoneTitle}
                              onChange={(value) =>
                                updateMilestoneRows(milestoneRows.map((item) => (item.id === row.id ? { ...item, milestoneKey: value, milestoneTitle: value } : item)))
                              }
                              placeholder="مثلاً اتمام اسکلت"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <FieldLabel label={valueColumnLabel} required tooltip={INSTALLMENT_TOOLTIPS.progressAmountValue} />
                          <RuleTextInput
                            value={row.value}
                            onChange={(value) =>
                              updateMilestoneRows(milestoneRows.map((item) => (item.id === row.id ? { ...item, value } : item)))
                            }
                            suffix={progressAmountMode === 'درصدی از مبلغ قرارداد' ? '%' : 'تومان'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <MiniRowButton onClick={() => updateMilestoneRows([...milestoneRows, createProgressMilestoneRow()])}>افزودن ردیف</MiniRowButton>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {(isRegular || isIrregular) ? (
        <>
          <div className="space-y-4">
            <FieldLabel label="تاریخ آخرین قسط" tooltip={INSTALLMENT_TOOLTIPS.lastDueDate} />
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
            tooltip={INSTALLMENT_TOOLTIPS.balloonEnabled}
          />

          {balloonEnabled ? (
            <div className="space-y-6">
              <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">
                پرداخت بالونی یعنی درصدی از اصل بدهی در یک یا چند قسط و در بازه زمانی مشخص، معمولا در اقساط پایانی، دریافت شود.
              </p>

              <div className="space-y-5">
                <SectionTitle title="بازه زمانی پیشنهادی پرداخت بالونی" hint="این بازه فاصله زمانی پیشنهادی پرداخت بالونی را مشخص می‌کند." />

                <UiChoicePills
                  options={balloonTagOptions}
                  value={String(state.values[balloonWindowKey] || balloonOptions[0])}
                  onChange={(value) => onValueChange(balloonWindowKey, value)}
                  wrap
                  className="justify-end flex-row-reverse"
                />
                <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">{INSTALLMENT_TOOLTIPS.balloonWindow}</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="درصد پیشنهادی سهم پرداخت بالونی" required tooltip={INSTALLMENT_TOOLTIPS.balloonPercent} />
                <RuleTextInput value={String(state.values[balloonPercentKey] ?? '')} onChange={(value) => onValueChange(balloonPercentKey, value)} suffix="%" />
                <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">درصدی از مانده بدهی که باید به‌صورت بالونی دریافت شود را در این بخش وارد کنید.</p>
              </div>
            </div>
          ) : null}
        </>
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
  const isMinimalInstallments = ruleId === 'installments';
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
    <section className={cn('mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8', isMinimalInstallments ? 'pb-12' : 'pb-24')}>
      <div
        className={cn(
          'space-y-5 border border-[color:var(--border-color)] sm:p-6',
          isMinimalInstallments
            ? 'rounded-lg bg-[color:var(--surface)] p-4 shadow-none'
            : 'rounded-[28px] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur',
        )}
      >
        {!hasSelectedAdditionalCost ? (
          <section
            className={cn(
              'border border-[color:var(--border-soft)] bg-[color:var(--surface)]',
              isMinimalInstallments ? 'rounded-md p-4' : 'rounded-[24px] p-5',
            )}
          >
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
              <section
                className={cn(
                  'border border-[color:var(--border-soft)] bg-[color:var(--surface)]',
                  isMinimalInstallments ? 'rounded-md p-4' : 'rounded-[24px] p-5',
                )}
              >
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
              <section
                className={cn(
                  'overflow-hidden border border-[color:var(--border-soft)] bg-[color:var(--surface)]',
                  isMinimalInstallments ? 'rounded-md' : 'rounded-[24px]',
                )}
              >
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

                <div className={cn('space-y-8', isMinimalInstallments ? 'p-4' : 'p-5')}>
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
          <section
            className={cn(
              'border p-4 text-sm',
              isMinimalInstallments
                ? 'rounded-md border-[color:var(--border-soft)] bg-[color:var(--surface)] text-[color:var(--text-strong)]'
                : 'rounded-2xl border-[#11b5c9]/50 bg-[#11b5c9]/10 text-[#8ef0ff]',
            )}
          >
            <div className="inline-flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          </section>
        ) : null}

        {error ? <div className={cn('border px-4 py-3 text-sm', isMinimalInstallments ? 'rounded-md border-[#e7c9cf] bg-transparent text-[#be123c]' : 'rounded-2xl border-[#fecdd3] bg-[#fff1f2] text-[#be123c]')}>{error}</div> : null}
      </div>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full justify-end">
          <BusinessSettingsSubmitButton saving={saving} onClick={() => void handleSave()} minimal={isMinimalInstallments} />
        </div>
      </div>
    </section>
  );
}
