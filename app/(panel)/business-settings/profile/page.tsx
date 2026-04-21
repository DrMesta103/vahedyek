import PanelLayout from '../../../components/PanelLayout';
import { BusinessSettingsCard, type BusinessSettingsCardProps } from '../_components/BusinessSettingsCard';

type ProfileSection = BusinessSettingsCardProps & {
  span?: 'full' | 'half';
};

const profileSections: ProfileSection[] = [
  {
    title: 'نوع مالکیت و اطلاعات پایه',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
  },
  {
    title: 'نماینده قانونی',
    description: 'مدیریت و تنظیم قراردادهای رسمی و اطلاعیه‌ها',
    span: 'full',
  },
  {
    title: 'شماره حساب',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 'full',
  },
  {
    title: 'لوگو و مهر',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
  },
  {
    title: 'اسناد',
    description: 'در حال توسعه، این اطلاعات می‌تواند فرآیند تنظیم قرارداد را بهبود ببخشد',
  },
  {
    title: 'زبان‌های فعال',
    description: 'این اطلاعات می‌تواند فرآیند تنظیم قرارداد را بهبود ببخشد',
  },
  {
    title: 'ارز پایه',
    description: 'این اطلاعات می‌تواند فرآیند تنظیم قرارداد را بهبود ببخشد',
  },
  {
    title: 'واحد اندازه‌گیری',
    description: 'این اطلاعات می‌تواند فرآیند تنظیم قرارداد را بهبود ببخشد',
  },
  {
    title: 'تقویم',
    description: 'این اطلاعات می‌تواند فرآیند تنظیم قرارداد را بهبود ببخشد',
  },
  {
    title: 'راه‌های ارتباطی',
    description: 'در حال توسعه، در این بخش می‌توانید آدرس‌ها و شماره‌های تماس سازمان خود را ثبت نمایید',
    span: 'full',
  },
];

export default function BusinessProfilePage() {
  return (
    <PanelLayout>
      <section className="business-profile-page">
        <header className="business-profile-intro">
          <p>در پروفایل کسب‌وکار اطلاعات هویتی، حقوقی، مالی و تماس شرکت ثبت می‌شود تا قراردادها، پروژه‌ها و اطلاع‌رسانی‌ها به‌صورت رسمی در سیستم باشد.</p>
        </header>

        <div className="business-profile-grid">
          {profileSections.map((section) => (
            <BusinessSettingsCard
              key={section.title}
              title={section.title}
              description={section.description}
              href={section.href}
              className={section.span === 'full' ? 'business-profile-card-full' : undefined}
            />
          ))}
        </div>
      </section>
    </PanelLayout>
  );
}
