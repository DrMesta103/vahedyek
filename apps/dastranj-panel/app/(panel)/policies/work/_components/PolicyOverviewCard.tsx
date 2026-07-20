'use client';

import { MinimalScroll } from '../../../../components/MinimalScroll';

import { useEffect, useState } from 'react';
import { CalendarDays, Lock, Pencil, X } from 'lucide-react';
import { updatePolicyBasicInfoAction } from '../../../../lib/actions';

type PolicyOverviewCardProps = {
  policyId: string;
  title: string;
  description: string;
  calendarYearLabel: string;
  calendarTitle: string;
  calendarId: string;
  calendars: Array<{ id: string; title: string; yearLabel: string }>;
  groupCount: number;
  readOnly?: boolean;
};

function resolveCalendarTitle(calendarTitle: string) {
  return calendarTitle.trim() || 'ثبت نشده';
}

function resolveCalendarYear(yearLabel: string) {
  const year = yearLabel.trim();
  if (!year || year === '-') return 'ثبت نشده';
  return year;
}

export function PolicyOverviewCard({
  policyId,
  title,
  description,
  calendarYearLabel,
  calendarTitle,
  calendarId,
  calendars,
  groupCount,
  readOnly = false,
}: PolicyOverviewCardProps) {
  const [open, setOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description);
  const [draftCalendarId, setDraftCalendarId] = useState(calendarId);

  useEffect(() => {
    if (!open) {
      setDraftTitle(title);
      setDraftDescription(description);
      setDraftCalendarId(calendarId);
    }
  }, [title, description, calendarId, open]);
  const changed = draftTitle.trim() !== title.trim() || draftDescription.trim() !== description.trim() || draftCalendarId !== calendarId;
  const calendarChanged = draftCalendarId !== calendarId;

  const titleValue = title.trim() || 'ثبت نشده';
  const descriptionValue = description.trim() || 'ثبت نشده';
  const calendarTitleValue = resolveCalendarTitle(calendarTitle);
  const calendarYearValue = resolveCalendarYear(calendarYearLabel);

  return (
    <>
      <article className="module-grid-card policy-overview-card">
        <header className="policy-overview-top">
          <div className="policy-overview-top-copy">
            <span className="policy-overview-eyebrow">اطلاعات پایه سیاست</span>
            <p className="policy-overview-top-hint">اطلاعات پایه و تقویم با کنترل اثر روی گروه‌های متصل قابل ویرایش است.</p>
          </div>
          {!readOnly ? <button type="button" className="policy-overview-edit-btn" onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden />
            ویرایش
          </button> : null}
        </header>

        <div className="policy-overview-fields">
          <div className="policy-overview-field">
            <span className="policy-overview-field-label">عنوان</span>
            <span className="policy-overview-field-value is-title">{titleValue}</span>
          </div>

          <div className="policy-overview-field">
            <span className="policy-overview-field-label">توضیحات</span>
            <span className="policy-overview-field-value">{descriptionValue}</span>
          </div>

          <div className="policy-overview-field is-readonly">
            <span className="policy-overview-field-label">عنوان تقویم</span>
            <span className="policy-overview-field-value">{calendarTitleValue}</span>
          </div>

          <div className="policy-overview-field is-readonly">
            <span className="policy-overview-field-label">
              <CalendarDays className="policy-overview-field-icon" aria-hidden />
              سال کاری
            </span>
            <div className="policy-overview-field-value-wrap">
              <span className="policy-overview-field-value">{calendarYearValue}</span>
              <span className="policy-overview-readonly-badge">
                <Lock className="h-3 w-3" aria-hidden />
                غیرقابل ویرایش
              </span>
            </div>
          </div>
        </div>
      </article>

      {open ? (
        <div className="policy-basic-dialog-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <MinimalScroll
            className="policy-basic-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-basic-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="policy-basic-dialog-title" className="policy-basic-dialog-title">
              ویرایش اطلاعات پایه
            </h2>

            <form action={updatePolicyBasicInfoAction as never} className="policy-basic-dialog-form" onSubmit={(event) => {
              if (!changed) { event.preventDefault(); return; }
              if (groupCount > 0 && calendarChanged && !window.confirm('تقویم کاری این سیاست در حال تغییر است. این تغییر می‌تواند روزهای کاری، تعطیلات، برنامه‌های زمانی و نتایج پردازش تردد گروه‌های متصل را تحت تأثیر قرار دهد. آیا ادامه می‌دهید؟')) event.preventDefault();
              else if (groupCount > 0 && !calendarChanged && !window.confirm('این سیاست در گروه‌های کاری استفاده می‌شود. ذخیره این تغییرات می‌تواند قواعد پردازش کارکنان این گروه‌ها را تغییر دهد. آیا از ذخیره تغییرات مطمئن هستید؟')) event.preventDefault();
            }}>
              <input type="hidden" name="policyId" value={policyId} />

              <label className="policy-basic-dialog-field">
                <span className="policy-basic-dialog-label">
                  عنوان <span className="policy-field-required">*</span>
                </span>
                <span className="policy-basic-dialog-input-wrap">
                  <input
                    name="title"
                    required
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="policy-field-input"
                    placeholder="عنوان سیاست کاری"
                  />
                  {draftTitle ? (
                    <button
                      type="button"
                      className="policy-basic-dialog-clear"
                      aria-label="پاک کردن عنوان"
                      onClick={() => setDraftTitle('')}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </span>
                <span className="policy-basic-dialog-hint">عنوان نمایشی این سیاست در فهرست و صفحات ویرایش</span>
              </label>

              <label className="policy-basic-dialog-field">
                <span className="policy-basic-dialog-label">توضیحات</span>
                <textarea
                  name="description"
                  rows={4}
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  className="policy-field-textarea"
                  placeholder="توضیح کوتاه برای مدیران"
                />
                <span className="policy-basic-dialog-hint">توضیحات تکمیلی (اختیاری)</span>
              </label>

              {groupCount > 0 ? <div className="policy-info-strip" role="alert"><p>این سیاست کاری در گروه‌های کاری استفاده می‌شود. تغییر قواعد آن می‌تواند بر پردازش تردد، تأخیر، غیبت، اضافه‌کاری و درخواست‌های کارکنان اثر بگذارد.</p></div> : null}
              <div className="policy-basic-dialog-readonly">
                <span className="policy-basic-dialog-label">تقویم کاری</span>
                <select name="calendarId" className="policy-field-select" value={draftCalendarId} onChange={(event) => setDraftCalendarId(event.target.value)} required>{calendars.map((item) => <option key={item.id} value={item.id}>{item.title} {item.yearLabel ? `- ${item.yearLabel}` : ''}</option>)}</select>
                {groupCount > 0 && calendarChanged ? <p className="policy-basic-dialog-readonly-note" role="alert">تقویم کاری این سیاست در حال تغییر است و می‌تواند نتایج پردازش تردد گروه‌های متصل را تغییر دهد.</p> : null}
              </div>

              <div className="policy-basic-dialog-actions">
                <button type="button" className="policy-basic-dialog-cancel" onClick={() => setOpen(false)}>
                  لغو
                </button>
                <button type="submit" className="policy-basic-dialog-submit" disabled={!changed}>
                  تایید
                </button>
              </div>
            </form>
          </MinimalScroll>
        </div>
      ) : null}
    </>
  );
}
