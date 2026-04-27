'use client';

import { startTransition, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, MapPin, Search, ShieldCheck, Users, Workflow, ZoomIn, LocateFixed, Plus } from 'lucide-react';
import { createLocationFromQuickSetupAction } from '../../../lib/actions';
import Step2CalendarShift from './Step2CalendarShift';
import Step3Policy from './Step3Policy';
import Step4Employees from './Step4Employees';

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
  locationItems?: { id: string; title: string; description: string | null; radius: number }[];
  tenantId?: string | null;
};

type CalendarSummary = {
  id: string;
  title: string;
  yearLabel: string;
  shiftTitle: string;
  shiftTypeLabel: string;
  holidayCount: number;
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

export function QuickSetupFlow({ profileName, steps, locationItems = [], tenantId }: QuickSetupFlowProps) {
  const firstPendingIndex = steps.findIndex((step) => !step.done);
  const initialIndex = firstPendingIndex === -1 ? steps.length - 1 : firstPendingIndex;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([initialIndex]));
  const [mapSearch, setMapSearch] = useState('');
  const [locationTitle, setLocationTitle] = useState('');
  const [locationRadius, setLocationRadius] = useState('50');
  const [selectedPoint, setSelectedPoint] = useState({ lat: '35.6997', lng: '51.3380' });
  // Track locally completed steps (for calendar step after inline completion)
  const [locallyCompleted, setLocallyCompleted] = useState<string[]>([]);
  const [calendarSummary, setCalendarSummary] = useState<CalendarSummary | null>(null);
  const [completedCalendars, setCompletedCalendars] = useState<{ id: string; title: string; yearLabel: string }[]>([]);

  const backendCurrentIndex = firstPendingIndex === -1 ? steps.length - 1 : firstPendingIndex;
  const activeStep = steps[activeIndex];
  const completedCount = steps.filter((step) => step.done || locallyCompleted.includes(step.key)).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const remainingCount = steps.length - completedCount;
  const StepIcon = STEP_META[activeStep.key as keyof typeof STEP_META]?.icon ?? Workflow;

  const activeDetails = useMemo(
    () => STEP_META[activeStep.key as keyof typeof STEP_META]?.details ?? [],
    [activeStep.key],
  );

  const isStepDone = (step: QuickSetupStep) => step.done || locallyCompleted.includes(step.key);

  const goToStep = (index: number, force = false) => {
    if (force) {
      // وقتی از onComplete صدا زده میشه، مستقیم برو
      setVisitedSteps((prev) => new Set(prev).add(index));
      startTransition(() => setActiveIndex(index));
      return;
    }
    const isDone = isStepDone(steps[index]);
    const currentIsDone = isStepDone(steps[activeIndex]);
    const isNext = index === activeIndex + 1;
    // استپ بعدی فقط اگر جاری تکمیل شده باشد
    if (isNext && !currentIsDone) return;
    const canAccess = isDone || index === activeIndex || visitedSteps.has(index);
    if (!canAccess) return;
    setVisitedSteps((prev) => new Set(prev).add(index));
    startTransition(() => setActiveIndex(index));
  };

  // ─── Location Stage ───────────────────────────────────────────────────────

  const renderLocationStage = () => {
    if (activeStep.done) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          {locationItems.map((loc) => (
            <div key={loc.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>عنوان: {loc.title}</div>
              <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 8 }}>توضیحات: {loc.description || 'ثبت نشده است'}</div>
              <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>شعاع مجاز: {loc.radius} متر</div>
            </div>
          ))}
          <a
            href="/locations"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            برای مدیریت کامل محل‌های کار، کلیک کنید تا به فهرست محل‌های کار بروید.
          </a>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={() => goToStep(Math.min(activeIndex + 1, steps.length - 1), true)}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="quick-setup-location-layout">
        <form id="quickSetupLocationForm" action={createLocationFromQuickSetupAction} className="quick-setup-location-form">
          <label className="quick-setup-field">
            <span>عنوان *</span>
            <input name="title" value={locationTitle} onChange={(event) => setLocationTitle(event.target.value)} placeholder="کارگاه" required />
          </label>

          <label className="quick-setup-field">
            <span>شعاع خطا *</span>
            <div className="quick-setup-field-inline">
              <input name="radius" value={locationRadius} onChange={(event) => setLocationRadius(event.target.value)} inputMode="numeric" placeholder="50" required />
              <small>متر</small>
            </div>
          </label>

          <input type="hidden" name="address" value={`مختصات انتخابی: ${selectedPoint.lng}, ${selectedPoint.lat}`} />
          <input type="hidden" name="description" value={mapSearch ? `جست‌وجو: ${mapSearch}` : 'ثبت‌شده از طریق راه‌اندازی سریع'} />

          <div className="quick-setup-location-hint">
            محل کار را با نام مناسب ثبت کنید و شعاع مجاز حضور را مشخص کنید تا در محاسبات تردد استفاده شود.
          </div>
        </form>

        <div className="quick-setup-map-panel">
          <div className="quick-setup-map-shell">
            <div className="quick-setup-map-search">
              <input value={mapSearch} onChange={(event) => setMapSearch(event.target.value)} placeholder="جستجو" />
              <Search size={16} />
            </div>

            <div className="quick-setup-map-canvas">
              <button type="button" className="quick-setup-map-marker" onClick={() => setSelectedPoint({ lat: '35.6997', lng: '51.3380' })}>
                <MapPin size={20} />
              </button>

              <div className="quick-setup-map-controls">
                <button type="button" onClick={() => setLocationRadius((current) => String(Math.min(Number(current || '50') + 10, 500)))}>
                  <Plus size={16} />
                </button>
                <button type="button" onClick={() => setLocationRadius((current) => String(Math.max(Number(current || '50') - 10, 10)))}>
                  <ZoomIn size={16} />
                </button>
              </div>

              <button type="button" className="quick-setup-map-locate" onClick={() => setSelectedPoint({ lat: '35.6997', lng: '51.3380' })}>
                <LocateFixed size={16} />
              </button>
            </div>
          </div>

          <div className="quick-setup-map-footer">
            <span>نقطه انتخابی: {selectedPoint.lng}, {selectedPoint.lat}</span>
            <button type="submit" form="quickSetupLocationForm" className="quick-setup-primary-action" disabled={!locationTitle.trim()}>
              مرحله بعد
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Calendar Stage ───────────────────────────────────────────────────────

  const renderCalendarStage = () => {
    const isDone = isStepDone(activeStep);

    if (isDone && calendarSummary) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>عنوان: {calendarSummary.title}</div>
            <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 8 }}>سال کاری: {calendarSummary.yearLabel}</div>
            <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>شیفت: {calendarSummary.shiftTitle}</div>
            <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>تعطیلات: {calendarSummary.holidayCount} روز</div>
          </div>
          <a
            href="/calendars"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            مدیریت تقویم کاری
          </a>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={() => goToStep(Math.min(activeIndex + 1, steps.length - 1))}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (isDone && !calendarSummary) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right' }}>
            <div style={{ color: '#aeb8d9', fontSize: 13 }}>تقویم کاری قبلاً ثبت شده است.</div>
          </div>
          <a
            href="/calendars"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            مدیریت تقویم کاری
          </a>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={() => goToStep(Math.min(activeIndex + 1, steps.length - 1))}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <Step2CalendarShift
        onComplete={(summary) => {
          setCalendarSummary(summary);
          setCompletedCalendars((prev) => [...prev, { id: summary.id, title: summary.title, yearLabel: summary.yearLabel }]);
          setLocallyCompleted((prev) => [...prev, 'calendar']);
          goToStep(Math.min(activeIndex + 1, steps.length - 1), true);
        }}
        onBack={() => goToStep(Math.max(activeIndex - 1, 0))}
      />
    );
  };

  // ─── Policy Stage ────────────────────────────────────────────────────────

  const renderPolicyStage = () => {
    const isDone = isStepDone(activeStep);
    if (isDone) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right' }}>
            <div style={{ color: '#aeb8d9', fontSize: 13 }}>سیاست کاری قبلاً ثبت شده است.</div>
          </div>
          <a href="/policies" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            مدیریت سیاست‌های کاری
          </a>
        </div>
      );
    }

    return (
      <Step3Policy
        calendars={completedCalendars}
        onComplete={() => {
          setLocallyCompleted((prev) => [...prev, 'policy']);
          goToStep(Math.min(activeIndex + 1, steps.length - 1), true);
        }}
        onBack={() => goToStep(Math.max(activeIndex - 1, 0))}
      />
    );
  };

  // ─── Employee Stage ───────────────────────────────────────────────────────

  const renderEmployeeStage = () => {
    const isDone = isStepDone(activeStep);
    if (isDone) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(14,20,38,0.94)', padding: 16, textAlign: 'right' }}>
            <div style={{ color: '#aeb8d9', fontSize: 13 }}>کارمندان قبلاً ثبت شده‌اند.</div>
          </div>
          <a href="/employees" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '12px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            مدیریت کارمندان
          </a>
        </div>
      );
    }

    return (
      <Step4Employees
        onComplete={() => {
          setLocallyCompleted((prev) => [...prev, 'employee']);
          goToStep(Math.min(activeIndex + 1, steps.length - 1), true);
        }}
        onBack={() => goToStep(Math.max(activeIndex - 1, 0))}
      />
    );
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
        </div>
      </section>

      <section className="quick-setup-stepper-shell">
        <div className="quick-setup-stepper">
          {steps.map((step, index) => {
            const isDone = isStepDone(step);
            const isActive = index === activeIndex;
            const wasVisited = visitedSteps.has(index);
            const currentIsDone = isStepDone(steps[activeIndex]);

            // قابل دسترس: done، جاری، بازدیدشده
            // استپ بعدی فقط اگر جاری تکمیل شده باشد
            const canAccess =
              isDone ||
              isActive ||
              wasVisited ||
              (index === activeIndex + 1 && currentIsDone);

            // تعیین کلاس badge:
            // 1. done + active → بنفش با تیک (is-done-active)
            // 2. done + not active → سبز با تیک (is-done)
            // 3. active + not done → بنفش با عدد (is-current)
            // 4. visited + not done + not active → بدون رنگ با عدد (is-visited)
            // 5. بقیه → disabled (is-future)
            let stepClass = 'quick-step';
            if (isDone && isActive) {
              stepClass += ' is-done-active'; // بنفش + تیک
            } else if (isDone) {
              stepClass += ' is-done'; // سبز + تیک
            } else if (isActive) {
              stepClass += ' is-current'; // بنفش + عدد
            } else if (wasVisited) {
              stepClass += ' is-visited'; // بدون رنگ + عدد (قابل کلیک)
            } else {
              stepClass += ' is-future'; // disabled
            }

            return (
              <button
                key={step.key}
                type="button"
                disabled={!canAccess}
                className={stepClass}
                onClick={() => goToStep(index)}
              >
                <span className="quick-step-badge">
                  {isDone ? <Check size={16} /> : index + 1}
                </span>
                <strong>{step.title}</strong>
                <span>{step.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="quick-setup-stepper-footer">
          <strong>{activeStep.title}</strong>
          <span>{isStepDone(activeStep) ? 'این مرحله تکمیل شده است.' : activeStep.subtitle}</span>
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
            {/* بستن فقط برای محل کار نشان داده نمی‌شود */}
            {activeStep.key !== 'location' && (
              <button type="button" className="quick-setup-stage-toggle">
                <ChevronDown size={16} />
                بستن
              </button>
            )}
          </div>

          <div className="quick-setup-stage-body">
            {activeStep.key === 'location' ? (
              renderLocationStage()
            ) : activeStep.key === 'calendar' ? (
              renderCalendarStage()
            ) : activeStep.key === 'policy' ? (
              renderPolicyStage()
            ) : activeStep.key === 'employee' ? (
              renderEmployeeStage()
            ) : (
              <>
                <div className="quick-setup-info-panel quick-setup-info-panel-primary">
                  <div className="quick-setup-info-head">
                    <strong>وضعیت مرحله</strong>
                    <span className={`quick-setup-pill${isStepDone(activeStep) ? ' is-success' : ''}`}>{isStepDone(activeStep) ? 'تکمیل شده' : 'در انتظار تکمیل'}</span>
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
                    <a href={isStepDone(activeStep) ? activeStep.manageHref : activeStep.href} className="quick-setup-primary-action">
                      {isStepDone(activeStep) ? 'مدیریت مرحله' : 'شروع مرحله'}
                    </a>
                    <a href={activeStep.manageHref} className="quick-setup-secondary-action">
                      مشاهده فهرست
                    </a>
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
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
