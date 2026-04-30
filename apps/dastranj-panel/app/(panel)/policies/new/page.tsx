import { createPolicyAction } from '../../../lib/actions';
import { listCalendars } from '../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui';

export default async function NewPolicyPage() {
  const calendars = await listCalendars();

  return (
    <div className="page-stack">
      <PageIntro title="افزودن سیاست کاری" description="نسخه اولیه برای اتصال سیاست به تقویم و تنظیمات پایه." />
      <FormCard title="فرم سیاست">
        <form action={createPolicyAction} className="form-grid">
          <label><span>عنوان</span><input name="title" required /></label>
          <label><span>تقویم</span><select name="calendarId" defaultValue=""><option value="">بدون تقویم</option>{calendars.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label className="full-span"><span>توضیح</span><textarea name="description" rows={4} /></label>
          <label><span>تعداد کارمند</span><input name="employeeCount" type="number" defaultValue="0" /></label>
          <label><span>شروع شب‌کاری</span><input name="nightWorkStart" defaultValue="22:00" /></label>
          <label className="checkbox-row"><input name="manualAttendance" type="checkbox" defaultChecked /><span>تردد دستی فعال باشد</span></label>
          <label className="checkbox-row"><input name="overtimeFromAttendance" type="checkbox" defaultChecked /><span>اضافه‌کاری از تردد محاسبه شود</span></label>
          <div className="full-span"><button type="submit" className="primary-button">ثبت سیاست</button></div>
        </form>
      </FormCard>
    </div>
  );
}
