import { DocCodeBlock, DocDoDont, DocGuidelines, DocPageHeader, DocPreview, DocSection, DocSpecGrid } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { ModuleLinkGridShowcase, ModuleLinkShowcase } from '@/components/lab/ModuleLinkGridShowcase';

export default function ModuleLinkGridPage() {
  return (
    <div dir="rtl">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'فهرست دسترسی‌های مجتمع' }]}>
        <DocPageHeader
          eyebrow="کامپوننت‌های کسب‌وکار"
          title="فهرست دسترسی‌های مجتمع"
          description="گرید دو ستونه برای نمایش مسیرهای اطلاعاتی و عملیاتی مجتمع با عنوان، توضیح، آیکن و فلش ورود."
          importCode={`import { TaavBusinessModuleLinkGrid } from '@repo/ui/taav/business';`}
        />
        <DocSection title="کامپوننت اصلی">
          <DocPreview bare>
            <ModuleLinkShowcase />
          </DocPreview>
        </DocSection>
        <DocSection title="گریدبندی">
          <DocPreview bare>
            <ModuleLinkGridShowcase />
          </DocPreview>
        </DocSection>
        <DocSection title="قواعد طراحی و تجربه کاربری">
          <DocGuidelines items={[
            'چیدمان پیش‌فرض دو ستونه است و در موبایل به یک ستون خوانا تبدیل می‌شود.',
            'هر آیتم شامل عنوان، توضیح، آیکن و فلش ورود است؛ محتوا از آرایه items دریافت می‌شود.',
            'عنوان‌ها راست‌چین، توضیحات کم‌رنگ‌تر و فلش در سمت چپ آیتم قرار می‌گیرد.',
            'hover و focus بدون تغییر شدید ابعاد انجام می‌شوند تا گرید پایدار بماند.',
            'آیتم می‌تواند با href یا onClick تعاملی باشد و حالت disabled نیز دارد.',
          ]} />
        </DocSection>
        <DocSection title="نمونه استفاده">
          <DocCodeBlock>{`<TaavBusinessModuleLinkGrid
  items={items}
  columns={2}
  gap="md"
/>`}</DocCodeBlock>
        </DocSection>
        <DocSection title="مشخصات">
          <DocSpecGrid items={[
            { label: 'Grid', value: '۱ ستون موبایل، ۲ ستون دسکتاپ' },
            { label: 'Gap', value: '16px پیش‌فرض' },
            { label: 'Direction', value: 'RTL' },
            { label: 'Interaction', value: 'href / onClick / disabled' },
          ]} />
        </DocSection>
        <DocSection title="دسترسی‌پذیری">
          <DocDoDont
            doItems={['برای مسیرهای واقعی href بدهید.', 'برای عملیات داخل همان صفحه onClick استفاده کنید.', 'برای آیکن‌های تزئینی aria-hidden حفظ می‌شود.']}
            dontItems={['منطق route یا مجوز را داخل کامپوننت قرار ندهید.', 'توضیحات طولانی را در یک ردیف فشرده نکنید.']}
          />
        </DocSection>
      </DocPageShell>
    </div>
  );
}
