'use client';

import { CircleHelp } from 'lucide-react';
import { useState, type InvalidEvent, type ReactNode } from 'react';
import { TaavTooltip, TaavTooltipProvider } from '@repo/ui/taav/primitives';
import { MinutesEquivalentHint } from '../../../components/MinutesEquivalentHint';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldSelect,
  PolicyFormActions,
} from './PolicyWorkspaceShell';

type FloatingShiftVariant = 'floating-day' | 'floating-absolute';

const SECTION_COPY: Record<FloatingShiftVariant, { title: string; description: string }> = {
  'floating-day': {
    title: 'محاسبه کم‌کاری',
    description:
      'در این نوع شیفت، ورود در یک بازه مجاز انجام می‌شود اما کارمند باید مدت کار مورد انتظار را کامل کند.',
  },
  'floating-absolute': {
    title: 'محاسبه کارکرد روزانه',
    description:
      'در این نوع شیفت، ساعت ورود و خروج ثابت نیست و معیار اصلی، تکمیل مدت کار مورد انتظار در روز است.',
  },
};

const WORK_SHORTAGE_GRACE_TOOLTIP: Record<FloatingShiftVariant, string> = {
  'floating-day':
    'در شیفت شناور شروع روز، کارمند می‌تواند در بازه مجاز ورود وارد شود، اما باید مدت کار مورد انتظار را کامل کند. این فرجه مشخص می‌کند چه مقدار کمبود جزئی در کارکرد روزانه قابل چشم‌پوشی است.',
  'floating-absolute':
    'در شیفت شناور مطلق، ساعت ورود و خروج ثابت نیست و معیار اصلی مجموع کارکرد روزانه است. این فرجه مشخص می‌کند چه مقدار کمبود جزئی نسبت به مدت کار مورد انتظار قابل چشم‌پوشی است.',
};

const MAX_SHORTAGE_ABSENCE_TOOLTIP: Record<FloatingShiftVariant, string> = {
  'floating-day':
    'این مقدار آستانه تبدیل کم‌کاری به غیبت است. در شیفت شناور شروع روز، کم‌کاری بر اساس تفاوت بین مدت کار مورد انتظار و کارکرد واقعی همان روز محاسبه می‌شود.',
  'floating-absolute':
    'این مقدار آستانه تبدیل کم‌کاری به غیبت است. در شیفت شناور مطلق، چون ساعت شروع و پایان ثابت وجود ندارد، غیبت بر اساس کمبود شدید در مجموع کارکرد روزانه تشخیص داده می‌شود.',
};

function ShortageCalculationTooltipContent() {
  return (
    <div className="floating-shift-tooltip-content">
      <p>
        در حالت ملایم، فقط مقدار مازاد بر فرجه مجاز کمبود کارکرد به‌عنوان کم‌کاری ثبت می‌شود. در حالت سخت‌گیرانه، کل
        کمبود نسبت به مدت کار مورد انتظار به‌عنوان کم‌کاری محاسبه می‌شود.
      </p>
      <p>
        اگر مدت کار مورد انتظار ۸ ساعت باشد، فرجه کمبود کارکرد ۱۰ دقیقه باشد و کارمند ۷ ساعت و ۴۰ دقیقه کار کرده
        باشد:
        <br />
        در حالت ملایم، ۱۰ دقیقه کم‌کاری ثبت می‌شود.
        <br />
        در حالت سخت‌گیرانه، ۲۰ دقیقه کم‌کاری ثبت می‌شود.
      </p>
    </div>
  );
}

function FloatingShiftFieldLabel({
  label,
  required,
  tooltip,
}: {
  label: string;
  required?: boolean;
  tooltip: ReactNode;
}) {
  return (
    <div className="floating-shift-policy-field-label">
      <PolicyFieldLabel label={label} required={required} />
      <TaavTooltip content={tooltip} side="top" align="end" contentClassName="floating-shift-policy-tooltip">
        <button type="button" className="floating-shift-policy-info-btn" aria-label={`راهنمای ${label}`}>
          <CircleHelp className="h-3.5 w-3.5" aria-hidden />
        </button>
      </TaavTooltip>
    </div>
  );
}

export function FloatingShiftPolicyEditor({
  variant,
  entryGraceMinutes,
  delayCalculationMode,
  maxDelayMinutes,
  preservedRequiredHours,
  backHref,
}: {
  variant: FloatingShiftVariant;
  entryGraceMinutes: number;
  delayCalculationMode: string;
  maxDelayMinutes: number;
  preservedRequiredHours?: number;
  backHref: string;
}) {
  const section = SECTION_COPY[variant];
  const [graceMinutes, setGraceMinutes] = useState(entryGraceMinutes);
  const [maxShortageMinutes, setMaxShortageMinutes] = useState(maxDelayMinutes);

  const clearValidity = (event: React.FormEvent<HTMLInputElement>) => {
    event.currentTarget.setCustomValidity('');
  };

  const validateGraceMinutes = (event: InvalidEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    if (event.currentTarget.validity.valueMissing) {
      event.currentTarget.setCustomValidity('فرجه مجاز کمبود کارکرد را وارد کنید.');
      return;
    }
    if (!Number.isFinite(value) || value < 0) {
      event.currentTarget.setCustomValidity('فرجه مجاز کمبود کارکرد نمی‌تواند منفی باشد.');
      return;
    }
    event.currentTarget.setCustomValidity('');
  };

  const validateMaxShortageMinutes = (event: InvalidEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    if (event.currentTarget.validity.valueMissing) {
      event.currentTarget.setCustomValidity('حداکثر کم‌کاری برای غیبت را وارد کنید.');
      return;
    }
    if (!Number.isFinite(value) || value < 0) {
      event.currentTarget.setCustomValidity('حداکثر کم‌کاری برای غیبت نمی‌تواند منفی باشد.');
      return;
    }
    if (value <= graceMinutes) {
      event.currentTarget.setCustomValidity('حداکثر کم‌کاری برای غیبت باید بیشتر از فرجه مجاز کمبود کارکرد باشد.');
      return;
    }
    event.currentTarget.setCustomValidity('');
  };

  return (
    <TaavTooltipProvider>
      <section className="shift-policy-panel floating-shift-policy-panel">
        <div className="floating-shift-policy-panel-header">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>

        <div className="floating-shift-policy-panel-grid">
          <label className="policy-field-stack shift-policy-field floating-shift-policy-field">
            <FloatingShiftFieldLabel
              label="فرجه مجاز کمبود کارکرد"
              required
              tooltip={WORK_SHORTAGE_GRACE_TOOLTIP[variant]}
            />
            <div className="shift-policy-control-wrap">
              <PolicyFieldInput
                name="entryGraceMinutes"
                type="number"
                min={0}
                required
                defaultValue={entryGraceMinutes}
                onChange={(event) => {
                  clearValidity(event);
                  setGraceMinutes(Number(event.currentTarget.value) || 0);
                }}
                onInput={clearValidity}
                onInvalid={validateGraceMinutes}
              />
              <span className="shift-policy-unit">دقیقه</span>
            </div>
            <MinutesEquivalentHint minutes={graceMinutes} />
            <p className="shift-policy-hint">
              اگر کارکرد روزانه تا این مقدار کمتر از مدت کار مورد انتظار باشد، کم‌کاری ثبت نمی‌شود.
            </p>
          </label>

          <label className="policy-field-stack shift-policy-field floating-shift-policy-field">
            <FloatingShiftFieldLabel label="نحوه محاسبه کم‌کاری" required tooltip={<ShortageCalculationTooltipContent />} />
            <div className="shift-policy-select-wrap">
              <PolicyFieldSelect name="delayCalculationMode" defaultValue={delayCalculationMode || 'lenient'} required>
                <option value="lenient">ملایم</option>
                <option value="strict">سخت‌گیرانه</option>
              </PolicyFieldSelect>
            </div>
            <p className="shift-policy-hint">مشخص می‌کند کمبود کارکرد بعد از فرجه چگونه محاسبه شود.</p>
          </label>

          <label className="policy-field-stack shift-policy-field floating-shift-policy-field is-full-width">
            <FloatingShiftFieldLabel
              label="حداکثر کم‌کاری برای غیبت"
              required
              tooltip={MAX_SHORTAGE_ABSENCE_TOOLTIP[variant]}
            />
            <div className="shift-policy-control-wrap floating-shift-policy-control-narrow">
              <PolicyFieldInput
                name="maxDelayMinutes"
                type="number"
                min={0}
                required
                defaultValue={maxDelayMinutes}
                onChange={(event) => {
                  clearValidity(event);
                  setMaxShortageMinutes(Number(event.currentTarget.value) || 0);
                }}
                onInput={clearValidity}
                onInvalid={validateMaxShortageMinutes}
              />
              <span className="shift-policy-unit">دقیقه</span>
            </div>
            <MinutesEquivalentHint minutes={maxShortageMinutes} />
            <p className="shift-policy-hint">
              اگر کمبود کارکرد از این مقدار بیشتر شود، روز می‌تواند به‌عنوان غیبت ثبت شود.
            </p>
          </label>
        </div>
      </section>

      {variant === 'floating-absolute' && typeof preservedRequiredHours === 'number' ? (
        <input type="hidden" name="requiredHours" value={preservedRequiredHours} />
      ) : null}

      <PolicyFormActions cancelHref={backHref} submitLabel="ویرایش" />
    </TaavTooltipProvider>
  );
}
