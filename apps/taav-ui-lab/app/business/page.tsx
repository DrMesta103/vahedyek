import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocApiNote, DocPageHeader } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { LAB_BUSINESS_NAV } from '@/lib/navigation';

const BUSINESS_ITEMS = [
  ...LAB_BUSINESS_NAV,
  {
    href: '/business/project-structure-card',
    label: 'کارت بلوک، واحد',
    badge: 'TaavProjectStructureCard',
    description: 'نمایش کارت‌های بلوک و واحد با حالت‌های مختلف',
  },
  {
    href: '/business/ownership-card',
    label: 'کارت نوع مالکیت و اطلاعات پایه',
    badge: 'TaavBusinessOwnershipCard',
    description: 'انتخاب نوع مالکیت حقیقی یا حقوقی برای تنظیم قرارداد',
  },
  {
    href: '/business/form-dialog-card',
    label: 'کارت فرم اطلاعات کسب‌وکار',
    badge: 'TaavBusinessFormDialogCard',
    description: 'فرم‌های مودال برای ثبت پلاک و مشخصات فنی پروژه',
  },
  {
    href: '/business/owner-card',
    label: 'کارت مالک کسب‌وکار',
    badge: 'TaavBusinessOwnerCard',
    description: 'نمایش مشخصات، شماره تماس و عملیات مالک کسب‌وکار',
  },
  {
    href: '/business/account-info-card',
    label: 'کارت اطلاعات حساب',
    badge: 'TaavBusinessAccountInfoCard',
    description: 'نمایش شماره حساب، شماره شبا و وضعیت استفاده در قرارداد',
  },
  {
    href: '/business/bank-account-info-input',
    label: 'اطلاعات حساب بانکی',
    badge: 'TaavBankAccountInfoInputCard',
    description: 'ورودی شماره کارت، شماره شبا و شماره حساب بانکی',
  },
  {
    href: '/business/form-step-indicator',
    label: 'Stepper مرحله‌ای',
    badge: 'TaavFormStepIndicator',
    description: 'نمایش مرحله‌ی فعال، مراحل تکمیل‌شده و مراحل بعدی فرم',
  },
  {
    href: '/business/icon-option-selector',
    label: 'انتخاب گزینه آیکون‌دار',
    badge: 'TaavBusinessIconChoiceGroup',
    description: 'انتخاب یک گزینه از میان گزینه‌های آیکون‌دار با پشتیبانی از ۲، ۳ و ۴ آیتم',
  },
  {
    href: '/business/toggle-card',
    label: 'کارت وضعیت',
    badge: 'TaavBusinessToggleCard',
    description: 'کارت دوحالته برای فعال‌سازی یا غیرفعال‌سازی قابلیت‌های کسب‌وکار در الگوی ساده و عملیاتی',
  },
  {
    href: '/business/communication-channels',
    subcomponent: 'TaavCommunicationChannelsCard',
    label: 'اطلاعات تماس',
    badge: 'TaavCommunicationChannels',
    description: 'مدیریت تلفن، ایمیل، فکس، وبسایت و شبکه‌های اجتماعی',
  },
  {
    href: '/business/module-link-grid',
    label: 'فهرست دسترسی‌های مجتمع',
    badge: 'TaavBusinessModuleLinkGrid',
    description: 'گرید RTL برای نمایش مسیرهای اطلاعاتی و عملیاتی مجتمع',
  },
];

const BUSINESS_COPY: Record<string, { label: string; description: string }> = {
  '/business/module-link-grid': { label: 'فهرست دسترسی‌های مجتمع', description: 'گرید دو ستونه برای نمایش مسیرهای اطلاعاتی و عملیاتی مجتمع با آیکن و فلش ورود' },
  '/business/sidebar': { label: 'سایدبار کسب‌وکار', description: 'ناوبری ERP با مسیر، tenant و دسترسی‌های سریع' },
  '/business/recommendation-card': { label: 'کارت پیشنهاد تنظیمات', description: 'تنظیم پیشنهادی با کلید فعال‌سازی و لینک جزئیات' },
  '/business/section-toolbar-card': { label: 'کارت سربرگ مدیریتی بخش', description: 'سربرگ مشترک برای بخش‌های مدیریتی با جست‌وجو و اقدام' },
  '/business/header-card': { label: 'سربرگ', description: 'کارت سربرگ بیزینسی برای عنوان، توضیح، آیکن، سوییچ، دکمه و جستجو' },
  '/business/mobile-number-input': { label: 'وارد کردن موبایل یا ایمیل', description: 'کارت ثبت موبایل یا ایمیل با اعتبارسنجی، شمارنده و پیام راهنما' },
  '/business/module-card': { label: 'کارت ماژول', description: 'کارت ناوبری برای ماژول‌ها و مراحل راه‌اندازی' },
  '/business/currency-input': { label: 'ورودی مبلغ', description: 'ورودی مبلغ با جداکننده سه‌رقمی و واحد پول برای قرارداد، حقوق و وام' },
  '/business/percentage-input': { label: 'ورودی درصد', description: 'ورودی درصد با حداقل و حداکثر برای پیش‌پرداخت، جریمه و تخفیف' },
  '/business/field-block': { label: 'بلوک فیلد', description: 'الگوی فیلد کسب‌وکاری با برچسب، راهنما و پیام وضعیت' },
  '/business/choice-chip': { label: 'چیپ انتخابی', description: 'انتخاب گزینه‌های کسب‌وکاری مانند نوع شرکت و نوع قرارداد' },
};

export function BusinessOverviewPage({ sectionTitle = 'کامپوننت‌های کسب‌وکار', sectionLabel = 'کسب‌وکار', sectionMode = 'business' }: { sectionTitle?: string; sectionLabel?: string; sectionMode?: 'business' | 'components' }) {
  const items = sectionMode === 'components'
    ? [...BUSINESS_ITEMS.filter((item) => item.href !== '/business/section-toolbar-card' && item.href !== '/business/communication-channels'), { href: '/business-components/choice-chip', label: 'chips', badge: 'TaavChoiceChipGroup', description: 'انتخاب محدود کسب‌وکار — نوع شرکت، نوع قرارداد، وضعیت ساده' }, { href: '/business-components/switch', label: 'switch', badge: 'TaavActivationSwitch', description: 'کنترل دوحالته برای فعال‌سازی و غیرفعال‌سازی تنظیمات' }, { href: '/business-components/link', label: 'link', badge: 'TaavDetailsLink', description: 'لینک جزئیات برای هدایت کاربر به اطلاعات یا تنظیمات مرتبط' }, { href: '/business-components/expanded', label: 'expanded', badge: 'TaavExpanded', description: 'ردیف بازشونده برای نمایش یا پنهان‌کردن جزئیات' }, { href: '/business-components/button', label: 'button', badge: 'TaavButton', description: 'دکمه اصلی برای اجرای یک اقدام مشخص در جریان کاربر' }]
    : BUSINESS_ITEMS;

  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: sectionLabel }]}>
      <DocPageHeader
        eyebrow="کامپوننت‌های کسب‌وکار"
        title={sectionTitle}
        description="مجموعه‌ای از اجزای تخصصی برای ساخت تجربه‌های کسب‌وکاری، فرم‌ها، ناوبری و کارت‌های مدیریتی."
        importCode={`import {
  TaavBusinessSidebar,
  TaavBusinessIntroCard,
  TaavBusinessRecommendationCard,
  TaavBusinessSectionToolbarCard,
  TaavBusinessHeaderCard,
  TaavMobileNumberInputCard,
  TaavModuleCard,
} from '@repo/ui/taav/business';`}
      />
      <DocApiNote />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
            if (item.href === '/business/toggle-card') return null;
            const displayItem = sectionMode === 'components' && item.href === '/business/choice-chip'
              ? { ...item, href: '/business-components/badges', label: 'badges', badge: 'TaavBadge' }
              : sectionMode === 'components' && item.href === '/business/field-block'
                ? { ...item, href: '/business-components/field-block', label: 'field', badge: 'TaavFieldBlock' }
              : sectionMode === 'components' && item.href === '/business/form-step-indicator'
                  ? { ...item, label: 'stepper' }
              : sectionMode === 'components' && item.href === '/business/module-link-grid'
                  ? { ...item, label: 'nextpage' }
              : sectionMode === 'components' && item.href === '/business/icon-option-selector'
                  ? { ...item, label: 'tabbar' }
                : sectionMode === 'components' && item.href === '/business/module-card'
                  ? { ...item, href: '/business-components/card', label: 'card' }
                : item;
            const copy = sectionMode === 'components' && item.href === '/business/choice-chip'
              ? { label: 'badges', description: 'Badgeهای نمایشی برای وضعیت، نوع کاربری، ویژگی‌های واحد و وضعیت معامله' }
              : sectionMode === 'components' && item.href === '/business/field-block'
                ? { label: 'field', description: 'کامپوننت اصلی فیلد با برچسب، کنترل و متن راهنما' }
                : sectionMode === 'components' && item.href === '/business/form-step-indicator'
                  ? { label: 'stepper', description: 'نمایش مرحله‌های فرم با مشخص‌کردن مرحله فعال و مراحل تکمیل‌شده' }
                : sectionMode === 'components' && item.href === '/business/module-link-grid'
                  ? { label: 'nextpage', description: 'نمایش مسیرهای اطلاعاتی و عملیاتی مجتمع با آیکن و فلش ورود' }
                : sectionMode === 'components' && item.href === '/business/icon-option-selector'
                  ? { label: 'tabbar', description: 'انتخاب یک گزینه از میان گزینه‌های آیکون‌دار' }
                : sectionMode === 'components' && item.href === '/business/module-card'
                  ? { label: 'card', description: 'کارت ناوبری برای ماژول‌ها و مراحل راه‌اندازی' }
                : BUSINESS_COPY[item.href] ?? { label: displayItem.label, description: 'مستندات، ویژگی‌ها، جدول props و پیش‌نمایش راست‌چین' };
            return (
              <Link key={displayItem.href} href={displayItem.href} className="h-full">
                <TaavCard variant="outlined" padding="md" radius="lg" interactive wrapperClassName="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">{copy.label}</h2>
                      <p className="mt-2 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{copy.description}</p>
                      {'subcomponent' in displayItem && displayItem.subcomponent ? <p className="mt-2 text-xs font-semibold text-[var(--taav-brand-600)]">زیرمجموعه: {displayItem.subcomponent}</p> : null}
                    </div>
                    {displayItem.badge ? <TaavBadge tone="brand" variant="soft" size="sm">{displayItem.badge}</TaavBadge> : null}
                  </div>
                </TaavCard>
              </Link>
            );
          })}
        </div>
      </DocPageShell>
    </div>
  );
}

export default BusinessOverviewPage;
