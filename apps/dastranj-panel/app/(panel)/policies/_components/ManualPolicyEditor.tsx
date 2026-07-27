import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldSelect,
  PolicyFormActions,
  PolicyToggleField,
} from './PolicyWorkspaceShell';

function ManualPolicyNumberField({
  name,
  label,
  required,
  unit,
  defaultValue,
  hint,
  fullWidth,
}: {
  name: string;
  label: string;
  required?: boolean;
  unit: string;
  defaultValue: number;
  hint: string;
  fullWidth?: boolean;
}) {
  return (
    <label className={`policy-field-stack shift-policy-field manual-policy-field${fullWidth ? ' is-full-width' : ''}`}>
      <PolicyFieldLabel label={label} required={required} />
      <div className="shift-policy-control-wrap">
        <PolicyFieldInput name={name} type="number" defaultValue={defaultValue} min={0} required={required} />
        <span className="shift-policy-unit">{unit}</span>
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

export function ManualPolicyEditor({
  backHref,
  policyId,
  manualEntryEnabled,
  manualRequireReason,
  requireAttachment,
  manualPastDaysEnabled,
  manualMaxPastDays,
  manualMonthlyCapPerUser,
  incompleteAttendanceRule,
}: {
  backHref: string;
  policyId: string;
  manualEntryEnabled: boolean;
  manualRequireReason: boolean;
  requireAttachment: boolean;
  manualPastDaysEnabled: boolean;
  manualMaxPastDays: number;
  manualMonthlyCapPerUser: number;
  incompleteAttendanceRule: 'correction_required' | 'warning_only';
}) {
  const returnPath = policyId ? `/policies/manual?policyId=${policyId}` : '/policies/manual';

  return (
    <div className="policy-form-card manual-policy-editor">
      <section className="shift-policy-panel manual-policy-panel">
        <div className="manual-policy-panel-header">
          <h2>سیاست‌های تردد دستی</h2>
          <p>تعریف شرایط ثبت دستی ورود و خروج، محدودیت‌ها و تاییدها</p>
        </div>

        <div className="manual-policy-toggles">
          <label className="policy-field-stack">
            <PolicyFieldLabel label="اگر ورود یا خروج کامل ثبت نشود، سیستم چه کند؟" />
            <PolicyFieldSelect name="incompleteAttendanceRule" defaultValue={incompleteAttendanceRule}>
              <option value="correction_required">تردد ناقص و درخواست اصلاح لازم باشد</option>
              <option value="warning_only">فقط هشدار ثبت شود</option>
            </PolicyFieldSelect>
          </label>
          <PolicyToggleField
            name="manualEntryEnabled"
            label="فعال‌سازی تردد دستی"
            hint="اجازه ثبت دستی ورود/خروج برای کاربران"
            defaultChecked={manualEntryEnabled}
          />
          <PolicyToggleField
            name="manualRequireReason"
            label="الزام ثبت دلیل"
            hint="کاربر هنگام ثبت دستی باید دلیل وارد کند"
            defaultChecked={manualRequireReason}
          />
          <PolicyToggleField
            name="requireAttachment"
            label="الزام پیوست"
            hint="مثلاً نامه، اسکرین‌شات یا تایید سرپرست"
            defaultChecked={requireAttachment}
          />
          <ManualPolicyNumberField
            name="manualMaxPastDays"
            label="حداکثر تعداد روز گذشته مجاز"
            required
            unit="روز"
            defaultValue={manualMaxPastDays}
            hint="تعداد روز مجاز برای برگشت به عقب"
          />
          <PolicyToggleField
            name="manualPastDaysEnabled"
            label="امکان ثبت برای روزهای گذشته"
            hint="کاربر بتواند برای روزهای قبل نیز درخواست ثبت کند"
            defaultChecked={manualPastDaysEnabled}
          />
        </div>

        <ManualPolicyNumberField
          name="manualMonthlyCapPerUser"
          label="سقف ماهانه ثبت دستی برای هر کاربر"
          required
          unit="بار"
          defaultValue={manualMonthlyCapPerUser}
          hint="هر نفر در ماه حداکثر چند بار ثبت دستی انجام دهد"
          fullWidth
        />
      </section>

      <input type="hidden" name="returnPath" value={returnPath} />
      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
