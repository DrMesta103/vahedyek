import { createEmployeeAction } from '../../../lib/actions';
import { listOrganizationUnits } from '../../../lib/data';
import { FormCard, PageIntro } from '../../../components/ui';

export default async function NewEmployeePage() {
  const units = await listOrganizationUnits();

  return (
    <div className="page-stack">
      <PageIntro title="افزودن کارمند" description="ساخت رکورد پرسنلی با اتصال به واحدهای سازمانی." />
      <FormCard title="اطلاعات پرسنلی">
        <form action={createEmployeeAction} className="form-grid">
          <label><span>نام</span><input name="firstName" required /></label>
          <label><span>نام خانوادگی</span><input name="lastName" required /></label>
          <label><span>کد ملی</span><input name="nationalId" /></label>
          <label><span>کد پرسنلی</span><input name="personnelCode" /></label>
          <label><span>موبایل ۱</span><input name="mobile1" /></label>
          <label><span>موبایل ۲</span><input name="mobile2" /></label>
          <label><span>ایمیل</span><input name="email" type="email" /></label>
          <label><span>وضعیت تاهل</span><select name="maritalStatus" defaultValue="single"><option value="single">مجرد</option><option value="married">متاهل</option><option value="divorced">جداشده</option></select></label>
          <label><span>تعداد فرزند</span><input name="childrenCount" type="number" defaultValue="0" /></label>
          <div className="full-span fieldset">
            <span>واحدهای سازمانی</span>
            <div className="checkbox-list">
              {units.map((unit) => (
                <label key={unit.id} className="checkbox-row">
                  <input name="organizationUnitIds" type="checkbox" value={unit.id} />
                  <span>{unit.title}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="checkbox-row"><input name="isActive" type="checkbox" defaultChecked /><span>فعال باشد</span></label>
          <label className="checkbox-row"><input name="canEditIdentityPhoto" type="checkbox" /><span>اجازه ویرایش عکس هویتی</span></label>
          <div className="full-span"><button type="submit" className="primary-button">ثبت کارمند</button></div>
        </form>
      </FormCard>
    </div>
  );
}
