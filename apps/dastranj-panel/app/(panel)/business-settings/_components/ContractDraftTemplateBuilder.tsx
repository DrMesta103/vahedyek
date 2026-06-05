'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ChevronLeft,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Gift,
  LineChart,
  LockKeyhole,
  MapPinned,
  Paperclip,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Umbrella,
  Upload,
  Wallet,
} from 'lucide-react';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { PayrollBaseSummaryPanel, type PayrollBaseSummaryItem } from '../../../components/PayrollBaseSummaryPanel';
import { VariableAmountTitlePicker } from '../../../components/VariableAmountTitlePicker';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { UnsavedChangesDialog, useUnsavedLeaveGuard } from '../../../components/UnsavedChangesGuard';
import { AdaptiveChipGroup } from '../../../components/AdaptiveChipGroup';
import { PanelToggleRow } from '../../../components/PanelToggleRow';
import { CalculationRulesBadges, CalcRulesDiffBadge, CalcRulesEditButton, CalculationRulesDialog } from '../../../components/CalculationRulesChips';
import type { PaymentEffectContext } from '../../../components/CalculationRulesChips';
import {
  getTemplateSteps,
  type ContractDraftTemplate,
  type ContractDraftTemplateStepId,
  type VariableTemplateItem,
} from '../../../lib/contract-draft-templates';
import { formatFaNumber, toPersianDigits } from '../../../lib/format-fa';
import { upsertContractDraftTemplateAction } from '../../../lib/actions';
import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_SENIORITY_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  ACTIVE_TENANT_STORAGE_KEY,
  getActiveTenantStorageId,
  getPayrollSettingsStorageKey,
  getTenantPayrollSettingsStorageKey,
  applyPayrollOverrides,
  normalizePayrollSettings,
  normalizePayrollOverrides,
  calculatePayrollValues,
  compareValues,
  validatePayrollStep,
  VARIABLE_TITLES,
  type BaseDifference,
  type MissionRule,
  type CalculationRules,
  type PayrollSettings,
  type VariableAmount,
} from '../../../lib/payroll-business-settings';
import type { HydratedClientStorageState } from '../../../lib/client-storage-persistence';
import { LeaveSection, WorkTimePayRulesSection } from './PayrollBusinessSettingsFlow';
import { MissionStep, MissionRuleDialog } from '../../employees/[id]/contract-drafts/_components/employee-contract-steps/MissionStep';
import { PaymentScheduleStep } from '../../employees/[id]/contract-drafts/_components/employee-contract-steps/PaymentScheduleStep';
import {
  CONTRACT_TYPE_OPTIONS as CONTRACT_TYPES,
  CONTRACT_TYPE_SUBCATEGORIES,
  WORK_LOCATION_CATEGORIES,
  WORK_LOCATION_SUBCATEGORIES,
  getWorkLocationSubHint,
} from '../../../lib/contract-subject-options';

type StepState = Record<ContractDraftTemplateStepId, { opened: boolean; completed: boolean; dirty: boolean; saved: boolean }>;

const PAYMENT_TYPES = [
  'پرداخت بر اساس دوره‌های زمانی',
  'پرداخت بر اساس نوع شغل و فعالیت',
  'پرداخت ترکیبی و روش‌های خاص',
];

const BENEFIT_TEMPLATE_FIELDS = [
  { key: 'workerAllowance', label: 'بن کارگری', baseKey: 'workerAllowance', description: 'کمک هزینه معیشت ماهانه' },
  { key: 'housingAllowance', label: 'حق مسکن', baseKey: 'housingAllowance', description: 'کمک هزینه مسکن ماهانه' },
  { key: 'childAllowance', label: 'حق اولاد به ازای هر فرزند در ماه', baseKey: 'childAllowance', description: 'مزیت فرزند واجد شرایط' },
  { key: 'marriageAllowance', label: 'حق تأهل', baseKey: 'marriageAllowance', description: 'مزیت مربوط به وضعیت تأهل' },
  { key: 'seniorityAllowance', label: 'مزد پایه سنوات', baseKey: 'seniorityAllowance', description: 'مزیت سابقه کار' },
  { key: 'eidBonus', label: 'عیدی', baseKey: 'eidBonus', description: 'مزایای پایان سال' },
] as const;

const COMMITMENT_CATEGORIES = [
  {
    title: 'تعهدات حفظ اطلاعات و امنیت',
    description: 'NDA، عدم رقابت، تضاد منافع و دسترسی.',
    chips: ['تعهد عدم افشای اطلاعات (NDA)', 'تعهد عدم رقابت', 'تعهد عدم جذب نیرو', 'تعهد عدم تضاد منافع', 'تعهد عدم دسترسی غیرمجاز'],
  },
  {
    title: 'تعهدات تجهیزات و اموال',
    description: 'نگهداری، بازگشت تجهیزات و ایمنی محیط.',
    chips: ['تعهد استفاده از تجهیزات سازمانی', 'تعهد بازگرداندن تجهیزات', 'تعهد مسئولیت مالی در صورت خسارت', 'تعهد رعایت اصول ایمنی و بهداشت محیط کار', 'تعهد رعایت استانداردهای محیط کاری'],
  },
  {
    title: 'تعهدات آموزشی',
    description: 'حضور، هزینه و ارتقای مهارت.',
    chips: ['تعهد حضور در دوره‌های آموزشی', 'تعهد برگشت هزینه آموزش', 'تعهد ارتقای مهارت'],
  },
  {
    title: 'تعهدات رفتاری و فرهنگی',
    description: 'انضباط، وقت‌شناسی و رفتار حرفه‌ای.',
    chips: ['تعهد رعایت فرهنگ سازمانی', 'تعهد رفتار حرفه‌ای', 'تعهد حضور منظم و پایبندی به ساعات کاری', 'تعهد عدم ایجاد تنش و اختلاف'],
  },
  {
    title: 'تعهدات مالی و حقوقی',
    description: 'مالیاتی، پیامدهای فسخ و دارایی‌ها.',
    chips: ['تعهد رعایت قوانین مالیاتی و بیمه‌ای', 'تعهد پرداخت جریمه در صورت فسخ زودهنگام', 'تعهد استفاده صحیح از منابع مالی سازمان'],
  },
];

const DOCUMENT_CATEGORIES = [
  {
    key: 'identity',
    title: 'مدارک شناسایی و هویتی',
    options: ['کارت ملی', 'شناسنامه', 'پاسپورت', 'گواهینامه رانندگی', 'کارت اقامت', 'کارت دانشجویی', 'کارت اتباع یا مجوز کار رسمی', 'تاییدیه ثبت‌نام در سامانه ثنا', 'کارت پایان خدمت / معافیت'],
  },
  { key: 'insurance', title: 'مدارک بیمه‌ای و تأمین اجتماعی', options: ['سوابق بیمه', 'کد بیمه تأمین اجتماعی', 'دفترچه یا شماره بیمه'] },
  { key: 'work', title: 'مدارک شغلی و سوابق کاری', options: ['رزومه', 'گواهی سابقه کار', 'معرفی‌نامه شغلی'] },
  { key: 'financial', title: 'مدارک مالی و تضامین', options: ['ضمانت‌نامه بانکی', 'چک', 'قراردادهای مالی'] },
  { key: 'education', title: 'مدارک آموزشی و تحصیلی', options: ['مدرک تحصیلی', 'گواهی دوره آموزشی', 'مجوز حرفه‌ای'] },
  { key: 'legal', title: 'مدارک اداری و حقوقی', options: ['گواهی عدم سوء پیشینه', 'فرم اطلاعات پرسنلی', 'تعهدنامه حقوقی'] },
  { key: 'commitments', title: 'تعهدات', options: ['تعهد محرمانگی', 'تعهد تجهیزات', 'تعهد آموزش', 'تعهد رفتاری'] },
];

function money(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function decimal(value: number) {
  return toPersianDigits(Number.isFinite(value) ? String(value) : '');
}

function getStorageValue(storageStates: HydratedClientStorageState[], storageKey: string) {
  return storageStates.find((item) => item.storageKey === storageKey)?.value ?? null;
}

function readTemplates(templates: ContractDraftTemplate[]) {
  return templates;
}

function readTenantPayrollBaseSettings(year: number, storageStates: HydratedClientStorageState[], tenantId?: string | null) {
  const rawAdminBase = getStorageValue(storageStates, getPayrollSettingsStorageKey(year));
  const adminBase = rawAdminBase ? normalizePayrollSettings(JSON.parse(rawAdminBase)) : DEFAULT_PAYROLL_SETTINGS;
  const storageTenantId = tenantId ?? getActiveTenantStorageId();
  if (!storageTenantId) return adminBase;

  const rawTenantOverrides = getStorageValue(storageStates, getTenantPayrollSettingsStorageKey(year, storageTenantId));
  if (rawTenantOverrides) {
    return normalizePayrollSettings(
      applyPayrollOverrides(adminBase, normalizePayrollOverrides(JSON.parse(rawTenantOverrides))),
    );
  }

  const rawLegacyTenantSettings = getStorageValue(storageStates, getPayrollSettingsStorageKey(year, storageTenantId));
  return rawLegacyTenantSettings ? normalizePayrollSettings(JSON.parse(rawLegacyTenantSettings)) : adminBase;
}

function buildPayrollBaseSummaryItems(
  template: ContractDraftTemplate,
  derived: ReturnType<typeof calculatePayrollValues>,
): PayrollBaseSummaryItem[] {
  const benefitItems = BENEFIT_TEMPLATE_FIELDS.flatMap(({ key, label, description }) => {
    const benefit = template.data.benefits[key];
    const rules = benefit.calculationRules ?? (key === 'seniorityAllowance' ? DEFAULT_SENIORITY_BENEFIT_RULES : DEFAULT_FIXED_BENEFIT_RULES);
    if (!benefit.enabled || rules.paymentEffect !== 'earning') return [];
    return [
      {
        id: `benefit-${key}`,
        title: label,
        amount: benefit.amount,
        paymentEffect: rules.paymentEffect,
        includedInWageBase: rules.includedInWageBase,
        system: rules.systemGenerated,
        note: description,
      } satisfies PayrollBaseSummaryItem,
    ];
  });

  const variableItems = template.data.variablePayments.additions.map((item) => {
    const amount =
      item.method === 'fixed'
        ? item.amount
        : (item.percent / 100) * (item.base === 'grossPay' ? derived.grossPay : derived.monthlyBaseSalary);
    const rules = item.calculationRules ?? DEFAULT_OPTIONAL_ADDITION_RULES;
    return {
      id: item.id,
      title: item.title,
      amount,
      paymentEffect: rules.paymentEffect,
      includedInWageBase: rules.includedInWageBase,
      system: rules.systemGenerated,
    } satisfies PayrollBaseSummaryItem;
  });

  return [...benefitItems, ...variableItems];
}

function differenceBadge(difference?: BaseDifference | null) {
  if (!difference) return null;
  return (
    <span className="business-payroll-difference-badge" title={difference.tooltip}>
      {difference.message}
    </span>
  );
}

function customDifference(message: string, tooltip: string): BaseDifference {
  return { isDifferent: true, direction: 'changed', message, tooltip };
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function normalizeDecimalInput(value: string) {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/,/g, '');
  return normalized ? Number(normalized.replace(/[^\d.]/g, '')) : Number.NaN;
}

function newVariableTemplateItem(type: 'addition' | 'deduction'): VariableTemplateItem {
  return {
    id: `${type}-${Date.now()}`,
    title: VARIABLE_TITLES[type][0],
    type,
    method: 'fixed',
    amount: 0,
    percent: 0,
    base: 'baseSalary',
    calculationRules: type === 'addition' ? { ...DEFAULT_OPTIONAL_ADDITION_RULES } : { ...DEFAULT_OPTIONAL_DEDUCTION_RULES },
  };
}

function getVariableItemDifference(baseItem: VariableAmount | undefined, item: VariableTemplateItem): BaseDifference | null {
  if (!baseItem) return null;
  if (baseItem.calculationMethod !== item.method) {
    return customDifference('متفاوت با مبنا', 'روش محاسبه این آیتم با تنظیمات پایه متفاوت است.');
  }
  if (item.method === 'fixed') {
    return compareValues(baseItem.amount, item.amount, {
      changed: 'متفاوت با مبنا',
      tooltip: `مبلغ مبنا برای این آیتم ${money(baseItem.amount)} است.`,
    });
  }
  if (baseItem.percent !== item.percent) {
    return compareValues(baseItem.percent, item.percent, {
      changed: 'متفاوت با مبنا',
      tooltip: `درصد مبنا برای این آیتم ${decimal(baseItem.percent)}٪ است.`,
    });
  }
  if (baseItem.calculationBase !== item.base) {
    return customDifference('متفاوت با مبنا', 'مبنای محاسبه این آیتم با تنظیمات پایه متفاوت است.');
  }
  return null;
}

const CONTRACT_STEP_ICONS: Record<ContractDraftTemplateStepId, ReactNode> = {
  attendanceBase: <Clock3 className="h-5 w-5 shrink-0" aria-hidden />,
  classification: <FileText className="h-5 w-5 shrink-0" aria-hidden />,
  payrollBase: <Wallet className="h-5 w-5 shrink-0" aria-hidden />,
  benefits: <Gift className="h-5 w-5 shrink-0" aria-hidden />,
  variablePayments: <LineChart className="h-5 w-5 shrink-0" aria-hidden />,
  paymentType: <CreditCard className="h-5 w-5 shrink-0" aria-hidden />,
  workTimePayRules: <Clock3 className="h-5 w-5 shrink-0" aria-hidden />,
  leave: <Umbrella className="h-5 w-5 shrink-0" aria-hidden />,
  mission: <MapPinned className="h-5 w-5 shrink-0" aria-hidden />,
  specialCommitments: <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />,
  attachments: <Paperclip className="h-5 w-5 shrink-0" aria-hidden />,
};

function ContractStepHeader({ stepId, title, detail }: { stepId: ContractDraftTemplateStepId; title: string; detail: string }) {
  return (
    <header className="business-payroll-section-head draft-template-flow-section-head contract-draft-step-banner">
      <div className="contract-draft-step-banner-copy">
        <div className="business-payroll-section-icon contract-draft-step-icon-shell" aria-hidden>
          {CONTRACT_STEP_ICONS[stepId]}
        </div>
        <div>
          <h2>{title}</h2>
          <p>{detail}</p>
        </div>
      </div>
    </header>
  );
}

function formatUsageTypeLabel(type: ContractDraftTemplate['usageType']) {
  return type === 'attendance_only' ? 'فقط تردد' : 'تردد و حقوق و دستمزد';
}

function createStepState(template: ContractDraftTemplate): StepState {
  return Object.fromEntries(
    getTemplateSteps(template.usageType).map((step, index) => [
      step.id,
      {
        opened: template.stepsProgress.openedStepIds.includes(step.id) || index === 0,
        completed: template.stepsProgress.completedStepIds.includes(step.id),
        dirty: template.stepsProgress.dirtyStepIds.includes(step.id),
        saved: template.stepsProgress.savedStepIds.includes(step.id),
      },
    ]),
  ) as StepState;
}

function composeSettings(template: ContractDraftTemplate, base: PayrollSettings): PayrollSettings {
  return {
    ...base,
    financial: {
      dailyBaseSalary: template.data.payrollBase.dailyBaseSalary,
      dailyRequiredMinutes: template.data.payrollBase.dailyRequiredMinutes,
    },
    benefits: {
      workerAllowance: template.data.benefits.workerAllowance.amount,
      housingAllowance: template.data.benefits.housingAllowance.amount,
      childAllowance: template.data.benefits.childAllowance.amount,
      marriageAllowance: template.data.benefits.marriageAllowance.amount,
      seniorityAllowance: template.data.benefits.seniorityAllowance.amount,
      eidBonus: template.data.benefits.eidBonus.amount,
    },
    variableAmounts: {
      additions: [],
      deductions: [],
    },
    paymentSchedule: template.data.paymentSchedule ?? base.paymentSchedule,
    workTimePayRules: {
      ...template.data.workTimePayRules,
      nightWork: {
        ...template.data.workTimePayRules.nightWork,
        startTime: base.workTimePayRules.nightWork.startTime,
        endTime: base.workTimePayRules.nightWork.endTime,
      },
    },
    leave: template.data.leave,
    mission: template.data.mission ?? base.mission,
  };
}

function syncNightWorkTimesFromBase(
  rules: PayrollSettings['workTimePayRules'],
  base: PayrollSettings,
): PayrollSettings['workTimePayRules'] {
  return {
    ...rules,
    nightWork: {
      ...rules.nightWork,
      startTime: base.workTimePayRules.nightWork.startTime,
      endTime: base.workTimePayRules.nightWork.endTime,
    },
  };
}

function updateProgress(template: ContractDraftTemplate, state: StepState, currentStepId: ContractDraftTemplateStepId): ContractDraftTemplate {
  const steps = getTemplateSteps(template.usageType);
  return {
    ...template,
    updatedAt: new Date().toISOString(),
    stepsProgress: {
      openedStepIds: steps.filter(({ id }) => state[id]?.opened).map(({ id }) => id),
      completedStepIds: steps.filter(({ id }) => state[id]?.completed).map(({ id }) => id),
      currentStepId,
      dirtyStepIds: steps.filter(({ id }) => state[id]?.dirty).map(({ id }) => id),
      savedStepIds: steps.filter(({ id }) => state[id]?.saved).map(({ id }) => id),
    },
  };
}

function FieldShell({
  label,
  unit,
  value,
  error,
  difference,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  error?: string;
  difference?: BaseDifference | null;
  onChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(Number.isFinite(value) ? String(value) : '');

  useEffect(() => {
    setDraftValue(Number.isFinite(value) ? String(value) : '');
  }, [value]);

  return (
    <label className={`business-payroll-field ${error ? 'has-error' : ''}`}>
      <span className="business-payroll-field-label">
        {label}
        {differenceBadge(difference)}
      </span>
      <span className="business-payroll-input">
        <input
          type="text"
          inputMode="numeric"
          value={draftValue}
          onChange={(event) => {
            const nextValue = event.target.value
              .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
              .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
            setDraftValue(nextValue);
            onChange(normalizeDecimalInput(nextValue));
          }}
        />
        <b>{unit}</b>
      </span>
      {error ? <em>{error}</em> : null}
    </label>
  );
}

function OptionGrid({
  options,
  selected,
  multi = false,
  onChange,
}: {
  options: string[];
  selected: string | string[];
  multi?: boolean;
  onChange: (value: string | string[]) => void;
}) {
  return (
    <AdaptiveChipGroup
      className="business-draft-option-grid contract-draft-option-grid"
      items={options.map((option) => ({ value: option, label: option }))}
      selected={selected}
      multi={multi}
      onChange={onChange}
    />
  );
}

function AttachmentDialog({
  category,
  selected,
  onClose,
  onSubmit,
}: {
  category: typeof DOCUMENT_CATEGORIES[number] | null;
  selected: string[];
  onClose: () => void;
  onSubmit: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    setDraft(selected);
  }, [selected, category]);

  return (
    <PanelFormModal
      open={Boolean(category)}
      title="مدارک اجباری برای عقد قرارداد"
      lead="پیوست هر مدرک را اجباری یا اختیاری علامت بزنید."
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={() => onSubmit(draft)} onCancel={onClose} />}
    >
      <AdaptiveChipGroup
        className="business-payroll-chips business-draft-document-picker"
        items={(category?.options ?? []).map((option) => ({ value: option, label: option }))}
        selected={draft}
        multi
        onChange={(value) => setDraft(Array.isArray(value) ? value : [value])}
      />
    </PanelFormModal>
  );
}

export function ContractDraftTemplateBuilder({
  tenantId = null,
  templates: initialTemplates,
  selectedTemplateId = null,
  storageStates,
}: {
  tenantId?: string | null;
  templates: ContractDraftTemplate[];
  selectedTemplateId?: string | null;
  storageStates: HydratedClientStorageState[];
}) {
  const router = useRouter();
  const tenantStorageId = tenantId ?? getActiveTenantStorageId();
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>(() => readTemplates(initialTemplates));
  const [template, setTemplate] = useState<ContractDraftTemplate | null>(() => {
    const selected = initialTemplates.find((item) => item.id === selectedTemplateId) ?? initialTemplates[0] ?? null;
    return selected;
  });
  const [baseSettings, setBaseSettings] = useState<PayrollSettings>(() => {
    const templateYear = initialTemplates.find((item) => item.id === selectedTemplateId)?.baseSettingsYear ?? initialTemplates[0]?.baseSettingsYear;
    return templateYear ? readTenantPayrollBaseSettings(templateYear, storageStates, tenantStorageId) : DEFAULT_PAYROLL_SETTINGS;
  });
  const [stepState, setStepState] = useState<StepState | null>(() => (template ? createStepState(template) : null));
  const [activeStep, setActiveStep] = useState<ContractDraftTemplateStepId>(() => template?.stepsProgress.currentStepId || 'classification');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachmentCategory, setAttachmentCategory] = useState<typeof DOCUMENT_CATEGORIES[number] | null>(null);
  const [missionEditor, setMissionEditor] = useState<MissionRule | null>(null);
  const [deletingMissionRule, setDeletingMissionRule] = useState<MissionRule | null>(null);
  const savedTemplateRef = useRef<ContractDraftTemplate | null>(null);

  useEffect(() => {
    if (tenantId) {
      window.sessionStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
    }
  }, [tenantId]);

  const steps = template ? getTemplateSteps(template.usageType) : [];
  const hasUnsavedChanges = useMemo(
    () => Boolean(stepState) && steps.some(({ id }) => stepState[id]?.dirty),
    [stepState, steps],
  );
  const settings = useMemo(() => template ? composeSettings(template, baseSettings) : DEFAULT_PAYROLL_SETTINGS, [template, baseSettings]);
  const derived = useMemo(() => calculatePayrollValues(settings), [settings]);
  const payrollSummaryItems = useMemo(
    () => (template ? buildPayrollBaseSummaryItems(template, derived) : []),
    [template, derived],
  );

  const persist = async (nextTemplate: ContractDraftTemplate, nextState = stepState, nextStep = activeStep) => {
    const withProgress = nextState ? updateProgress(nextTemplate, nextState, nextStep) : nextTemplate;
    setTemplate(withProgress);
    const nextTemplates = templates.some((item) => item.id === withProgress.id)
      ? templates.map((item) => (item.id === withProgress.id ? withProgress : item))
      : [withProgress, ...templates];
    setTemplates(nextTemplates);
    await upsertContractDraftTemplateAction(withProgress);
  };

  const updateTemplate = (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => {
    if (!template || !stepState) return;
    const next = apply(template);
    const nextState = { ...stepState, [step]: { ...stepState[step], dirty: true, saved: false } };
    setStepState(nextState);
    void persist(next, nextState, activeStep);
    setErrors({});
  };

  const scrollToStep = (step: ContractDraftTemplateStepId) => {
    document.getElementById(`contract-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveStep = (step: ContractDraftTemplateStepId) => {
    if (!template || !stepState) return false;
    const validation = validateStep(step, template, settings);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setActiveStep(step);
      requestAnimationFrame(() => scrollToStep(step));
      return false;
    }
    const nextState = { ...stepState, [step]: { ...stepState[step], dirty: false, saved: true } };
    setStepState(nextState);
    const nextTemplate = updateProgress(template, nextState, activeStep);
    savedTemplateRef.current = nextTemplate;
    void persist(nextTemplate, nextState, activeStep);
    setErrors({});
    return true;
  };

  const continueFromStep = (step: ContractDraftTemplateStepId) => {
    if (!template || !stepState) return;
    const validation = validateStep(step, template, settings);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setActiveStep(step);
      requestAnimationFrame(() => scrollToStep(step));
      return;
    }
    const stepIndex = steps.findIndex((item) => item.id === step);
    const nextStep = steps[stepIndex + 1];
    if (!nextStep) {
      saveStep(step);
      return;
    }
    const nextState = {
      ...stepState,
      [step]: { ...stepState[step], completed: true, dirty: false, saved: true },
      [nextStep.id]: { ...stepState[nextStep.id], opened: true },
    };
    setStepState(nextState);
    setActiveStep(nextStep.id);
    void persist(template, nextState, nextStep.id);
    requestAnimationFrame(() => scrollToStep(nextStep.id));
  };

  const saveDirtyStepsAndLeave = () => {
    if (!template || !stepState) return true;

    const dirtySteps = steps.filter(({ id }) => stepState[id]?.dirty).map(({ id }) => id);
    for (const step of dirtySteps) {
      const validation = validateStep(step, template, settings);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setActiveStep(step);
        requestAnimationFrame(() => scrollToStep(step));
        return false;
      }
    }

    if (!dirtySteps.length) return true;

    const nextState = { ...stepState };
    for (const step of dirtySteps) {
      nextState[step] = { ...nextState[step], dirty: false, saved: true };
    }
    const nextTemplate = updateProgress(template, nextState, activeStep);
    setStepState(nextState);
    savedTemplateRef.current = nextTemplate;
    void persist(nextTemplate, nextState, activeStep);
    setErrors({});
    return true;
  };

  const unsavedLeaveGuard = useUnsavedLeaveGuard({
    hasUnsavedChanges,
    onSaveAndLeave: saveDirtyStepsAndLeave,
    onBrowserBack: () => router.push('/draft-templates'),
  });

  if (!template || !stepState) {
    return (
      <div className="business-payroll-years-page business-payroll-flow" dir="rtl" lang="fa">
        <main className="business-payroll-years-content">
          <section className="business-payroll-years-empty">
            <FileText className="h-10 w-10" />
            <h2>قالبی برای ویرایش انتخاب نشده است</h2>
            <p>برای ساخت قالب پیش‌نویس قرارداد، از فهرست قالب‌ها یک قالب جدید اضافه کنید.</p>
            <Link href="/draft-templates?create=1" className="draft-template-flow-action is-primary">
              افزودن قالب جدید
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const completedCount = steps.filter(({ id }) => stepState[id]?.completed || stepState[id]?.saved).length;
  const progressPercent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const diffCount = countDifferences(template, baseSettings);
  const commitmentCount = template.data.specialCommitments.selected.length;
  const documentCount = Object.values(template.data.attachments.requiredDocuments).reduce((sum, items) => sum + items.length, 0);
  const activeBenefitCount = BENEFIT_TEMPLATE_FIELDS.filter(({ key }) => template.data.benefits[key].enabled).length;
  const annualTransferEnabled = template.data.leave.transferPolicy.mode === 'carry_forward'
    && template.data.leave.transferPolicy.limits.annual.enabled;

  return (
    <div className="draft-template-flow-page business-payroll-flow business-contract-template-flow" dir="rtl" lang="fa">
      <aside className="draft-template-flow-sidebar draft-template-flow-sidebar-right" aria-label="مراحل قالب قرارداد">
        <div className="draft-template-flow-sidebar-panel">
          <header className="draft-template-flow-sidebar-header contract-draft-stepper-head">
            <h2>قالب پیش‌نویس قرارداد</h2>
            <p>مراحل را به ترتیب تکمیل کنید.</p>
          </header>
          <MinimalScroll className="draft-template-flow-nav-list contract-draft-stepper-scroll">
            {steps.map((step, index) => {
              const state = stepState[step.id];
              const isCurrent = state.opened && activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`draft-template-flow-nav-item contract-draft-stepper-card ${isCurrent ? 'is-active' : ''} ${state.dirty ? 'is-dirty' : ''} ${state.opened ? 'is-opened' : 'is-locked'}`}
                >
                  <button
                    type="button"
                    className="draft-template-flow-nav-main"
                    disabled={!state.opened}
                    title={state.opened ? undefined : 'ابتدا مراحل قبلی را تکمیل کنید'}
                    onClick={() => {
                      if (!state.opened) return;
                      setActiveStep(step.id);
                      void persist(template, stepState, step.id);
                      requestAnimationFrame(() => scrollToStep(step.id));
                    }}
                  >
                    <span className="draft-template-flow-nav-number">{formatFaNumber(index + 1, { useGrouping: false })}</span>
                    <span className="draft-template-flow-nav-copy">
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                      <span className="business-payroll-step-badges">
                        {isCurrent ? <span className="business-payroll-step-badge is-current">در حال انجام</span> : null}
                        {!isCurrent && state.opened && state.saved && !state.dirty ? (
                          <span className="business-payroll-step-badge is-saved">ذخیره شده</span>
                        ) : null}
                        {!state.opened ? (
                          <span className="business-payroll-step-badge is-locked" aria-label="قفل شده">
                            <LockKeyhole className="h-3 w-3" />
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                  {state.opened && state.dirty ? (
                    <button type="button" className="business-payroll-step-save-tag" onClick={() => saveStep(step.id)}>
                      ذخیره
                    </button>
                  ) : null}
                </div>
              );
            })}
          </MinimalScroll>
        </div>
      </aside>

      <aside className="draft-template-flow-report business-payroll-report contract-draft-live-summary" aria-label="خلاصه زنده">
        <div className="draft-template-flow-report-panel">
          <header className="draft-template-flow-report-header">
            <div className="draft-template-flow-report-meta">
              <span>وضعیت قالب</span>
              <strong>پیش‌نویس</strong>
            </div>
            <h2>خلاصه زنده</h2>
            <p>اطلاعات قالب با تغییر مقادیر به‌روز می‌شود.</p>
          </header>
          <MinimalScroll className="draft-template-flow-report-body business-payroll-summary contract-draft-summary-body">
            <div className="draft-template-flow-report-card accent">
              <span>نام قالب</span>
              <strong>{template.name}</strong>
              <small>
                {formatUsageTypeLabel(template.usageType)} · سال {formatFaNumber(template.baseSettingsYear, { useGrouping: false })}
              </small>
            </div>

            <div className="draft-template-flow-report-card contract-draft-summary-progress">
              <div className="draft-template-flow-report-card-head">
                <span>پیشرفت تکمیل</span>
                <strong>
                  {formatFaNumber(completedCount, { useGrouping: false })} از {formatFaNumber(steps.length, { useGrouping: false })}
                </strong>
              </div>
              <div
                className="contract-draft-summary-progress-bar"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="پیشرفت تکمیل مراحل"
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <small>{formatFaNumber(progressPercent, { useGrouping: false })}٪ تکمیل شده</small>
            </div>

            <PayrollBaseSummaryPanel
              baseSalaryAmount={derived.monthlyBaseSalary}
              items={payrollSummaryItems}
              className="contract-draft-summary-payroll"
            />

            <div className="draft-template-flow-report-grid">
              <div>
                <span>تفاوت با مبنا</span>
                <strong className={diffCount > 0 ? 'is-positive' : ''}>{formatFaNumber(diffCount, { useGrouping: false })}</strong>
              </div>
              <div>
                <span>تعهدات</span>
                <strong>{formatFaNumber(commitmentCount, { useGrouping: false })}</strong>
              </div>
              <div>
                <span>مدارک اجباری</span>
                <strong>{formatFaNumber(documentCount, { useGrouping: false })}</strong>
              </div>
              <div>
                <span>{template.usageType === 'payroll_attendance' ? 'مزایای فعال' : 'سقف اضافه‌کاری'}</span>
                <strong className={template.usageType === 'payroll_attendance' ? 'is-positive' : ''}>
                  {template.usageType === 'payroll_attendance'
                    ? formatFaNumber(activeBenefitCount, { useGrouping: false })
                    : `${formatFaNumber(template.data.attendanceBase.monthlyOvertimeLimitHours)} ساعت`}
                </strong>
              </div>
            </div>

            <div className="draft-template-flow-report-card">
              <span>تردد و مرخصی</span>
              <small>سقف اضافه‌کاری ماهانه: {formatFaNumber(template.data.attendanceBase.monthlyOvertimeLimitHours)} ساعت</small>
              <small>سهمیه مرخصی ماهانه: {formatFaNumber(template.data.leave.monthlyQuotaHours)} ساعت</small>
              <small>
                انتقال سالانه:{' '}
                {annualTransferEnabled
                  ? `${formatFaNumber(template.data.leave.transferPolicy.limits.annual.maxHours ?? 0)} ساعت`
                  : 'غیرفعال'}
              </small>
            </div>

            {template.usageType === 'payroll_attendance' ? (
              <div className="draft-template-flow-report-card total">
                <span>حقوق پایه روزانه</span>
                <strong>{money(template.data.payrollBase.dailyBaseSalary)}</strong>
                <small>
                  دقایق موظفی روزانه: {formatFaNumber(template.data.payrollBase.dailyRequiredMinutes)} · مزایای فعال:{' '}
                  {formatFaNumber(activeBenefitCount, { useGrouping: false })}
                </small>
              </div>
            ) : null}
          </MinimalScroll>
        </div>
      </aside>

      <main className="draft-template-flow-main draft-template-flow-content business-payroll-content">
        <header className="draft-template-flow-page-header contract-draft-page-header">
          <nav className="draft-template-flow-breadcrumb contract-draft-breadcrumb" aria-label="مسیر صفحه">
            <Link href="/">دسترنج</Link>
            <ChevronLeft className="contract-draft-breadcrumb-chevron" aria-hidden />
            <Link href="/business-settings">تنظیمات کسب و کار</Link>
            <ChevronLeft className="contract-draft-breadcrumb-chevron" aria-hidden />
            <span className="contract-draft-breadcrumb-current">قالب پیش‌نویس قرارداد</span>
          </nav>
          <div className="business-payroll-flow-title contract-draft-title-row">
            <div className="contract-draft-title-block">
              <div className="business-payroll-title-row contract-draft-heading-line">
                <h1>قالب پیش‌نویس قرارداد</h1>
                <strong className="business-payroll-mode-badge">صاحب کسب و کار</strong>
              </div>
              <p className="contract-draft-template-name">{template.name}</p>
              <p className="contract-draft-page-lead">ساخت و تنظیم قالب قرارداد بر اساس تنظیمات مبنای انتخاب‌شده</p>
            </div>
            <button
              type="button"
              className="business-payroll-outline-button contract-draft-back-link"
              onClick={() => unsavedLeaveGuard.requestLeave(() => router.push('/draft-templates'))}
            >
              بازگشت به فهرست قالب‌ها
            </button>
          </div>
          <div className="business-payroll-header-badges contract-draft-header-badges">
            <span className="contract-draft-badge contract-draft-badge--usage">نوع قالب: {formatUsageTypeLabel(template.usageType)}</span>
            <span className="contract-draft-badge contract-draft-badge--base">مبنای تنظیمات: سال {formatFaNumber(template.baseSettingsYear, { useGrouping: false })}</span>
            <span className="contract-draft-badge contract-draft-badge--draft">وضعیت: پیش‌نویس</span>
          </div>
        </header>

        <div className="business-payroll-sections contract-draft-sections-stack">
          {steps.filter(({ id }) => stepState[id]?.opened).map((step) => (
            <section
              key={step.id}
              id={`contract-draft-${step.id}`}
              className={`draft-template-flow-section business-payroll-current-section contract-draft-step-section ${activeStep === step.id ? 'is-current' : ''}`}
            >
              <ContractStepHeader stepId={step.id} title={step.title} detail={step.detail} />
              <div className="contract-draft-step-body">
                {renderStep(
                  step.id,
                  template,
                  baseSettings,
                  settings,
                  derived,
                  errors,
                  updateTemplate,
                  setAttachmentCategory,
                  setMissionEditor,
                  setDeletingMissionRule,
                  () =>
                    setMissionEditor({
                      id: `mission-${Date.now()}`,
                      title: 'ماموریت جدید',
                      coefficient: 1,
                      paymentBase: 'base_salary',
                      active: true,
                    }),
                )}
              </div>
              <footer className="business-payroll-step-footer contract-draft-step-footer">
                <button
                  type="button"
                  className={
                    steps[steps.length - 1].id === step.id
                      ? 'draft-template-flow-action is-primary'
                      : stepState[step.id].dirty
                        ? 'draft-template-flow-action is-save-continue'
                        : 'draft-template-flow-action is-secondary'
                  }
                  onClick={() => continueFromStep(step.id)}
                >
                  {stepState[step.id].dirty ? <Save className="h-4 w-4" aria-hidden /> : null}
                  {steps[steps.length - 1].id === step.id ? 'ذخیره تغییرات' : stepState[step.id].dirty ? 'ذخیره و ادامه' : 'مرحله بعد'}
                </button>
              </footer>
            </section>
          ))}
        </div>
      </main>

      <MissionRuleDialog
        open={Boolean(missionEditor)}
        initialRule={missionEditor}
        monthlyBaseSalary={derived.monthlyBaseSalary}
        grossPay={derived.grossPay}
        onClose={() => setMissionEditor(null)}
        onSubmit={(rule) => {
          if (!template || !stepState) return;
          updateTemplate('mission', (current) => {
            const exists = current.data.mission.rules.some((item) => item.id === rule.id);
            return {
              ...current,
              data: {
                ...current.data,
                mission: {
                  ...current.data.mission,
                  enabled: true,
                  rules: exists ? current.data.mission.rules.map((item) => (item.id === rule.id ? rule : item)) : [...current.data.mission.rules, rule],
                },
              },
            };
          });
          setMissionEditor(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingMissionRule)}
        title="حذف ماموریت"
        description={deletingMissionRule ? `آیا از حذف «${deletingMissionRule.title}» مطمئن هستید؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={() => {
          if (!deletingMissionRule || !template || !stepState) return;
          updateTemplate('mission', (current) => ({
            ...current,
            data: {
              ...current.data,
              mission: {
                ...current.data.mission,
                rules: current.data.mission.rules.filter((item) => item.id !== deletingMissionRule.id),
              },
            },
          }));
          setDeletingMissionRule(null);
        }}
        onCancel={() => setDeletingMissionRule(null)}
      />
      <AttachmentDialog
        category={attachmentCategory}
        selected={attachmentCategory ? template.data.attachments.requiredDocuments[attachmentCategory.key] ?? [] : []}
        onClose={() => setAttachmentCategory(null)}
        onSubmit={(items) => {
          if (!attachmentCategory) return;
          updateTemplate('attachments', (current) => ({
            ...current,
            data: {
              ...current.data,
              attachments: {
                requiredDocuments: {
                  ...current.data.attachments.requiredDocuments,
                  [attachmentCategory.key]: items,
                },
              },
            },
          }));
          setAttachmentCategory(null);
        }}
      />
      <UnsavedChangesDialog
        open={unsavedLeaveGuard.dialogOpen}
        saving={unsavedLeaveGuard.saving}
        onSaveAndLeave={unsavedLeaveGuard.confirmSaveAndLeave}
        onDiscardAndLeave={unsavedLeaveGuard.confirmDiscardAndLeave}
        onCancel={unsavedLeaveGuard.closeDialog}
      />
    </div>
  );
}

function validateStep(step: ContractDraftTemplateStepId, template: ContractDraftTemplate, settings: PayrollSettings) {
  const errors: Record<string, string> = {};
  if (step === 'classification') {
    if (!template.data.classification.contractType) errors.contractType = 'حداقل یک گزینه را انتخاب کنید';
    if (!template.data.classification.contractSubType) errors.contractSubType = 'زیرگروه قرارداد را انتخاب کنید';
    const workLocationCategory = template.data.classification.workLocationCategories[0];
    if (!workLocationCategory || !(WORK_LOCATION_CATEGORIES as readonly string[]).includes(workLocationCategory)) {
      errors.workLocationCategory = 'دسته‌بندی محل انجام کار را انتخاب کنید';
    }
    if (!template.data.classification.workLocationSubCategory) errors.workLocationSubCategory = 'زیرگروه محل انجام کار را انتخاب کنید';
  }
  if (step === 'attendanceBase') {
    if (!Number.isFinite(template.data.attendanceBase.monthlyOvertimeLimitHours) || template.data.attendanceBase.monthlyOvertimeLimitHours <= 0) errors.monthlyOvertimeLimitHours = 'مقدار باید عددی مثبت باشد';
    if (!Number.isFinite(template.data.attendanceBase.monthlyLeaveQuotaHours) || template.data.attendanceBase.monthlyLeaveQuotaHours <= 0) errors.monthlyLeaveQuotaHours = 'مقدار باید عددی مثبت باشد';
  }
  if (step === 'payrollBase') {
    if (!Number.isFinite(template.data.payrollBase.dailyRequiredMinutes) || template.data.payrollBase.dailyRequiredMinutes <= 0) errors.dailyRequiredMinutes = 'مقدار باید عددی مثبت باشد';
    if (!Number.isFinite(template.data.payrollBase.dailyBaseSalary) || template.data.payrollBase.dailyBaseSalary <= 0) errors.dailyBaseSalary = 'مقدار باید عددی مثبت باشد';
    if (template.data.payrollBase.insuranceEnabled) {
      if (!Number.isFinite(template.data.payrollBase.employerInsurancePercent) || template.data.payrollBase.employerInsurancePercent < 0) {
        errors.employerInsurancePercent = 'مقدار باید عددی معتبر باشد';
      }
      if (!Number.isFinite(template.data.payrollBase.employeeInsurancePercent) || template.data.payrollBase.employeeInsurancePercent < 0) {
        errors.employeeInsurancePercent = 'مقدار باید عددی معتبر باشد';
      }
    }
  }
  if (step === 'paymentType' && !template.data.paymentSchedule.type) errors.paymentType = 'حداقل یک گزینه را انتخاب کنید';
  if (step === 'workTimePayRules') return validatePayrollStep('overtime', settings);
  if (step === 'leave') return validatePayrollStep('leave', settings);
  if (step === 'mission') return validatePayrollStep('mission', settings);
  return errors;
}

function countDifferences(template: ContractDraftTemplate, base: PayrollSettings) {
  let count = 0;
  if (template.data.payrollBase.dailyRequiredMinutes !== base.financial.dailyRequiredMinutes) count += 1;
  if (template.data.payrollBase.dailyBaseSalary !== base.financial.dailyBaseSalary) count += 1;
  if (template.data.payrollBase.insuranceEnabled !== (base.deductions.employeeInsurancePercent > 0)) count += 1;
  if (template.data.payrollBase.employerInsurancePercent !== base.deductions.employerInsurancePercent) count += 1;
  if (template.data.payrollBase.employeeInsurancePercent !== base.deductions.employeeInsurancePercent) count += 1;
  if (JSON.stringify(template.data.paymentSchedule) !== JSON.stringify(base.paymentSchedule)) count += 1;
  if (JSON.stringify(template.data.workTimePayRules) !== JSON.stringify(base.workTimePayRules)) count += 1;
  if (JSON.stringify(template.data.leave) !== JSON.stringify(base.leave)) count += 1;
  if (JSON.stringify(template.data.mission) !== JSON.stringify(base.mission)) count += 1;
  BENEFIT_TEMPLATE_FIELDS.forEach(({ key, baseKey }) => {
    if (template.data.benefits[key].amount !== base.benefits[baseKey]) count += 1;
  });
  return count;
}

function renderStep(
  step: ContractDraftTemplateStepId,
  template: ContractDraftTemplate,
  baseSettings: PayrollSettings,
  settings: PayrollSettings,
  derived: ReturnType<typeof calculatePayrollValues>,
  errors: Record<string, string>,
  updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void,
  setAttachmentCategory: (category: typeof DOCUMENT_CATEGORIES[number]) => void,
  onMissionEdit: (rule: MissionRule) => void,
  onMissionDelete: (rule: MissionRule) => void,
  onMissionAdd: () => void,
) {
  switch (step) {
    case 'attendanceBase':
      return <AttendanceBaseStep template={template} baseSettings={baseSettings} errors={errors} updateTemplate={updateTemplate} />;
    case 'classification':
      return <ClassificationStep template={template} errors={errors} updateTemplate={updateTemplate} />;
    case 'payrollBase':
      return <PayrollBaseStep template={template} baseSettings={baseSettings} errors={errors} updateTemplate={updateTemplate} />;
    case 'benefits':
      return <BenefitsTemplateStep template={template} baseSettings={baseSettings} updateTemplate={updateTemplate} />;
    case 'variablePayments':
      return <VariablePaymentsStep template={template} baseSettings={baseSettings} updateTemplate={updateTemplate} />;
    case 'paymentType':
      return (
        <>
          <PaymentScheduleStep
            paymentSchedule={template.data.paymentSchedule}
            basePaymentSchedule={baseSettings.paymentSchedule}
            comparisonMode="tenant"
            comparisonTooltip="در تنظیمات مبنا، نوع پرداخت متفاوت تعریف شده است."
            helperText="روش کلی پرداخت دستمزد را برای این قالب انتخاب کنید."
            onChange={(paymentSchedule) =>
              updateTemplate('paymentType', (current) => ({
                ...current,
                data: {
                  ...current.data,
                  paymentSchedule,
                  paymentType: {
                    type: paymentSchedule.type === 'job_activity'
                      ? 'پرداخت بر اساس نوع شغل و فعالیت'
                      : paymentSchedule.type === 'hybrid_special'
                        ? 'پرداخت ترکیبی و روش‌های خاص'
                        : 'پرداخت بر اساس دوره‌های زمانی',
                  },
                },
              }))
            }
          />
          {errors.paymentType ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" /> {errors.paymentType}</p> : null}
        </>
      );
    case 'workTimePayRules':
      return (
        <WorkTimePayRulesSection
          settings={settings}
          baseSettings={baseSettings}
          derived={derived}
          errors={errors}
          nightWorkTimesReadOnly
          businessSettingsHref={`/business-settings/payroll-attendance/tenant?year=${template.baseSettingsYear}`}
          onChange={(workTimePayRules) =>
            updateTemplate('workTimePayRules', (current) => ({
              ...current,
              data: { ...current.data, workTimePayRules: syncNightWorkTimesFromBase(workTimePayRules, baseSettings) },
            }))
          }
        />
      );
    case 'leave':
      return (
        <LeaveSection
          settings={settings}
          baseSettings={baseSettings}
          errors={errors}
          onLeaveChange={(leave) =>
            updateTemplate('leave', (current) => ({ ...current, data: { ...current.data, leave } }))
          }
        />
      );
    case 'mission':
      return (
        <MissionStep
          mission={template.data.mission}
          baseMission={baseSettings.mission}
          derived={derived}
          comparisonMode="tenant"
          comparisonReferenceWord="مبنا"
          exclusiveLabel="این قالب"
          tag="قالب انتخاب‌شده"
          description="قواعد ماموریت را برای این قالب تنظیم کنید."
          onMissionChange={(mission) =>
            updateTemplate('mission', (current) => ({
              ...current,
              data: { ...current.data, mission: { ...current.data.mission, ...mission } },
            }))
          }
          onEditRule={onMissionEdit}
          onDeleteRule={onMissionDelete}
          onAddRule={onMissionAdd}
        />
      );
    case 'specialCommitments':
      return <SpecialCommitmentsStep template={template} updateTemplate={updateTemplate} />;
    case 'attachments':
      return <AttachmentsStep template={template} updateTemplate={updateTemplate} setAttachmentCategory={setAttachmentCategory} />;
  }
}

function AttendanceBaseStep({
  template,
  baseSettings,
  errors,
  updateTemplate,
}: {
  template: ContractDraftTemplate;
  baseSettings: PayrollSettings;
  errors: Record<string, string>;
  updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void;
}) {
  const baseMonthlyOvertime = baseSettings.workTimePayRules.overtime.dailyLimitHours * 28;
  return (
    <>
      <p className="contract-draft-field-hint">سقف تردد، مرخصی و انتقال را نسبت به مبنا تنظیم کنید.</p>
      <div className="business-payroll-fields three">
        <FieldShell
          label="سقف اضافه‌کاری ماهانه"
          unit="ساعت"
          value={template.data.attendanceBase.monthlyOvertimeLimitHours}
          error={errors.monthlyOvertimeLimitHours}
          difference={compareValues(baseMonthlyOvertime, template.data.attendanceBase.monthlyOvertimeLimitHours, {
            changed: 'متفاوت با مبنا',
            tooltip: `سقف اضافه‌کاری ماهانه در تنظیمات مبنا ${formatFaNumber(baseMonthlyOvertime)} ساعت است.`,
            higher: (value) => `${formatFaNumber(value)} ساعت بیشتر از مبنا`,
            lower: (value) => `${formatFaNumber(value)} ساعت کمتر از مبنا`,
          })}
          onChange={(monthlyOvertimeLimitHours) => updateTemplate('attendanceBase', (current) => ({ ...current, data: { ...current.data, attendanceBase: { ...current.data.attendanceBase, monthlyOvertimeLimitHours } } }))}
        />
        <FieldShell
          label="سهمیه مرخصی ماهانه"
          unit="ساعت"
          value={template.data.attendanceBase.monthlyLeaveQuotaHours}
          error={errors.monthlyLeaveQuotaHours}
          difference={compareValues(baseSettings.leave.monthlyQuotaHours, template.data.attendanceBase.monthlyLeaveQuotaHours, {
            changed: 'متفاوت با مبنا',
            tooltip: `سهمیه مرخصی ماهانه در تنظیمات مبنا ${formatFaNumber(baseSettings.leave.monthlyQuotaHours)} ساعت است.`,
            higher: (value) => `${formatFaNumber(value)} ساعت بیشتر از مبنا`,
            lower: (value) => `${formatFaNumber(value)} ساعت کمتر از مبنا`,
          })}
          onChange={(monthlyLeaveQuotaHours) => updateTemplate('attendanceBase', (current) => ({ ...current, data: { ...current.data, attendanceBase: { ...current.data.attendanceBase, monthlyLeaveQuotaHours } } }))}
        />
        <FieldShell
          label="حداکثر انتقال مرخصی به سال بعد"
          unit="ساعت"
          value={template.data.attendanceBase.annualLeaveTransfer.hours ?? 0}
          difference={(baseSettings.leave.transferPolicy.mode === 'carry_forward' && baseSettings.leave.transferPolicy.limits.annual.enabled) === template.data.attendanceBase.annualLeaveTransfer.enabled
            ? compareValues(baseSettings.leave.transferPolicy.limits.annual.maxHours ?? 0, template.data.attendanceBase.annualLeaveTransfer.hours ?? 0, {
                changed: 'متفاوت با مبنا',
                tooltip: `انتقال سالیانه در تنظیمات مبنا ${baseSettings.leave.transferPolicy.mode === 'carry_forward' && baseSettings.leave.transferPolicy.limits.annual.enabled ? `${formatFaNumber(baseSettings.leave.transferPolicy.limits.annual.maxHours ?? 0)} ساعت` : 'غیرفعال'} است.`,
              })
            : customDifference(template.data.attendanceBase.annualLeaveTransfer.enabled ? 'فعال شده نسبت به مبنا' : 'غیرفعال نسبت به مبنا', 'وضعیت انتقال سالیانه با تنظیمات مبنا متفاوت است.')}
          onChange={(hours) => updateTemplate('attendanceBase', (current) => ({ ...current, data: { ...current.data, attendanceBase: { ...current.data.attendanceBase, annualLeaveTransfer: { enabled: true, hours } } } }))}
        />
      </div>
    </>
  );
}

function PayrollBaseStep({
  template,
  baseSettings,
  errors,
  updateTemplate,
}: {
  template: ContractDraftTemplate;
  baseSettings: PayrollSettings;
  errors: Record<string, string>;
  updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void;
}) {
  return (
    <>
      <p className="contract-draft-field-hint">مزد روز، موظفی و تنظیمات بیمه و مالیات را نسبت به مبنا مشخص کنید.</p>
      <div className="business-payroll-fields two">
        <FieldShell
          label="دقایق موظفی روزانه"
          unit="دقیقه"
          value={template.data.payrollBase.dailyRequiredMinutes}
          error={errors.dailyRequiredMinutes}
          difference={compareValues(baseSettings.financial.dailyRequiredMinutes, template.data.payrollBase.dailyRequiredMinutes, {
            changed: 'متفاوت با مبنا',
            tooltip: `دقایق موظفی روزانه در تنظیمات مبنا ${formatFaNumber(baseSettings.financial.dailyRequiredMinutes)} دقیقه است.`,
            higher: (value) => `${formatFaNumber(value)} دقیقه بیشتر از مبنا`,
            lower: (value) => `${formatFaNumber(value)} دقیقه کمتر از مبنا`,
          })}
          onChange={(dailyRequiredMinutes) => updateTemplate('payrollBase', (current) => ({ ...current, data: { ...current.data, payrollBase: { ...current.data.payrollBase, dailyRequiredMinutes } } }))}
        />
        <FieldShell
          label="حقوق پایه به ازای روز"
          unit="ریال"
          value={template.data.payrollBase.dailyBaseSalary}
          error={errors.dailyBaseSalary}
          difference={compareValues(baseSettings.financial.dailyBaseSalary, template.data.payrollBase.dailyBaseSalary, {
            changed: 'متفاوت با حقوق پایه مبنا',
            tooltip: `حقوق پایه روزانه در تنظیمات مبنا ${money(baseSettings.financial.dailyBaseSalary)} است.`,
          })}
          onChange={(dailyBaseSalary) => updateTemplate('payrollBase', (current) => ({ ...current, data: { ...current.data, payrollBase: { ...current.data.payrollBase, dailyBaseSalary } } }))}
        />
      </div>
      <section className="business-payroll-subcard contract-draft-subsection">
        <div className="business-draft-section-title">
          <h3>بیمه و مالیات</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--legal">آیین‌نامه حقوقی</span>
        </div>
        <div className="business-payroll-fields two">
          <ToggleCard
            title="وضعیت بیمه"
            first="کارگر شامل بیمه می‌شود"
            second="کارگر شامل بیمه نمی‌شود"
            selected={template.data.payrollBase.insuranceEnabled}
            onChange={(insuranceEnabled) => updateTemplate('payrollBase', (current) => ({ ...current, data: { ...current.data, payrollBase: { ...current.data.payrollBase, insuranceEnabled } } }))}
          />
          <ToggleCard
            title="وضعیت مالیات"
            first="مالیات به عهده کارگر می‌باشد"
            second="مالیات به عهده کارفرما می‌باشد"
            selected={template.data.payrollBase.taxPayer === 'employee'}
            onChange={(employeePays) => updateTemplate('payrollBase', (current) => ({ ...current, data: { ...current.data, payrollBase: { ...current.data.payrollBase, taxEnabled: true, taxPayer: employeePays ? 'employee' : 'employer' } } }))}
          />
        </div>
        {template.data.payrollBase.insuranceEnabled ? (
          <div className="business-payroll-fields two contract-draft-insurance-fields">
            <FieldShell
              label="درصد بیمه کارفرما"
              unit="%"
              value={template.data.payrollBase.employerInsurancePercent}
              difference={compareValues(baseSettings.deductions.employerInsurancePercent, template.data.payrollBase.employerInsurancePercent, {
                changed: 'متفاوت با مبنا',
                tooltip: `سهم بیمه کارفرما در تنظیمات مبنا ${formatFaNumber(baseSettings.deductions.employerInsurancePercent)}٪ است.`,
                higher: (value) => `${formatFaNumber(value)}٪ بیشتر از مبنا`,
                lower: (value) => `${formatFaNumber(value)}٪ کمتر از مبنا`,
              })}
              onChange={(employerInsurancePercent) =>
                updateTemplate('payrollBase', (current) => ({
                  ...current,
                  data: {
                    ...current.data,
                    payrollBase: {
                      ...current.data.payrollBase,
                      employerInsurancePercent,
                    },
                  },
                }))
              }
            />
            <FieldShell
              label="درصد بیمه کارگر"
              unit="%"
              value={template.data.payrollBase.employeeInsurancePercent}
              difference={compareValues(baseSettings.deductions.employeeInsurancePercent, template.data.payrollBase.employeeInsurancePercent, {
                changed: 'متفاوت با مبنا',
                tooltip: `سهم بیمه کارگر در تنظیمات مبنا ${formatFaNumber(baseSettings.deductions.employeeInsurancePercent)}٪ است.`,
                higher: (value) => `${formatFaNumber(value)}٪ بیشتر از مبنا`,
                lower: (value) => `${formatFaNumber(value)}٪ کمتر از مبنا`,
              })}
              onChange={(employeeInsurancePercent) =>
                updateTemplate('payrollBase', (current) => ({
                  ...current,
                  data: {
                    ...current.data,
                    payrollBase: {
                      ...current.data.payrollBase,
                      employeeInsurancePercent,
                    },
                  },
                }))
              }
            />
          </div>
        ) : (
          <p className="contract-draft-subcategory-note contract-draft-subcategory-note--muted">
            وقتی بیمه غیرفعال است، سهم‌های بیمه نمایش داده نمی‌شوند.
          </p>
        )}
      </section>
    </>
  );
}

function ClassificationStep({ template, errors, updateTemplate }: { template: ContractDraftTemplate; errors: Record<string, string>; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  const selectedContractType = template.data.classification.contractType;
  const contractConfig = selectedContractType ? CONTRACT_TYPE_SUBCATEGORIES[selectedContractType] : null;
  const selectedContractSubType = template.data.classification.contractSubType;
  const selectedLocationCategory = template.data.classification.workLocationCategories[0] ?? '';
  const selectedLocationSubCategory = template.data.classification.workLocationSubCategory;
  const locationOptions = selectedLocationCategory ? WORK_LOCATION_SUBCATEGORIES[selectedLocationCategory] ?? [] : [];
  const selectedLocationHelper = locationOptions.find((option) => option.label === selectedLocationSubCategory)?.helper;

  return (
    <>
      <section className="business-payroll-subcard contract-draft-subsection contract-draft-intro-card">
        <div className="business-draft-section-title">
          <h3>نوع قرارداد</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
        </div>
        <p className="contract-draft-field-hint">نوع قرارداد مشخص می‌کند که شرایط همکاری کارمند با سازمان چگونه است. این گزینه بر میزان تعهدات، مزایا و شرایط فسخ قرارداد تأثیر می‌گذارد.</p>
        <OptionGrid
          options={[...CONTRACT_TYPES]}
          selected={selectedContractType}
          onChange={(contractType) =>
            updateTemplate('classification', (current) => {
              const config = CONTRACT_TYPE_SUBCATEGORIES[contractType as string];
              return {
                ...current,
                data: {
                  ...current.data,
                  classification: {
                    ...current.data.classification,
                    contractType: contractType as string,
                    contractSubType: config?.options[0] ?? '',
                  },
                },
              };
            })
          }
        />
        {errors.contractType ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.contractType}</p> : null}
        {contractConfig ? (
          <div className="contract-draft-subchoice-panel">
            <p className="contract-draft-subcategory-note">{contractConfig.hint}</p>
            <OptionGrid
              options={contractConfig.options}
              selected={selectedContractSubType}
              onChange={(contractSubType) =>
                updateTemplate('classification', (current) => ({
                  ...current,
                  data: {
                    ...current.data,
                    classification: {
                      ...current.data.classification,
                      contractSubType: contractSubType as string,
                    },
                  },
                }))
              }
            />
            {selectedContractSubType ? <p className="contract-draft-subcategory-note">{selectedContractSubType}</p> : null}
          </div>
        ) : null}
        {errors.contractSubType ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.contractSubType}</p> : null}
      </section>

      <section className="business-payroll-subcard contract-draft-subsection contract-draft-subsection--nested">
        <div className="business-draft-section-title">
          <h3>دسته‌بندی بر اساس محل انجام کار</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
        </div>
        <p className="contract-draft-field-hint">این بخش مشخص می‌کند که کارمند در چه محیطی مشغول به کار است. بسته به ماهیت شغل، محل انجام کار می‌تواند ثابت، متغیر یا وابسته به مشتری باشد.</p>
        <OptionGrid
          options={[...WORK_LOCATION_CATEGORIES]}
          selected={selectedLocationCategory}
          onChange={(workLocationCategory) =>
            updateTemplate('classification', (current) => {
              const options = WORK_LOCATION_SUBCATEGORIES[workLocationCategory as string] ?? [];
              return {
                ...current,
                data: {
                  ...current.data,
                  classification: {
                    ...current.data.classification,
                    workLocationCategories: [workLocationCategory as string],
                    workLocationSubCategory: options[0]?.label ?? '',
                  },
                },
              };
            })
          }
        />
        {errors.workLocationCategory ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.workLocationCategory}</p> : null}
        {selectedLocationCategory ? (
          <div className="contract-draft-subchoice-panel">
            <p className="contract-draft-subcategory-note">{getWorkLocationSubHint(selectedLocationCategory)}</p>
            <OptionGrid
              options={locationOptions.map((option) => option.label)}
              selected={selectedLocationSubCategory}
              onChange={(workLocationSubCategory) =>
                updateTemplate('classification', (current) => ({
                  ...current,
                  data: {
                    ...current.data,
                    classification: {
                      ...current.data.classification,
                      workLocationSubCategory: workLocationSubCategory as string,
                    },
                  },
                }))
              }
            />
            {selectedLocationHelper ? <p className="contract-draft-subcategory-note">{selectedLocationHelper}</p> : null}
          </div>
        ) : null}
        {errors.workLocationSubCategory ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.workLocationSubCategory}</p> : null}
      </section>
    </>
  );
}

function ToggleCard({ title, first, second, selected, onChange }: { title: string; first: string; second: string; selected: boolean; onChange: (selected: boolean) => void }) {
  return (
    <article className="business-payroll-transfer-rule">
      <strong>{title}</strong>
      <div className="business-payroll-toggle">
        <button type="button" className={selected ? 'is-selected' : ''} onClick={() => onChange(true)}>{first}</button>
        <button type="button" className={!selected ? 'is-selected' : ''} onClick={() => onChange(false)}>{second}</button>
      </div>
    </article>
  );
}

function BenefitsTemplateStep({ template, baseSettings, updateTemplate }: { template: ContractDraftTemplate; baseSettings: PayrollSettings; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  const [rulesDialog, setRulesDialog] = useState<{ key: typeof BENEFIT_TEMPLATE_FIELDS[number]['key'] } | null>(null);

  const activeKey = rulesDialog?.key;
  const activeItem = activeKey ? template.data.benefits[activeKey] : null;
  const activeBaseRules =
    activeKey
      ? baseSettings.benefitRules?.[activeKey] ??
        (activeKey === 'seniorityAllowance' ? DEFAULT_SENIORITY_BENEFIT_RULES : DEFAULT_FIXED_BENEFIT_RULES)
      : null;
  const activeLabel = activeKey ? BENEFIT_TEMPLATE_FIELDS.find((f) => f.key === activeKey)?.label : undefined;

  return (
    <>
      <p className="contract-draft-field-hint">مزایای این قالب را نسبت به مبنا فعال یا مبلغ‌دهی کنید.</p>
      <div className="business-payroll-time-rule-cards">
        {BENEFIT_TEMPLATE_FIELDS.map(({ key, label, baseKey, description }) => {
          const item = template.data.benefits[key];
          const baseAmount = baseSettings.benefits[baseKey];
          const baseRules = baseSettings.benefitRules?.[baseKey] ?? DEFAULT_FIXED_BENEFIT_RULES;
          const currentRules = item.calculationRules ?? (key === 'seniorityAllowance' ? DEFAULT_SENIORITY_BENEFIT_RULES : DEFAULT_FIXED_BENEFIT_RULES);
          const amountDiff = !item.enabled
            ? customDifference('غیرفعال نسبت به مبنا', `مبلغ مبنا برای ${label} ${money(baseAmount)} است.`)
            : compareValues(baseAmount, item.amount, { changed: 'متفاوت با مبلغ مبنا', tooltip: `مبلغ مبنا برای ${label} ${money(baseAmount)} است.` });
          return (
            <article key={key} className="business-payroll-transfer-rule">
              <div className="business-payroll-transfer-rule-head">
                <div>
                  <strong>{label}</strong>
                  <small>{description}</small>
                  {differenceBadge(amountDiff)}
                </div>
                <div className="business-payroll-toggle">
                  <button type="button" className={item.enabled ? 'is-selected' : ''} onClick={() => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, enabled: true } } } }))}>فعال</button>
                  <button type="button" className={!item.enabled ? 'is-warning' : ''} onClick={() => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, enabled: false } } } }))}>غیرفعال</button>
                </div>
              </div>
              {item.enabled ? (
                <FieldShell label="مبلغ" unit="ریال" value={item.amount} onChange={(amount) => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, amount } } } }))} />
              ) : null}
              <div className="calc-badges-row">
                <CalculationRulesBadges rules={currentRules} />
                <CalcRulesDiffBadge baseRules={baseRules} currentRules={currentRules} baseLabel="تنظیمات مبنا" />
                <CalcRulesEditButton onClick={() => setRulesDialog({ key })} />
              </div>
            </article>
          );
        })}
      </div>
      <section className="business-payroll-subcard contract-draft-subsection contract-draft-severance-card">
        <h3>مزایای پایان سال و پایان کار</h3>
        <OptionGrid
          options={['پرداخت در پایان همکاری', 'پرداخت دوره‌ای']}
          selected={template.data.benefits.severancePaymentMethod === 'end_of_work' ? 'پرداخت در پایان همکاری' : 'پرداخت دوره‌ای'}
          onChange={(value) => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, severancePaymentMethod: value === 'پرداخت در پایان همکاری' ? 'end_of_work' : 'periodic' } } }))}
        />
        <PanelToggleRow
          label="کلیه حقوق و مزایای پرداخت‌نشده در زمان تسویه‌حساب نهایی پرداخت خواهد شد."
          checked={template.data.benefits.finalSettlementEnabled}
          onChange={(finalSettlementEnabled) =>
            updateTemplate('benefits', (current) => ({
              ...current,
              data: { ...current.data, benefits: { ...current.data.benefits, finalSettlementEnabled } },
            }))
          }
        />
      </section>

      {activeItem && activeKey ? (
        <CalculationRulesDialog
          open={Boolean(rulesDialog)}
          itemTitle={activeLabel}
          rules={activeItem.calculationRules ?? (activeKey === 'seniorityAllowance' ? DEFAULT_SENIORITY_BENEFIT_RULES : DEFAULT_FIXED_BENEFIT_RULES)}
          baseRules={activeBaseRules}
          baseLabel="تنظیمات مبنا"
          effectContext="benefit_or_addition"
          onClose={() => setRulesDialog(null)}
          onSubmit={(next) => {
            updateTemplate('benefits', (current) => ({
              ...current,
              data: {
                ...current.data,
                benefits: {
                  ...current.data.benefits,
                  [activeKey]: { ...current.data.benefits[activeKey], calculationRules: next },
                },
              },
            }));
            setRulesDialog(null);
          }}
        />
      ) : null}
    </>
  );
}

function VariablePaymentsStep({ template, baseSettings, updateTemplate }: { template: ContractDraftTemplate; baseSettings: PayrollSettings; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  const addItem = (type: 'addition' | 'deduction') => {
    const item: VariableTemplateItem = {
      id: `${type}-${Date.now()}`,
      title: VARIABLE_TITLES[type][0],
      type,
      method: 'fixed',
      amount: 0,
      percent: 0,
      base: 'baseSalary',
      calculationRules: type === 'addition' ? { ...DEFAULT_OPTIONAL_ADDITION_RULES } : { ...DEFAULT_OPTIONAL_DEDUCTION_RULES },
    };
    updateTemplate('variablePayments', (current) => ({
      ...current,
      data: {
        ...current.data,
        variablePayments: {
          ...current.data.variablePayments,
          [type === 'addition' ? 'additions' : 'deductions']: [...current.data.variablePayments[type === 'addition' ? 'additions' : 'deductions'], item],
        },
      },
    }));
  };

  const updateItem = (item: VariableTemplateItem) => updateTemplate('variablePayments', (current) => {
    const key = item.type === 'addition' ? 'additions' : 'deductions';
    const items = current.data.variablePayments[key];
    const exists = items.some((entry) => entry.id === item.id);
    return {
      ...current,
      data: {
        ...current.data,
        variablePayments: {
          ...current.data.variablePayments,
          [key]: exists ? items.map((entry) => (entry.id === item.id ? item : entry)) : [...items, item],
        },
      },
    };
  });

  const removeItem = (item: VariableTemplateItem) => updateTemplate('variablePayments', (current) => {
    const key = item.type === 'addition' ? 'additions' : 'deductions';
    return {
      ...current,
      data: {
        ...current.data,
        variablePayments: {
          ...current.data.variablePayments,
          [key]: current.data.variablePayments[key].filter((entry) => entry.id !== item.id),
        },
      },
    };
  });

  return (
    <>
      <p className="contract-draft-field-hint">در صورت نیاز، اضافات و کسورات اختیاری را برای این قالب تعریف کنید.</p>
      <div className="business-payroll-toggle">
        <button type="button" className={template.data.variablePayments.enabled ? 'is-selected' : ''} onClick={() => updateTemplate('variablePayments', (current) => ({ ...current, data: { ...current.data, variablePayments: { ...current.data.variablePayments, enabled: true } } }))}>فعال</button>
        <button type="button" className={!template.data.variablePayments.enabled ? 'is-warning' : ''} onClick={() => updateTemplate('variablePayments', (current) => ({ ...current, data: { ...current.data, variablePayments: { ...current.data.variablePayments, enabled: false } } }))}>غیرفعال</button>
      </div>
      {template.data.variablePayments.enabled ? (
        <div className="business-payroll-time-rule-cards">
          <VariableListDialog
            title="اضافات اختیاری"
            items={template.data.variablePayments.additions}
            baseItems={baseSettings.variableAmounts.additions}
            onAdd={() => addItem('addition')}
            onUpdate={updateItem}
            onRemove={removeItem}
            itemType="addition"
          />
          <VariableListDialog
            title="کسورات اختیاری"
            items={template.data.variablePayments.deductions}
            baseItems={baseSettings.variableAmounts.deductions}
            onAdd={() => addItem('deduction')}
            onUpdate={updateItem}
            onRemove={removeItem}
            itemType="deduction"
          />
        </div>
      ) : null}
    </>
  );
}

function VariableList({ title, items, baseItems, onAdd, onUpdate, onRemove, itemType }: {
  title: string;
  items: VariableTemplateItem[];
  baseItems?: { id: string; calculationRules?: CalculationRules }[];
  onAdd: () => void;
  onUpdate: (item: VariableTemplateItem) => void;
  onRemove: (item: VariableTemplateItem) => void;
  itemType: 'addition' | 'deduction';
}) {
  const [rulesDialog, setRulesDialog] = useState<VariableTemplateItem | null>(null);
  const effectContext: PaymentEffectContext = itemType === 'deduction' ? 'deduction' : 'benefit_or_addition';

  return (
    <section className="business-payroll-subcard">
      <div className="business-payroll-subcard-head">
        <h3>{title}</h3>
        <button type="button" className="business-payroll-outline-button" onClick={onAdd}><Plus className="h-4 w-4" /> افزودن</button>
      </div>
      {items.map((item) => {
        const baseItem = baseItems?.find((b) => b.id === item.id);
        const rules = item.calculationRules ?? (item.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
        return (
          <article key={item.id} className="business-draft-variable-card">
            <input value={item.title} onChange={(event) => onUpdate({ ...item, title: event.target.value })} />
            <select value={item.method} onChange={(event) => onUpdate({ ...item, method: event.target.value as VariableTemplateItem['method'] })}>
              <option value="fixed">مبلغ ثابت</option>
              <option value="percentage">ضریب</option>
            </select>
            <input
              type="text"
              inputMode="numeric"
              value={item.method === 'fixed' ? (Number.isFinite(item.amount) ? String(item.amount) : '') : (Number.isFinite(item.percent) ? String(item.percent) : '')}
              onChange={(event) => {
                const normalized = event.target.value
                  .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
                  .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
                onUpdate(
                  item.method === 'fixed'
                    ? { ...item, amount: normalized ? Number(normalized) : Number.NaN }
                    : { ...item, percent: normalized ? Number(normalized) : Number.NaN },
                );
              }}
            />
            <button type="button" onClick={() => onRemove(item)}><Trash2 className="h-4 w-4" /></button>
            <div className="calc-badges-row" style={{ gridColumn: '1 / -1' }}>
              <CalculationRulesBadges rules={rules} />
              {baseItem?.calculationRules ? (
                <CalcRulesDiffBadge baseRules={baseItem.calculationRules} currentRules={rules} baseLabel="تنظیمات مبنا" />
              ) : null}
              <CalcRulesEditButton onClick={() => setRulesDialog(item)} />
            </div>
          </article>
        );
      })}
      {rulesDialog ? (
        <CalculationRulesDialog
          open={Boolean(rulesDialog)}
          itemTitle={rulesDialog.title}
          rules={rulesDialog.calculationRules ?? (rulesDialog.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES)}
          baseRules={baseItems?.find((b) => b.id === rulesDialog.id)?.calculationRules ?? null}
          baseLabel="تنظیمات مبنا"
          effectContext={effectContext}
          onClose={() => setRulesDialog(null)}
          onSubmit={(next) => {
            onUpdate({ ...rulesDialog, calculationRules: next });
            setRulesDialog(null);
          }}
        />
      ) : null}
    </section>
  );
}

function VariableAmountDialog({
  open,
  initialItem,
  baseItem,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialItem: VariableTemplateItem | null;
  baseItem?: VariableAmount | null;
  onClose: () => void;
  onSubmit: (item: VariableTemplateItem) => void;
}) {
  const [item, setItem] = useState<VariableTemplateItem>(initialItem ?? newVariableTemplateItem('addition'));
  const [error, setError] = useState('');
  const [rulesDialog, setRulesDialog] = useState<VariableTemplateItem | null>(null);
  const isEditing = Boolean(initialItem);
  const methodDifference = baseItem ? customDifference('متفاوت با مبنا', 'روش محاسبه این آیتم با تنظیمات پایه متفاوت است.') : null;
  const amountDifference =
    baseItem && item.method === 'fixed' && baseItem.calculationMethod === 'fixed'
      ? compareValues(baseItem.amount, item.amount, {
          changed: 'متفاوت با مبنا',
          tooltip: `مبلغ مبنا برای این آیتم ${money(baseItem.amount)} است.`,
        })
      : methodDifference;
  const percentDifference =
    baseItem && item.method === 'percentage' && baseItem.calculationMethod === 'percentage'
      ? compareValues(baseItem.percent, item.percent, {
          changed: 'متفاوت با مبنا',
          tooltip: `درصد مبنا برای این آیتم ${decimal(baseItem.percent)}٪ است.`,
        })
      : methodDifference;
  const baseDifference = baseItem && item.method === 'percentage' && baseItem.calculationMethod === 'percentage' && baseItem.calculationBase !== item.base
    ? customDifference('متفاوت با مبنا', 'مبنای محاسبه این آیتم با تنظیمات پایه متفاوت است.')
    : null;
  const rules = item.calculationRules ?? (item.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
  const baseRules = baseItem?.calculationRules ?? null;
  const effectContext: PaymentEffectContext = item.type === 'deduction' ? 'deduction' : 'benefit_or_addition';

  useEffect(() => {
    if (!open) {
      setRulesDialog(null);
      return;
    }
    setItem(initialItem ?? newVariableTemplateItem('addition'));
    setError('');
    setRulesDialog(null);
  }, [initialItem, open]);

  const submit = () => {
    if (!item.title.trim()) return setError('عنوان الزامی است.');
    if (item.method === 'fixed' && (!Number.isFinite(item.amount) || item.amount < 0)) {
      return setError('مبلغ وارد شده معتبر نیست.');
    }
    if (item.method === 'percentage' && (!Number.isFinite(item.percent) || item.percent <= 0 || item.percent > 100)) {
      return setError('درصد باید بیشتر از صفر و حداکثر ۱۰۰ باشد.');
    }
    onSubmit(item);
  };

  return (
    <>
      <PanelFormModal
        open={open}
        title={isEditing ? 'ویرایش مبلغ متغیر' : item.type === 'addition' ? 'افزودن اضافه' : 'افزودن کسورات'}
        lead={
          item.type === 'addition'
            ? 'این مبلغ به حقوق قابل پرداخت اضافه می‌شود.'
            : 'این مبلغ قراردادی از حقوق قابل پرداخت کم می‌شود و مستقل از بیمه و مالیات پایه است.'
        }
        error={error}
        onClose={onClose}
        footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={submit} onCancel={onClose} />}
      >
        <div className="payroll-variable-amount-dialog-form business-payroll-editor variable">
          <VariableAmountTitlePicker
            type={item.type}
            title={item.title}
            onTitleChange={(nextTitle) => setItem((value) => ({ ...value, title: nextTitle }))}
          />

          <div className="business-payroll-toggle">
            <button
              type="button"
              className={item.method === 'fixed' ? 'is-selected' : ''}
              onClick={() => setItem((value) => ({ ...value, method: 'fixed' }))}
            >
              مبلغ ثابت
            </button>
            <button
              type="button"
              className={item.method === 'percentage' ? 'is-selected' : ''}
              onClick={() => setItem((value) => ({ ...value, method: 'percentage' }))}
            >
              ضریب محاسبه
            </button>
          </div>

          {item.method === 'fixed' ? (
            <FieldShell
              label="مبلغ"
              unit="ریال"
              value={item.amount}
              difference={amountDifference}
              onChange={(amount) => setItem((value) => ({ ...value, amount }))}
            />
          ) : (
            <div className="business-payroll-fields two">
              <FieldShell
                label="درصد محاسبه"
                unit="%"
                value={item.percent}
                difference={percentDifference}
                onChange={(percent) => setItem((value) => ({ ...value, percent }))}
              />
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">
                  مبنای پرداخت
                  {differenceBadge(baseDifference)}
                </span>
                <select
                  value={item.base}
                  onChange={(event) => setItem((value) => ({ ...value, base: event.target.value as VariableTemplateItem['base'] }))}
                >
                  <option value="baseSalary">درصدی از حقوق پایه ماهانه</option>
                  <option value="grossPay">درصدی از جمع حقوق دریافتی</option>
                </select>
                <small>حقوق پایه ماهانه برابر حقوق پایه روزانه ضرب در ۳۰ است.</small>
              </label>
            </div>
          )}

          <div className="calc-badges-row">
            <CalculationRulesBadges rules={rules} />
            {baseRules ? <CalcRulesDiffBadge baseRules={baseRules} currentRules={rules} baseLabel="تنظیمات مبنا" /> : null}
            <CalcRulesEditButton onClick={() => setRulesDialog(item)} />
          </div>
        </div>
      </PanelFormModal>

      {rulesDialog ? (
        <CalculationRulesDialog
          open={Boolean(rulesDialog)}
          itemTitle={rulesDialog.title}
          rules={rulesDialog.calculationRules ?? (rulesDialog.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES)}
          baseRules={baseRules}
          baseLabel="تنظیمات مبنا"
          effectContext={effectContext}
          onClose={() => setRulesDialog(null)}
          onSubmit={(next) => {
            setItem((value) => ({ ...value, calculationRules: next }));
            setRulesDialog(null);
          }}
        />
      ) : null}
    </>
  );
}

function VariableListDialog({
  title,
  items,
  baseItems,
  onAdd,
  onUpdate,
  onRemove,
  itemType,
}: {
  title: string;
  items: VariableTemplateItem[];
  baseItems?: VariableAmount[];
  onAdd: () => void;
  onUpdate: (item: VariableTemplateItem) => void;
  onRemove: (item: VariableTemplateItem) => void;
  itemType: 'addition' | 'deduction';
}) {
  const [editor, setEditor] = useState<VariableTemplateItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VariableTemplateItem | null>(null);
  const [rulesDialog, setRulesDialog] = useState<VariableTemplateItem | null>(null);
  const effectContext: PaymentEffectContext = itemType === 'deduction' ? 'deduction' : 'benefit_or_addition';
  void onAdd;

  const saveItem = (item: VariableTemplateItem) => {
    onUpdate(item);
    setEditor(null);
  };

  const saveRules = (item: VariableTemplateItem, rules: CalculationRules) => {
    onUpdate({ ...item, calculationRules: rules });
    setRulesDialog(null);
  };

  const confirmDeleteItem = () => {
    if (!deletingItem) return;
    onRemove(deletingItem);
    setDeletingItem(null);
  };

  return (
    <section className="business-payroll-subcard">
      <div className="business-payroll-subcard-head">
        <h3>{title}</h3>
        <button type="button" className="business-payroll-outline-button" onClick={() => setEditor(newVariableTemplateItem(itemType))}>
          <Plus className="h-4 w-4" /> افزودن
        </button>
      </div>
      <VariableAmountDialog
        open={Boolean(editor)}
        initialItem={editor}
        baseItem={editor ? baseItems?.find((b) => b.id === editor.id) ?? null : null}
        onClose={() => setEditor(null)}
        onSubmit={saveItem}
      />
      <div className="business-payroll-items">
        {items.length ? (
          items.map((item) => {
            const baseItem = baseItems?.find((b) => b.id === item.id);
            const rules = item.calculationRules ?? (item.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
            const valueDifference = getVariableItemDifference(baseItem, item);
            return (
              <article key={item.id} className="business-draft-variable-card">
                <div className="business-payroll-transfer-rule-head">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.type === 'addition' ? 'اضافه اختیاری' : 'کسورات اختیاری'}</small>
                    {differenceBadge(valueDifference)}
                  </div>
                  <div className="business-payroll-item-actions">
                    <button type="button" aria-label="ویرایش آیتم" onClick={() => setEditor(item)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="حذف آیتم" onClick={() => setDeletingItem(item)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p>
                  {item.method === 'fixed'
                    ? 'مبلغ ثابت'
                    : `${formatFaNumber(item.percent)}٪ از ${item.base === 'baseSalary' ? 'حقوق پایه ماهانه' : 'جمع حقوق دریافتی'}`}
                </p>
                <b>{item.method === 'fixed' ? money(item.amount) : `${formatFaNumber(item.percent)}٪`}</b>
                <div className="calc-badges-row" style={{ gridColumn: '1 / -1' }}>
                  <CalculationRulesBadges rules={rules} />
                  {baseItem?.calculationRules ? (
                    <CalcRulesDiffBadge baseRules={baseItem.calculationRules} currentRules={rules} baseLabel="تنظیمات مبنا" />
                  ) : null}
                  <CalcRulesEditButton onClick={() => setRulesDialog(item)} />
                </div>
              </article>
            );
          })
        ) : (
          <p className="business-payroll-empty">هنوز مبلغ متغیری ثبت نشده است.</p>
        )}
      </div>
      {baseItems?.length ? (
        <div className="business-payroll-removed-items">
          {baseItems
            .filter((baseItem) => !items.some((item) => item.id === baseItem.id))
            .map((baseItem) => (
              <span key={`removed-${baseItem.id}`}>
                {differenceBadge(customDifference('حذف از مبنا', `${baseItem.title} در تنظیمات پایه وجود دارد.`))}
              </span>
            ))}
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="حذف مبلغ متغیر"
        description={deletingItem ? `آیا از حذف «${deletingItem.title}» مطمئن هستید؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeletingItem(null)}
      />
      {rulesDialog ? (
        <CalculationRulesDialog
          open={Boolean(rulesDialog)}
          itemTitle={rulesDialog.title}
          rules={rulesDialog.calculationRules ?? (rulesDialog.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES)}
          baseRules={baseItems?.find((b) => b.id === rulesDialog.id)?.calculationRules ?? null}
          baseLabel="تنظیمات مبنا"
          effectContext={effectContext}
          onClose={() => setRulesDialog(null)}
          onSubmit={(next) => saveRules(rulesDialog, next)}
        />
      ) : null}
    </section>
  );
}

function PaymentTypeStep({ template, errors, updateTemplate }: { template: ContractDraftTemplate; errors: Record<string, string>; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  return (
    <>
      <p className="contract-draft-field-hint">روش کلی پرداخت دستمزد را برای متن قرارداد انتخاب کنید.</p>
      <OptionGrid
        options={PAYMENT_TYPES}
        selected={template.data.paymentType.type}
        onChange={(type) => updateTemplate('paymentType', (current) => ({ ...current, data: { ...current.data, paymentType: { type: type as string } } }))}
      />
      {errors.paymentType ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" /> {errors.paymentType}</p> : null}
    </>
  );
}

function SpecialCommitmentsStep({ template, updateTemplate }: { template: ContractDraftTemplate; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  return (
    <>
      <p className="contract-draft-field-hint">بندهای مدنظر را انتخاب کنید؛ توضیح کامل در بالای هر دسته است.</p>
      <div className="business-draft-category-grid">
        {COMMITMENT_CATEGORIES.map((category) => (
          <article key={category.title} className="business-payroll-subcard">
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <div className="business-payroll-chips">
              {category.chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={template.data.specialCommitments.selected.includes(chip) ? 'is-selected' : ''}
                  onClick={() => updateTemplate('specialCommitments', (current) => ({ ...current, data: { ...current.data, specialCommitments: { ...current.data.specialCommitments, selected: toggle(current.data.specialCommitments.selected, chip) } } }))}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="business-draft-card-actions">
              <button type="button" className="business-payroll-outline-button"><FileText className="h-4 w-4" /> نمونه فایل تعهدات</button>
              <button type="button" className="business-payroll-outline-button"><Upload className="h-4 w-4" /> بارگذاری فایل</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function AttachmentsStep({ template, setAttachmentCategory }: { template: ContractDraftTemplate; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void; setAttachmentCategory: (category: typeof DOCUMENT_CATEGORIES[number]) => void }) {
  return (
    <>
      <p className="contract-draft-field-hint">مدارک اجباری هر دسته را مشخص کنید.</p>
      <div className="business-draft-category-grid">
        {DOCUMENT_CATEGORIES.map((category) => {
          const selected = template.data.attachments.requiredDocuments[category.key] ?? [];
          return (
            <article key={category.key} className="business-payroll-subcard">
              <div className="business-payroll-subcard-head">
                <h3>{category.title}</h3>
                <button type="button" className="business-payroll-outline-button" onClick={() => setAttachmentCategory(category)}>
                  <Plus className="h-4 w-4" /> افزودن
                </button>
              </div>
              <div className="business-payroll-condition-chips">
                {selected.length ? selected.map((item) => <span key={item}>{item}</span>) : <span>مدرکی انتخاب نشده است</span>}
              </div>
              <small><Paperclip className="h-3.5 w-3.5" /> این بخش نوع مدرک اجباری را مشخص می‌کند.</small>
            </article>
          );
        })}
      </div>
    </>
  );
}
