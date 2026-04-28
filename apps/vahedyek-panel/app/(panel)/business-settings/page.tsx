import PanelLayout from '../../components/PanelLayout';
import { BusinessSettingsCard, type BusinessSettingsCardProps } from './_components/BusinessSettingsCard';

const settingCards: BusinessSettingsCardProps[] = [
  {
    title: 'پروفایل کسب‌وکار',
    description:
      'در این بخش می‌توانید تمامی اطلاعات پروفایل کسب‌وکار را وارد کنید؛ مانند اطلاعات نماینده قانونی، شماره‌حساب‌ها، زبان‌های فعال و سایر تنظیمات پایه.',
    href: '/business-settings/profile',
  },
  {
    title: 'تعریف پروژه / مجتمع',
    description:
      'تمام اطلاعات بخش پروژه یا مجتمع، مشخصات اجرایی و داده‌های پایه مرتبط با ساختار کسب‌وکار را می‌توانید در این بخش وارد کنید.',
    href: '/business-settings/project',
  },
  {
    title: 'تنظیمات مالی و قواعد قراردادی',
    description:
      'در این بخش می‌توانید جزئیات مالی، قواعد پیش‌فرض قرارداد، ساختار پرداخت‌ها و تنظیمات پیشنهادی مورد استفاده در قراردادها را مدیریت کنید.',
    href: '/business-settings/contract-rules',
  },
  {
    title: 'بلوک / برج - طبقه - واحد',
    description:
      'در این بخش اطلاعات بلوک، برج، طبقات، واحدها و انواع کاربری‌های مختلف هر واحد را ثبت و مدیریت می‌کنید.',
  },
];

export default function BusinessSettingsPage() {
  return (
    <PanelLayout>
      <section className="business-settings-page">
        <div className="business-settings-grid">
          {settingCards.map((card) => (
            <BusinessSettingsCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </PanelLayout>
  );
}
