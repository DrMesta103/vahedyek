import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFormActions,
  PolicyInfoStrip,
  PolicyToggleField,
} from './PolicyWorkspaceShell';
import { SearchablePolicySelect } from './SearchablePolicySelect';
import {
  REMOTE_WORK_ATTENDANCE_EFFECT_LABELS,
  REMOTE_WORK_PAYMENT_EFFECT_LABELS,
  type RemoteWorkPolicyRules,
} from '../../../lib/remote-work-policy';

const ATTENDANCE_EFFECT_OPTIONS = Object.entries(REMOTE_WORK_ATTENDANCE_EFFECT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PAYMENT_EFFECT_OPTIONS = Object.entries(REMOTE_WORK_PAYMENT_EFFECT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function RemotePolicyEditor({
  backHref,
  policyId,
  policy,
}: {
  backHref: string;
  policyId: string;
  policy: RemoteWorkPolicyRules;
}) {
  const returnPath = policyId ? `/policies/remote?policyId=${policyId}` : '/policies/remote';

  return (
    <div className="policy-form-card remote-policy-editor">
      <PolicyInfoStrip text="دورکاری تأییدشده می‌تواند به عنوان حضور معتبر در گزارش کارکرد لحاظ شود. نحوه اثر دورکاری بر تردد و پرداخت از این سیاست مشخص می‌شود." />

      <section className="shift-policy-panel remote-policy-panel">
        <div className="manual-policy-panel-header">
          <h2>سیاست‌های دورکاری</h2>
          <p>تعریف مجوز، اثر حضور/پرداخت و محدودیت‌های ثبت درخواست دورکاری</p>
        </div>

        <div className="manual-policy-toggles">
          <PolicyToggleField
            name="remoteWorkEnabled"
            label="فعال‌سازی دورکاری"
            hint="اگر فعال باشد، ثبت درخواست دورکاری برای کارمندان تابع این سیاست کاری مجاز است."
            defaultChecked={policy.enabled}
          />
          <PolicyToggleField
            name="remoteDailyModeEnabled"
            label="دورکاری روزانه"
            hint="کارمند می‌تواند برای یک روز کاری درخواست دورکاری ثبت کند."
            defaultChecked={policy.requestModes.daily}
          />
          <PolicyToggleField
            name="remoteHourlyModeEnabled"
            label="دورکاری ساعتی"
            hint="کارمند می‌تواند برای بازه ساعتی مشخص درخواست دورکاری ثبت کند."
            defaultChecked={policy.requestModes.hourly}
          />
          <PolicyToggleField
            name="remoteMultiDayModeEnabled"
            label="چند روز متوالی"
            hint="کارمند می‌تواند برای چند روز کاری متوالی درخواست دورکاری ثبت کند."
            defaultChecked={policy.requestModes.multiDay}
          />
        </div>

        <div className="shift-policy-panel-grid">
          <label className="policy-field-stack shift-policy-field">
            <PolicyFieldLabel label="اثر دورکاری روی حضور و غیاب" required />
            <SearchablePolicySelect
              name="remoteAttendanceEffect"
              value={policy.attendanceEffect}
              options={ATTENDANCE_EFFECT_OPTIONS}
              placeholder="انتخاب"
            />
          </label>
          <label className="policy-field-stack shift-policy-field">
            <PolicyFieldLabel label="اثر پرداخت" required />
            <SearchablePolicySelect
              name="remotePaymentEffect"
              value={policy.paymentEffect}
              options={PAYMENT_EFFECT_OPTIONS}
              placeholder="انتخاب"
            />
          </label>
        </div>

        <div className="manual-policy-toggles">
          <PolicyToggleField
            name="remoteRequireReason"
            label="الزام ثبت دلیل"
            hint="اگر فعال باشد، ثبت درخواست دورکاری بدون انتخاب علت مجاز نیست."
            defaultChecked={policy.requireReason}
          />
          <PolicyToggleField
            name="remoteRequireAttachment"
            label="الزام پیوست"
            hint="اگر فعال باشد، ثبت درخواست دورکاری بدون فایل پیوست مجاز نیست."
            defaultChecked={policy.requireAttachment}
          />
          <PolicyToggleField
            name="remotePastDaysEnabled"
            label="امکان ثبت برای روزهای گذشته"
            hint="کارمند بتواند برای روزهای قبل نیز درخواست دورکاری ثبت کند."
            defaultChecked={policy.pastDaysEnabled}
          />
          <PolicyToggleField
            name="remoteAllowHolidays"
            label="امکان دورکاری در روز تعطیل"
            hint="اگر غیرفعال باشد، ثبت دورکاری در روزهای تعطیل یا بدون شیفت مسدود می‌شود."
            defaultChecked={policy.allowHolidays}
          />
        </div>

        <div className="shift-policy-panel-grid">
          <label className="policy-field-stack shift-policy-field">
            <PolicyFieldLabel label="حداکثر تعداد روز گذشته مجاز" />
            <div className="shift-policy-control-wrap">
              <PolicyFieldInput name="remoteMaxPastDays" type="number" defaultValue={policy.maxPastDays} min={0} />
              <span className="shift-policy-unit">روز</span>
            </div>
          </label>
          <label className="policy-field-stack shift-policy-field">
            <PolicyFieldLabel label="نوع سقف ماهانه" />
            <SearchablePolicySelect
              name="remoteMonthlyLimitType"
              value={policy.monthlyLimit.type}
              options={[
                { value: 'days', label: 'روز' },
                { value: 'hours', label: 'ساعت' },
              ]}
              placeholder="انتخاب"
            />
          </label>
          <label className="policy-field-stack shift-policy-field">
            <PolicyFieldLabel label="سقف ماهانه دورکاری" />
            <div className="shift-policy-control-wrap">
              <PolicyFieldInput
                name="remoteMonthlyLimitValue"
                type="number"
                defaultValue={policy.monthlyLimit.value ?? ''}
                min={0}
              />
              <span className="shift-policy-unit">{policy.monthlyLimit.type === 'hours' ? 'ساعت' : 'روز'}</span>
            </div>
          </label>
        </div>
      </section>

      <input type="hidden" name="returnPath" value={returnPath} />
      <PolicyFormActions cancelHref={backHref} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
