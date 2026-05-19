type QuickSetupHeroProps = {
  profileName?: string | null;
  progress: number;
  completedCount: number;
  totalCount: number;
};

export function QuickSetupHero({ profileName, progress, completedCount, totalCount }: QuickSetupHeroProps) {
  return (
    <section className="quick-setup-hero">
      <div className="quick-setup-hero-copy">
        <div className="quick-setup-hero-kicker">وضعیت راه‌اندازی سیستم</div>
        <h1>خوش آمدید</h1>
        <p>برای استفاده کامل از امکانات پنل این مراحل را به‌ترتیب تکمیل کنید. اطلاعات این بخش‌ها برای محاسبه دقیق حضور و دستمزد ضروری است.</p>
        <div className="quick-setup-hero-note">{profileName ? `پروفایل فعال: ${profileName}` : 'پروفایل کسب‌وکار هنوز تکمیل نشده است.'}</div>
      </div>

      <div className="quick-setup-progress-card">
        <div className="quick-setup-progress-head">
          <span>پیشرفت کل</span>
          <strong>{progress}%</strong>
        </div>
        <div className="quick-setup-progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>{completedCount} مورد از {totalCount} مورد تکمیل شده است</p>
      </div>
    </section>
  );
}
