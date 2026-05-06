import PanelLayout from '../../../components/PanelLayout';
import { BusinessSettingsCard } from '../_components/BusinessSettingsCard';
import { LoanSectionCard } from '../_components/LoanSettingsPrimitives';
import { approvalUsageOptions } from '../_components/approvalProcessConfig';

export default function BusinessApprovalProcessPage() {
  return (
    <PanelLayout>
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
          <LoanSectionCard className="overflow-hidden border-none bg-transparent p-0 shadow-none">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-6 text-right shadow-[0_12px_30px_var(--shadow-soft)] sm:p-7">
                <span className="inline-flex rounded-full border border-[color:var(--theme-accent-border)] bg-[color:var(--theme-accent-softer)] px-4 py-2 text-xs font-black text-[color:var(--theme-action-text)]">
                  فرآیند تایید
                </span>
                <h1 className="mt-4 text-2xl font-black leading-[1.8] text-[color:var(--text-strong)] sm:text-[2rem]">
                  انتخاب نوع کاربری برای مسیر تایید
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--text-muted)]">
                  ابتدا نوع کاربری واحد را انتخاب کنید تا مسیر تایید پیش‌نویس قرارداد برای همان دسته تنظیم شود. هر نوع کاربری می‌تواند
                  فرآیند تایید مستقل و تاییدکننده‌های متفاوت خودش را داشته باشد.
                </p>
              </div>

              <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-6 text-right">
                <h2 className="text-lg font-black text-[color:var(--text-strong)]">راهنمای انتخاب</h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--text-muted)]">
                  <p>برای هر نوع کاربری یک مسیر مجزا تعریف می‌شود و تغییرات آن فقط روی همان دسته اثر دارد.</p>
                  <p>پس از ورود به هر کارت، می‌توانید نقش‌ها، ترتیب مراحل و تاییدکننده‌های آن فرآیند را تنظیم کنید.</p>
                </div>
              </div>
            </div>
          </LoanSectionCard>

          <div className="approval-process-selection-grid">
            {approvalUsageOptions.map((item) => (
              <BusinessSettingsCard
                key={item.id}
                title={item.shortTitle}
                description={item.description}
                href={`/business-settings/approval-process/${item.id}`}
                className="approval-process-selection-card"
              />
            ))}
          </div>
        </div>
      </section>
    </PanelLayout>
  );
}
