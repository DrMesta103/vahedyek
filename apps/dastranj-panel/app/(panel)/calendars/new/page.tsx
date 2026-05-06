import { createCalendarAction } from '../../../lib/actions';
import { FormCard, PageIntro } from '@repo/ui/server';

export default function NewCalendarPage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن تقویم کاری" description="فیلدهای پایه تقویم از پروتوتایپ به مدل دیتابیسی تبدیل شده‌اند." />
      <FormCard title="فرم تقویم">
        <form action={createCalendarAction} className="form-grid">
          <label><span>عنوان</span><input name="title" required /></label>
          <label><span>سال</span><input name="yearLabel" defaultValue="۱۴۰۵" required /></label>
          <label><span>شروع</span><input name="startDate" defaultValue="2026-03-21" required /></label>
          <label><span>پایان</span><input name="endDate" defaultValue="2027-03-20" required /></label>
          <label><span>عنوان شیفت</span><input name="shiftTitle" defaultValue="شیفت صبح اداری" required /></label>
          <label><span>نوع شیفت</span><input name="shiftTypeLabel" defaultValue="ثابت" required /></label>
          <label><span>روزهای شیفت</span><input name="totalShiftDays" type="number" defaultValue="286" /></label>
          <label><span>تعداد رویداد</span><input name="totalEventDays" type="number" defaultValue="26" /></label>
          <label><span>تعطیلات</span><input name="holidayCount" type="number" defaultValue="26" /></label>
          <label><span>وضعیت</span><select name="status" defaultValue="active"><option value="active">active</option><option value="inactive">inactive</option></select></label>
          <label className="full-span"><span>توضیح</span><textarea name="description" rows={4} /></label>
          <div className="full-span"><button type="submit" className="primary-button">ثبت تقویم</button></div>
        </form>
      </FormCard>
    </div>
  );
}
