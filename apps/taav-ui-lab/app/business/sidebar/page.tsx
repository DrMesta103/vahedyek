'use client';

import { useState } from 'react';
import { TaavBusinessSidebar } from '@repo/ui/taav/business';
import {
  DocDoDont,
  DocGuidelines,
  DocPageHeader,
  DocPreview,
  DocPropsTable,
  DocSection,
  DocSpecGrid,
} from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { BusinessSidebarPreview, BusinessSidebarThemePreview } from '@/components/lab/BusinessSidebarPreview';
import { BusinessSidebarAppViewport } from '@/components/lab/BusinessSidebarAppViewport';
import {
  DASHRANJ_DEMO_NAV_ITEMS,
  DASHRANJ_DEMO_NAV_PATH,
  DASHRANJ_DEMO_QUICK_ACTIONS,
  DASHRANJ_DEMO_TENANT,
  DASHRANJ_DEMO_USER,
  DASHRANJ_DEMO_VERSION,
  VAHEDYEK_DEMO_NAV_PATH,
} from '@/lib/demo/business-sidebar-demo';
import { BUSINESS_SIDEBAR_PROPS } from '@/lib/docs/component-props';

function StateNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-4 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
      {children}
    </p>
  );
}

export default function BusinessSidebarDocPage() {
  const [activeItemId, setActiveItemId] = useState('employees');

  return (
    <DocPageShell
      breadcrumbs={[
        { label: 'خانه', href: '/' },
        { label: 'Business', href: '/business' },
        { label: 'سایدبار کسب‌وکار' },
      ]}
    >
      <DocPageHeader
        eyebrow="Business Components"
        title="TaavBusinessSidebar"
        description="shell کسب‌وکار RTL برای پنل‌های DastRanj و VahedYek — سایدبار، مسیر صفحه و ناحیه محتوا در یک کامپوننت؛ presentation-only و data-driven."
        importCode={`import { TaavBusinessSidebar } from "@repo/ui/taav/business";`}
      />

      <DocSection title="مسیر صفحه + سایدبار">
        <StateNote>
          breadcrumb مسیر کاربر <strong>بالای محتوا و هم‌راستا با سایدبار</strong> داخل همان{' '}
          <code className="lab-code">TaavBusinessSidebar</code> رندر می‌شود. پیش‌فرض مسیر{' '}
          <strong>خانه</strong> است. آیتم آخر صفحه فعلی (bold) و بقیه لینک/دکمه بازگشت هستند.
        </StateNote>
        <DocPreview label="VahedYek-style breadcrumb · shell یکپارچه">
          <BusinessSidebarPreview navPathItems={VAHEDYEK_DEMO_NAV_PATH} activeItemId="employees" height={680} />
        </DocPreview>
      </DocSection>

      <DocSection title="Light / Dark">
        <StateNote>
          نمونه تم روشن و تیره برای shell یکپارچه سایدبار + مسیر صفحه.
        </StateNote>
        <BusinessSidebarThemePreview navPathItems={VAHEDYEK_DEMO_NAV_PATH} />
      </DocSection>

      <DocSection title="A) DastRanj-style full sidebar">
        <StateNote>
          حالت کامل سایدبار دسترنج؛ مناسب زمانی که کاربر باید نام منوها، وضعیت tenant و اکشن‌های سریع را همزمان ببیند.
          حالت کامل برای استفاده روزمره در پنل، با نمایش عنوان منوها و وضعیت tenant.
        </StateNote>
        <DocPreview label="placement=right · full · mock app viewport">
          <BusinessSidebarPreview activeItemId="employees" />
        </DocPreview>
      </DocSection>

      <DocSection title="B) DastRanj-style collapsed sidebar">
        <StateNote>
          حالت بسته یا Collapsed؛ برای آزاد کردن فضای صفحه در پنل‌های عملیاتی. در این حالت فقط آیکون‌ها نمایش داده می‌شوند
          و توضیح هر آیتم از طریق tooltip یا aria-label در دسترس است.
          حالت فشرده برای زمانی که کاربر به فضای کاری بیشتری نیاز دارد؛ فقط آیکون‌ها نمایش داده می‌شوند.
        </StateNote>
        <DocPreview label="collapsed · placement=right · icon rail">
          <BusinessSidebarPreview collapsed activeItemId="employees" />
        </DocPreview>
      </DocSection>

      <DocSection title="C) Data-driven example">
        <StateNote>
          نمونه داده‌محور؛ نشان می‌دهد که سایدبار مالک route، tenant، auth یا permission نیست و فقط داده و handler از اپ دریافت می‌کند.
          آیتم فعال باید مسیر فعلی کاربر را نشان دهد و از خود کامپوننت route را تشخیص ندهد.
        </StateNote>
        <DocPreview label="interactive activeItemId · right-aligned viewport">
          <BusinessSidebarAppViewport height={640}>
            <TaavBusinessSidebar
              user={DASHRANJ_DEMO_USER}
              tenant={DASHRANJ_DEMO_TENANT}
              quickActions={DASHRANJ_DEMO_QUICK_ACTIONS}
              items={DASHRANJ_DEMO_NAV_ITEMS}
              activeItemId={activeItemId}
              version={DASHRANJ_DEMO_VERSION}
              variant="dastranj"
              placement="right"
              navPath={DASHRANJ_DEMO_NAV_PATH}
              onNavigate={(item) => setActiveItemId(item.id)}
              onTenantSwitch={() => undefined}
              onTenantPanelClick={() => undefined}
              shellClassName="h-full"
              className="h-full"
            >
              <div className="flex h-full items-start p-6">
                <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-business-sidebar-text-muted)]">
                  آیتم فعال: <strong className="text-[var(--taav-business-sidebar-text)]">{activeItemId}</strong>
                </p>
              </div>
            </TaavBusinessSidebar>
          </BusinessSidebarAppViewport>
        </DocPreview>
      </DocSection>

      <DocSection title="D) Tenant states">
        <StateNote>
          نمایش وضعیت tenant مانند active، loading، inactive و error بدون وارد کردن منطق tenant به خود کامپوننت.
          نمایش وضعیت tenant فقط نمایشی است؛ تغییر tenant و وضعیت واقعی از اپ اصلی پاس داده می‌شود.
        </StateNote>
        <div className="grid gap-4 xl:grid-cols-2">
          <DocPreview label="tenant active">
            <BusinessSidebarPreview tenantStatus="active" height={640} />
          </DocPreview>
          <DocPreview label="tenant loading">
            <BusinessSidebarPreview tenantStatus="loading" loading height={640} />
          </DocPreview>
        </div>
      </DocSection>

      <DocSection title="Quick actions & badges">
        <StateNote>
          اکشن‌های سریع برای عملیات پرتکرار مثل خانه، اعلان، تنظیمات یا خروج استفاده می‌شوند.
        </StateNote>
        <div className="grid gap-4 xl:grid-cols-2">
          <DocPreview label="notification badge">
            <BusinessSidebarPreview activeItemId="employees" height={640} />
          </DocPreview>
          <DocPreview label="disabled nav item">
            <BusinessSidebarPreview showDisabled activeItemId="employees" height={640} />
          </DocPreview>
        </div>
      </DocSection>

      <DocSection title="E) Scroll behavior">
        <StateNote>
          فقط بخش منو اسکرول می‌شود؛ header، quick actions و bottom status ثابت می‌مانند. اسکرول باید مینیمال و کم‌جلب‌توجه باشد.
          اسکرول فقط برای لیست منو است و باید بسیار مینیمال باشد تا تمرکز کاربر را نگیرد.
        </StateNote>
        <DocPreview label="taav-scrollarea--minimal · menu only scrolls">
          <BusinessSidebarPreview activeItemId="employees" />
        </DocPreview>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={BUSINESS_SIDEBAR_PROPS} />
      </DocSection>

      <DocSection title="Design specs">
        <DocSpecGrid
          items={[
            { label: 'Nav path', value: 'navPath prop — top of content column, aligned with sidebar rail' },
            { label: 'Placement', value: 'placement="right" (default) — DastRanj RTL app shell' },
            { label: 'Collapsed width', value: '52px — icon rail with tooltips' },
            { label: 'Scroll', value: 'taav-scrollarea--minimal (3px, hover reveal)' },
            { label: 'Collapsed tenant', value: 'Compact teal strip + status dot' },
            { label: 'Active (collapsed)', value: 'Teal tint + inset border accent' },
            { label: 'Collapsible', value: 'collapsible=true shows footer toggle' },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <DocGuidelines
          items={[
            'در collapsed همه آیتم‌های icon-only دارای aria-label و tooltip هستند.',
            'Nav items از aria-current="page" برای آیتم فعال استفاده می‌کنند.',
            'Nav path از aria-current="page" برای آیتم فعلی breadcrumb استفاده می‌کند.',
            'Quick actions و collapse toggle دارای aria-label/title و aria-expanded هستند.',
            'آیتم disabled با aria-disabled مشخص می‌شود.',
            'focus-visible ring روی menu items، actions و collapse button.',
            'اسکرول منو با scrollbar مینیمال — wheel/touch/keyboard همچنان کار می‌کند.',
          ]}
        />
      </DocSection>

      <DocSection title="Do / Don't">
        <DocDoDont
          doItems={[
            'در محصولات RTL مثل DastRanj از placement="right" استفاده کنید',
            'navPath را از router/state اپ پاس دهید — پیش‌فرض خانه',
            'collapsed را به‌عنوان icon rail عمدی طراحی‌شده استفاده کنید نه squeeze',
            'فقط ناحیه منو را scrollable نگه دارید — header/footer ثابت',
            'activeItemId را از router/state app پاس دهید',
            'از taav-scrollarea--minimal برای navigation تیره استفاده کنید',
          ]}
          dontItems={[
            'سایدبار را به‌صورت کارت شناور وسط/چپ صفحه render نکنید',
            'route detection داخل TaavUI ننویسید',
            'breadcrumb را جدا از TaavBusinessSidebar رندر نکنید',
            'scrollbar پیش‌فرض خاکستری مرورگر در navigation تیره استفاده نکنید',
            'در collapsed برچسب متنی را بدون aria-label/tooltip مخفی نکنید',
          ]}
        />
      </DocSection>

      <DocSection title="Migration guidance (DastRanj)">
        <DocGuidelines
          items={[
            'در commit جداگانه: Sidebar.tsx فعلی را با TaavBusinessSidebar جایگزین کنید.',
            'APP_MENU_ITEMS و getActiveNavigationItem در app باقی بمانند.',
            'localStorage collapse state در PanelShell مدیریت شود.',
            'shellClassName="h-full" و padding shell از خود کامپوننت — دیگر py/mr جدا لازم نیست.',
          ]}
        />
      </DocSection>
    </DocPageShell>
  );
}
