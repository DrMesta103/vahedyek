'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { TaaviaBrand } from '@/app/lib/data';
import { CreateBrandDialog } from './CreateBrandDialog';

type TaaviaBrandsClientProps = {
  tenantId: string;
  initialBrands: TaaviaBrand[];
};

export function TaaviaBrandsClient({ tenantId, initialBrands }: TaaviaBrandsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreated = (brandId: string) => {
    router.push(`/businesses/${tenantId}/products/taavia/brands/${brandId}`);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/businesses/${tenantId}/products/taavia`}>
          <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاویا
          </TaavButton>
        </Link>
        <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
          برند جدید
        </TaavButton>
      </div>

      {initialBrands.length === 0 ? (
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <TaavEmptyState
            variant="default"
            title="هنوز برندی برای تاویا ساخته نشده است."
            description="برای شروع، یک برند جدید ایجاد کنید."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
                ایجاد برند
              </TaavButton>
            }
          />
        </TaavCard>
      ) : (
        <div className="ai-lab-card-grid">
          {initialBrands.map((brand) => (
            <Link key={brand.id} href={`/businesses/${tenantId}/products/taavia/brands/${brand.id}`}>
              <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="h-full transition hover:border-[color:var(--taav-brand-muted)]">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                      {brand.name}
                    </h2>
                    <TaavBadge tone="brand" variant="soft">فعال</TaavBadge>
                  </div>
                  <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                    ایجاد: {new Date(brand.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                  <TaavButton width="full" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    ورود به ایجنت مدیریت
                  </TaavButton>
                </div>
              </TaavCard>
            </Link>
          ))}
        </div>
      )}

      <CreateBrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenantId={tenantId}
        onCreated={handleCreated}
      />
    </>
  );
}
