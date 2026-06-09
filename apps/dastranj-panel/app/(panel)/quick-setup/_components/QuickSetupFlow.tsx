'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronLeft, CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MinimalScroll } from '../../../components/MinimalScroll';
import Step1Location, { type Step1LocationHandle } from './Step1Location';
import Step2CalendarShift from './Step2CalendarShift';
import Step3Policy from './Step3Policy';
import Step4Employees from './Step4Employees';
import Step5WorkGroup from './Step5WorkGroup';
import type {
  CompletedCalendarItem,
  DefaultCalendarTemplate,
  LocationSummaryItem,
  QuickEmployeeImportJobSummary,
  QuickEmployeeSummary,
  QuickPolicySummary,
  QuickSetupStep,
  QuickWorkGroupDraft,
  QuickWorkGroupSummary,
} from './quick-setup.types';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: Array<{ id: Step; key: QuickSetupStep['key']; title: string; description: string }> = [
  { id: 1, key: 'location', title: 'محل کار اصلی', description: 'ثبت محل کار اصلی و شعاع مجاز' },
  { id: 2, key: 'calendar', title: 'تقویم کاری', description: 'تقویم، تعطیلات و شیفت' },
  { id: 3, key: 'policy', title: 'سیاست کاری', description: 'انتخاب قالب اولیه قوانین تردد و درخواست' },
  { id: 4, key: 'employee', title: 'مدیریت کارکنان', description: 'ثبت و دعوت اولیه کارکنان' },
  { id: 5, key: 'work-group', title: 'گروه های کاری', description: 'ساخت گروه کاری و اتصال اعضا، محل و سیاست' },
];

const STEP_HEADER_COPY: Record<Step, { label: string; title: string; description: string }> = {
  1: {
    label: 'مرحله ۱ از ۵ — محل کار اصلی',
    title: 'محل کار اصلی را تعریف کنید',
    description:
      'اطلاعات پایه محل کار سازمان را ثبت کنید تا تقویم، شیفت‌ها و سیاست‌های کاری بر اساس آن تنظیم شوند.',
  },
  2: {
    label: 'مرحله ۲ از ۵ — تقویم کاری',
    title: 'تقویم کاری را تعریف کنید',
    description:
      'روزهای کاری، تعطیلات و روزهای غیرکاری سازمان را مشخص کنید تا مبنای محاسبه حضور و غیاب باشد.',
  },
  3: {
    label: 'مرحله ۳ از ۵ — سیاست کاری',
    title: 'انتخاب سیاست کاری',
    description:
      'سیاست کاری مشخص می‌کند سیستم تردد، ساعت کار، مرخصی، اضافه‌کاری و درخواست‌های کارکنان را بر چه قواعدی مدیریت کند.',
  },
  4: {
    label: 'مرحله ۴ از ۵ — مدیریت کارکنان',
    title: 'ثبت و دعوت کارکنان',
    description:
      'کارکنان سازمان را به لیست کسب‌وکار اضافه کنید. برای شروع سریع، فقط اطلاعات حداقلی دریافت می‌شود و اطلاعات تکمیلی می‌تواند بعداً توسط مدیر یا خود کارکنان تکمیل شود.',
  },
  5: {
    label: 'مرحله ۵ از ۵ — گروه‌های کاری',
    title: 'تعریف گروه کاری',
    description:
      'برای شروع استفاده از دستانژ، یک گروه کاری بسازید و محل کار، اعضا و سیاست کاری آن را مشخص کنید. هر گروه کاری می‌تواند محل، اعضا و سیاست کاری مخصوص خود را داشته باشد.',
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StepHeader({
  item,
  active,
  complete,
  disabled,
  onClick,
}: {
  item: (typeof STEPS)[number];
  active: boolean;
  complete: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex min-w-[132px] flex-col items-center gap-2 px-2 py-2 text-center transition-all',
        disabled ? 'cursor-not-allowed opacity-45' : 'opacity-100',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black transition-all',
          active && 'border-indigo-400 bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]',
          complete && !active && 'border-emerald-500 bg-emerald-600 text-white',
          !active && !complete && 'border-slate-500/70 bg-transparent text-slate-300 group-hover:border-slate-400',
        )}
      >
        {complete ? <Check className="h-4 w-4" /> : item.id}
      </div>
      <div className={cn('text-sm font-bold', active || complete ? 'text-white' : 'text-slate-400')}>{item.title}</div>
    </button>
  );
}

type QuickSetupFlowProps = {
  profileName?: string | null;
  steps: QuickSetupStep[];
  locationItems?: LocationSummaryItem[];
  calendarItems?: CompletedCalendarItem[];
  defaultCalendarTemplate?: DefaultCalendarTemplate | null;
  policyItems?: QuickPolicySummary[];
  employeeItems?: QuickEmployeeSummary[];
  employeeImportJobs?: QuickEmployeeImportJobSummary[];
  workGroupItems?: QuickWorkGroupSummary[];
  tenantId?: string | null;
};

export function QuickSetupFlow({
  profileName,
  steps,
  locationItems = [],
  calendarItems = [],
  defaultCalendarTemplate = null,
  policyItems = [],
  employeeItems = [],
  employeeImportJobs = [],
  workGroupItems = [],
}: QuickSetupFlowProps) {
  const initialCompleted = useMemo(
    () => STEPS.filter((item) => steps.find((step) => step.key === item.key)?.done).map((item) => item.id),
    [steps],
  );
  const firstPending = STEPS.find((item) => !initialCompleted.includes(item.id))?.id ?? 5;
  const [step, setStep] = useState<Step>(firstPending);
  const [completedSteps, setCompletedSteps] = useState<Step[]>(initialCompleted);
  const [exitOpen, setExitOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationSummaryItem | null>(locationItems.find((item) => item.isPrimaryOnboarding) ?? null);
  const [calendar, setCalendar] = useState<CompletedCalendarItem | null>(calendarItems[0] ?? null);
  const [calendars, setCalendars] = useState<CompletedCalendarItem[]>(calendarItems);
  const [policy, setPolicy] = useState<QuickPolicySummary | null>(policyItems.find((item) => item.isDefault) ?? policyItems[0] ?? null);
  const [employees, setEmployees] = useState<QuickEmployeeSummary[]>(employeeItems);
  const [workGroup, setWorkGroup] = useState<QuickWorkGroupSummary | null>(workGroupItems[0] ?? null);
  const initialPolicy = policyItems.find((item) => item.isDefault) ?? policyItems[0] ?? null;
  const [workGroupDraft, setWorkGroupDraft] = useState<QuickWorkGroupDraft>({
    title: workGroupItems[0]?.title ?? '',
    logoUrl: '',
    selectedLocationId: locationItems[0]?.id ?? '',
    selectedEmployees: [],
    employeeSearch: '',
    selectedPolicyIds: initialPolicy?.id ? [initialPolicy.id] : [],
  });
  const [workGroupResumeSection, setWorkGroupResumeSection] = useState<1 | 2 | 3 | 4 | null>(null);
  const locationStepRef = useRef<Step1LocationHandle | null>(null);
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const completedCount = completedSteps.length;
  const progress = useMemo(() => (completedCount / STEPS.length) * 100, [completedCount]);
  const accessibleUntil = useMemo(() => Math.min(STEPS.length, completedCount + 1) as Step, [completedCount]);
  const currentStepMeta = STEPS.find((item) => item.id === step)!;
  const currentStepHeader = STEP_HEADER_COPY[step];

  const markStepCompleted = (targetStep: Step) => {
    setCompletedSteps((prev) => (prev.includes(targetStep) ? prev : ([...prev, targetStep].sort((a, b) => a - b) as Step[])));
  };

  const goToStep = (target: Step) => {
    if (target <= accessibleUntil || completedSteps.includes(target)) setStep(target);
  };

  const goBack = () => {
    if (step === 1) {
      setExitOpen(true);
      return;
    }
    setStep((prev) => (prev - 1) as Step);
  };

  const handleEnterDashboard = () => {
    setRedirectError(null);
    try {
      router.push('/');
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        if (window.location.pathname !== '/') {
          setRedirectError('راه‌اندازی تکمیل شد، اما ورود به داشبورد انجام نشد. دوباره تلاش کنید.');
        }
      }, 350);
    } catch {
      if (mountedRef.current) {
        setRedirectError('راه‌اندازی تکمیل شد، اما ورود به داشبورد انجام نشد. دوباره تلاش کنید.');
      }
    }
  };

  const handleExit = () => {
    if (step === 1) {
      locationStepRef.current?.requestExit();
      return;
    }
    setExitOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 sm:p-4 lg:p-4" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-[28px] border border-indigo-500/20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.28),transparent_35%),linear-gradient(135deg,rgba(27,36,62,0.96),rgba(35,29,79,0.92))] p-5 sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="order-2 rounded-xl border border-white/10 bg-slate-950/35 p-4 lg:order-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-white">پیشرفت کل</div>
                <div className="text-lg font-black text-white">{Math.round(progress)}%</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700/70">
                <div className="h-full rounded-full bg-slate-300 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 text-xs text-slate-300">
                {completedCount} مورد از {STEPS.length} مورد تکمیل شده است
              </div>
              <button
                type="button"
                onClick={handleExit}
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-rose-400/60 px-4 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
              >
                خروج موقت از راه‌اندازی
              </button>
            </div>

            <div className="order-1 flex flex-col justify-center text-right lg:order-2">
              <div className="mb-3 inline-flex items-center gap-2 self-start rounded-full text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                {currentStepHeader.label}
              </div>
              <h1 className="text-xl font-black text-white sm:text-2xl">{currentStepHeader.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{currentStepHeader.description}</p>
              <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-400">
                برای استفاده کامل از امکانات پنل{profileName ? ` ${profileName}` : ''}، این مراحل را به ترتیب تکمیل کنید. اطلاعات این بخش ها برای محاسبه دقیق حضور و دستمزد ضروری است.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-800/65 px-4 py-5 sm:px-5">
          <MinimalScroll variant="horizontal">
            <div className="mx-auto flex min-w-max items-start justify-center gap-5">
              {STEPS.map((item) => (
                <StepHeader
                  key={item.id}
                  item={item}
                  active={item.id === step}
                  complete={completedSteps.includes(item.id)}
                  disabled={item.id > accessibleUntil && !completedSteps.includes(item.id)}
                  onClick={() => goToStep(item.id)}
                />
              ))}
            </div>
          </MinimalScroll>
          <div className="mt-4 border-t border-white/10 pt-4 text-center">
            <div className="text-sm font-bold text-white">{currentStepMeta.title}</div>
            <div className="mt-1 text-xs text-slate-400">{currentStepMeta.description}</div>
          </div>
        </section>

        <div className="space-y-4">
          <div className={step === 1 ? 'block' : 'hidden'}>
            <Step1Location
              ref={locationStepRef}
              isCompleted={completedSteps.includes(1)}
              initialLocation={location}
              onComplete={(value) => {
                setLocation(value);
                markStepCompleted(1);
                setStep(workGroupResumeSection ? 5 : 2);
              }}
            />
          </div>

          <div className={step === 2 ? 'block' : 'hidden'}>
            <Step2CalendarShift
              isCompleted={completedSteps.includes(2)}
              initialCalendar={calendar}
              defaultCalendarTemplate={defaultCalendarTemplate}
              onComplete={(value) => {
                setCalendar(value);
                setCalendars((prev) => [value, ...prev.filter((item) => item.id !== value.id)]);
                markStepCompleted(2);
                setStep(3);
              }}
              onBack={goBack}
            />
          </div>

          <div className={step === 3 ? 'block' : 'hidden'}>
            <Step3Policy
              isCompleted={completedSteps.includes(3)}
              calendar={calendar}
              calendars={calendars}
              policy={policy}
              onPolicyChange={setPolicy}
              onComplete={(value) => {
                setPolicy(value);
                markStepCompleted(3);
                setStep(workGroupResumeSection ? 5 : 4);
              }}
              onBack={goBack}
            />
          </div>

          <div className={step === 4 ? 'block' : 'hidden'}>
            <Step4Employees
              employees={employees}
              importJobs={employeeImportJobs}
              onChange={setEmployees}
              onBack={goBack}
              onNext={() => {
                markStepCompleted(4);
                setStep(5);
              }}
              onExit={handleExit}
            />
          </div>

          <div className={step === 5 ? 'block' : 'hidden'}>
            <Step5WorkGroup
              key={`work-group-${workGroupResumeSection ?? 'default'}`}
              initialWorkGroup={workGroup}
              draft={workGroupDraft}
              initialSection={workGroupResumeSection ?? 1}
              locations={locationItems.map((item) => ({
                id: item.id,
                name: item.title,
                description: item.description ?? 'توضیحات ثبت نشده است',
                radius: item.radius,
              }))}
              employees={employees.map((employee) => ({
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`.trim() || employee.email || employee.mobile || 'بدون نام',
                contactValue: employee.email || employee.mobile || 'ثبت نشده',
              }))}
              policies={policyItems.map((item) => ({
                id: item.id,
                name: item.title,
                description: item.description,
                calendarName: item.calendarTitle,
                isActive: Boolean(item.isDefault),
                yearUsed: item.year,
                isDefault: item.isDefault,
              }))}
              onDraftChange={setWorkGroupDraft}
              onGoToPolicyStep={() => {
                setWorkGroupResumeSection(2);
                setStep(3);
              }}
              onGoToLocationStep={() => {
                setWorkGroupResumeSection(3);
                setStep(1);
              }}
              onBack={goBack}
              onSave={(value) => {
                setWorkGroup(value);
                markStepCompleted(5);
                setWorkGroupResumeSection(null);
                if ([1, 2, 3, 4].every((id) => completedSteps.includes(id as Step))) {
                  setCompletedOpen(true);
                }
              }}
            />
          </div>
        </div>

      </div>

      {exitOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setExitOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100" onClick={(event) => event.stopPropagation()}>
            <div className="text-xl font-black text-white">خروج از راه اندازی سریع</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">این اطلاعات برای راه اندازی اولیه لازم است. در صورت خروج، می توانید بعدا از بخش های مختلف آن ها را تکمیل کنید.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setExitOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">ادامه</button>
              <a href="/business-settings" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">خروج</a>
            </div>
          </div>
        </div>
      ) : null}

      {completedOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[540px] rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(10,18,40,0.98),rgba(8,14,30,0.96))] px-5 py-6 text-right text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-6 sm:py-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_10px_30px_rgba(16,185,129,0.18)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.08em] text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  موفقیت
                </div>
                <div className="mt-3 text-2xl font-black leading-10 text-white">راه‌اندازی سریع با موفقیت تکمیل شد</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-8 text-slate-200 sm:text-[15px]">
              تبریک! تنظیمات اولیه سازمان شما آماده است و حالا می‌توانید استفاده از دسترنج را شروع کنید.
              <span className="mt-2 block text-slate-300">
                محل کار، تقویم، سیاست کاری، کارکنان و گروه کاری اولیه ثبت شده‌اند و هر زمان لازم باشد می‌توانید جزئیات را از بخش تنظیمات کامل‌تر کنید.
              </span>
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['محل کار', 'تقویم', 'سیاست کاری', 'کارکنان', 'گروه کاری اولیه'].map((item) => (
                <span key={item} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-200">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs leading-6 text-slate-300">
              تنظیمات پیشرفته همیشه از منوی تنظیمات در دسترس است.
            </div>

            {redirectError ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm leading-7 text-rose-100" role="alert">
                <span className="inline-flex items-center gap-2 font-bold text-rose-50">
                  <CircleAlert className="h-4 w-4" />
                  خطا
                </span>
                <div className="mt-1">{redirectError}</div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleEnterDashboard}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-base font-black text-[#031b18] transition-colors hover:bg-emerald-400"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
              ورود به داشبورد دسترنج
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
