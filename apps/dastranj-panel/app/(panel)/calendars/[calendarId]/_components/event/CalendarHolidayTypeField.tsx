'use client';

import { Building2, Check, Landmark, Lock } from 'lucide-react';
import {
  CALENDAR_FRIDAY_HOLIDAY_TYPE,
  CALENDAR_HOLIDAY_TYPE_OPTIONS,
  type CalendarHolidayType,
} from '../../../../../lib/calendar-event-types';

const HOLIDAY_TYPE_ICONS = {
  official: Landmark,
  organizational: Building2,
} as const;

type CalendarHolidayTypeFieldProps = {
  value: CalendarHolidayType | null;
  lockedFriday?: boolean;
  rangeIncludesFriday?: boolean;
  onChange: (value: CalendarHolidayType) => void;
};

export function CalendarHolidayTypeField({
  value,
  lockedFriday = false,
  rangeIncludesFriday = false,
  onChange,
}: CalendarHolidayTypeFieldProps) {
  return (
    <div className="calendar-event-holiday-type">
      <div className="calendar-event-holiday-type-head">
        <span>
          نوع تعطیلی <em>*</em>
        </span>
        <p>
          {lockedFriday ? (
            <>
              این روز (یا بازهٔ شما) به‌عنوان <strong>تعطیل هفتگی</strong> تشخیص داده شده است؛ فقط «{CALENDAR_FRIDAY_HOLIDAY_TYPE.label}» ثبت می‌شود و
              انتخاب رسمی/سازمانی ندارید.
            </>
          ) : (
            <>
              برای روزهای <strong>غیرتعطیل هفتگی</strong> یکی از دو گزینه را انتخاب کنید؛ رسمی و سازمانی در حقوق و دستمزد ضریب
              متفاوتی دارند.
            </>
          )}
        </p>
      </div>

      {lockedFriday ? (
        <div
          className="calendar-event-holiday-type-card is-locked is-friday"
          title={CALENDAR_FRIDAY_HOLIDAY_TYPE.tooltip}
        >
          <span className="calendar-event-holiday-type-card-icon is-friday" aria-hidden>
            <Lock className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="calendar-event-holiday-type-copy">
            <span className="calendar-event-holiday-type-title">
              <strong>{CALENDAR_FRIDAY_HOLIDAY_TYPE.label}</strong>
              <span className="calendar-event-holiday-type-lock">قفل‌شده</span>
            </span>
            <p>{CALENDAR_FRIDAY_HOLIDAY_TYPE.tooltip}</p>
          </span>
        </div>
      ) : (
        <div className="calendar-event-holiday-type-grid" role="radiogroup" aria-label="نوع تعطیلی">
          {CALENDAR_HOLIDAY_TYPE_OPTIONS.map((option) => {
            const isActive = value === option.id;
            const Icon = HOLIDAY_TYPE_ICONS[option.id];

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`calendar-event-holiday-type-card is-${option.id}${isActive ? ' is-active' : ''}`}
                title={option.tooltip}
                onClick={() => onChange(option.id)}
              >
                <span className={`calendar-event-holiday-type-card-icon is-${option.id}`} aria-hidden>
                  <Icon className="h-4 w-4" strokeWidth={2.1} />
                </span>
                <span className="calendar-event-holiday-type-copy">
                  <span className="calendar-event-holiday-type-title">
                    <strong>{option.label}</strong>
                  </span>
                  <p>{option.tooltip}</p>
                </span>
                <span className="calendar-event-holiday-type-check" aria-hidden>
                  {isActive ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {rangeIncludesFriday ? (
        <p className="calendar-event-hint calendar-event-holiday-range-note">
          روزهای تعطیل هفتگی در بازه انتخابی به‌صورت «{CALENDAR_FRIDAY_HOLIDAY_TYPE.label}» ثبت می‌شوند و مشمول ضریب تعطیل هفتگی
          خواهند بود.
        </p>
      ) : null}
    </div>
  );
}
