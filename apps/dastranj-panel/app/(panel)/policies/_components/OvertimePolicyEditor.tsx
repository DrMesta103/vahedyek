import { PolicyFieldInput, PolicyFieldLabel, PolicyFieldSelect, PolicyFormActions, PolicyInfoStrip, PolicyToggleField } from './PolicyWorkspaceShell';

export function OvertimePolicyEditor({
  backHref,
  policyId,
  overtimeFromAttendance,
  overtimeRequireAttachment,
  overtimeBeforeShift,
  overtimeAfterShift,
  dailyLimitHours,
  overtimeRule,
  requestRule,
}: {
  backHref: string;
  policyId: string;
  overtimeFromAttendance: boolean;
  overtimeRequireAttachment: boolean;
  overtimeBeforeShift: boolean;
  overtimeAfterShift: boolean;
  dailyLimitHours: number;
  overtimeRule: 'manager_approval' | 'automatic' | 'disabled';
  requestRule: 'leave_and_correction' | 'leave_only' | 'correction_only' | 'none';
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
          <label className="policy-field-stack">
            <PolicyFieldLabel label="سقف اضافه‌کاری روزانه (ساعت)" hint="حداکثر اضافه‌کاری مجاز برای هر روز کاری در این سیاست." />
            <PolicyFieldInput name="dailyLimitHours" type="number" min="0.25" max="24" step="0.25" defaultValue={dailyLimitHours} required />
          </label>
          <label className="policy-field-stack">
            <PolicyFieldLabel label="آیا اضافه‌کاری در این سیاست فعال باشد؟" hint="نرخ و محاسبات مالی در حقوق و دستمزد مدیریت می‌شود." />
            <PolicyFieldSelect name="overtimeRule" defaultValue={overtimeRule}>
              <option value="manager_approval">فعال، فقط با تأیید مدیر</option>
              <option value="automatic">فعال، بدون تأیید مدیر</option>
              <option value="disabled">غیرفعال</option>
            </PolicyFieldSelect>
          </label>
          <label className="policy-field-stack">
            <PolicyFieldLabel label="آیا درخواست مرخصی و اصلاح تردد فعال باشد؟" />
            <PolicyFieldSelect name="requestRule" defaultValue={requestRule}>
              <option value="leave_and_correction">هر دو فعال</option>
              <option value="leave_only">فقط مرخصی</option>
              <option value="correction_only">فقط اصلاح تردد</option>
              <option value="none">هیچ‌کدام</option>
            </PolicyFieldSelect>
          </label>
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
