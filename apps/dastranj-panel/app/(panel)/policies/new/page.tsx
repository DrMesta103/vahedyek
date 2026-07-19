import { ChevronDown } from 'lucide-react';
import { savePolicyWorkspaceAction } from '../../../lib/actions';
import { listCalendars } from '../../../lib/data';
import {
  PolicyFieldInput,
  PolicyFieldLabel,
  PolicyFieldSelect,
  PolicyFieldTextarea,
  PolicyFormActions,
  PolicyPageShell,
  PolicySectionCard,
} from '../_components/PolicyWorkspaceShell';

export default async function NewPolicyPage() {
  const calendars = await listCalendars();

  return (
    <PolicyPageShell
      title="ثبت سیاست کاری جدید"
      subtitle="تنظیم قوانین حضور و غیاب کارمندان"
    >
      <form action={savePolicyWorkspaceAction} className="policy-form-stack">
        <input type="hidden" name="familyKey" value="work" />
        <input type="hidden" name="variant" value="default" />

        <PolicySectionCard title="اطلاعات پایه">
          <div className="policy-form-card">
            <label className="policy-field-stack">
              <PolicyFieldLabel label="عنوان" required hint="عنوان نمایشی سیاست کاری" />
              <PolicyFieldInput name="title" required />
            </label>

            <label className="policy-field-stack">
              <PolicyFieldLabel label="توضیحات" hint="توضیحات تکمیلی (اختیاری)" />
              <PolicyFieldTextarea name="description" rows={4} />
            </label>

            <label className="policy-field-stack">
              <PolicyFieldLabel label="انتخاب تقویم کاری" required hint="پس از ذخیره، تقویم قابل تغییر نیست" />
              <span className="policy-select-wrap">
                <PolicyFieldSelect name="calendarId" required defaultValue="">
                  <option value="" disabled>
                    انتخاب کنید
                  </option>
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.title} {calendar.yearLabel ? `- ${calendar.yearLabel}` : ''}
                    </option>
                  ))}
                </PolicyFieldSelect>
                <ChevronDown className="policy-select-icon" aria-hidden />
              </span>
            </label>
          </div>
        </PolicySectionCard>

        <PolicySectionCard title="Blueprint">
          <div className="policy-form-card">
            <label className="policy-field-stack">
              <PolicyFieldLabel label="Blueprint مبنا" required hint="سیاست ساخته‌شده پس از ثبت مستقل است." />
              <span className="policy-select-wrap">
                <PolicyFieldSelect name="blueprintKey" required defaultValue="custom">
                  <option value="custom">سیاست سفارشی</option>
                  <option value="office">اداری</option>
                  <option value="restaurant">رستورانی</option>
                  <option value="retail">فروشگاهی</option>
                </PolicyFieldSelect>
                <ChevronDown className="policy-select-icon" aria-hidden />
              </span>
            </label>
          </div>
        </PolicySectionCard>

        <PolicySectionCard title="قواعد پایه">
          <div className="policy-form-card">
            <label className="policy-toggle-field"><span className="policy-toggle-copy"><span className="policy-toggle-label">ورود الزامی</span></span><input name="entryRequired" type="checkbox" defaultChecked /></label>
            <label className="policy-toggle-field"><span className="policy-toggle-copy"><span className="policy-toggle-label">خروج الزامی</span></span><input name="exitRequired" type="checkbox" defaultChecked /></label>
            <label className="policy-toggle-field"><span className="policy-toggle-copy"><span className="policy-toggle-label">کنترل مکان</span></span><input name="requireGeofence" type="checkbox" /></label>
            <label className="policy-toggle-field"><span className="policy-toggle-copy"><span className="policy-toggle-label">ثبت ناقص به‌عنوان غیبت ناقص</span></span><input name="incompleteAttendance" type="checkbox" defaultChecked /></label>
            <label className="policy-toggle-field"><span className="policy-toggle-copy"><span className="policy-toggle-label">قابلیت درخواست</span></span><input name="requestEnabled" type="checkbox" defaultChecked /></label>
            <p className="policy-info-strip">خلاصه قواعد انتخاب‌شده پیش از ثبت در همین صفحه نمایش داده می‌شود.</p>
          </div>
        </PolicySectionCard>

        {calendars.length === 0 ? (
          <div className="policy-info-strip" role="alert">
            <p>برای ثبت سیاست کاری ابتدا باید یک تقویم کاری ثبت شده باشد.</p>
          </div>
        ) : null}

        <PolicyFormActions cancelHref="/policies" submitLabel="ایجاد سیاست" disabled={calendars.length === 0} />
      </form>
    </PolicyPageShell>
  );
}
