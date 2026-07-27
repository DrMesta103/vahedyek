import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldSelect,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyToggleField,
} from './PolicyWorkspaceShell';

function OtherPolicyNumberField({
  name,
  label,
  required,
  unit,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  unit: string;
  defaultValue: number;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field other-policy-field">
      <PolicyFieldLabel label={label} required={required} />
      <div className="shift-policy-control-wrap">
        <PolicyFieldInput name={name} type="number" defaultValue={defaultValue} min={0} required={required} />
        <span className="shift-policy-unit">{unit}</span>
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

export function OtherPolicyEditor({
  backHref,
  policyId,
  requireGeofence,
  faceRecognitionInFlow,
  consecutiveAbsenceWarning,
  maxConsecutiveAbsenceDays,
  locationRule,
}: {
  backHref: string;
  policyId: string;
  requireGeofence: boolean;
  faceRecognitionInFlow: boolean;
  consecutiveAbsenceWarning: boolean;
  maxConsecutiveAbsenceDays: number;
  locationRule: 'workplace_only' | 'unrestricted';
}) {
  const returnPath = policyId
    ? `/policies/work/base?policyId=${policyId}&section=other`
    : '/policies/work/base?section=other';

  return (
    <div className="policy-form-card other-policy-editor">
      <PolicyInfoStrip text="در سایر سیاست‌ها، تنظیمات تکمیلی حضور و غیاب مانند محدوده مکانی، تشخیص چهره و هشدار غیبت تنظیم می‌شود." />

      <section className="shift-policy-panel other-policy-panel">
        <div className="other-policy-panel-header">
          <h2>سایر سیاست‌ها</h2>
          <p>تنظیمات تکمیلی حضور و غیاب که در سایر تب‌ها پوشش داده نشده‌اند</p>
        </div>

        <div className="other-policy-toggles">
          <label className="policy-field-stack">
            <PolicyFieldLabel label="کارمند از کجا اجازه ثبت تردد دارد؟" />
            <PolicyFieldSelect name="locationRule" defaultValue={locationRule}>
              <option value="workplace_only">فقط در محل کار</option>
              <option value="unrestricted">بدون محدودیت مکانی</option>
            </PolicyFieldSelect>
          </label>
          <PolicyToggleField
            name="requireGeofence"
            label="الزام محدوده مکانی (Geofence)"
            hint="ثبت تردد فقط داخل محدوده‌های تعریف‌شده مجاز باشد"
            defaultChecked={requireGeofence}
          />
          <PolicyToggleField
            name="faceRecognitionInFlow"
            label="تشخیص چهره در فلو تردد"
            hint="برای ثبت ورود/خروج، تایید چهره کاربر در جریان تردد انجام شود"
            defaultChecked={faceRecognitionInFlow}
          />
          <PolicyToggleField
            name="consecutiveAbsenceWarning"
            label="هشدار سقف غیبت متوالی"
            hint="با رسیدن به سقف غیبت، هشدار برای مدیر ارسال شود"
            defaultChecked={consecutiveAbsenceWarning}
          />
        </div>

        <OtherPolicyNumberField
          name="maxConsecutiveAbsenceDays"
          label="حداکثر غیبت متوالی برای هشدار"
          required
          unit="روز"
          defaultValue={maxConsecutiveAbsenceDays}
          hint="حداکثر غیبت متوالی برای هشدار"
        />
      </section>

      <input type="hidden" name="returnPath" value={returnPath} />
      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
