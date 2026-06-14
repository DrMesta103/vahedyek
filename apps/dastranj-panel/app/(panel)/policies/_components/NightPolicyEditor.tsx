import { PolicyFormActions, PolicyToggleField } from './PolicyWorkspaceShell';

export function NightPolicyEditor({
  backHref,
  nightEnabled,
}: {
  backHref: string;
  nightEnabled: boolean;
}) {
  return (
    <div className="policy-form-card night-policy-editor">
      <section className="shift-policy-panel night-policy-panel">
        <div className="night-policy-panel-header">
          <h2>تنظیمات شب کاری</h2>
          <p>فعال یا غیرفعال کردن قوانین شب‌کاری برای محاسبه اضافه‌کاری و حق شب‌کاری</p>
        </div>

        <PolicyToggleField
          name="nightEnabled"
          label="فعال‌سازی تنظیمات شب کاری"
          hint="در صورت فعال بودن، قوانین شب‌کاری در محاسبات حضور و حقوق اعمال می‌شود."
          defaultChecked={nightEnabled}
        />
      </section>

      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
