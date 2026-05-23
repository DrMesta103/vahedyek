'use client';

import { useState } from 'react';
import { PolicyFieldInput, PolicyFieldLabel, PolicyFormActions, PolicyToggleField } from './PolicyWorkspaceShell';

function NightPolicyTimeField({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field">
      <PolicyFieldLabel label={label} />
      <div className="night-policy-control-wrap">
        <PolicyFieldInput name={name} type="time" defaultValue={defaultValue} required />
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

export function NightPolicyEditor({
  nightEnabled: initialNightEnabled,
  nightStart,
  nightEnd,
}: {
  nightEnabled: boolean;
  nightStart: string;
  nightEnd: string;
}) {
  const [nightEnabled, setNightEnabled] = useState(initialNightEnabled);

  return (
    <div className="policy-form-card night-policy-editor">
      <section className="shift-policy-panel night-policy-panel">
        <div className="night-policy-panel-header">
          <h2>تنظیمات شب کاری</h2>
          <p>تعریف بازه زمانی شب کاری برای محاسبه اضافه‌کاری و حق شب کاری</p>
        </div>

        <PolicyToggleField
          name="nightEnabled"
          label="فعال‌سازی تنظیمات شب کاری"
          hint="در صورت فعال بودن، بازه زمانی شب کاری قابل تنظیم است."
          checked={nightEnabled}
          onCheckedChange={setNightEnabled}
        />

        {nightEnabled ? (
          <div className="shift-policy-panel-grid night-policy-times">
            <NightPolicyTimeField
              name="nightStart"
              label="شروع شیفت شب"
              defaultValue={nightStart}
              hint="ساعت و دقیقه شروع شیفت شب کاری. مثلاً اگر شیفت شب از ۸ شب شروع شود، این مقدار ۲۰:۰۰ است."
            />
            <NightPolicyTimeField
              name="nightEnd"
              label="پایان شیفت شب"
              defaultValue={nightEnd}
              hint="ساعت و دقیقه پایان شیفت شب کاری. مثلاً اگر شیفت شب تا ۸ صبح تمام شود، این مقدار ۰۸:۰۰ است."
            />
          </div>
        ) : null}
      </section>

      <PolicyFormActions cancelHref="/policies" submitLabel="ذخیره تغییرات" />
    </div>
  );
}
