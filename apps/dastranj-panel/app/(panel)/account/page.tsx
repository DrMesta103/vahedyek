import { saveBusinessProfileAction, seedSampleDataAction } from '../../lib/actions';
import { getBusinessProfile } from '../../lib/data';
import { FormCard, PageIntro } from '@repo/ui/server';

export default async function AccountPage() {
  const profile = await getBusinessProfile();
  const setupStatus = profile?.quickSetupStatus ?? 'in_progress';
  const setupStatusLabel =
    setupStatus === 'completed' ? 'تکمیل شده' : setupStatus === 'pending' ? 'شروع نشده' : 'در حال انجام';

  return (
    <div className="page-stack">
      <PageIntro title="حساب کسب و کار" description="تنظیمات پایه برند، اطلاعات تماس و وضعیت راه‌اندازی." />

      <section className="dashboard-grid">
        <article className="profile-summary-card">
          <div className="dashboard-spotlight-head">
            <div>
              <p className="eyebrow">هویت جاری</p>
              <h3>{profile?.brandName ?? 'دسترنج'}</h3>
            </div>
            <span className={`status-chip status-chip-${setupStatus}`}>{setupStatusLabel}</span>
          </div>
          <div className="detail-grid">
            <div>
              <span>نام حقوقی</span>
              <strong>{profile?.legalName ?? 'ثبت نشده'}</strong>
            </div>
            <div>
              <span>ایمیل</span>
              <strong>{profile?.contactEmail ?? 'ثبت نشده'}</strong>
            </div>
            <div>
              <span>تلفن</span>
              <strong>{profile?.phone ?? 'ثبت نشده'}</strong>
            </div>
            <div>
              <span>پکیج حقوق</span>
              <strong>{profile?.payrollPackageEnabled ? 'فعال' : 'غیرفعال'}</strong>
            </div>
          </div>
        </article>

        <article className="profile-summary-card profile-summary-accent">
          <p className="eyebrow">اقدام سریع</p>
          <h3>نمونه‌داده و راه‌اندازی اولیه</h3>
          <p>اگر محیط تازه ساخته شده، از اینجا داده‌ی اولیه را تزریق کنید و بعد فلوهای اصلی را در پنل بررسی کنید.</p>
          <form action={seedSampleDataAction} className="stack">
            <button type="submit" className="secondary-button">
              ساخت داده نمونه
            </button>
          </form>
        </article>
      </section>

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

        <FormCard title="راهنمای استقرار" description="برای کنترل وضعیت فعلی و آماده‌سازی محیط می‌توانید از این کارت استفاده کنید.">
          <form action={seedSampleDataAction} className="stack">
            <p className="muted">این عملیات فقط وقتی داده‌ای در دیتابیس نباشد مؤثر است. اگر قبلاً داده ساخته شده، این بخش فقط نقش utility دارد.</p>
            <button type="submit" className="secondary-button">
              ساخت داده نمونه
            </button>
          </form>
        </FormCard>
      </div>
    </div>
  );
}
