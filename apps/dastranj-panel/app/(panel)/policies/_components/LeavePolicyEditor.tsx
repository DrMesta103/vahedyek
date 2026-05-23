import type { PolicyFamilyKey } from '../../../lib/policy-workspaces';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyToggleField,
  PolicyVariantTabs,
} from './PolicyWorkspaceShell';

const LEAVE_INFO_STRIPS: Record<string, string> = {
  annual: 'در مرخصی استحقاقی فقط محدودیت مصرف ماهانه و الزام پیوست تنظیم می‌شود.',
  sick: 'در مرخصی استعلاجی فقط الزام پیوست تنظیم می‌شود.',
  unpaid: 'برای مرخصی بدون حقوق فقط سقف مجاز و الزام پیوست تنظیم می‌شود.',
  bonus: 'در مرخصی تشویقی فقط الزام پیوست تنظیم می‌شود.',
};

function LeavePolicyNumberField({
  name,
  label,
  required,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue: number;
  hint: string;
}) {
  return (
    <label className="policy-field-stack shift-policy-field leave-policy-field">
      <PolicyFieldLabel label={label} required={required} />
      <div className="shift-policy-control-wrap">
        <PolicyFieldInput name={name} type="number" defaultValue={defaultValue} min={0} required={required} />
        <span className="shift-policy-unit">دقیقه</span>
      </div>
      <p className="shift-policy-hint">{hint}</p>
    </label>
  );
}

export function LeavePolicyEditor({
  familyKey,
  variant,
  monthlyLimit,
  requireAttachment,
}: {
  familyKey: PolicyFamilyKey;
  variant: string;
  monthlyLimit: number;
  requireAttachment: boolean;
}) {
  const infoText = LEAVE_INFO_STRIPS[variant] ?? LEAVE_INFO_STRIPS.annual;

  return (
    <div className="policy-form-card leave-policy-editor">
      <PolicyVariantTabs familyKey={familyKey} variant={variant} />
      <PolicyInfoStrip text={infoText} />

      <section className="shift-policy-panel leave-policy-panel">
        <div className="leave-policy-panel-header">
          <h2>سیاست‌های مرخصی</h2>
          <p>تعریف نوع مرخصی، سهمیه‌ها و محدودیت‌های درخواست</p>
        </div>

        <div className="leave-policy-fields">
          {variant === 'annual' ? (
            <LeavePolicyNumberField
              name="monthlyLimit"
              label="حداکثر استفاده از سهمیه در ماه"
              required
              defaultValue={monthlyLimit}
              hint="سقف مجاز مصرف مرخصی استحقاقی در هر ماه"
            />
          ) : null}

          {variant === 'unpaid' ? (
            <LeavePolicyNumberField
              name="monthlyLimit"
              label="سقف مرخصی بدون حقوق"
              required
              defaultValue={monthlyLimit}
              hint="حداکثر مدت مجاز برای مرخصی بدون حقوق"
            />
          ) : null}

          <PolicyToggleField
            name="requireAttachment"
            label="الزام به پیوست فایل"
            hint="درخواست بدون فایل ثبت نشود"
            defaultChecked={requireAttachment}
          />
        </div>
      </section>

      <PolicyFormActions cancelHref="/policies" submitLabel="ذخیره تغییرات" />
    </div>
  );
}
