import Link from 'next/link';
import { FileText, Search } from 'lucide-react';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { getDraftTemplateCategoryLabel, getDraftTemplateSummary } from '../../lib/draft-template-display';
import { listDraftTemplates } from '../../lib/data';
import { formatFaNumber, formatPersianJalaliDate } from '../../lib/format-fa';
import { DraftTemplateActions } from './DraftTemplateActions';

export default async function DraftTemplatesPage() {
  const items = await listDraftTemplates();
  const activeCount = items.filter((item) => item.isActive).length;
  const archivedCount = items.length - activeCount;

  return (
    <div className="page-stack module-page draft-templates-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={[
          { label: 'دسترنج', href: '/' },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'قالب‌های پیش‌نویس' },
        ]}
        title="قالب‌های پیش‌نویس قرارداد"
        subtitle="نسخه‌های پیش‌نویس قرارداد کارکنان را از اینجا مدیریت کنید."
      />

      <div className="draft-template-toolbar" aria-label="ابزارهای فهرست قالب‌ها">
        <Link href="/draft-templates/new" className="module-page-add-btn draft-template-top-add">
          <span aria-hidden>+</span>
          ایجاد قالب پیش‌نویس
        </Link>
        <button type="button" className="draft-template-search" aria-label="جستجو در قالب‌ها">
          <Search className="h-5 w-5" strokeWidth={2.1} />
        </button>
      </div>

      <section className="draft-template-stats" aria-label="آمار قالب‌های پیش‌نویس">
        <div className="draft-template-stat-card">
          <span>کل نسخه‌ها</span>
          <strong>{formatFaNumber(items.length, { useGrouping: false })}</strong>
        </div>
        <div className="draft-template-stat-card is-active">
          <span>فعال</span>
          <strong>{formatFaNumber(activeCount, { useGrouping: false })}</strong>
        </div>
        <div className="draft-template-stat-card is-archived">
          <span>آرشیو</span>
          <strong>{formatFaNumber(archivedCount, { useGrouping: false })}</strong>
        </div>
      </section>

      <div className="draft-template-list">
        {items.map((item) => {
          const summary = getDraftTemplateSummary(item.body);
          const categoryLabel = getDraftTemplateCategoryLabel(item.category);

          return (
            <article key={item.id} className="draft-template-card">
              <div className="draft-template-card-menu">
                <DraftTemplateActions templateId={item.id} />
              </div>

              <div className="draft-template-card-head">
                <div className="draft-template-title-block">
                  <h3>{item.title.trim() || 'بدون عنوان'}</h3>
                  <div className="draft-template-pills">
                    <span className={`module-status-pill ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                      {item.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    {summary.pills.map((pill) => (
                      <span key={pill}>{pill}</span>
                    ))}
                    <span>نوع: {categoryLabel}</span>
                  </div>
                  <p>{item.description ?? 'توضیحی ثبت نشده است.'}</p>
                  <time dateTime={item.updatedAt.toISOString()}>
                    آخرین به‌روزرسانی: {formatPersianJalaliDate(item.updatedAt)}
                  </time>
                </div>
                <span className="draft-template-file-icon" aria-hidden>
                  <FileText className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </div>

              <div className="draft-template-fields">
                <div className="draft-template-field">
                  <span>سقف مرخصی ماهیانه</span>
                  <strong>{summary.fields.monthlyLeaveLimit}</strong>
                </div>
                <div className="draft-template-field">
                  <span>حداکثر انتقال مرخصی به سال بعد</span>
                  <strong>{summary.fields.leaveTransferLimit}</strong>
                </div>
                <div className="draft-template-field">
                  <span>سقف ساعت اضافه‌کاری ماهانه</span>
                  <strong>{summary.fields.monthlyOvertimeLimit}</strong>
                </div>
                <div className="draft-template-field">
                  <span>
                    ناخالص پرداختی <span className="draft-template-field-hint">(۳۰ روز)</span>
                  </span>
                  <strong>{summary.fields.grossPayment}</strong>
                </div>
                <div className="draft-template-field">
                  <span>
                    خالص پرداختی <span className="draft-template-field-hint">(۳۰ روز)</span>
                  </span>
                  <strong>{summary.fields.netPayment}</strong>
                </div>
              </div>
            </article>
          );
        })}

        {items.length === 0 ? (
          <div className="draft-template-empty">
            <FileText className="h-8 w-8" strokeWidth={2.1} />
            <p>هنوز قالب پیش‌نویسی ثبت نشده است.</p>
            <Link href="/draft-templates/new" className="module-page-add-btn">
              <span aria-hidden>+</span>
              ایجاد قالب پیش‌نویس
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
