import { PolicyFormActions, PolicyInfoStrip, PolicyToggleField } from './PolicyWorkspaceShell';

export function OvertimePolicyEditor({
  backHref,
  policyId,
  overtimeFromAttendance,
  overtimeRequireAttachment,
  overtimeBeforeShift,
  overtimeAfterShift,
}: {
  backHref: string;
  policyId: string;
  overtimeFromAttendance: boolean;
  overtimeRequireAttachment: boolean;
  overtimeBeforeShift: boolean;
  overtimeAfterShift: boolean;
}) {
  const returnPath = policyId
    ? `/policies/work/base?policyId=${policyId}&section=overtime`
    : '/policies/work/base?section=overtime';

  return (
    <div className="policy-form-card overtime-policy-editor">
      <PolicyInfoStrip text="در سیاست اضافه‌کاری، قوانین محاسبه خودکار از تردد و الزام پیوست فایل تنظیم می‌شود." />

      <section className="shift-policy-panel overtime-policy-panel">
        <div className="overtime-policy-panel-header">
          <h2>سیاست‌های اضافه‌کاری</h2>
          <p>تعریف قوانین ثبت و محاسبه اضافه‌کاری بر اساس تردد و برنامه کاری</p>
        </div>

        <div className="overtime-policy-toggles">
          <PolicyToggleField
            name="overtimeFromAttendance"
            label="محاسبه خودکار از تردد"
            hint="اختلاف ورود/خروج با برنامه کاری به صورت خودکار اضافه‌کاری شود"
            defaultChecked={overtimeFromAttendance}
          />
          <PolicyToggleField
            name="overtimeRequireAttachment"
            label="الزام به پیوست"
            hint="برای ثبت «اضافه‌کاری» پیوست فایل الزامی باشد"
            defaultChecked={overtimeRequireAttachment}
          />
          <PolicyToggleField
            name="overtimeBeforeShift"
            label="اضافه‌کاری قبل از شیفت"
            hint="با روشن بودن محاسبه خودکار، زمان قبل از شروع شیفت محاسبه شود"
            defaultChecked={overtimeBeforeShift}
          />
          <PolicyToggleField
            name="overtimeAfterShift"
            label="اضافه‌کاری بعد از شیفت"
            hint="با روشن بودن محاسبه خودکار، زمان بعد از پایان شیفت محاسبه شود"
            defaultChecked={overtimeAfterShift}
          />
        </div>
      </section>

      <input type="hidden" name="returnPath" value={returnPath} />
      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
