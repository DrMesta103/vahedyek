'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
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
  QuickEmployeeSummary,
  QuickPolicySummary,
  QuickSetupStep,
  QuickWorkGroupSummary,
} from './quick-setup.types';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: Array<{ id: Step; key: QuickSetupStep['key']; title: string; description: string }> = [
  { id: 1, key: 'location', title: 'محل کار اصلی', description: 'ثبت محل کار اصلی و شعاع مجاز' },
  { id: 2, key: 'calendar', title: 'تقویم کاری', description: 'تقویم، تعطیلات و شیفت' },
  { id: 3, key: 'policy', title: 'سیاست کاری', description: 'انتخاب قالب اولیه قوانین تردد و درخواست' },
  { id: 4, key: 'employee', title: 'مدیریت کارکنان', description: 'ثبت و تکمیل کارکنان' },
  { id: 5, key: 'work-group', title: 'گروه های کاری', description: 'ساخت گروه کاری و اتمام راه اندازی' },
];

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
  const [location, setLocation] = useState<LocationSummaryItem | null>(locationItems.find((item) => item.isPrimaryOnboarding) ?? null);
  const [calendar, setCalendar] = useState<CompletedCalendarItem | null>(calendarItems[0] ?? null);
  const [calendars, setCalendars] = useState<CompletedCalendarItem[]>(calendarItems);
  const [policy, setPolicy] = useState<QuickPolicySummary | null>(policyItems.find((item) => item.isDefault) ?? policyItems[0] ?? null);
  const [employees, setEmployees] = useState<QuickEmployeeSummary[]>(employeeItems);
  const [workGroup, setWorkGroup] = useState<QuickWorkGroupSummary | null>(workGroupItems[0] ?? null);
  const employeesRef = useRef<QuickEmployeeSummary[]>(employeeItems);
  const locationStepRef = useRef<Step1LocationHandle | null>(null);

  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  const completedCount = completedSteps.length;
  const progress = useMemo(() => (completedCount / STEPS.length) * 100, [completedCount]);
  const accessibleUntil = useMemo(() => Math.min(STEPS.length, completedCount + 1) as Step, [completedCount]);
  const currentStepMeta = STEPS.find((item) => item.id === step)!;
  const showFooterNavigation = step === 4;

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

  const goNext = () => {
    markStepCompleted(step);
    setStep((prev) => (prev + 1) as Step);
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
                وضعیت راه اندازی سیستم
              </div>
              <h1 className="text-xl font-black text-white sm:text-xl">خوش آمدید</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
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
                setStep(2);
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
                setStep(4);
              }}
              onBack={goBack}
            />
          </div>

          <div className={step === 4 ? 'block' : 'hidden'}>
            <Step4Employees employees={employees} onChange={setEmployees} />
          </div>

          <div className={step === 5 ? 'block' : 'hidden'}>
            <Step5WorkGroup
              initialWorkGroup={workGroup}
              locations={location ? [{ id: location.id, name: location.title, description: location.description ?? 'توضیحات ثبت نشده است', radius: location.radius }] : []}
              employees={employees.map((employee) => ({
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`.trim() || employee.contact.value,
                contactValue: employee.contact.value,
              }))}
              policies={
                policy
                  ? [{ id: policy.id, name: policy.title, calendarName: policy.calendarTitle, isActive: true, yearUsed: policy.year, isDefault: policy.isDefault ?? true }]
                  : []
              }
              onSave={(value) => {
                setWorkGroup(value);
                markStepCompleted(5);
                setCompletedOpen(true);
              }}
            />
          </div>
        </div>

        {showFooterNavigation ? (
          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={goBack} className="rounded-xl border border-white/10 bg-slate-800 px-5 py-2.5 text-sm text-slate-100 transition-colors hover:border-white/20">
                مرحله قبل
              </button>
              <button type="button" onClick={goNext} disabled={employees.length === 0} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                تایید و ادامه
              </button>
            </div>
          </section>
        ) : null}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-[500px] rounded-xl border border-white/10 bg-[#0b1228] px-5 py-8 text-center text-slate-100">
            <div className="text-xl font-black text-white">راه اندازی سریع تکمیل شد</div>
            <p className="mx-auto mt-5 max-w-[360px] text-base leading-8 text-slate-200">تنظیمات پایه انجام شد و حالا می توانید کار را از صفحه اصلی ادامه دهید.</p>
            <a href="/business-settings" className="mt-8 inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-indigo-500">
              ورود به خانه
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
