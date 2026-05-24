'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, Clock3, Eye, FileText, Info, Save, ShieldCheck, X } from 'lucide-react';
import { parseDraftTemplateBody } from '../../../lib/draft-template-display';
import { formatFaNumber, toPersianDigits } from '../../../lib/format-fa';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { FixedAdjustmentsSection } from './_components/FixedAdjustmentsSection';
import { parseFixedAdjustments, type FixedAdjustmentItem } from './_components/fixed-adjustment-types';
import { TimeCoefficientsSection, type TimeCoefficientItem } from './_components/TimeCoefficientsSection';
import { NightShiftRulesSection, type NightShiftRules } from './_components/NightShiftRulesSection';
import { LegalLimitsSection, type LegalLimits } from './_components/LegalLimitsSection';

type StepId =
  | 'base'
  | 'attendance'
  | 'payroll'
  | 'components'
  | 'jobBenefits'
  | 'otherBenefits'
  | 'fixedAdjustments'
  | 'timeCoefficients'
  | 'nightShiftRules'
  | 'legalLimits';

type StepState = {
  dirty: boolean;
  saving: boolean;
  savedAt: number | null;
};

type NewDraftTemplateFlowProps = {
  createAction: (formData: FormData) => void | Promise<void>;
  saveStepAction: (formData: FormData) => Promise<{ ok: true; id: string }>;
  initialTemplate?: {
    id: string;
    title: string;
    description: string | null;
    body: string;
    updatedAt: string;
  } | null;
};

type DraftTemplateBody = {
  base?: {
    title?: string;
    description?: string;
    workReference?: string;
  } | null;
  attendance?: {
    monthlyLeaveLimit?: string;
    leaveTransferLimit?: string;
    monthlyOvertimeLimit?: string;
  } | null;
  payroll?: {
    enabled?: boolean;
    type?: string | null;
    entryMode?: string | null;
    includeInsurance?: boolean;
    includeTax?: boolean;
    components?: Record<string, { amount?: string; insurance?: boolean; tax?: boolean; inBase?: boolean } | undefined>;
    jobBenefits?: Record<string, { amount?: string; insurance?: boolean; tax?: boolean; inBase?: boolean } | undefined>;
    otherBenefits?: Record<string, { amount?: string; insurance?: boolean; inBase?: boolean } | undefined>;
    fixedAdjustments?: FixedAdjustmentItem[];
    timeCoefficients?: Record<string, TimeCoefficientItem | undefined>;
    nightShiftRules?: NightShiftRules | null;
    legalLimits?: LegalLimits | null;
    monthlyDutyHours?: string;
    hourlyRateFormula?: string;
  } | null;
};

const baseSteps: Array<{ id: StepId; title: string; detail: string }> = [
  { id: 'base', title: 'اطلاعات پایه', detail: 'تعریف عنوان و توضیحات' },
  { id: 'attendance', title: 'اطلاعات حضور و غیاب', detail: 'تنظیم مرخصی و اضافه‌کاری' },
  { id: 'payroll', title: 'اطلاعات حقوق و دستمزد', detail: 'فعال‌سازی و تنظیم محاسبات' },
];

const componentStep = {
  id: 'components',
  title: 'مولفه‌های اصلی حکمی',
  detail: 'حقوق پایه و مزایای اصلی',
} satisfies { id: StepId; title: string; detail: string };

const jobBenefitsStep = {
  id: 'jobBenefits',
  title: 'مزایای به تبع شغل',
  detail: 'آیتم‌های مرتبط با شغل',
} satisfies { id: StepId; title: string; detail: string };

const otherBenefitsStep = {
  id: 'otherBenefits',
  title: 'سایر مزایا',
  detail: 'مزایای مستقل خارج از گروه شغلی',
} satisfies { id: StepId; title: string; detail: string };

const fixedAdjustmentsStep = {
  id: 'fixedAdjustments',
  title: 'اضافات و کسورات ثابت',
  detail: 'مبلغ ثابت یا ضریب مزد مبنا',
} satisfies { id: StepId; title: string; detail: string };

const timeCoefficientsStep = {
  id: 'timeCoefficients',
  title: 'فوق‌العاده ضرایب زمانی',
  detail: 'ضرایب اضافه‌کاری و شب‌کاری',
} satisfies { id: StepId; title: string; detail: string };

const nightShiftRulesStep = {
  id: 'nightShiftRules',
  title: 'فوق‌العاده نوبت کاری',
  detail: 'درصدها، شیفت‌های نوبت‌کاری',
} satisfies { id: StepId; title: string; detail: string };

const legalLimitsStep = {
  id: 'legalLimits',
  title: 'کسورات قانونی و حدود بیمه / مالیات',
  detail: 'نرخ‌های بیمه و مالیات',
} satisfies { id: StepId; title: string; detail: string };

const defaultStepState: Record<StepId, StepState> = {
  base: { dirty: false, saving: false, savedAt: null },
  attendance: { dirty: false, saving: false, savedAt: null },
  payroll: { dirty: false, saving: false, savedAt: null },
  components: { dirty: false, saving: false, savedAt: null },
  jobBenefits: { dirty: false, saving: false, savedAt: null },
  otherBenefits: { dirty: false, saving: false, savedAt: null },
  fixedAdjustments: { dirty: false, saving: false, savedAt: null },
  timeCoefficients: { dirty: false, saving: false, savedAt: null },
  nightShiftRules: { dirty: false, saving: false, savedAt: null },
  legalLimits: { dirty: false, saving: false, savedAt: null },
};

const payrollComponentItems = [
  {
    id: 'baseSalary',
    title: 'حقوق پایه ماهانه',
    description: 'حقوق ثابت ماهانه که مبنای اصلی محاسبات مزدی است.',
    placeholder: '۰',
  },
  {
    id: 'monthlyBenefitsBase',
    title: 'پایه سنوات ماهانه',
    description: 'پایه سنوات ماهانه برای کارکنان مشمول سنوات.',
    placeholder: '۰',
  },
  {
    id: 'housingAllowance',
    title: 'حق مسکن',
    description: 'حق مسکن مصوب برای کار در صورت شمول.',
    placeholder: '۰',
  },
  {
    id: 'foodAllowance',
    title: 'بن خواربار/کارگری',
    description: 'بن کارگری/کمک هزینه غذا مطابق مصوبات.',
    placeholder: '۰',
  },
  {
    id: 'childAllowance',
    title: 'حق اولاد (هر فرزند)',
    description: 'حق اولاد به ازای هر فرزند واجد شرایط طبق ضوابط قانونی.',
    placeholder: '۰',
  },
  {
    id: 'seniorityAllowance',
    title: 'حق تاهل',
    description: 'مزایای تکمیلی قابل اعمال در سیاست پرداخت.',
    placeholder: '۰',
  },
];

const jobBenefitItems = [
  {
    id: 'attractionAllowance',
    title: 'حق جذب',
    description: 'مزایای جذب/نگهداشت نیروی کار',
    placeholder: '۰',
  },
  {
    id: 'managementAllowance',
    title: 'حق مدیریت',
    description: 'مزایای مرتبط با مسئولیت مدیریت',
    placeholder: '۰',
  },
  {
    id: 'commuteAllowance',
    title: 'ایاب و ذهاب',
    description: 'کمک‌هزینه رفت‌وآمد',
    placeholder: '۰',
  },
  {
    id: 'hardshipAllowance',
    title: 'سختی کار',
    description: 'فوق‌العاده سختی کار',
    placeholder: '۰',
  },
];

const otherBenefitItems = [
  {
    id: 'miscBenefit',
    title: 'سایر مزایا',
    description: 'مزایای خارج از گروه‌های اصلی',
    placeholder: '۰',
  },
];

function parseInitialBody(value: string | null | undefined): DraftTemplateBody {
  return parseDraftTemplateBody(value);
}

function getSavedTimestamp(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function buildInitialStepState(body: DraftTemplateBody, updatedAt: string | null | undefined, hasTemplate: boolean) {
  if (!hasTemplate) return defaultStepState;
  const savedAt = getSavedTimestamp(updatedAt);
  return {
    base: { dirty: false, saving: false, savedAt },
    attendance: { dirty: false, saving: false, savedAt: body.attendance ? savedAt : null },
    payroll: { dirty: false, saving: false, savedAt: body.payroll ? savedAt : null },
    components: { dirty: false, saving: false, savedAt: body.payroll?.components ? savedAt : null },
    jobBenefits: { dirty: false, saving: false, savedAt: body.payroll?.jobBenefits ? savedAt : null },
    otherBenefits: { dirty: false, saving: false, savedAt: body.payroll?.otherBenefits ? savedAt : null },
    fixedAdjustments: {
      dirty: false,
      saving: false,
      savedAt: Array.isArray(body.payroll?.fixedAdjustments) ? savedAt : null,
    },
    timeCoefficients: { dirty: false, saving: false, savedAt: body.payroll?.timeCoefficients ? savedAt : null },
    nightShiftRules: { dirty: false, saving: false, savedAt: body.payroll?.nightShiftRules ? savedAt : null },
    legalLimits: { dirty: false, saving: false, savedAt: body.payroll?.legalLimits ? savedAt : null },
  } satisfies Record<StepId, StepState>;
}

function getInitialActiveStep(body: DraftTemplateBody, hasTemplate: boolean): StepId {
  if (!hasTemplate) return 'base';
  if (!body.attendance) return 'attendance';
  if (!body.payroll) return 'payroll';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.components) return 'components';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.jobBenefits) return 'jobBenefits';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.otherBenefits) return 'otherBenefits';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !Array.isArray(body.payroll.fixedAdjustments))
    return 'fixedAdjustments';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.timeCoefficients) return 'timeCoefficients';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.nightShiftRules) return 'nightShiftRules';
  if (body.payroll?.enabled && body.payroll.entryMode === 'manual' && !body.payroll.legalLimits) return 'legalLimits';
  return 'payroll';
}

function formatStepTime(timestamp: number | null) {
  if (!timestamp) return 'وارد نشده';
  return toPersianDigits(
    new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(timestamp),
  );
}

function normalizeDigitsOnly(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
}

function keepDigitsOnly(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const normalized = normalizeDigitsOnly(input.value);
  if (input.value !== normalized) {
    input.value = normalized;
  }
}

type OtherBenefitAmountFieldProps = {
  name: string;
  defaultValue?: string;
  placeholder: string;
  onDirty: () => void;
};

function OtherBenefitAmountField({ name, defaultValue = '', placeholder, onDirty }: OtherBenefitAmountFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasValue, setHasValue] = useState(Boolean(defaultValue));

  return (
    <div className="draft-template-flow-other-benefit-input">
      <input
        ref={inputRef}
        name={name}
        defaultValue={defaultValue}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        onInput={(event) => {
          keepDigitsOnly(event);
          setHasValue(Boolean(event.currentTarget.value));
          onDirty();
        }}
      />
      {hasValue ? (
        <button
          type="button"
          className="draft-template-flow-other-benefit-clear"
          aria-label="پاک کردن مبلغ"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = '';
            setHasValue(false);
            onDirty();
          }}
        >
          <X className="h-4 w-4" strokeWidth={2.1} />
        </button>
      ) : (
        <ChevronDown className="draft-template-flow-other-benefit-caret h-4 w-4" strokeWidth={2.1} aria-hidden />
      )}
    </div>
  );
}

export function NewDraftTemplateFlow({ createAction, saveStepAction, initialTemplate = null }: NewDraftTemplateFlowProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLElement>(null);
  const initialBody = useMemo(() => parseInitialBody(initialTemplate?.body), [initialTemplate?.body]);
  const initialActiveStep = useMemo(
    () => getInitialActiveStep(initialBody, Boolean(initialTemplate?.id)),
    [initialBody, initialTemplate?.id],
  );
  const [draftId, setDraftId] = useState(initialTemplate?.id ?? '');
  const [stepState, setStepState] = useState(() =>
    buildInitialStepState(initialBody, initialTemplate?.updatedAt, Boolean(initialTemplate?.id)),
  );
  const [activeStep, setActiveStep] = useState<StepId>(initialActiveStep);
  const [saveError, setSaveError] = useState('');
  const [payrollEnabled, setPayrollEnabled] = useState<'unset' | 'yes' | 'no'>(
    initialBody.payroll ? (initialBody.payroll.enabled ? 'yes' : 'no') : 'unset',
  );
  const [payrollEntryMode, setPayrollEntryMode] = useState<'manual' | 'agreement'>(
    initialBody.payroll?.entryMode === 'agreement' ? 'agreement' : 'manual',
  );
  const [includeInsurance, setIncludeInsurance] = useState(initialBody.payroll?.includeInsurance ?? true);
  const [includeTax, setIncludeTax] = useState(initialBody.payroll?.includeTax ?? true);
  const [fixedAdjustments, setFixedAdjustments] = useState<FixedAdjustmentItem[]>(() =>
    parseFixedAdjustments(initialBody.payroll?.fixedAdjustments),
  );
  const showComponentsStep = payrollEnabled === 'yes' && payrollEntryMode === 'manual';
  const steps = useMemo(
    () =>
      showComponentsStep
        ? [
            ...baseSteps,
            componentStep,
            jobBenefitsStep,
            otherBenefitsStep,
            fixedAdjustmentsStep,
            timeCoefficientsStep,
            nightShiftRulesStep,
            legalLimitsStep,
          ]
        : baseSteps,
    [showComponentsStep],
  );
  const savedCount = useMemo(
    () => steps.filter((step) => stepState[step.id].savedAt && !stepState[step.id].dirty).length,
    [stepState, steps],
  );
  const dirtyCount = useMemo(
    () => steps.filter((step) => stepState[step.id].dirty).length,
    [stepState, steps],
  );
  const baseCompleted = Boolean(draftId && stepState.base.savedAt);
  const attendanceCompleted = Boolean(baseCompleted && stepState.attendance.savedAt);
  const payrollCompleted = Boolean(attendanceCompleted && stepState.payroll.savedAt);
  const componentsCompleted = Boolean(payrollCompleted && stepState.components.savedAt);
  const jobBenefitsCompleted = Boolean(componentsCompleted && stepState.jobBenefits.savedAt);
  const otherBenefitsCompleted = Boolean(jobBenefitsCompleted && stepState.otherBenefits.savedAt);
  const fixedAdjustmentsCompleted = Boolean(otherBenefitsCompleted && stepState.fixedAdjustments.savedAt != null);
  const timeCoefficientsCompleted = Boolean(fixedAdjustmentsCompleted && stepState.timeCoefficients.savedAt);
  const nightShiftRulesCompleted = Boolean(timeCoefficientsCompleted && stepState.nightShiftRules.savedAt);
  const legalLimitsCompleted = Boolean(nightShiftRulesCompleted && stepState.legalLimits.savedAt);
  const baseSaved = Boolean(baseCompleted && !stepState.base.dirty);
  const attendanceSaved = Boolean(attendanceCompleted && !stepState.attendance.dirty);
  const payrollSaved = Boolean(payrollCompleted && !stepState.payroll.dirty);
  const componentsSaved = Boolean(componentsCompleted && !stepState.components.dirty);
  const jobBenefitsSaved = Boolean(jobBenefitsCompleted && !stepState.jobBenefits.dirty);
  const otherBenefitsSaved = Boolean(otherBenefitsCompleted && !stepState.otherBenefits.dirty);
  const fixedAdjustmentsSaved = Boolean(fixedAdjustmentsCompleted && !stepState.fixedAdjustments.dirty);
  const timeCoefficientsSaved = Boolean(timeCoefficientsCompleted && !stepState.timeCoefficients.dirty);
  const nightShiftRulesSaved = Boolean(nightShiftRulesCompleted && !stepState.nightShiftRules.dirty);
  const legalLimitsSaved = Boolean(legalLimitsCompleted && !stepState.legalLimits.dirty);
  const finalReady = Boolean(
    baseSaved &&
      attendanceSaved &&
      payrollSaved &&
      (!showComponentsStep ||
        (componentsSaved &&
          jobBenefitsSaved &&
          otherBenefitsSaved &&
          fixedAdjustmentsSaved &&
          timeCoefficientsSaved &&
          nightShiftRulesSaved &&
          legalLimitsSaved)),
  );

  const scrollStepIntoView = (stepId: StepId, behavior: ScrollBehavior = 'smooth') => {
    const container = contentRef.current;
    const target = document.getElementById(stepId);
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = container.scrollTop + targetRect.top - containerRect.top - 18;
    container.scrollTo({ top: Math.max(0, top), behavior });
  };

  useEffect(() => {
    if (!initialTemplate?.id) return;
    setActiveStep(initialActiveStep);
    window.setTimeout(() => scrollStepIntoView(initialActiveStep, 'auto'), 80);
  }, [initialActiveStep, initialTemplate?.id]);

  const markDirty = (stepId: StepId) => {
    setStepState((current) => ({
      ...current,
      [stepId]: current[stepId].dirty ? current[stepId] : { ...current[stepId], dirty: true },
    }));
  };

  const saveStep = async (stepId: StepId) => {
    if (stepId === 'attendance' && !baseCompleted) {
      setSaveError('ابتدا اطلاعات پایه را ذخیره کنید.');
      return;
    }
    if (stepId === 'payroll' && !attendanceCompleted) {
      setSaveError('ابتدا اطلاعات حضور و غیاب را ذخیره کنید.');
      return;
    }
    if (stepId === 'components' && !payrollCompleted) {
      setSaveError('ابتدا روش ورود اطلاعات حقوق و دستمزد را ذخیره کنید.');
      return;
    }
    if (stepId === 'jobBenefits' && !componentsCompleted) {
      setSaveError('ابتدا مولفه‌های اصلی حکمی را ذخیره کنید.');
      return;
    }
    if (stepId === 'otherBenefits' && !jobBenefitsCompleted) {
      setSaveError('ابتدا مزایای به تبع شغل را ذخیره کنید.');
      return;
    }
    if (stepId === 'fixedAdjustments' && !otherBenefitsCompleted) {
      setSaveError('ابتدا سایر مزایا را ذخیره کنید.');
      return;
    }
    if (stepId === 'timeCoefficients' && !fixedAdjustmentsCompleted) {
      setSaveError('ابتدا اضافات و کسورات ثابت را ذخیره کنید.');
      return;
    }
    if (stepId === 'nightShiftRules' && !timeCoefficientsCompleted) {
      setSaveError('ابتدا ضرایب زمانی را ذخیره کنید.');
      return;
    }
    if (stepId === 'legalLimits' && !nightShiftRulesCompleted) {
      setSaveError('ابتدا فوق‌العاده نوبت کاری را ذخیره کنید.');
      return;
    }
    if (stepId === 'payroll' && payrollEnabled === 'unset') {
      setSaveError('وضعیت محاسبات حقوق و دستمزد را مشخص کنید.');
      return;
    }

    setStepState((current) => ({ ...current, [stepId]: { ...current[stepId], saving: true } }));
    setSaveError('');
    try {
      const form = document.getElementById('draft-template-create-form') as HTMLFormElement | null;
      if (!form) throw new Error('فرم قالب پیدا نشد.');
      const formData = new FormData(form);
      formData.set('step', stepId);
      if (draftId) formData.set('id', draftId);
      const result = await saveStepAction(formData);
      const wasNewDraft = !draftId;
      setDraftId(result.id);
      if (wasNewDraft) {
        router.replace(`/draft-templates/new?id=${encodeURIComponent(result.id)}`, { scroll: false });
      }
      setStepState((current) => ({ ...current, [stepId]: { dirty: false, saving: false, savedAt: Date.now() } }));
      if (stepId === 'base') {
        setActiveStep('attendance');
        window.setTimeout(() => scrollStepIntoView('attendance'), 80);
      }
      if (stepId === 'attendance') {
        setActiveStep('payroll');
        window.setTimeout(() => scrollStepIntoView('payroll'), 80);
      }
      if (stepId === 'payroll' && payrollEnabled === 'yes' && payrollEntryMode === 'manual') {
        setActiveStep('components');
        window.setTimeout(() => scrollStepIntoView('components'), 80);
      }
      if (stepId === 'components') {
        setActiveStep('jobBenefits');
        window.setTimeout(() => scrollStepIntoView('jobBenefits'), 80);
      }
      if (stepId === 'jobBenefits') {
        setActiveStep('otherBenefits');
        window.setTimeout(() => scrollStepIntoView('otherBenefits'), 80);
      }
      if (stepId === 'otherBenefits') {
        setActiveStep('fixedAdjustments');
        window.setTimeout(() => scrollStepIntoView('fixedAdjustments'), 80);
      }
      if (stepId === 'fixedAdjustments') {
        setActiveStep('timeCoefficients');
        window.setTimeout(() => scrollStepIntoView('timeCoefficients'), 80);
      }
      if (stepId === 'timeCoefficients') {
        setActiveStep('nightShiftRules');
        window.setTimeout(() => scrollStepIntoView('nightShiftRules'), 80);
      }
      if (stepId === 'nightShiftRules') {
        setActiveStep('legalLimits');
        window.setTimeout(() => scrollStepIntoView('legalLimits'), 80);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'ذخیره مرحله انجام نشد.');
      setStepState((current) => ({ ...current, [stepId]: { ...current[stepId], saving: false } }));
    }
  };

  const scrollToStep = (stepId: StepId) => {
    setActiveStep(stepId);
    if (stepId === 'attendance' && !baseCompleted) return;
    if (stepId === 'payroll' && !attendanceCompleted) return;
    if (stepId === 'components' && !payrollCompleted) return;
    if (stepId === 'jobBenefits' && !componentsCompleted) return;
    if (stepId === 'otherBenefits' && !jobBenefitsCompleted) return;
    if (stepId === 'fixedAdjustments' && !otherBenefitsCompleted) return;
    if (stepId === 'timeCoefficients' && !fixedAdjustmentsCompleted) return;
    if (stepId === 'nightShiftRules' && !timeCoefficientsCompleted) return;
    if (stepId === 'legalLimits' && !nightShiftRulesCompleted) return;
    scrollStepIntoView(stepId);
  };

  return (
    <div className="draft-template-flow-page" dir="rtl" lang="fa">
      <aside className="draft-template-flow-sidebar draft-template-flow-sidebar-right" aria-label="مواد قالب">
        <div className="draft-template-flow-sidebar-panel">
          <header className="draft-template-flow-sidebar-header">
            <h2>مواد قالب</h2>
            <p>بخش‌های پیش‌نویس قرارداد</p>
          </header>

          <MinimalScroll className="draft-template-flow-nav-list" aria-label="مراحل قالب">
            {steps.map((step, index) => {
              const state = stepState[step.id];
              const locked =
                (step.id === 'attendance' && !baseCompleted) ||
                (step.id === 'payroll' && !attendanceCompleted) ||
                (step.id === 'components' && !payrollCompleted) ||
                (step.id === 'jobBenefits' && !componentsCompleted) ||
                (step.id === 'otherBenefits' && !jobBenefitsCompleted) ||
                (step.id === 'fixedAdjustments' && !otherBenefitsCompleted) ||
                (step.id === 'timeCoefficients' && !fixedAdjustmentsCompleted) ||
                (step.id === 'nightShiftRules' && !timeCoefficientsCompleted) ||
                (step.id === 'legalLimits' && !nightShiftRulesCompleted);
              return (
                <div key={step.id} className={`draft-template-flow-nav-item ${activeStep === step.id ? 'is-active' : ''} ${state.dirty ? 'is-dirty' : ''} ${locked ? 'is-locked' : ''}`}>
                  <button type="button" className="draft-template-flow-nav-main" disabled={locked} onClick={() => scrollToStep(step.id)}>
                    <span className="draft-template-flow-nav-number">{formatFaNumber(index + 1, { useGrouping: false })}</span>
                    <span className="draft-template-flow-nav-copy">
                      <strong>{step.title}</strong>
                      <small>{locked ? 'پس از ذخیره مرحله قبل' : state.dirty ? 'تغییرات ذخیره نشده' : formatStepTime(state.savedAt)}</small>
                    </span>
                  </button>
                  {state.dirty && !locked ? (
                    <button type="button" className="draft-template-flow-nav-save" disabled={state.saving} onClick={() => saveStep(step.id)}>
                      {state.saving ? '...' : 'ذخیره'}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </MinimalScroll>

          <div className="draft-template-flow-sidebar-footer">
            <button type="button" className="draft-template-flow-action is-secondary">
              <Eye className="h-4 w-4" strokeWidth={2.1} />
              پیش‌نمایش
            </button>
            <button type="button" disabled={!finalReady} onClick={() => router.push('/draft-templates')} className="draft-template-flow-action is-primary">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
              ثبت قالب پیش‌نویس
            </button>
          </div>
        </div>
      </aside>

      <aside className="draft-template-flow-report" aria-label="گزارش قالب">
        <div className="draft-template-flow-report-panel">
          <header className="draft-template-flow-report-header">
            <div className="draft-template-flow-report-meta">
              <span>وضعیت</span>
              <strong>پیش‌نویس</strong>
            </div>
            <h2>گزارش زنده قالب</h2>
            <p>خلاصه تنظیمات پایه، حضور و غیاب و وضعیت تکمیل قالب.</p>
          </header>

          <MinimalScroll className="draft-template-flow-report-body">
            <div className="draft-template-flow-report-card">
              <span>نسخه قالب</span>
              <strong>{formatFaNumber(1, { useGrouping: false })}</strong>
            </div>
            <div className="draft-template-flow-report-grid">
              <div>
                <span>استپ‌ها</span>
                <strong>{formatFaNumber(steps.length, { useGrouping: false })}</strong>
              </div>
              <div>
                <span>ذخیره‌شده</span>
                <strong>{formatFaNumber(savedCount, { useGrouping: false })}</strong>
              </div>
            </div>
            <div className="draft-template-flow-report-card">
              <div className="draft-template-flow-report-card-head">
                <span>پراکندگی اطلاعات</span>
                <strong>{dirtyCount ? `${formatFaNumber(dirtyCount, { useGrouping: false })} تغییر` : 'شروع'}</strong>
              </div>
              <div className="draft-template-flow-ring" aria-hidden>
                <div>
                  <strong>{formatFaNumber(steps.length, { useGrouping: false })}</strong>
                  <span>بخش</span>
                </div>
              </div>
            </div>
            <div className="draft-template-flow-report-card">
              <div className="draft-template-flow-report-card-head">
                <span>موارد ثبت‌شده</span>
                <strong>{savedCount ? `${formatFaNumber(savedCount, { useGrouping: false })} بخش` : 'بدون داده'}</strong>
              </div>
              <p className="draft-template-flow-report-empty">بعد از ذخیره اطلاعات، خلاصه مقادیر قالب اینجا کامل می‌شود.</p>
            </div>
          </MinimalScroll>
        </div>
      </aside>

      <main ref={contentRef} className="draft-template-flow-content">
        <header className="draft-template-flow-page-header">
          <nav className="draft-template-flow-breadcrumb" aria-label="مسیر صفحه">
            <Link href="/">دسترنج</Link>
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.1} />
            <Link href="/draft-templates">قالب‌های پیش‌نویس</Link>
          </nav>
          <h1>ویرایش قالب پیش‌نویس قرارداد</h1>
          <p>تعریف قالب و مواد پایه برای قراردادهای منابع انسانی.</p>
        </header>

        <form id="draft-template-create-form" action={createAction} className="draft-template-flow-form">
          <input type="hidden" name="category" value="hr" />
          <input type="hidden" name="version" value="1" />
          <input type="hidden" name="isActive" value="on" />
          <input type="hidden" name="body" value="draft-template-flow-v1" />
          <input type="hidden" name="id" value={draftId} />
          <input type="hidden" name="payrollEnabled" value={payrollEnabled} />
          <input type="hidden" name="fixedAdjustmentsJson" value={JSON.stringify(fixedAdjustments)} readOnly />

          {saveError ? <div className="draft-template-flow-error">{saveError}</div> : null}

          <section id="base" className="draft-template-flow-section" onFocus={() => setActiveStep('base')}>
            <header className="draft-template-flow-section-head">
              <div>
                <h2>اطلاعات پایه</h2>
                <p>تعریف عنوان و توضیحات</p>
              </div>
            </header>

            <div className="draft-template-flow-field">
              <label htmlFor="draft-template-title">عنوان</label>
              <input
                id="draft-template-title"
                name="title"
                defaultValue={initialBody.base?.title ?? initialTemplate?.title ?? ''}
                placeholder="عنوان قالب را وارد کنید"
                onChange={() => markDirty('base')}
              />
              <p>عنوان قالب برای شناسایی نسخه پیش‌نویس قرارداد در سیستم استفاده می‌شود.</p>
            </div>

            <div className="draft-template-flow-field">
              <label htmlFor="draft-template-description">توضیحات</label>
              <textarea id="draft-template-description" name="description" rows={4} defaultValue={initialBody.base?.description ?? initialTemplate?.description ?? ''} onChange={() => markDirty('base')} />
              <p>توضیحات تکمیلی درباره کاربرد قالب ثبت آن اختیاری است.</p>
            </div>

            <div className="draft-template-flow-field">
              <label htmlFor="draft-template-work-reference">مرجع اداره کار</label>
              <select id="draft-template-work-reference" name="workReference" defaultValue={initialBody.base?.workReference ?? 'none'} onChange={() => markDirty('base')}>
                <option value="none">عدم استفاده از مرجع اداره کار</option>
                <option value="labor-law">استفاده از مقادیر پایه اداره کار</option>
              </select>
              <p>با انتخاب مرجع، مقادیر پایه اداره کار برای مزایا، بیمه، مالیات و بخش‌های مرتبط به صورت خودکار در فرم قرار می‌گیرند.</p>
            </div>

            <div className="draft-template-flow-note">
              <Info className="h-4 w-4" strokeWidth={2.1} />
              برای این قالب از مقادیر مرجع اداره کار استفاده نمی‌شود.
            </div>

            <div className="draft-template-flow-section-footer">
              <button
                type="button"
                className={`draft-template-flow-section-save ${stepState.base.dirty ? 'is-dirty' : 'is-saved'}`}
                disabled={!stepState.base.dirty || stepState.base.saving}
                onClick={() => saveStep('base')}
              >
                <Save className="h-4 w-4" strokeWidth={2.1} />
                {stepState.base.saving ? 'در حال ذخیره...' : stepState.base.dirty ? 'ذخیره تغییرات' : 'ذخیره شده'}
              </button>
            </div>
          </section>

          {baseCompleted ? (
          <section id="attendance" className="draft-template-flow-section" onFocus={() => setActiveStep('attendance')}>
            <header className="draft-template-flow-section-head">
              <div>
                <h2>اطلاعات حضور و غیاب</h2>
                <p>تنظیم مرخصی و اضافه‌کاری</p>
              </div>
            </header>

            <div className="draft-template-flow-attendance-grid">
              <div className="draft-template-flow-field">
                <label htmlFor="monthly-leave-limit">سقف مرخصی ماهیانه</label>
                <div className="draft-template-flow-input-icon">
                  <Clock3 className="h-4 w-4" strokeWidth={2.1} />
                  <input id="monthly-leave-limit" name="monthlyLeaveLimit" inputMode="numeric" pattern="[0-9]*" defaultValue={initialBody.attendance?.monthlyLeaveLimit ?? ''} onInput={keepDigitsOnly} onChange={() => markDirty('attendance')} />
                </div>
                <p>سقف مرخصی استحقاقی قابل استفاده در هر ماه برای این قالب قرارداد.</p>
              </div>

              <div className="draft-template-flow-field">
                <label htmlFor="leave-transfer-limit">حداکثر انتقال مرخصی به سال بعد</label>
                <div className="draft-template-flow-input-icon">
                  <Clock3 className="h-4 w-4" strokeWidth={2.1} />
                  <input id="leave-transfer-limit" name="leaveTransferLimit" inputMode="numeric" pattern="[0-9]*" defaultValue={initialBody.attendance?.leaveTransferLimit ?? ''} onInput={keepDigitsOnly} onChange={() => markDirty('attendance')} />
                </div>
                <p>حداکثر مانده مرخصی که طبق سیاست شرکت/قوانین داخلی به سال بعد منتقل می‌شود.</p>
              </div>

              <div className="draft-template-flow-field">
                <label htmlFor="monthly-overtime-limit">سقف ساعت اضافه‌کاری ماهانه</label>
                <div className="draft-template-flow-input-icon">
                  <Clock3 className="h-4 w-4" strokeWidth={2.1} />
                  <input id="monthly-overtime-limit" name="monthlyOvertimeLimit" inputMode="numeric" pattern="[0-9]*" defaultValue={initialBody.attendance?.monthlyOvertimeLimit ?? ''} onInput={keepDigitsOnly} onChange={() => markDirty('attendance')} />
                </div>
                <p>حداکثر ساعت اضافه‌کاری مجاز ماهانه برای جلوگیری از ثبت مازاد غیرمجاز.</p>
              </div>
            </div>

            <div className="draft-template-flow-section-footer">
              <button
                type="button"
                className={`draft-template-flow-section-save ${stepState.attendance.dirty ? 'is-dirty' : 'is-saved'}`}
                disabled={!stepState.attendance.dirty || stepState.attendance.saving}
                onClick={() => saveStep('attendance')}
              >
                <Save className="h-4 w-4" strokeWidth={2.1} />
                {stepState.attendance.saving ? 'در حال ذخیره...' : stepState.attendance.dirty ? 'ذخیره تغییرات' : 'ذخیره شده'}
              </button>
            </div>
          </section>
          ) : null}

          {attendanceCompleted ? (
            <section id="payroll" className="draft-template-flow-section" onFocus={() => setActiveStep('payroll')}>
              <header className="draft-template-flow-section-head">
                <div>
                  <h2>روش ورود اطلاعات حقوق و دستمزد</h2>
                  <p>انتخاب بخش دستی یا حقوق توافقی</p>
                </div>
              </header>

              <div className="draft-template-flow-payroll-switch">
                <div>
                  <strong>آیا این قالب شامل محاسبات حقوق و دستمزد باشد؟</strong>
                  <span>اگر غیرفعال باشد، بعد از ذخیره همین مرحله پیش‌نویس آماده ثبت نهایی است.</span>
                </div>
                <div className="draft-template-flow-payroll-switch-actions">
                  <button
                    type="button"
                    className={payrollEnabled === 'yes' ? 'is-selected' : ''}
                    onClick={() => {
                      setPayrollEnabled('yes');
                      markDirty('payroll');
                    }}
                  >
                    فعال
                  </button>
                  <button
                    type="button"
                    className={payrollEnabled === 'no' ? 'is-selected' : ''}
                    onClick={() => {
                      setPayrollEnabled('no');
                      markDirty('payroll');
                    }}
                  >
                    غیرفعال
                  </button>
                </div>
              </div>

              {payrollEnabled === 'yes' ? (
                <>
                  <div className="draft-template-flow-payroll-types">
                    <label className="is-active">
                      <input type="radio" name="payrollType" value="monthly_fixed" defaultChecked onChange={() => markDirty('payroll')} />
                      <strong>ثابت ماهیانه</strong>
                      <span>پرداخت ثابت ماهانه با مزد مبنا و مزایا</span>
                    </label>
                    <label className="is-disabled">
                      <input type="radio" name="payrollType" value="daily" disabled />
                      <em>در حال توسعه</em>
                      <strong>روز‌مزد</strong>
                      <span>پرداخت بر مبنای روزهای کارکرد</span>
                    </label>
                    <label className="is-disabled">
                      <input type="radio" name="payrollType" value="hourly" disabled />
                      <em>در حال توسعه</em>
                      <strong>ساعتی</strong>
                      <span>پرداخت بر مبنای ساعات کارکرد</span>
                    </label>
                    <label className="is-disabled">
                      <input type="radio" name="payrollType" value="project" disabled />
                      <em>در حال توسعه</em>
                      <strong>پروژه‌ای</strong>
                      <span>پرداخت توافقی بر اساس پروژه</span>
                    </label>
                    <label className="is-disabled">
                      <input type="radio" name="payrollType" value="consulting" disabled />
                      <em>در حال توسعه</em>
                      <strong>مشاوره‌ای</strong>
                      <span>پرداخت بر اساس قرارداد مشاوره</span>
                    </label>
                  </div>

                  <div className="draft-template-flow-payroll-mode">
                    <label className={payrollEntryMode === 'manual' ? 'is-active' : ''}>
                      <input
                        type="radio"
                        name="payrollEntryMode"
                        value="manual"
                        defaultChecked={payrollEntryMode === 'manual'}
                        onChange={() => {
                          setPayrollEntryMode('manual');
                          markDirty('payroll');
                        }}
                      />
                      <strong>ورود دستی همه اطلاعات</strong>
                      <span>تمام بخش‌ها قابل ویرایش هستند.</span>
                    </label>
                    <label className={payrollEntryMode === 'agreement' ? 'is-active' : ''}>
                      <input
                        type="radio"
                        name="payrollEntryMode"
                        value="agreement"
                        defaultChecked={payrollEntryMode === 'agreement'}
                        onChange={() => {
                          setPayrollEntryMode('agreement');
                          markDirty('payroll');
                        }}
                      />
                      <strong>تعیین حقوق توافقی</strong>
                      <span>فقط گزارش نمایش داده می‌شود.</span>
                    </label>
                  </div>

                  <div className="draft-template-flow-payroll-legal">
                    <div>
                      <h3>انتخاب پرداخت‌های قانونی برای این قالب</h3>
                      <p>وضعیت اعمال بیمه در محاسبات حقوقی.</p>
                    </div>
                    <div className="draft-template-flow-legal-pills">
                      <label className={includeInsurance ? 'is-selected' : ''}>
                        <input
                          type="checkbox"
                          name="includeInsurance"
                          checked={includeInsurance}
                          onChange={(event) => {
                            setIncludeInsurance(event.currentTarget.checked);
                            markDirty('payroll');
                          }}
                        />
                        <span aria-hidden>{includeInsurance ? '✓' : ''}</span>
                        مشمول بیمه
                      </label>
                      <label className={includeTax ? 'is-selected' : ''}>
                        <input
                          type="checkbox"
                          name="includeTax"
                          checked={includeTax}
                          onChange={(event) => {
                            setIncludeTax(event.currentTarget.checked);
                            markDirty('payroll');
                          }}
                        />
                        <span aria-hidden>{includeTax ? '✓' : ''}</span>
                        مشمول مالیات
                      </label>
                    </div>
                  </div>

                  {payrollEntryMode === 'manual' ? (
                    <>
                      <div className="draft-template-flow-field">
                        <label htmlFor="monthly-duty-hours">ساعت موظفی در ماه (برای محاسبه نرخ ساعتی)</label>
                        <div className="draft-template-flow-input-icon">
                          <Clock3 className="h-4 w-4" strokeWidth={2.1} />
                          <input
                            id="monthly-duty-hours"
                            name="monthlyDutyHours"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            defaultValue={initialBody.payroll?.monthlyDutyHours ?? ''}
                            onInput={keepDigitsOnly}
                            onChange={() => markDirty('payroll')}
                          />
                        </div>
                        <p>ساعت موظفی ماهانه برای محاسبه نرخ ساعتی و تبدیل‌های روزانه/هفتگی.</p>
                      </div>

                      <div className="draft-template-flow-field">
                        <label htmlFor="hourly-rate-formula">نرخ ساعتی (مزد مبنا ماهانه ÷ ساعت موظفی)</label>
                        <input
                          id="hourly-rate-formula"
                          name="hourlyRateFormula"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="ریال"
                          defaultValue={initialBody.payroll?.hourlyRateFormula ?? ''}
                          onInput={keepDigitsOnly}
                          onChange={() => markDirty('payroll')}
                        />
                        <p>فرمول پیش‌فرض نرخ ساعتی است؛ در صورت نیاز می‌توانید مقدار دستی ثبت کنید.</p>
                      </div>
                    </>
                  ) : null}

                  {payrollEntryMode === 'agreement' ? (
                    <div className="draft-template-flow-note">
                      <Info className="h-4 w-4" strokeWidth={2.1} />
                      در حالت حقوق توافقی، مولفه‌های دستی نمایش داده نمی‌شوند و مبلغ توافقی در مراحل بعدی ثبت می‌شود.
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className="draft-template-flow-section-footer">
                <button
                  type="button"
                  className={`draft-template-flow-section-save ${stepState.payroll.dirty ? 'is-dirty' : 'is-saved'}`}
                  disabled={!stepState.payroll.dirty || stepState.payroll.saving}
                  onClick={() => saveStep('payroll')}
                >
                  <Save className="h-4 w-4" strokeWidth={2.1} />
                  {stepState.payroll.saving ? 'در حال ذخیره...' : stepState.payroll.dirty ? 'ذخیره تغییرات' : 'ذخیره شده'}
                </button>
              </div>
            </section>
          ) : null}

          {payrollCompleted && showComponentsStep ? (
            <section id="components" className="draft-template-flow-section" onFocus={() => setActiveStep('components')}>
              <header className="draft-template-flow-section-head">
                <div>
                  <h2>مولفه‌های اصلی حکمی</h2>
                  <p>حقوق پایه و مزایای اصلی</p>
                </div>
              </header>

              <section className="draft-template-flow-payroll-components">
                <header>
                  <h3>مولفه‌های اصلی حکمی</h3>
                  <p>حقوق پایه و مزایای اصلی</p>
                </header>

                {payrollComponentItems.map((item) => {
                  const component = initialBody.payroll?.components?.[item.id];
                  return (
                    <div key={item.id} className="draft-template-flow-payroll-component-row">
                      <div className="draft-template-flow-payroll-component-copy">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <div className="draft-template-flow-payroll-component-pills">
                          <label>
                            <input type="checkbox" name={`${item.id}Insurance`} defaultChecked={component?.insurance ?? true} onChange={() => markDirty('components')} />
                            مشمول بیمه
                          </label>
                          <label>
                            <input type="checkbox" name={`${item.id}Tax`} defaultChecked={component?.tax ?? true} onChange={() => markDirty('components')} />
                            مشمول مالیات
                          </label>
                          <label>
                            <input type="checkbox" name={`${item.id}InBase`} defaultChecked={component?.inBase ?? false} onChange={() => markDirty('components')} />
                            قابل احتساب در مزد مبنا
                          </label>
                        </div>
                      </div>
                      <input name={item.id} inputMode="numeric" pattern="[0-9]*" placeholder={item.placeholder} defaultValue={component?.amount ?? ''} onInput={keepDigitsOnly} onChange={() => markDirty('components')} />
                    </div>
                  );
                })}
              </section>

              <div className="draft-template-flow-section-footer">
                <button
                  type="button"
                  className={`draft-template-flow-section-save ${stepState.components.dirty ? 'is-dirty' : 'is-saved'}`}
                  disabled={Boolean(!stepState.components.dirty && stepState.components.savedAt) || stepState.components.saving}
                  onClick={() => saveStep('components')}
                >
                  <Save className="h-4 w-4" strokeWidth={2.1} />
                  {stepState.components.saving ? 'در حال ذخیره...' : stepState.components.dirty ? 'ذخیره تغییرات' : stepState.components.savedAt ? 'ذخیره شده' : 'ذخیره'}
                </button>
              </div>
            </section>
          ) : null}

          {componentsCompleted && showComponentsStep ? (
            <section id="jobBenefits" className="draft-template-flow-section" onFocus={() => setActiveStep('jobBenefits')}>
              <header className="draft-template-flow-section-head">
                <div>
                  <h2>مزایای به تبع شغل</h2>
                  <p>آیتم‌های مرتبط با شغل</p>
                </div>
              </header>

              <section className="draft-template-flow-payroll-components">
                <header>
                  <h3>مزایای به تبع شغل</h3>
                  <p>آیتم‌های مرتبط با شغل</p>
                </header>

                {jobBenefitItems.map((item) => {
                  const benefit = initialBody.payroll?.jobBenefits?.[item.id];
                  return (
                    <div key={item.id} className="draft-template-flow-payroll-component-row">
                      <div className="draft-template-flow-payroll-component-copy">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <div className="draft-template-flow-payroll-component-pills">
                          <label>
                            <input type="checkbox" name={`${item.id}Insurance`} defaultChecked={benefit?.insurance ?? false} onChange={() => markDirty('jobBenefits')} />
                            مشمول بیمه
                          </label>
                          <label>
                            <input type="checkbox" name={`${item.id}Tax`} defaultChecked={benefit?.tax ?? false} onChange={() => markDirty('jobBenefits')} />
                            مشمول مالیات
                          </label>
                          <label>
                            <input type="checkbox" name={`${item.id}InBase`} defaultChecked={benefit?.inBase ?? false} onChange={() => markDirty('jobBenefits')} />
                            قابل احتساب در مزد مبنا
                          </label>
                        </div>
                      </div>
                      <input name={item.id} inputMode="numeric" pattern="[0-9]*" placeholder={item.placeholder} defaultValue={benefit?.amount ?? ''} onInput={keepDigitsOnly} onChange={() => markDirty('jobBenefits')} />
                    </div>
                  );
                })}
              </section>

              <div className="draft-template-flow-section-footer">
                <button
                  type="button"
                  className={`draft-template-flow-section-save ${stepState.jobBenefits.dirty ? 'is-dirty' : 'is-saved'}`}
                  disabled={Boolean(!stepState.jobBenefits.dirty && stepState.jobBenefits.savedAt) || stepState.jobBenefits.saving}
                  onClick={() => saveStep('jobBenefits')}
                >
                  <Save className="h-4 w-4" strokeWidth={2.1} />
                  {stepState.jobBenefits.saving ? 'در حال ذخیره...' : stepState.jobBenefits.dirty ? 'ذخیره تغییرات' : stepState.jobBenefits.savedAt ? 'ذخیره شده' : 'ذخیره'}
                </button>
              </div>
            </section>
          ) : null}

          {jobBenefitsCompleted && showComponentsStep ? (
            <section id="otherBenefits" className="draft-template-flow-section draft-template-flow-other-benefits-section" onFocus={() => setActiveStep('otherBenefits')}>
              <header className="draft-template-flow-section-head">
                <div>
                  <h2>سایر مزایا</h2>
                  <p>مزایای مستقل خارج از گروه مزایای شغلی</p>
                </div>
              </header>

              <div className="draft-template-flow-other-benefits-list">
                {otherBenefitItems.map((item) => {
                  const benefit = initialBody.payroll?.otherBenefits?.[item.id];
                  return (
                    <article key={item.id} className="draft-template-flow-other-benefit-card">
                      <div className="draft-template-flow-other-benefit-copy">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="draft-template-flow-other-benefit-pills">
                          <label onMouseDown={(event) => event.preventDefault()}>
                            <input
                              type="checkbox"
                              name={`${item.id}Insurance`}
                              defaultChecked={benefit?.insurance ?? false}
                              onChange={() => markDirty('otherBenefits')}
                            />
                            <span aria-hidden />
                            مشمول بیمه
                          </label>
                          <label onMouseDown={(event) => event.preventDefault()}>
                            <input
                              type="checkbox"
                              name={`${item.id}InBase`}
                              defaultChecked={benefit?.inBase ?? false}
                              onChange={() => markDirty('otherBenefits')}
                            />
                            <span aria-hidden />
                            قابل احتساب در مزد مبنا
                          </label>
                        </div>
                      </div>
                      <OtherBenefitAmountField
                        name={item.id}
                        defaultValue={benefit?.amount ?? ''}
                        placeholder={item.placeholder}
                        onDirty={() => markDirty('otherBenefits')}
                      />
                    </article>
                  );
                })}
              </div>

              <div className="draft-template-flow-section-footer">
                <button
                  type="button"
                  className={`draft-template-flow-section-save ${stepState.otherBenefits.dirty ? 'is-dirty' : 'is-saved'}`}
                  disabled={Boolean(!stepState.otherBenefits.dirty && stepState.otherBenefits.savedAt) || stepState.otherBenefits.saving}
                  onClick={() => saveStep('otherBenefits')}
                >
                  <Save className="h-4 w-4" strokeWidth={2.1} />
                  {stepState.otherBenefits.saving ? 'در حال ذخیره...' : stepState.otherBenefits.dirty ? 'ذخیره تغییرات' : stepState.otherBenefits.savedAt ? 'ذخیره شده' : 'ذخیره'}
                </button>
              </div>
            </section>
          ) : null}

          {otherBenefitsCompleted && showComponentsStep ? (
            <FixedAdjustmentsSection
              items={fixedAdjustments}
              onItemsChange={setFixedAdjustments}
              onFocus={() => setActiveStep('fixedAdjustments')}
              onDirty={() => markDirty('fixedAdjustments')}
              stepDirty={stepState.fixedAdjustments.dirty}
              stepSavedAt={stepState.fixedAdjustments.savedAt}
              stepSaving={stepState.fixedAdjustments.saving}
              onSave={() => saveStep('fixedAdjustments')}
            />
          ) : null}

          {fixedAdjustmentsCompleted && showComponentsStep ? (
            <TimeCoefficientsSection
              values={initialBody.payroll?.timeCoefficients}
              onFocus={() => setActiveStep('timeCoefficients')}
              onDirty={() => markDirty('timeCoefficients')}
              stepDirty={stepState.timeCoefficients.dirty}
              stepSavedAt={stepState.timeCoefficients.savedAt}
              stepSaving={stepState.timeCoefficients.saving}
              onSave={() => saveStep('timeCoefficients')}
            />
          ) : null}

          {timeCoefficientsCompleted && showComponentsStep ? (
            <NightShiftRulesSection
              values={initialBody.payroll?.nightShiftRules}
              onFocus={() => setActiveStep('nightShiftRules')}
              onDirty={() => markDirty('nightShiftRules')}
              stepDirty={stepState.nightShiftRules.dirty}
              stepSavedAt={stepState.nightShiftRules.savedAt}
              stepSaving={stepState.nightShiftRules.saving}
              onSave={() => saveStep('nightShiftRules')}
            />
          ) : null}

          {nightShiftRulesCompleted && showComponentsStep ? (
            <LegalLimitsSection
              values={initialBody.payroll?.legalLimits}
              onFocus={() => setActiveStep('legalLimits')}
              onDirty={() => markDirty('legalLimits')}
              stepDirty={stepState.legalLimits.dirty}
              stepSavedAt={stepState.legalLimits.savedAt}
              stepSaving={stepState.legalLimits.saving}
              onSave={() => saveStep('legalLimits')}
            />
          ) : null}

          <div className="draft-template-flow-submit-row">
            <button type="button" disabled={!finalReady} onClick={() => router.push('/draft-templates')}>
              <Save className="h-4 w-4" strokeWidth={2.1} />
              ثبت قالب پیش‌نویس
            </button>
            <Link href="/draft-templates">
              <FileText className="h-4 w-4" strokeWidth={2.1} />
              بازگشت به فهرست
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
