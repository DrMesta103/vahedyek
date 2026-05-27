'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Check,
  ChevronLeft,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Gift,
  LineChart,
  LockKeyhole,
  Paperclip,
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
import {
  ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY,
  CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY,
  getTemplateSteps,
  normalizeContractDraftTemplate,
  type ContractDraftTemplate,
  type ContractDraftTemplateStepId,
  type VariableTemplateItem,
} from '../../../lib/contract-draft-templates';
import { formatFaNumber, toPersianDigits } from '../../../lib/format-fa';
import {
  DEFAULT_PAYROLL_SETTINGS,
  getPayrollSettingsStorageKey,
  normalizePayrollSettings,
  calculatePayrollValues,
  compareValues,
  validatePayrollStep,
  type BaseDifference,
  type PayrollSettings,
} from '../../../lib/payroll-business-settings';
import { LeaveSection, WorkTimePayRulesSection } from './PayrollBusinessSettingsFlow';

type StepState = Record<ContractDraftTemplateStepId, { opened: boolean; completed: boolean; dirty: boolean; saved: boolean }>;

const CONTRACT_TYPES = [
  'قراردادهای رسمی و استخدام دائم',
  'قراردادهای موقت و پروژه‌ای',
  'قراردادهای نیمه‌وقت و منعطف',
  'قراردادهای آزمایشی و آموزشی',
  'قراردادهای ویژه و خاص',
  'قراردادهای مشاوره‌ای و تخصصی',
];

const WORK_LOCATION_CATEGORIES = [
  'دسته‌بندی بر اساس نوع حضور فیزیکی',
  'دسته‌بندی بر اساس ارتباط با مشتری و ذینفعان',
  'دسته‌بندی بر اساس نوع محیط کاری',
  'دسته‌بندی بر اساس پویایی و جابجایی شغلی',
];

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

function readTemplates() {
  const raw = window.localStorage.getItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(normalizeContractDraftTemplate).filter(Boolean) as ContractDraftTemplate[] : [];
  } catch {
    window.localStorage.removeItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
    return [];
  }
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

const CONTRACT_STEP_ICONS: Record<ContractDraftTemplateStepId, ReactNode> = {
  attendanceBase: <Clock3 className="h-5 w-5 shrink-0" aria-hidden />,
  classification: <FileText className="h-5 w-5 shrink-0" aria-hidden />,
  payrollBase: <Wallet className="h-5 w-5 shrink-0" aria-hidden />,
  benefits: <Gift className="h-5 w-5 shrink-0" aria-hidden />,
  variablePayments: <LineChart className="h-5 w-5 shrink-0" aria-hidden />,
  paymentType: <CreditCard className="h-5 w-5 shrink-0" aria-hidden />,
  workTimePayRules: <Clock3 className="h-5 w-5 shrink-0" aria-hidden />,
  leave: <Umbrella className="h-5 w-5 shrink-0" aria-hidden />,
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
    workTimePayRules: template.data.workTimePayRules,
    leave: template.data.leave,
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
  return (
    <label className={`business-payroll-field ${error ? 'has-error' : ''}`}>
      <span className="business-payroll-field-label">
        {label}
        {differenceBadge(difference)}
      </span>
      <span className="business-payroll-input">
        <input inputMode="numeric" value={Number.isFinite(value) ? formatFaNumber(value) : ''} onChange={(event) => onChange(Number(event.target.value.replace(/[^\d.]/g, '')))} />
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
    <div className="business-draft-option-grid contract-draft-option-grid">
      {options.map((option) => {
        const isSelected = Array.isArray(selected) ? selected.includes(option) : selected === option;
        return (
          <button
            key={option}
            type="button"
            className={`contract-draft-option-chip${isSelected ? ' is-selected' : ''}`}
            onClick={() => onChange(multi && Array.isArray(selected) ? toggle(selected, option) : option)}
          >
            {multi ? (
              <span className="contract-draft-option-check" aria-hidden>
                {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={2.75} /> : null}
              </span>
            ) : null}
            <span className="contract-draft-option-label">{option}</span>
          </button>
        );
      })}
    </div>
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
      <div className="business-payroll-chips business-draft-document-picker">
        {category?.options.map((option) => (
          <button key={option} type="button" className={draft.includes(option) ? 'is-selected' : ''} onClick={() => setDraft(toggle(draft, option))}>
            {option}
          </button>
        ))}
      </div>
    </PanelFormModal>
  );
}

export function ContractDraftTemplateBuilder() {
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>([]);
  const [template, setTemplate] = useState<ContractDraftTemplate | null>(null);
  const [baseSettings, setBaseSettings] = useState<PayrollSettings>(DEFAULT_PAYROLL_SETTINGS);
  const [stepState, setStepState] = useState<StepState | null>(null);
  const [activeStep, setActiveStep] = useState<ContractDraftTemplateStepId>('classification');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachmentCategory, setAttachmentCategory] = useState<typeof DOCUMENT_CATEGORIES[number] | null>(null);
  const savedTemplateRef = useRef<ContractDraftTemplate | null>(null);

  useEffect(() => {
    const all = readTemplates();
    const activeId = window.localStorage.getItem(ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY);
    const current = all.find((item) => item.id === activeId) ?? all[0] ?? null;
    setTemplates(all);
    setTemplate(current);
    savedTemplateRef.current = current;
    if (!current) return;
    const rawBase = window.localStorage.getItem(getPayrollSettingsStorageKey(current.baseSettingsYear));
    const base = rawBase ? normalizePayrollSettings(JSON.parse(rawBase)) : DEFAULT_PAYROLL_SETTINGS;
    setBaseSettings(base);
    const state = createStepState(current);
    setStepState(state);
    setActiveStep(current.stepsProgress.currentStepId || getTemplateSteps(current.usageType)[0].id);
  }, []);

  const steps = template ? getTemplateSteps(template.usageType) : [];
  const settings = useMemo(() => template ? composeSettings(template, baseSettings) : DEFAULT_PAYROLL_SETTINGS, [template, baseSettings]);
  const derived = useMemo(() => calculatePayrollValues(settings), [settings]);

  const persist = (nextTemplate: ContractDraftTemplate, nextState = stepState, nextStep = activeStep) => {
    const withProgress = nextState ? updateProgress(nextTemplate, nextState, nextStep) : nextTemplate;
    setTemplate(withProgress);
    const nextTemplates = templates.some((item) => item.id === withProgress.id)
      ? templates.map((item) => (item.id === withProgress.id ? withProgress : item))
      : [withProgress, ...templates];
    setTemplates(nextTemplates);
    window.localStorage.setItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));
    window.localStorage.setItem(ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY, withProgress.id);
  };

  const markDirty = (step: ContractDraftTemplateStepId) => {
    if (!stepState || !template) return;
    const next = { ...stepState, [step]: { ...stepState[step], dirty: true, saved: false } };
    setStepState(next);
    persist(template, next, activeStep);
  };

  const updateTemplate = (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => {
    if (!template) return;
    const next = apply(template);
    persist(next);
    markDirty(step);
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
    persist(nextTemplate, nextState, activeStep);
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
    persist(template, nextState, nextStep.id);
    requestAnimationFrame(() => scrollToStep(nextStep.id));
  };

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
  const diffCount = countDifferences(template, baseSettings);
  const commitmentCount = template.data.specialCommitments.selected.length;
  const documentCount = Object.values(template.data.attachments.requiredDocuments).reduce((sum, items) => sum + items.length, 0);

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
                      persist(template, stepState, step.id);
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
          <header className="draft-template-flow-report-header contract-draft-summary-head">
            <h2>خلاصه زنده</h2>
            <p>اطلاعات قالب با تغییر مقادیر به‌روز می‌شود.</p>
          </header>
          <MinimalScroll className="draft-template-flow-report-body business-payroll-summary contract-draft-summary-scroll">
            <div className="contract-draft-summary-grid">
              <article className="contract-draft-summary-card">
                <h3>اطلاعات قالب</h3>
                <dl className="contract-draft-summary-dl">
                  <div>
                    <dt>نام قالب</dt>
                    <dd>{template.name}</dd>
                  </div>
                  <div>
                    <dt>نوع قالب</dt>
                    <dd>{formatUsageTypeLabel(template.usageType)}</dd>
                  </div>
                  <div>
                    <dt>مبنای تنظیمات</dt>
                    <dd>سال {formatFaNumber(template.baseSettingsYear, { useGrouping: false })}</dd>
                  </div>
                </dl>
              </article>
              <article className="contract-draft-summary-card">
                <h3>پیشرفت تکمیل</h3>
                <dl className="contract-draft-summary-dl">
                  <div>
                    <dt>مراحل تکمیل‌شده</dt>
                    <dd>
                      {formatFaNumber(completedCount, { useGrouping: false })} از {formatFaNumber(steps.length, { useGrouping: false })}
                    </dd>
                  </div>
                  <div>
                    <dt>تفاوت با مبنا</dt>
                    <dd className="contract-draft-summary-value">{formatFaNumber(diffCount, { useGrouping: false })}</dd>
                  </div>
                </dl>
              </article>
              <article className="contract-draft-summary-card">
                <h3>تعهدات و مدارک</h3>
                <dl className="contract-draft-summary-dl">
                  <div>
                    <dt>تعهدات انتخاب‌شده</dt>
                    <dd>{formatFaNumber(commitmentCount, { useGrouping: false })}</dd>
                  </div>
                  <div>
                    <dt>مدارک اجباری</dt>
                    <dd>{formatFaNumber(documentCount, { useGrouping: false })}</dd>
                  </div>
                </dl>
              </article>
              <article className="contract-draft-summary-card">
                <h3>تردد و مرخصی</h3>
                <dl className="contract-draft-summary-dl">
                  <div>
                    <dt>سقف اضافه‌کاری ماهانه</dt>
                    <dd className="contract-draft-summary-value">{formatFaNumber(template.data.attendanceBase.monthlyOvertimeLimitHours)} ساعت</dd>
                  </div>
                  <div>
                    <dt>سهمیه مرخصی ماهانه</dt>
                    <dd className="contract-draft-summary-value">{formatFaNumber(template.data.leave.monthlyQuotaHours)} ساعت</dd>
                  </div>
                  <div>
                    <dt>انتقال سالانه</dt>
                    <dd>
                      {template.data.leave.transferLimits.annual.enabled
                        ? `${formatFaNumber(template.data.leave.transferLimits.annual.hours ?? 0)} ساعت`
                        : 'غیرفعال'}
                    </dd>
                  </div>
                </dl>
              </article>
              {template.usageType === 'payroll_attendance' ? (
                <article className="contract-draft-summary-card">
                  <h3>حقوق و مزایا</h3>
                  <dl className="contract-draft-summary-dl">
                    <div>
                      <dt>حقوق پایه روزانه</dt>
                      <dd className="contract-draft-summary-value">{money(template.data.payrollBase.dailyBaseSalary)}</dd>
                    </div>
                    <div>
                      <dt>دقایق موظفی روزانه</dt>
                      <dd className="contract-draft-summary-value">{formatFaNumber(template.data.payrollBase.dailyRequiredMinutes)} دقیقه</dd>
                    </div>
                    <div>
                      <dt>مزایای فعال</dt>
                      <dd className="contract-draft-summary-value">
                        {formatFaNumber(BENEFIT_TEMPLATE_FIELDS.filter(({ key }) => template.data.benefits[key].enabled).length, { useGrouping: false })}
                      </dd>
                    </div>
                  </dl>
                </article>
              ) : null}
            </div>
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
            <Link href="/draft-templates" className="business-payroll-outline-button contract-draft-back-link">
              بازگشت به فهرست قالب‌ها
            </Link>
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
              <div className="contract-draft-step-body">{renderStep(step.id, template, baseSettings, settings, derived, errors, updateTemplate, setAttachmentCategory)}</div>
              <footer className="business-payroll-step-footer contract-draft-step-footer">
                <button type="button" className="draft-template-flow-action is-primary" onClick={() => continueFromStep(step.id)}>
                  {stepState[step.id].dirty ? <Save className="h-4 w-4" aria-hidden /> : null}
                  {steps[steps.length - 1].id === step.id ? 'ذخیره تغییرات' : stepState[step.id].dirty ? 'ذخیره و ادامه' : 'مرحله بعد'}
                </button>
              </footer>
            </section>
          ))}
        </div>
      </main>

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
    </div>
  );
}

function validateStep(step: ContractDraftTemplateStepId, template: ContractDraftTemplate, settings: PayrollSettings) {
  const errors: Record<string, string> = {};
  if (step === 'classification') {
    if (!template.data.classification.contractType) errors.contractType = 'حداقل یک گزینه را انتخاب کنید';
  }
  if (step === 'attendanceBase') {
    if (!Number.isFinite(template.data.attendanceBase.monthlyOvertimeLimitHours) || template.data.attendanceBase.monthlyOvertimeLimitHours <= 0) errors.monthlyOvertimeLimitHours = 'مقدار باید عددی مثبت باشد';
    if (!Number.isFinite(template.data.attendanceBase.monthlyLeaveQuotaHours) || template.data.attendanceBase.monthlyLeaveQuotaHours <= 0) errors.monthlyLeaveQuotaHours = 'مقدار باید عددی مثبت باشد';
  }
  if (step === 'payrollBase') {
    if (!Number.isFinite(template.data.payrollBase.dailyRequiredMinutes) || template.data.payrollBase.dailyRequiredMinutes <= 0) errors.dailyRequiredMinutes = 'مقدار باید عددی مثبت باشد';
    if (!Number.isFinite(template.data.payrollBase.dailyBaseSalary) || template.data.payrollBase.dailyBaseSalary <= 0) errors.dailyBaseSalary = 'مقدار باید عددی مثبت باشد';
  }
  if (step === 'paymentType' && !template.data.paymentType.type) errors.paymentType = 'حداقل یک گزینه را انتخاب کنید';
  if (step === 'workTimePayRules') return validatePayrollStep('overtime', settings);
  if (step === 'leave') return validatePayrollStep('leave', settings);
  return errors;
}

function countDifferences(template: ContractDraftTemplate, base: PayrollSettings) {
  let count = 0;
  if (template.data.payrollBase.dailyRequiredMinutes !== base.financial.dailyRequiredMinutes) count += 1;
  if (template.data.payrollBase.dailyBaseSalary !== base.financial.dailyBaseSalary) count += 1;
  if (JSON.stringify(template.data.workTimePayRules) !== JSON.stringify(base.workTimePayRules)) count += 1;
  if (JSON.stringify(template.data.leave) !== JSON.stringify(base.leave)) count += 1;
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
      return <VariablePaymentsStep template={template} updateTemplate={updateTemplate} />;
    case 'paymentType':
      return <PaymentTypeStep template={template} errors={errors} updateTemplate={updateTemplate} />;
    case 'workTimePayRules':
      return (
        <WorkTimePayRulesSection
          settings={settings}
          baseSettings={baseSettings}
          derived={derived}
          errors={errors}
          onChange={(workTimePayRules) =>
            updateTemplate('workTimePayRules', (current) => ({ ...current, data: { ...current.data, workTimePayRules } }))
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
          difference={baseSettings.leave.transferLimits.annual.enabled === template.data.attendanceBase.annualLeaveTransfer.enabled
            ? compareValues(baseSettings.leave.transferLimits.annual.hours ?? 0, template.data.attendanceBase.annualLeaveTransfer.hours ?? 0, {
                changed: 'متفاوت با مبنا',
                tooltip: `انتقال سالیانه در تنظیمات مبنا ${baseSettings.leave.transferLimits.annual.enabled ? `${formatFaNumber(baseSettings.leave.transferLimits.annual.hours ?? 0)} ساعت` : 'غیرفعال'} است.`,
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
      </section>
    </>
  );
}

function ClassificationStep({ template, errors, updateTemplate }: { template: ContractDraftTemplate; errors: Record<string, string>; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  return (
    <>
      <section className="business-payroll-subcard contract-draft-subsection">
        <div className="business-draft-section-title">
          <h3>نوع قرارداد</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
        </div>
        <p className="contract-draft-field-hint">نوع همکاری و شرایط کلی را برای متن قرارداد مشخص کنید.</p>
        <OptionGrid
          options={CONTRACT_TYPES}
          selected={template.data.classification.contractType}
          onChange={(contractType) => updateTemplate('classification', (current) => ({ ...current, data: { ...current.data, classification: { ...current.data.classification, contractType: contractType as string } } }))}
        />
        {errors.contractType ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.contractType}</p> : null}
      </section>
      <section className="business-payroll-subcard contract-draft-subsection">
        <div className="business-draft-section-title">
          <h3>دسته‌بندی بر اساس محل انجام کار</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
        </div>
        <p className="contract-draft-field-hint">محل یا شیوه انجام کار را برای متن قرارداد مشخص کنید.</p>
        <OptionGrid
          options={WORK_LOCATION_CATEGORIES}
          selected={template.data.classification.workLocationCategories}
          multi
          onChange={(workLocationCategories) => updateTemplate('classification', (current) => ({ ...current, data: { ...current.data, classification: { ...current.data.classification, workLocationCategories: workLocationCategories as string[] } } }))}
        />
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
  return (
    <>
      <p className="contract-draft-field-hint">مزایای این قالب را نسبت به مبنا فعال یا مبلغ‌دهی کنید.</p>
      <div className="business-payroll-time-rule-cards">
        {BENEFIT_TEMPLATE_FIELDS.map(({ key, label, baseKey, description }) => {
          const item = template.data.benefits[key];
          const baseAmount = baseSettings.benefits[baseKey];
          const difference = !item.enabled
            ? customDifference('غیرفعال نسبت به مبنا', `مبلغ مبنا برای ${label} ${money(baseAmount)} است.`)
            : compareValues(baseAmount, item.amount, { changed: 'متفاوت با مبلغ مبنا', tooltip: `مبلغ مبنا برای ${label} ${money(baseAmount)} است.` });
          return (
            <article key={key} className="business-payroll-transfer-rule">
              <div className="business-payroll-transfer-rule-head">
                <div>
                  <strong>{label}</strong>
                  <small>{description}</small>
                  {differenceBadge(difference)}
                </div>
                <div className="business-payroll-toggle">
                  <button type="button" className={item.enabled ? 'is-selected' : ''} onClick={() => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, enabled: true } } } }))}>فعال</button>
                  <button type="button" className={!item.enabled ? 'is-warning' : ''} onClick={() => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, enabled: false } } } }))}>غیرفعال</button>
                </div>
              </div>
              {item.enabled ? (
                <FieldShell label="مبلغ" unit="ریال" value={item.amount} onChange={(amount) => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, [key]: { ...item, amount } } } }))} />
              ) : null}
            </article>
          );
        })}
      </div>
      <section className="business-payroll-subcard">
        <h3>مزایای پایان سال و پایان کار</h3>
        <OptionGrid
          options={['پرداخت در پایان همکاری', 'پرداخت دوره‌ای']}
          selected={template.data.benefits.severancePaymentMethod === 'end_of_work' ? 'پرداخت در پایان همکاری' : 'پرداخت دوره‌ای'}
          onChange={(value) => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, severancePaymentMethod: value === 'پرداخت در پایان همکاری' ? 'end_of_work' : 'periodic' } } }))}
        />
        <label className="business-draft-checkbox">
          <input type="checkbox" checked={template.data.benefits.finalSettlementEnabled} onChange={(event) => updateTemplate('benefits', (current) => ({ ...current, data: { ...current.data, benefits: { ...current.data.benefits, finalSettlementEnabled: event.target.checked } } }))} />
          کلیه حقوق و مزایای پرداخت‌نشده در زمان تسویه‌حساب نهایی پرداخت خواهد شد.
        </label>
      </section>
    </>
  );
}

function VariablePaymentsStep({ template, updateTemplate }: { template: ContractDraftTemplate; updateTemplate: (step: ContractDraftTemplateStepId, apply: (current: ContractDraftTemplate) => ContractDraftTemplate) => void }) {
  const addItem = (type: 'addition' | 'deduction') => {
    const item: VariableTemplateItem = {
      id: `${type}-${Date.now()}`,
      title: type === 'addition' ? 'پاداش ثابت ماهانه' : 'کسورات سازمانی',
      type,
      method: 'fixed',
      amount: 0,
      percent: 0,
      base: 'baseSalary',
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
    return {
      ...current,
      data: {
        ...current.data,
        variablePayments: {
          ...current.data.variablePayments,
          [key]: current.data.variablePayments[key].map((entry) => (entry.id === item.id ? item : entry)),
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
          <VariableList title="اضافات اختیاری" items={template.data.variablePayments.additions} onAdd={() => addItem('addition')} onUpdate={updateItem} onRemove={removeItem} />
          <VariableList title="کسورات اختیاری" items={template.data.variablePayments.deductions} onAdd={() => addItem('deduction')} onUpdate={updateItem} onRemove={removeItem} />
        </div>
      ) : null}
    </>
  );
}

function VariableList({ title, items, onAdd, onUpdate, onRemove }: { title: string; items: VariableTemplateItem[]; onAdd: () => void; onUpdate: (item: VariableTemplateItem) => void; onRemove: (item: VariableTemplateItem) => void }) {
  return (
    <section className="business-payroll-subcard">
      <div className="business-payroll-subcard-head">
        <h3>{title}</h3>
        <button type="button" className="business-payroll-outline-button" onClick={onAdd}><Plus className="h-4 w-4" /> افزودن</button>
      </div>
      {items.map((item) => (
        <article key={item.id} className="business-draft-variable-card">
          <input value={item.title} onChange={(event) => onUpdate({ ...item, title: event.target.value })} />
          <select value={item.method} onChange={(event) => onUpdate({ ...item, method: event.target.value as VariableTemplateItem['method'] })}>
            <option value="fixed">مبلغ ثابت</option>
            <option value="percentage">ضریب</option>
          </select>
          <input inputMode="numeric" value={item.method === 'fixed' ? item.amount : item.percent} onChange={(event) => onUpdate(item.method === 'fixed' ? { ...item, amount: Number(event.target.value) } : { ...item, percent: Number(event.target.value) })} />
          <button type="button" onClick={() => onRemove(item)}><Trash2 className="h-4 w-4" /></button>
        </article>
      ))}
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
