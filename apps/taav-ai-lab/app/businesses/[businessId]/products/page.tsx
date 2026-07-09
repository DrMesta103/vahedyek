import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  MessageSquare,
  Search,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { getTaaviaBrandsForTenant, getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaaviaProductDialog } from '@/components/TaaviaProductDialog';

const upcomingProducts = [
  {
    name: 'واحد یک',
    icon: Building2,
    description: 'راهکار آینده برای مدیریت جریان‌های عملیاتی و داده‌های کسب‌وکار.',
  },
  {
    name: 'دسترنج',
    icon: Briefcase,
    description: 'محصولی برای فلوهای منابع انسانی، درخواست‌ها و عملیات سازمانی.',
  },
  {
    name: 'دیوان',
    icon: FileText,
    description: 'فضای بعدی برای مدیریت اسناد، پرونده‌ها و گردش‌های اداری.',
  },
  {
    name: 'سامانه استخدام و ارزیابی',
    icon: Users,
    description: 'برای جذب، ارزیابی و پیگیری مسیر استخدام نیروها.',
  },
  {
    name: 'درخواست خرید',
    icon: ShoppingCart,
    description: 'برای ثبت، بررسی و تایید درخواست‌های خرید داخلی.',
  },
  {
    name: 'منشی',
    icon: MessageSquare,
    description: 'دستیار ارتباطی و پاسخ‌گویی برای مدیریت پیام‌ها و هماهنگی‌ها.',
  },
  {
    name: 'قرارملاقات',
    icon: CalendarDays,
    description: 'ابزار زمان‌بندی و مدیریت جلسه‌ها و ملاقات‌ها.',
  },
  {
    name: 'کندو',
    icon: BarChart3,
    description: 'مرکز تجمیع و سازمان‌دهی داده‌ها و بسته‌های کاری.',
  },
  {
    name: 'اکسپو',
    icon: Store,
    description: 'نمایشگاه محصول و ویترین ارائه‌ی سرویس‌ها و قابلیت‌ها.',
  },
  {
    name: 'یوز',
    icon: Search,
    description: 'ابزار جست‌وجو و کشف سریع اطلاعات در فلوهای کاری.',
  },
] as const;

type UpcomingProduct = (typeof upcomingProducts)[number];

function UpcomingProductCard({ product }: { product: UpcomingProduct }) {
  const Icon = product.icon;

  return (
    <TaavCard variant="soft" padding="md" radius="xl">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <Icon className="h-5 w-5 text-[var(--taav-text-subtle)]" />
          <TaavBadge tone="neutral" variant="soft">
            به زودی
          </TaavBadge>
        </div>
        <div>
          <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
            {product.name}
          </h2>
          <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            {product.description}
          </p>
        </div>
        <div className="text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-text-subtle)]">
          در نوبت انتشار
        </div>
      </div>
    </TaavCard>
  );
}

export default async function ProductsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId } = await params;
  const business = await getTenantForUser(session.userId, businessId);
  const taaviaBrands = await getTaaviaBrandsForTenant(session.userId, businessId);

  if (!business) {
    return (
      <AiLabShell
        pathname="/businesses"
        fullName={session.fullName}
        email={session.email}
        mobile={session.mobile}
        currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
        currentTenantName={currentTenant?.name ?? null}
      >
        <AiLabPage
          eyebrow="عدم دسترسی"
          title="این کسب‌وکار برای شما در دسترس نیست"
          description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید."
        />
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="محصولات"
        title={`${business.name} · محصولات`}
        description="محصولات هوش مصنوعی تاو برای شبیه‌سازی و مدیریت قابلیت‌های کسب‌وکار."
        badge="کاتالوگ"
      >
        <AiLabSectionCard title="محصولات موجود" description="یک محصول را انتخاب کنید تا وارد فضای کاری آن شوید.">
          <div className="ai-lab-card-grid">
            {taaviaBrands.length === 0 ? (
              <TaaviaProductDialog businessId={business.id} />
            ) : (
              <Link href={`/businesses/${business.id}/products/taavia`} className="block h-full">
                <TaavCard
                  variant="outlined"
                  padding="md"
                  radius="xl"
                  interactive
                  wrapperClassName="h-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
                        <Bot className="h-5 w-5" />
                      </div>
                      <TaavBadge tone="brand" variant="soft">
                        فعال
                      </TaavBadge>
                    </div>

                    <div className="grid gap-2">
                      <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">تاویا</h2>
                      <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                        {taaviaBrands.length} برند برای این محصول ساخته شده است. برای ورود به بخش‌های تاویا اینجا کلیک کنید.
                      </p>
                    </div>

                    <div className="flex items-center justify-between rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] px-4 py-3 text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">
                      <span>انتخاب تاویا</span>
                      <span aria-hidden="true">‹</span>
                    </div>
                  </div>
                </TaavCard>
              </Link>
            )}

            {upcomingProducts.map((product) => (
              <UpcomingProductCard key={product.name} product={product} />
            ))}
          </div>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
