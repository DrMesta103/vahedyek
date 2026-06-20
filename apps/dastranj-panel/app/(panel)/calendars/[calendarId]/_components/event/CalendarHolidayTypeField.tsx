'use client';

import { Building2, CalendarDays, Check, ExternalLink, Landmark } from 'lucide-react';
import Link from 'next/link';
import {
  CALENDAR_ALL_HOLIDAY_TYPE_OPTIONS,
  getHolidayTypeCoefficient,
  getPayrollSettingsHrefForYear,
  type CalendarHolidayCoefficients,
  type CalendarHolidayType,
} from '../../../../../lib/calendar-event-types';
import { formatFaNumber } from '../../../../../lib/format-fa';

const HOLIDAY_TYPE_ICONS = {
  official: Landmark,
  organizational: Building2,
  friday: CalendarDays,
} as const;

function formatCoefficient(value: number) {
  return formatFaNumber(value, { useGrouping: false, fractionDigits: value % 1 === 0 ? 0 : 2 });
}

type CalendarHolidayTypeFieldProps = {
  value: CalendarHolidayType | null;
  coefficients: CalendarHolidayCoefficients;
  onChange: (value: CalendarHolidayType) => void;
};

function HolidayCoefficientHint({
  type,
  coefficients,
}: {
  type: CalendarHolidayType;
  coefficients: CalendarHolidayCoefficients;
}) {
  const coefficient = getHolidayTypeCoefficient(type, coefficients);
  const payrollSettingsHref = getPayrollSettingsHrefForYear(coefficients.year);

  if (!coefficients.isConfigured) {
    return (
      <div className="calendar-event-holiday-type-coefficient is-missing">
        <span className="calendar-event-holiday-type-coefficient-label">ضریب سال {formatFaNumber(coefficients.year, { useGrouping: false })}</span>
        <p>
          ضرایب حقوق و دستمزد برای این سال هنوز توسط صاحب کسب‌وکار تنظیم نشده است. مقدار پیش‌فرض{' '}
          <strong>{formatCoefficient(coefficient)}</strong> نمایش داده می‌شود.
        </p>
        <Link href={payrollSettingsHref} className="calendar-event-holiday-type-settings-link">
          <span>تنظیم ضرایب در بخش صاحب کسب‌وکار</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="calendar-event-holiday-type-coefficient">
      <span className="calendar-event-holiday-type-coefficient-label">
        ضریب کارکرد در سال {formatFaNumber(coefficients.year, { useGrouping: false })}
      </span>
      <p>
        در صورت کارکرد در این روز، ضریب <strong>{formatCoefficient(coefficient)}</strong> طبق تنظیمات حقوق و دستمزد
        اعمال می‌شود.
      </p>
    </div>
  );
}

export function CalendarHolidayTypeField({ value, coefficients, onChange }: CalendarHolidayTypeFieldProps) {
  return (
    <div className="calendar-event-holiday-type">
      <div className="calendar-event-holiday-type-head">
        <span>
          نوع تعطیلی <em>*</em>
        </span>
        <p>
          یکی از سه نوع را انتخاب کنید. هر نوع در محاسبه حقوق و دستمزد ضریب متفاوتی دارد؛ انتخاب درست از بروز اختلاف
          در گزارش‌های حقوقی جلوگیری می‌کند.
        </p>
      </div>

      <div className="calendar-event-holiday-type-grid" role="radiogroup" aria-label="نوع تعطیلی">
        {CALENDAR_ALL_HOLIDAY_TYPE_OPTIONS.map((option) => {
          const isActive = value === option.id;
          const Icon = HOLIDAY_TYPE_ICONS[option.id];
          const coefficient = getHolidayTypeCoefficient(option.id, coefficients);
          const cardTitle = `${option.label} — ${option.summary}. ضریب سال ${coefficients.year}: ${formatCoefficient(coefficient)}`;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`calendar-event-holiday-type-card is-${option.id}${isActive ? ' is-active' : ''}`}
              title={cardTitle}
              onClick={() => onChange(option.id)}
            >
              <span className={`calendar-event-holiday-type-card-icon is-${option.id}`} aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <span className="calendar-event-holiday-type-copy">
                <span className="calendar-event-holiday-type-title">
                  <strong>{option.label}</strong>
                </span>
                <p>{option.summary}</p>
                <HolidayCoefficientHint type={option.id} coefficients={coefficients} />
              </span>
              <span className="calendar-event-holiday-type-check" aria-hidden>
                {isActive ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
