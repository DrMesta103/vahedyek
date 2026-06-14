import {
  getLeavePolicyDefaultsFromSectionValues,
  LEAVE_TYPE_MODE_TOOLTIPS,
  LEAVE_TYPE_DESCRIPTIONS,
  LEAVE_VARIANT_TO_TYPE,
} from '../../../lib/leave-policy';
import type { PolicyFamilyKey, PolicyWorkspaceSectionValues } from '../../../lib/policy-workspaces';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyToggleField,
  PolicyVariantTabs,
} from './PolicyWorkspaceShell';

function LeavePolicyNumberField({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field leave-policy-field">
      <PolicyFieldLabel label={label} />
      <div className="shift-policy-control-wrap">
        <PolicyFieldInput name={name} type="number" defaultValue={defaultValue ?? ''} min={0} />
        <span className="shift-policy-unit">دقیقه</span>
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

export function LeavePolicyEditor({
  familyKey,
  variant,
  sectionValues,
}: {
  familyKey: PolicyFamilyKey;
  variant: string;
  sectionValues: PolicyWorkspaceSectionValues;
}) {
  const leaveType = LEAVE_VARIANT_TO_TYPE[variant] ?? 'entitlement';
  const rule = getLeavePolicyDefaultsFromSectionValues(sectionValues, variant);
  const supportsMonthlyCap = leaveType === 'entitlement' || leaveType === 'sick';
  const supportsMaxUsage = leaveType === 'unpaid' || leaveType === 'bonus';

  return (
    <div className="policy-form-card leave-policy-editor">
      <PolicyVariantTabs familyKey={familyKey} variant={variant} />
      <PolicyInfoStrip text={LEAVE_TYPE_DESCRIPTIONS[leaveType]} />

      <section className="shift-policy-panel leave-policy-panel">
        <div className="leave-policy-panel-header">
          <h2>سیاست‌های مرخصی</h2>
          <p>تعریف نوع مرخصی، محدودیت‌ها و رفتار این نوع مرخصی در درخواست‌ها</p>
        </div>

        <div className="leave-policy-fields">
          <PolicyToggleField
            name="enabled"
            label="فعال بودن این نوع مرخصی"
            hint="اگر خاموش باشد ثبت این نوع مرخصی برای کارکنان مجاز نیست."
            defaultChecked={rule.enabled}
          />

          <PolicyToggleField
            name="paid"
            label="با حقوق"
            hint="این نوع مرخصی در محاسبه حقوق به عنوان زمان پرداخت‌شده لحاظ شود."
            defaultChecked={rule.paid}
          />

          <PolicyToggleField
            name="deductsFromEntitlementBalance"
            label="کسر از مانده استحقاقی"
            hint="در صورت فعال بودن، از سهمیه مرخصی استحقاقی کارمند کم می‌شود."
            defaultChecked={rule.deductsFromEntitlementBalance}
          />

          <PolicyToggleField
            name="requireAttachment"
            label="الزام به پیوست فایل"
            hint="درخواست بدون فایل ثبت نشود."
            defaultChecked={rule.requiresAttachment}
          />

          <PolicyToggleField
            name="dailyModeEnabled"
            label="فعال بودن حالت روزانه"
            hint={LEAVE_TYPE_MODE_TOOLTIPS[leaveType].daily}
            defaultChecked={rule.requestModes.daily}
          />

          <PolicyToggleField
            name="hourlyModeEnabled"
            label="فعال بودن حالت ساعتی"
            hint={LEAVE_TYPE_MODE_TOOLTIPS[leaveType].hourly}
            defaultChecked={rule.requestModes.hourly}
          />

          <PolicyToggleField
            name="multiDayModeEnabled"
            label="فعال بودن حالت چندروزه"
            hint="ثبت بازه چندروزه برای این نوع مرخصی مجاز باشد."
            defaultChecked={rule.requestModes.multiDay}
          />

          {supportsMonthlyCap ? (
            <LeavePolicyNumberField
              name="monthlyLimit"
              label="سقف مصرف ماهانه"
              defaultValue={rule.monthlyUsageCapHours != null ? rule.monthlyUsageCapHours * 60 : null}
              hint="در صورت نیاز، سقف مصرف ماهانه این نوع مرخصی را مشخص کنید."
            />
          ) : (
            <input type="hidden" name="monthlyLimit" value="" />
          )}

          {supportsMaxUsage ? (
            <LeavePolicyNumberField
              name="maxUsageHours"
              label="حداکثر مدت مجاز"
              defaultValue={rule.maxUsageHours != null ? rule.maxUsageHours * 60 : null}
              hint="در صورت نیاز، سقف مدت مجاز برای این نوع مرخصی را مشخص کنید."
            />
          ) : (
            <input type="hidden" name="maxUsageHours" value="" />
          )}
        </div>
      </section>

      <PolicyFormActions cancelHref="/policies" submitLabel="ذخیره تغییرات" />
    </div>
  );
}
