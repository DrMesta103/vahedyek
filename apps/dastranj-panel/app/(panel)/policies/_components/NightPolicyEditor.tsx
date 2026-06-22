'use client';

import { useState, type InvalidEvent } from 'react';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyToggleField,
} from './PolicyWorkspaceShell';

export function NightPolicyEditor({
  backHref,
  nightEnabled,
  nightStart,
  nightEnd,
}: {
  backHref: string;
  nightEnabled: boolean;
  nightStart: string;
  nightEnd: string;
}) {
  const [enabled, setEnabled] = useState(nightEnabled);
  const [startTime, setStartTime] = useState(nightStart);
  const [endTime, setEndTime] = useState(nightEnd);

  const setRequiredTimeMessage =
    (message: string) =>
    (event: InvalidEvent<HTMLInputElement>) => {
      if (event.currentTarget.validity.valueMissing) {
        event.currentTarget.setCustomValidity(message);
        return;
      }
      event.currentTarget.setCustomValidity('');
    };

  return (
    <div className="policy-form-card night-policy-editor">
      <section className="shift-policy-panel night-policy-panel">
        <div className="night-policy-panel-header">
          <h2>تنظیمات شب‌کاری</h2>
          <p>فعال‌سازی و تعیین بازه‌ای که در محاسبات حضور و حقوق به عنوان شب‌کاری شناخته می‌شود.</p>
        </div>

        <PolicyToggleField
          name="nightEnabled"
          label="فعال‌سازی تنظیمات شب‌کاری"
          hint="در صورت فعال بودن، بازه شب‌کاری برای تشخیص ساعات شب‌کاری در محاسبات حضور و حقوق استفاده می‌شود."
          checked={enabled}
          onCheckedChange={setEnabled}
        />

        <PolicyInfoStrip text="در صورت فعال بودن، بازه شب‌کاری برای تشخیص ساعات شب‌کاری در محاسبات حضور و حقوق استفاده می‌شود." />

        <div className="policy-field-grid policy-field-grid-2">
          <label className="policy-field-stack">
            <PolicyFieldLabel label="شروع بازه شب‌کاری" required={enabled} hint="نمونه: 22:00" />
            <PolicyFieldInput
              name="nightStart"
              type="time"
              value={startTime}
              disabled={!enabled}
              required={enabled}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setStartTime(event.currentTarget.value);
              }}
              onInput={(event) => event.currentTarget.setCustomValidity('')}
              onInvalid={setRequiredTimeMessage('شروع بازه شب‌کاری را وارد کنید')}
            />
          </label>

          <label className="policy-field-stack">
            <PolicyFieldLabel label="پایان بازه شب‌کاری" required={enabled} hint="نمونه: 06:00" />
            <PolicyFieldInput
              name="nightEnd"
              type="time"
              value={endTime}
              disabled={!enabled}
              required={enabled}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setEndTime(event.currentTarget.value);
              }}
              onInput={(event) => event.currentTarget.setCustomValidity('')}
              onInvalid={setRequiredTimeMessage('پایان بازه شب‌کاری را وارد کنید')}
            />
          </label>
        </div>

        <p className="shift-policy-hint">
          {enabled
            ? 'بازه‌های عبوری از نیمه‌شب نیز پشتیبانی می‌شوند؛ مثل 22:00 تا 06:00.'
            : 'با غیرفعال بودن این بخش، هیچ بازه‌ای به عنوان شب‌کاری در سیاست کاری محاسبه نمی‌شود.'}
        </p>
      </section>

      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
