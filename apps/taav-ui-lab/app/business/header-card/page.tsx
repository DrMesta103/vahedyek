'use client';

import {
  DocCodeBlock,
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import {
  BusinessHeaderCardActionDemo,
  BusinessHeaderCardActionWithSearchDemo,
  BusinessHeaderCardNavigationDemo,
  BusinessHeaderCardToggleDemo,
  BusinessHeaderCardToggleWithLinkDemo,
} from '@/components/lab/BusinessHeaderCardShowcase';
import { BusinessHeaderCardTokenControls } from '@/components/lab/BusinessHeaderCardTokenControls';

const HEADER_CARD_PROPS = [
  { name: 'title', type: 'ReactNode', description: 'عنوان اصلی سربرگ بیزینسی', required: true },
  { name: 'description', type: 'ReactNode', description: 'توضیح کوتاه زیر عنوان' },
  { name: 'icon', type: 'ReactNode', description: 'آیکن داخل باکس teal در سمت راست' },
  { name: 'variant', type: '"toggleWithLink" | "toggle" | "action" | "actionWithSearch" | "navigation"', description: 'نوع چیدمان سربرگ و کنترل‌های داخلی' },
  { name: 'showArrow', type: 'boolean', description: 'نمایش/عدم نمایش فلش سمت راست' },
  { name: 'href / onNavigate / onClick', type: 'string / fn / fn', description: 'رفتار فلش یا ناوبری' },
  { name: 'enabled / defaultEnabled / onToggle', type: 'boolean / boolean / fn', description: 'کنترل سوییچ فعال/غیرفعال' },
  { name: 'toggleLabels', type: '{ enabled?: ReactNode; disabled?: ReactNode }', description: 'برچسب‌های سوییچ' },
  { name: 'action', type: '{ label; icon?; onClick?; disabled? }', description: 'دکمه اکشن سمت چپ' },
  { name: 'detailLink', type: '{ label; href?; onClick?; disabled? }', description: 'لینک جزئیات زیر توضیح' },
  { name: 'search', type: '{ value?; placeholder?; onChange?; disabled? }', description: 'نوار جستجو در variant اکشن' },
  { name: 'loading / disabled', type: 'boolean / boolean', description: 'حالت بارگذاری و غیرفعال' },
  { name: 'themeMode', type: '"auto" | "light" | "dark"', description: 'هماهنگی با تم روشن یا تیره' },
  { name: 'className / wrapperClassName', type: 'string', description: 'سفارشی‌سازی ظاهر کارت' },
];

export default function BusinessHeaderCardDocPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'سربرگ' },
      ]}
      inspector={<BusinessHeaderCardTokenControls />}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavBusinessHeaderCard"
        description="کارت سربرگ بیزینسی برای نمایش عنوان، توضیح، آیکن، فلش، سوییچ، دکمه اکشن و جستجو در بخش‌های مدیریتی و تنظیماتی."
        importCode={`import { TaavBusinessHeaderCard } from "@repo/ui/taav/business";`}
      />

      <DocSection title="کامپوننت اصلی">
        <BusinessHeaderCardToggleWithLinkDemo />
      </DocSection>

      <DocSection title="راهنمای استفاده">
        <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          این کامپوننت برای بخش‌هایی مثل نماینده قانونی، فهرست کارمندان، فهرست واحدها و حالت‌های تنظیماتی مشابه
          ساخته شده است. بسته به variant، سوییچ، دکمه اکشن، لینک جزئیات یا جستجو نمایش داده می‌شود.
        </p>
      </DocSection>

      <DocSection title="توکن سوییچ">
        <BusinessHeaderCardToggleDemo />
      </DocSection>

      <DocSection title="توکن افزودن">
        <BusinessHeaderCardActionDemo />
      </DocSection>

      <DocSection title="توکن افزودن و جستجو">
        <BusinessHeaderCardActionWithSearchDemo />
      </DocSection>

      <DocSection title="توکن فقط اکشن بازگشت">
        <BusinessHeaderCardNavigationDemo />
      </DocSection>

      <DocSection title="code sample">
        <DocCodeBlock>{`<TaavBusinessHeaderCard
  title="هزینه‌های جانبی"
  description="هزینه‌های ثابت یا درصدی مانند کارمزد اداری، هزینه تشکیل پرونده و هزینه خدمات را در این بخش تعریف کنید."
  icon={<BadgePercent />}
  variant="toggleWithLink"
  enabled={enabled}
  onToggle={setEnabled}
/>`}</DocCodeBlock>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={HEADER_CARD_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Card radius', value: 'var(--taav-business-header-card-radius) / compact' },
            { label: 'Layout', value: 'RTL افقی — فلش راست، آیکن راست، متن میانی، کنترل چپ' },
            { label: 'Icon box', value: '56×56 · var(--taav-business-header-card-icon-radius)' },
            { label: 'Title', value: 'var(--taav-business-header-card-title-size) / 600 / #30343b' },
            { label: 'Description', value: 'var(--taav-business-header-card-desc-size) / #5f6f80' },
            { label: 'Action button', value: '36px · var(--taav-business-header-card-action-radius/size)' },
          ]}
        />
      </DocSection>

      <DocSection title="راهنمای رفتاری">
        <DocGuidelines
          items={[
            'فلش فقط مسیر ناوبری را نشان می‌دهد و کل کارت نباید بی‌دلیل clickable شود.',
            'سوییچ فقط در variantهای toggle استفاده شود و حالت فعال/غیرفعال را واضح نگه دارد.',
            'دکمه اکشن باید مستقل از فلش باشد و روی دسترسی سریع تمرکز کند.',
            'در حالت actionWithSearch، جستجو باید در خط دوم و هم‌راستا با سمت راست کارت قرار بگیرد.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'برای سربرگ‌های مدیریتی از این کارت به‌عنوان الگوی اصلی استفاده کنید.',
            'Title و description را کوتاه و راست‌چین نگه دارید.',
            'Variant مناسب را بر اساس نیاز واقعی انتخاب کنید.',
          ]}
          dontItems={[
            'برای صفحه‌های عمومی و غیرمدیریتی از این کارت استفاده نکنید.',
            'فلش، سوییچ و دکمه اکشن را هم‌زمان بدون نیاز نمایش ندهید.',
            'منطق business را داخل کامپوننت سخت‌کد نکنید.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
