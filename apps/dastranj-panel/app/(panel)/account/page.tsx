import { saveBusinessProfileAction, seedSampleDataAction } from '../../lib/actions';
import { getBusinessProfile } from '../../lib/data';
import { FormCard, PageIntro } from '../../components/ui';

export default async function AccountPage() {
  const profile = await getBusinessProfile();

  return (
    <div className="page-stack">
      <PageIntro title="حساب کسب و کار" description="تنظیمات پایه برند، اطلاعات تماس و وضعیت راه‌اندازی." />

      <div className="dual-grid">
        <FormCard title="پروفایل" description="این اطلاعات به‌عنوان هویت پایه دسترنج استفاده می‌شود.">
          <form action={saveBusinessProfileAction} className="form-grid">
            <label>
              <span>نام برند</span>
              <input name="brandName" defaultValue={profile?.brandName ?? 'دسترنج'} required />
            </label>
            <label>
              <span>نام حقوقی</span>
              <input name="legalName" defaultValue={profile?.legalName ?? ''} />
            </label>
            <label>
              <span>ایمیل</span>
              <input name="contactEmail" type="email" defaultValue={profile?.contactEmail ?? ''} />
            </label>
            <label>
              <span>تلفن</span>
              <input name="phone" defaultValue={profile?.phone ?? ''} />
            </label>
            <label className="full-span">
              <span>آدرس</span>
              <textarea name="address" defaultValue={profile?.address ?? ''} rows={4} />
            </label>
            <label className="checkbox-row">
              <input name="payrollPackageEnabled" type="checkbox" defaultChecked={profile?.payrollPackageEnabled ?? false} />
              <span>پکیج حقوق و دستمزد فعال باشد</span>
            </label>
            <label>
              <span>وضعیت راه‌اندازی</span>
              <select name="quickSetupStatus" defaultValue={profile?.quickSetupStatus ?? 'in_progress'}>
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>
            </label>
            <div className="full-span inline-actions">
              <button type="submit" className="primary-button">
                ذخیره
              </button>
            </div>
          </form>
        </FormCard>

        <FormCard title="نمونه‌داده" description="اگر دیتابیس خالی است، یک بار داده نمونه کامل برای تمام دامنه‌ها تزریق می‌کند.">
          <form action={seedSampleDataAction} className="stack">
            <p className="muted">این عملیات فقط وقتی داده‌ای در دیتابیس نباشد مؤثر است.</p>
            <button type="submit" className="secondary-button">
              ساخت داده نمونه
            </button>
          </form>
        </FormCard>
      </div>
    </div>
  );
}
