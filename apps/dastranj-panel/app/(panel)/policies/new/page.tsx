import { ChevronDown } from 'lucide-react';
import { policyBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
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
      breadcrumb={policyBreadcrumbs({ label: 'افزودن سیاست کاری' })}
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
