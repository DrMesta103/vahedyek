'use client';

import Link from 'next/link';
import { startTransition, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, MapPin, ShieldCheck, Users, Workflow } from 'lucide-react';

type QuickSetupStep = {
  key: string;
  title: string;
  subtitle: string;
  done: boolean;
  href: string;
  manageHref: string;
  count: number;
};

type QuickSetupFlowProps = {
  profileName?: string | null;
  steps: QuickSetupStep[];
};

const STEP_META = {
  location: {
    icon: MapPin,
    details: ['عنوان محل کار را ثبت کنید', 'شعاع مجاز حضور را مشخص کنید', 'بعد از ثبت، موقعیت در کل سیستم قابل استفاده می‌شود'],
  },
  calendar: {
    icon: CalendarDays,
    details: ['تقویم پایه سال کاری را تعیین کنید', 'تعطیلات سازمانی را وارد کنید', 'شیفت پیش‌فرض این تقویم را نهایی کنید'],
  },
  policy: {
    icon: ShieldCheck,
    details: ['سیاست حضور و غیاب را تعریف کنید', 'تقویم مرتبط را به سیاست وصل کنید', 'پارامترهای تاخیر، اضافه‌کاری و مرخصی را کامل کنید'],
  },
  employee: {
    icon: Users,
    details: ['اولین کارکنان را وارد کنید', 'اطلاعات پرسنلی و واحدها را ثبت کنید', 'آماده تخصیص به گروه‌های کاری شوید'],
  },
  'work-group': {
    icon: Workflow,
    details: ['گروه اجرایی را بسازید', 'افراد، محل کار و سیاست را متصل کنید', 'فاز راه‌اندازی سریع را نهایی کنید'],
  },
} as const;

export function QuickSetupFlow({ profileName, steps }: QuickSetupFlowProps) {
  const firstPendingIndex = steps.findIndex((step) => !step.done);
  const initialIndex = firstPendingIndex === -1 ? steps.length - 1 : firstPendingIndex;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeStep = steps[activeIndex];
  const completedCount = steps.filter((step) => step.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const remainingCount = steps.length - completedCount;
  const StepIcon = STEP_META[activeStep.key as keyof typeof STEP_META]?.icon ?? Workflow;

  const activeDetails = useMemo(
    () => STEP_META[activeStep.key as keyof typeof STEP_META]?.details ?? [],
    [activeStep.key],
  );

  const goToStep = (index: number) => {
    startTransition(() => setActiveIndex(index));
  };

  return (
    <div className="quick-setup-page">
      <section className="quick-setup-hero">
        <div className="quick-setup-hero-copy">
          <div className="quick-setup-hero-kicker">وضعیت راه‌اندازی سیستم</div>
          <h1>خوش آمدید</h1>
          <p>
            برای استفاده کامل از امکانات پنل این مراحل را به‌ترتیب تکمیل کنید. اطلاعات این بخش‌ها برای محاسبه دقیق حضور و دستمزد ضروری است.
          </p>
          <div className="quick-setup-hero-note">{profileName ? `پروفایل فعال: ${profileName}` : 'پروفایل کسب‌وکار هنوز تکمیل نشده است.'}</div>
        </div>

        <div className="quick-setup-progress-card">
          <div className="quick-setup-progress-head">
            <span>پیشرفت کل</span>
            <strong>{progress}%</strong>
          </div>
          <div className="quick-setup-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>{completedCount} مورد از {steps.length} مورد تکمیل شده است</p>
          <Link href="/" className="quick-setup-exit">
            خروج از راه‌اندازی سریع
          </Link>
        </div>
      </section>

      <section className="quick-setup-stepper-shell">
        <div className="quick-setup-stepper">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isDone = step.done;

            return (
              <button key={step.key} type="button" className={`quick-step${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`} onClick={() => goToStep(index)}>
                <span className="quick-step-badge">{isDone ? <Check size={16} /> : index + 1}</span>
                <strong>{step.title}</strong>
                <span>{step.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="quick-setup-stepper-footer">
          <strong>{activeStep.title}</strong>
          <span>{activeStep.subtitle}</span>
        </div>
      </section>

      <section className="quick-setup-stage">
        <div className="quick-setup-stage-card">
          <div className="quick-setup-stage-header">
            <div className="quick-setup-stage-title">
              <span className="quick-setup-stage-icon">
                <StepIcon size={18} />
              </span>
              <div>
                <h2>{activeStep.title}</h2>
                <p>{activeStep.subtitle}</p>
              </div>
            </div>
            <button type="button" className="quick-setup-stage-toggle">
              <ChevronDown size={16} />
              بستن
            </button>
          </div>

          <div className="quick-setup-stage-body">
            <div className="quick-setup-info-panel quick-setup-info-panel-primary">
              <div className="quick-setup-info-head">
                <strong>وضعیت مرحله</strong>
                <span className={`quick-setup-pill${activeStep.done ? ' is-success' : ''}`}>{activeStep.done ? 'تکمیل شده' : 'در انتظار تکمیل'}</span>
              </div>
              <div className="quick-setup-stage-summary">
                <div>
                  <span>تعداد ثبت شده</span>
                  <strong>{activeStep.count}</strong>
                </div>
                <div>
                  <span>مرحله جاری</span>
                  <strong>{activeIndex + 1}</strong>
                </div>
                <div>
                  <span>باقی‌مانده</span>
                  <strong>{remainingCount}</strong>
                </div>
              </div>
              <div className="quick-setup-cta-row">
                <Link href={activeStep.done ? activeStep.manageHref : activeStep.href} className="quick-setup-primary-action">
                  {activeStep.done ? 'مدیریت مرحله' : 'شروع مرحله'}
                </Link>
                <Link href={activeStep.manageHref} className="quick-setup-secondary-action">
                  مشاهده فهرست
                </Link>
              </div>
            </div>

            <div className="quick-setup-info-panel">
              <div className="quick-setup-info-head">
                <strong>کارهای پیشنهادی</strong>
                <span className="quick-setup-subtle-badge">
                  <Clock3 size={14} />
                  مرحله {activeIndex + 1}
                </span>
              </div>
              <div className="quick-setup-task-list">
                {activeDetails.map((detail) => (
                  <div key={detail} className="quick-setup-task-item">
                    <span className="quick-setup-task-dot" />
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-setup-info-panel">
              <div className="quick-setup-info-head">
                <strong>مسیریابی مراحل</strong>
                <span className="quick-setup-subtle-badge">گام بعدی</span>
              </div>
              <div className="quick-setup-navigation-row">
                <button type="button" className="quick-setup-nav-button" onClick={() => goToStep(Math.max(activeIndex - 1, 0))} disabled={activeIndex === 0}>
                  مرحله قبل
                </button>
                <button
                  type="button"
                  className="quick-setup-nav-button is-primary"
                  onClick={() => goToStep(Math.min(activeIndex + 1, steps.length - 1))}
                  disabled={activeIndex === steps.length - 1}
                >
                  مرحله بعد
                  <ArrowLeft size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
