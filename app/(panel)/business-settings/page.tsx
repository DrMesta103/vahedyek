import PanelLayout from '../../components/PanelLayout';

const settingCards = [
  {
    title: 'پروفایل کسب‌وکار',
    description: 'در این بخش می‌توانید تمامی اطلاعات پروفایل کسب‌وکار را وارد کنید؛ مانند اطلاعات نماینده قانونی، شماره‌حساب‌ها، زبان‌های فعال و سایر تنظیمات پایه.',
  },
  {
    title: 'بلوک / برج - طبقه - واحد',
    description: 'در این بخش اطلاعات بلوک، برج، طبقات، واحدها و انواع کاربری‌های مختلف هر واحد را ثبت و مدیریت می‌کنید.',
  },
  {
    title: 'تنظیمات مالی و قواعد قراردادی',
    description: 'در این بخش می‌توانید جزئیات مالی، قواعد پیش‌فرض قرارداد، ساختار پرداخت‌ها و تنظیمات پیشنهادی مورد استفاده در قراردادها را مدیریت کنید.',
  },
  {
    title: 'تعریف پروژه / مجتمع',
    description: 'تمام اطلاعات بخش پروژه یا مجتمع، مشخصات اجرایی و داده‌های پایه مرتبط با ساختار کسب‌وکار را می‌توانید در این بخش وارد کنید.',
  },
];

export default function BusinessSettingsPage() {
  return (
    <PanelLayout>
      <section className="business-settings-page">
        <div className="business-settings-grid">
          {settingCards.map((card) => (
            <article key={card.title} className="business-settings-card">
              <div className="business-settings-card-header">
                <div className="business-settings-pattern" />
                <span className="business-settings-card-arrow">›</span>
                <h2 className="business-settings-card-title">{card.title}</h2>
              </div>
              <div className="business-settings-card-body">
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PanelLayout>
  );
}
