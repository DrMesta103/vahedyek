'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  MoreVertical,
  Percent,
  Pencil,
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
import { TagPill as DraftTagPill } from '../../contracts/new/_components/ContractFormPrimitives';
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

type ProgressBlockOption = {
  id: string;
  name: string;
};

type ProgressExpandableEntry = {
  scheduleKey: string;
  scheduleTitle: string;
  blockId: string;
  blockName: string;
  stageId: string;
  stageTitle: string;
  progressValue: string;
  amountMode: 'percent' | 'fixed';
  value: string;
};

type ProgressExpandableGroup = {
  id: string;
  selectedScheduleKeys: string[];
  selectedStageIds: string[];
  entries: ProgressExpandableEntry[];
};

function createProgressExpandableGroup(): ProgressExpandableGroup {
  return {
    id: crypto.randomUUID(),
    selectedScheduleKeys: [],
    selectedStageIds: [],
    entries: [],
  };
}

function parseProgressExpandableGroups(value: string | boolean | undefined) {
  if (typeof value !== 'string' || !value.trim()) return [] as ProgressExpandableGroup[];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [] as ProgressExpandableGroup[];
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const group = item as Record<string, unknown>;
        const selectedScheduleKeys = Array.isArray(group.selectedScheduleKeys)
          ? group.selectedScheduleKeys.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [];
        const selectedStageIds = Array.isArray(group.selectedStageIds)
          ? group.selectedStageIds.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [];
        const entries = Array.isArray(group.entries)
          ? group.entries
              .map((entry) => {
                if (!entry || typeof entry !== 'object') return null;
                const row = entry as Record<string, unknown>;
                return {
                  scheduleKey: typeof row.scheduleKey === 'string' ? row.scheduleKey : '',
                  scheduleTitle: typeof row.scheduleTitle === 'string' ? row.scheduleTitle : '',
                  blockId: typeof row.blockId === 'string' ? row.blockId : '',
                  blockName: typeof row.blockName === 'string' ? row.blockName : '',
                  stageId: typeof row.stageId === 'string' ? row.stageId : '',
                  stageTitle: typeof row.stageTitle === 'string' ? row.stageTitle : '',
                  progressValue: typeof row.progressValue === 'string' ? row.progressValue : '',
                  amountMode: row.amountMode === 'fixed' ? 'fixed' : 'percent',
                  value: typeof row.value === 'string' ? row.value : '',
                } satisfies ProgressExpandableEntry;
              })
              .filter((entry): entry is ProgressExpandableEntry => Boolean(entry))
          : [];

        return {
          id: typeof group.id === 'string' && group.id.trim() ? group.id : crypto.randomUUID(),
          selectedScheduleKeys,
          selectedStageIds,
          entries,
        } satisfies ProgressExpandableGroup;
      })
      .filter((item): item is ProgressExpandableGroup => Boolean(item));
  } catch {
    return [] as ProgressExpandableGroup[];
  }
}

function serializeProgressExpandableGroups(groups: ProgressExpandableGroup[]) {
  return JSON.stringify(groups);
}

function syncProgressExpandableGroup(
  group: ProgressExpandableGroup,
  schedules: PhysicalProgressScheduleSummary[],
): ProgressExpandableGroup {
  const selectedScheduleKeys = Array.from(
    new Set(group.selectedScheduleKeys.filter((scheduleKey) => schedules.some((schedule) => schedule.scheduleKey === scheduleKey))),
  );
  const selectedStageIdSet = new Set(group.selectedStageIds);
  const normalizeStageKey = (value: string) => value.trim().toLocaleLowerCase('fa-IR');
  const entryMap = new Map(group.entries.map((entry) => [entry.stageId, entry]));
  const entryByScheduleAndTitle = new Map<string, ProgressExpandableEntry>(
    group.entries.map((entry) => [`${entry.scheduleKey}::${normalizeStageKey(entry.stageTitle)}`, entry]),
  );
  const selectedStageTitleSet = new Set(
    group.entries.map((entry) => `${entry.scheduleKey}::${normalizeStageKey(entry.stageTitle)}`),
  );
  const selectedStageIds: string[] = [];
  const entries: ProgressExpandableEntry[] = [];

  selectedScheduleKeys.forEach((scheduleKey) => {
    const schedule = schedules.find((item) => item.scheduleKey === scheduleKey);
    if (!schedule) return;

    schedule.stages.forEach((stage) => {
      const stageTitleKey = `${schedule.scheduleKey}::${normalizeStageKey(stage.title)}`;
      const shouldIncludeStage =
        schedule.stages.length === 1 || selectedStageIdSet.has(stage.id) || selectedStageTitleSet.has(stageTitleKey);
      if (!shouldIncludeStage) return;
      selectedStageIds.push(stage.id);
      const currentEntry = entryMap.get(stage.id) ?? entryByScheduleAndTitle.get(stageTitleKey);
      entries.push({
        scheduleKey: schedule.scheduleKey,
        scheduleTitle: schedule.title,
        blockId: schedule.blockId,
        blockName: schedule.blockName,
        stageId: stage.id,
        stageTitle: stage.title,
        progressValue: currentEntry?.progressValue ?? '',
        amountMode: currentEntry?.amountMode ?? 'percent',
        value: currentEntry?.value ?? '',
      });
    });
  });

  return {
    ...group,
    selectedScheduleKeys,
    selectedStageIds,
    entries,
  };
}

function isProgressGroupEmpty(group: ProgressExpandableGroup) {
  return !group.selectedScheduleKeys.length && !group.selectedStageIds.length && !group.entries.length;
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
  progressSelectedScheduleKeys: 'می‌توانید در هر بخش پرداخت یک یا چند برنامه ثبت‌شده را به‌عنوان مبنای تعریف مرحله‌ها انتخاب کنید.',
  progressMilestone: 'مرحله‌های هر برنامه به‌صورت جداگانه نمایش داده می‌شوند و انتخاب آن‌ها، فرم ثبت قسط همان مرحله را باز می‌کند.',
  progressTriggerPercent: 'در این فیلد، درصد پیشرفت یا میزان تحقق مدنظر برای همان مرحله ثبت می‌شود.',
  progressAmountValue: 'مقدار قسطی که در اثر تحقق این شرط فعال می‌شود؛ بسته به روش محاسبه می‌تواند درصدی یا مبلغ ثابت باشد.',
  progressExpandableGroups: 'هر بخش پرداخت یک بسته مستقل از انتخاب برنامه‌ها، مرحله‌ها و مقادیر اقساط مبتنی بر پیشرفت فیزیکی است.',
} as const;

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-right">
      <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">{title}</h4>
      {hint ? <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{hint}</p> : null}
    </div>
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
  progressBasedStandaloneHref,
  standaloneProgressMode = false,
  standaloneProgressGroupId,
  onStandaloneProgressSubmit,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
  progressBasedStandaloneHref?: string;
  standaloneProgressMode?: boolean;
  standaloneProgressGroupId?: string;
  onStandaloneProgressSubmit?: (serializedGroups: string) => Promise<void>;
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
  const [progressBlocks, setProgressBlocks] = useState<ProgressBlockOption[]>([]);
  const [progressSchedules, setProgressSchedules] = useState<PhysicalProgressScheduleSummary[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [openProgressGroupId, setOpenProgressGroupId] = useState('');
  const [openProgressGroupMenuId, setOpenProgressGroupMenuId] = useState('');
  const [progressGroupError, setProgressGroupError] = useState('');
  const progressGroups = useMemo(
    () => parseProgressExpandableGroups(state.values.progressExpandableGroups),
    [state.values.progressExpandableGroups],
  );
  const standaloneWorkingGroup = standaloneProgressMode
    ? progressGroups.find((group) => group.id === standaloneProgressGroupId) ??
      progressGroups.find((group) => group.id === openProgressGroupId) ??
      progressGroups.find((group) => isProgressGroupEmpty(group)) ??
      null
    : null;
  const visibleProgressGroups = standaloneProgressMode ? (standaloneWorkingGroup ? [standaloneWorkingGroup] : []) : progressGroups;

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

  useEffect(() => {
    if (!isProgressBased) return;
    if (!progressGroups.length) {
      if (standaloneProgressMode && !standaloneProgressGroupId) {
        onValueChange('progressExpandableGroups', serializeProgressExpandableGroups([createProgressExpandableGroup()]));
      }
      return;
    }

    if (standaloneProgressMode && !standaloneProgressGroupId && !progressGroups.some((group) => isProgressGroupEmpty(group))) {
      onValueChange('progressExpandableGroups', serializeProgressExpandableGroups([...progressGroups, createProgressExpandableGroup()]));
    }
  }, [isProgressBased, onValueChange, progressGroups, standaloneProgressGroupId, standaloneProgressMode]);

  useEffect(() => {
    if (!isProgressBased || !progressSchedules.length || !progressGroups.length) return;
    const syncedGroups = progressGroups.map((group) => syncProgressExpandableGroup(group, progressSchedules));
    if (JSON.stringify(syncedGroups) !== JSON.stringify(progressGroups)) {
      onValueChange('progressExpandableGroups', serializeProgressExpandableGroups(syncedGroups));
    }
  }, [isProgressBased, onValueChange, progressGroups, progressSchedules]);

  useEffect(() => {
    if (!isProgressBased || !progressGroups.length) return;
    if (!progressGroups.some((group) => group.id === openProgressGroupId)) {
      setOpenProgressGroupId(progressGroups[progressGroups.length - 1]?.id ?? '');
    }
  }, [isProgressBased, openProgressGroupId, progressGroups]);

  useEffect(() => {
    if (!isProgressBased || !standaloneProgressMode || !standaloneWorkingGroup) return;
    if (openProgressGroupId !== standaloneWorkingGroup.id) {
      setOpenProgressGroupId(standaloneWorkingGroup.id);
    }
  }, [isProgressBased, openProgressGroupId, standaloneProgressMode, standaloneWorkingGroup]);

  const updateProgressGroups = (groups: ProgressExpandableGroup[]) => {
    onValueChange('progressExpandableGroups', serializeProgressExpandableGroups(groups));
  };

  const addProgressGroup = () => {
    const existingEmptyGroup = progressGroups.find((group) => isProgressGroupEmpty(group));
    if (existingEmptyGroup) {
      setOpenProgressGroupId(existingEmptyGroup.id);
      setOpenProgressGroupMenuId('');
      setProgressGroupError('');
      return;
    }

    const nextGroup = createProgressExpandableGroup();
    updateProgressGroups([...progressGroups, nextGroup]);
    setOpenProgressGroupId(nextGroup.id);
    setOpenProgressGroupMenuId('');
    setProgressGroupError('');
  };

  const updateSingleProgressGroup = (groupId: string, updater: (group: ProgressExpandableGroup) => ProgressExpandableGroup) => {
    const nextGroups = progressGroups.map((group) =>
      group.id === groupId ? syncProgressExpandableGroup(updater(group), progressSchedules) : group,
    );
    updateProgressGroups(nextGroups);
  };

  const removeProgressGroup = (groupId: string) => {
    const nextGroups = progressGroups.filter((group) => group.id !== groupId);
    if (!nextGroups.length) {
      const fallbackGroup = createProgressExpandableGroup();
      updateProgressGroups([fallbackGroup]);
      setOpenProgressGroupId(fallbackGroup.id);
      setOpenProgressGroupMenuId('');
      return;
    }

    updateProgressGroups(nextGroups);
    setOpenProgressGroupMenuId('');
    if (openProgressGroupId === groupId) {
      setOpenProgressGroupId(nextGroups[nextGroups.length - 1]?.id ?? '');
    }
  };

  const toggleScheduleSelection = (groupId: string, scheduleKey: string) => {
    updateSingleProgressGroup(groupId, (group) => {
      const checked = group.selectedScheduleKeys.includes(scheduleKey);
      return {
        ...group,
        selectedScheduleKeys: checked
          ? group.selectedScheduleKeys.filter((item) => item !== scheduleKey)
          : [...group.selectedScheduleKeys, scheduleKey],
      };
    });
    setProgressGroupError('');
  };

  const toggleScheduleStagesSelection = (groupId: string, scheduleKey: string) => {
    const schedule = progressSchedules.find((item) => item.scheduleKey === scheduleKey);
    if (!schedule) return;

    updateSingleProgressGroup(groupId, (group) => {
      const stageIds = schedule.stages.map((stage) => stage.id);
      const allSelected = stageIds.every((stageId) => group.selectedStageIds.includes(stageId));
      return {
        ...group,
        selectedStageIds: allSelected
          ? group.selectedStageIds.filter((stageId) => !stageIds.includes(stageId))
          : Array.from(new Set([...group.selectedStageIds, ...stageIds])),
      };
    });
    setProgressGroupError('');
  };

  const toggleSingleStageSelection = (groupId: string, stageId: string) => {
    updateSingleProgressGroup(groupId, (group) => {
      const checked = group.selectedStageIds.includes(stageId);
      return {
        ...group,
        selectedStageIds: checked
          ? group.selectedStageIds.filter((item) => item !== stageId)
          : [...group.selectedStageIds, stageId],
      };
    });
    setProgressGroupError('');
  };

  const updateProgressEntry = (
    groupId: string,
    stageId: string,
    key: 'progressValue' | 'value' | 'amountMode',
    value: string,
  ) => {
    updateSingleProgressGroup(groupId, (group) => ({
      ...group,
      entries: group.entries.map((entry) => (entry.stageId === stageId ? { ...entry, [key]: value } : entry)),
    }));
  };

  const validateProgressGroup = (group: ProgressExpandableGroup) => {
    if (!group.selectedScheduleKeys.length) return 'حداقل یک برنامه باید در این بخش انتخاب شود.';
    if (!group.selectedStageIds.length) return 'حداقل یک مرحله باید در این بخش انتخاب شود.';
    const invalidEntry = group.entries.find((entry) => !entry.progressValue.trim() || !entry.value.trim());
    if (invalidEntry) {
      return `برای مرحله «${invalidEntry.stageTitle}» هر دو فیلد میزان پیشرفت و مقدار قسط را تکمیل کنید.`;
    }
    return '';
  };

  const submitProgressGroup = async (groupId: string) => {
    const group = progressGroups.find((item) => item.id === groupId);
    if (!group) return;
    const syncedGroup = syncProgressExpandableGroup(group, progressSchedules);
    const validationError = validateProgressGroup(syncedGroup);
    if (validationError) {
      setProgressGroupError(validationError);
      setOpenProgressGroupId(groupId);
      return;
    }

    setProgressGroupError('');
    const nextGroups = progressGroups.map((item) => (item.id === groupId ? syncedGroup : item));
    const serializedNextGroups = serializeProgressExpandableGroups(nextGroups);

    if (standaloneProgressMode && onStandaloneProgressSubmit) {
      updateProgressGroups(nextGroups);
      await onStandaloneProgressSubmit(serializedNextGroups);
      return;
    }

    const existingEmptyGroup = nextGroups.find((item) => item.id !== groupId && isProgressGroupEmpty(item));

    if (existingEmptyGroup) {
      updateProgressGroups(nextGroups);
      setOpenProgressGroupMenuId('');
      setOpenProgressGroupId(existingEmptyGroup.id);
      return;
    }

    const nextGroup = createProgressExpandableGroup();
    updateProgressGroups([...nextGroups, nextGroup]);
    setOpenProgressGroupMenuId('');
    setOpenProgressGroupId(nextGroup.id);
  };

  const renderProgressGroupEditor = (group: ProgressExpandableGroup) => {
    const selectedSchedules = progressSchedules.filter((schedule) => group.selectedScheduleKeys.includes(schedule.scheduleKey));
    const canSubmitGroup = group.selectedScheduleKeys.length > 0 && group.selectedStageIds.length > 0;

    return (
      <div className="space-y-5">
        <div
          className={cn(
            'space-y-4 rounded-2xl p-4',
            standaloneProgressMode
              ? 'bg-transparent'
              : 'bg-transparent',
          )}
        >
          <div className="text-right">
            <FieldLabel label="برنامه‌های ثبت‌شده" required tooltip={INSTALLMENT_TOOLTIPS.progressSelectedScheduleKeys} />
          </div>
          <div
            className={cn(
              'flex flex-row-reverse flex-wrap justify-end gap-2 bg-transparent p-3',
              standaloneProgressMode ? 'rounded-2xl bg-[color:var(--surface-soft)]/55' : 'rounded-2xl bg-[color:var(--surface-soft)]/55',
            )}
          >
            {progressSchedules.map((schedule) => {
              const checked = group.selectedScheduleKeys.includes(schedule.scheduleKey);
              return (
                <DraftTagPill
                  key={schedule.scheduleKey}
                  label={`${schedule.title} | ${schedule.blockName}`}
                  active={checked}
                  onClick={() => toggleScheduleSelection(group.id, schedule.scheduleKey)}
                />
              );
            })}
          </div>
        </div>

        {selectedSchedules.length ? (
          <div className="space-y-4">
            <FieldLabel label="مرحله‌های برنامه‌های منتخب" required tooltip={INSTALLMENT_TOOLTIPS.progressMilestone} />
            <div
              className={cn(
                'space-y-4 bg-transparent p-4',
                standaloneProgressMode ? 'rounded-2xl bg-[color:var(--surface-soft)]/45' : 'rounded-2xl bg-[color:var(--surface-soft)]/45',
              )}
            >
              {selectedSchedules.map((schedule) => {
                const scheduleStageIds = schedule.stages.map((stage) => stage.id);
                const reversedStages = [...schedule.stages].reverse();
                const allStagesSelected =
                  scheduleStageIds.length > 0 &&
                  scheduleStageIds.every((stageId) => group.selectedStageIds.includes(stageId));

                return (
                  <div
                    key={schedule.scheduleKey}
                    className={cn(
                      'space-y-4 rounded-2xl bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_4%,white),white_72%)] p-4 last:border-b-0',
                      standaloneProgressMode ? 'shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]' : 'border border-[color:var(--border-soft)]',
                    )}
                  >
                    <div className="text-right">
                      <p className="text-sm font-black text-[color:var(--text-strong)]">{schedule.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{schedule.blockName}</p>
                    </div>

                    <div
                      className={cn(
                        'flex flex-wrap justify-end gap-2 p-3 [direction:rtl]',
                        standaloneProgressMode ? 'rounded-2xl bg-white/65' : 'rounded-2xl bg-white/65',
                      )}
                    >
                      {schedule.stages.length > 1 ? (
                        <DraftTagPill
                          label="انتخاب همه"
                          active={allStagesSelected}
                          onClick={() => toggleScheduleStagesSelection(group.id, schedule.scheduleKey)}
                        />
                      ) : null}

                      {reversedStages.map((stage) => {
                        const isSingleStageSchedule = schedule.stages.length === 1;
                        const checked = isSingleStageSchedule || group.selectedStageIds.includes(stage.id);
                        const entry = group.entries.find((item) => item.stageId === stage.id);
                        return (
                          <DraftTagPill
                            key={stage.id}
                            label={`${stage.title} | ${stage.weight}٪`}
                            active={checked}
                            onClick={() => {
                              if (!isSingleStageSchedule) toggleSingleStageSelection(group.id, stage.id);
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      {reversedStages.map((stage) => {
                        const isSingleStageSchedule = schedule.stages.length === 1;
                        const checked = isSingleStageSchedule || group.selectedStageIds.includes(stage.id);
                        const entry = group.entries.find((item) => item.stageId === stage.id);
                        if (!checked || !entry) return null;

                        return (
                          <div
                            key={`${stage.id}-editor`}
                            className={cn(
                              'space-y-4 rounded-xl bg-white/70 p-4',
                              standaloneProgressMode ? 'shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]' : 'shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]',
                            )}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-right">
                                <p className="text-sm font-black text-[color:var(--text-strong)]">
                                  {entry.stageTitle} | {entry.scheduleTitle} | {entry.blockName}
                                </p>
                              </div>
                              <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                                <span className="text-xs font-bold text-[color:var(--text-muted)]">روش محاسبه مبلغ</span>
                                <BusinessSwitch
                                  checked={entry.amountMode === 'percent'}
                                  onChange={(checked) => updateProgressEntry(group.id, entry.stageId, 'amountMode', checked ? 'percent' : 'fixed')}
                                  activeLabel="درصدی"
                                  inactiveLabel="مبلغی"
                                  className="business-switch progress-amount-mode-switch"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 [direction:rtl]">
                              <div className="flex h-full flex-col justify-between gap-3">
                                <FieldLabel label="میزان پیشرفت" required tooltip={INSTALLMENT_TOOLTIPS.progressTriggerPercent} />
                                <RuleTextInput
                                  value={entry.progressValue}
                                  onChange={(value) => updateProgressEntry(group.id, entry.stageId, 'progressValue', value)}
                                  suffix="%"
                                />
                              </div>

                              <div className="flex h-full flex-col justify-between gap-3">
                                <FieldLabel
                                  label={entry.amountMode === 'percent' ? 'درصد از مبلغ قرارداد' : 'مبلغ ثابت'}
                                  required
                                  tooltip={INSTALLMENT_TOOLTIPS.progressAmountValue}
                                />
                                <RuleTextInput
                                  value={entry.value}
                                  onChange={(value) => updateProgressEntry(group.id, entry.stageId, 'value', value)}
                                  suffix={entry.amountMode === 'percent' ? '%' : 'تومان'}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[color:var(--text-muted)]">
              {standaloneProgressMode
                ? 'پس از ثبت، این بخش به فهرست اقساط مبتنی بر پیشرفت اضافه می‌شود.'
                : 'ثبت این بخش انجام شد و می‌توانید بخش بعدی را تعریف کنید.'}
            </span>
          </div>
          <button
            type="button"
            disabled={!canSubmitGroup}
            onClick={() => void submitProgressGroup(group.id)}
            className={cn(
              'inline-flex min-w-[172px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition',
              canSubmitGroup
                ? 'bg-[#0f766e] text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)] hover:bg-[#0b5f59]'
                : 'cursor-not-allowed bg-[#cbd5e1] text-white shadow-none',
            )}
          >
            {standaloneProgressMode ? 'ثبت بخش اقساط مبتنی بر پیشرفت' : 'ثبت و رفتن به بخش بعدی'}
          </button>
        </div>
      </div>
    );
  };

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
            در این مدل، محرک پرداخت وابسته به زمان نیست و اقساط بر اساس انتخاب برنامه‌ها و مرحله‌های ثبت‌شده پروژه تعریف می‌شوند.
          </p>
          <div className="border-t border-[color:var(--border-soft)]" />

          <div
            className={cn(
              'space-y-5 bg-[color:var(--surface)]',
              standaloneProgressMode ? 'p-0' : 'rounded-2xl bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_3%,white),white_78%)] p-5',
            )}
          >
            <div
              className={cn(
                'space-y-4 bg-transparent',
                standaloneProgressMode ? 'p-0' : 'rounded-2xl bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]',
              )}
            >
              {!standaloneProgressMode && progressBasedStandaloneHref ? (
                <Link
                  href={progressBasedStandaloneHref}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-6 py-6 text-right transition hover:bg-[color:var(--surface-soft)]"
                >
                  <ChevronLeft className="h-6 w-6 shrink-0 text-[color:var(--text-muted)]" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-[color:var(--text-strong)]">افزودن بخش جدید اقساط مبتنی بر پیشرفت</h3>
                    <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                      برای تعریف یک بخش جدید، انتخاب برنامه‌ها و مرحله‌های مرتبط را در صفحه بعد انجام دهید.
                    </p>
                  </div>
                </Link>
              ) : (
                <SectionTitle
                  title={standaloneProgressMode ? 'تعریف بخش جدید اقساط مبتنی بر پیشرفت' : 'بخش‌های پرداخت مبتنی بر پیشرفت'}
                  hint={
                    standaloneProgressMode
                      ? 'ابتدا برنامه‌های مدنظر را انتخاب کنید تا مرحله‌های همان برنامه‌ها نمایش داده شوند.'
                      : 'بخش‌های ثبت‌شده اقساط مبتنی بر پیشرفت را از اینجا مشاهده و مدیریت کنید.'
                  }
                />
              )}

              {progressGroupError ? (
                <div className="rounded-md border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm leading-7 text-[#be123c]">
                  {progressGroupError}
                </div>
              ) : null}

              {scheduleLoading ? (
                <div className="rounded-md border border-[color:var(--border-soft)] bg-transparent p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  در حال دریافت برنامه‌ها و مرحله‌های پیشرفت فیزیکی...
                </div>
              ) : null}

              {!scheduleLoading && !progressSchedules.length ? (
                <div className="rounded-md border border-[color:var(--border-soft)] bg-transparent p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  هنوز هیچ برنامه پیشرفت فیزیکی برای پروژه ثبت نشده است.
                </div>
              ) : null}

              {standaloneProgressMode && standaloneWorkingGroup ? (
                <div className="rounded-2xl bg-[color:var(--surface)] p-0">
                  {renderProgressGroupEditor(standaloneWorkingGroup)}
                </div>
              ) : null}

              {!standaloneProgressMode ? (
                <div className="space-y-3">
                  {visibleProgressGroups
                    .filter((group) => !isProgressGroupEmpty(group))
                    .map((group, index) => {
                  const selectedSchedules = progressSchedules.filter((schedule) => group.selectedScheduleKeys.includes(schedule.scheduleKey));
                  const selectedBlocks = progressBlocks.filter((block) =>
                    selectedSchedules.some((schedule) => schedule.blockId === block.id),
                  );

                  return (
                    <div
                      key={group.id}
                      className="overflow-visible rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.96),color-mix(in_srgb,var(--dark-teal)_5%,white))] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right">
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-sm font-black text-[color:var(--text-strong)]">
                              بخش {index + 1} اقساط مبتنی بر پیشرفت
                            </span>
                            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[color:var(--dark-teal)] shadow-[inset_0_0_0_1px_rgba(15,118,110,0.12)]">
                              {group.selectedScheduleKeys.length} برنامه
                            </span>
                            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[color:var(--dark-teal)] shadow-[inset_0_0_0_1px_rgba(15,118,110,0.12)]">
                              {group.selectedStageIds.length} مرحله
                            </span>
                          </div>
                          {selectedBlocks.length ? (
                            <p className="text-xs leading-6 text-[color:var(--text-muted)]">
                              بلوک‌های درگیر: {selectedBlocks.map((block) => block.name).join('، ')}
                            </p>
                          ) : (
                            <p className="text-xs leading-6 text-[color:var(--text-muted)]">هنوز برنامه یا مرحله‌ای در این بخش پرداخت انتخاب نشده است.</p>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            className="business-block-card-menu"
                            aria-label={`گزینه‌های بخش پرداخت ${index + 1}`}
                            onClick={() => setOpenProgressGroupMenuId((current) => (current === group.id ? '' : group.id))}
                          >
                            <MoreVertical />
                          </button>
                          {openProgressGroupMenuId === group.id ? (
                            <div className="business-block-menu-popover left-0 right-auto">
                              <Link
                                href={`/business-settings/contract-rules/installments/progress-based?groupId=${group.id}`}
                                onClick={() => setOpenProgressGroupMenuId('')}
                              >
                                <Pencil /> ویرایش
                              </Link>
                              <button type="button" onClick={() => removeProgressGroup(group.id)}>
                                <Trash2 /> حذف
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                  {!visibleProgressGroups.filter((group) => !isProgressGroupEmpty(group)).length ? (
                    <div className="rounded-2xl bg-white/70 p-4 text-sm leading-7 text-[color:var(--text-muted)] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
                      هنوز بخشی برای اقساط مبتنی بر پیشرفت ثبت نشده است.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
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

export function ContractRuleDetailsPanel({
  ruleId,
  forcedTabId,
  backHref,
  submitRedirectHref,
  standaloneProgressGroupId,
}: {
  ruleId: ContractRuleId;
  forcedTabId?: string;
  backHref?: string;
  submitRedirectHref?: string;
  standaloneProgressGroupId?: string;
}) {
  const router = useRouter();
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
        if (mounted) {
          setState(
            forcedTabId && rule.tabs.some((tab) => tab.id === forcedTabId)
              ? { ...payload, activeTab: forcedTabId }
              : payload,
          );
        }
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
  }, [forcedTabId, rule.tabs, ruleId]);

  const currentTab = useMemo(() => {
    if (!state) return rule.tabs[0] ?? null;
    return rule.tabs.find((tab) => tab.id === state.activeTab) ?? rule.tabs[0] ?? null;
  }, [rule, state]);
  const hasSelectedAdditionalCost = ruleId === 'additional-costs' && Boolean(state?.activeChip);
  const showActivationSection = !forcedTabId;
  const shouldShowRuleContent = forcedTabId ? true : Boolean(state?.active);
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

  const handleStandaloneProgressSubmit = async (serializedGroups: string) => {
    if (!state) return;

    const nextState: ContractRuleState = {
      ...state,
      activeTab: 'progress-based',
      values: {
        ...state.values,
        progressExpandableGroups: serializedGroups,
      },
    };

    try {
      setSaving(true);
      setError('');
      setMessage('');
      setState(nextState);

      const response = await fetch(`/api/business-settings/contract-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات انجام نشد.');
      }

      if (submitRedirectHref) {
        router.push(submitRedirectHref);
        return;
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
        {backHref ? (
          <div className="flex justify-end">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--theme-action-text)]">
              <span>بازگشت</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
        {!hasSelectedAdditionalCost && showActivationSection ? (
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

        {shouldShowRuleContent ? (
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
                  'overflow-hidden bg-[color:var(--surface)]',
                  isMinimalInstallments ? 'rounded-md' : 'rounded-[24px]',
                )}
              >
                {ruleId !== 'adjustment' && !forcedTabId ? (
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
                    <InstallmentsTabContent
                      state={state}
                      onValueChange={(key, value) => applyPanelValue(setState, key, value)}
                      progressBasedStandaloneHref={
                        !forcedTabId && state.activeTab === 'progress-based'
                          ? '/business-settings/contract-rules/installments/progress-based'
                          : undefined
                      }
                      standaloneProgressMode={forcedTabId === 'progress-based'}
                      standaloneProgressGroupId={forcedTabId === 'progress-based' ? standaloneProgressGroupId : undefined}
                      onStandaloneProgressSubmit={forcedTabId === 'progress-based' ? handleStandaloneProgressSubmit : undefined}
                    />
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

      {!forcedTabId ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 px-4 sm:px-6 lg:px-8">
          <div className="flex w-full justify-end">
            <BusinessSettingsSubmitButton saving={saving} onClick={() => void handleSave()} minimal={isMinimalInstallments} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
