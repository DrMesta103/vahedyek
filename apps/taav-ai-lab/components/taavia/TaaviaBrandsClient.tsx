'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Cpu, MoreVertical, PencilLine, Plus, Trash2 } from 'lucide-react';
import {
  TaavBadge,
  TaavButton,
  TaavCard,
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownTrigger,
} from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { TaaviaBrand } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabTooltipIcon } from '@/components/AiLabTooltip';
import { CreateBrandDialog } from '@/components/taavia/CreateBrandDialog';
import { TaaviaBrandModelSettingsDialog } from '@/components/taavia/TaaviaBrandModelSettingsDialog';

type TaaviaBrandsClientProps = {
  tenantId: string;
  initialBrands: TaaviaBrand[];
};

export function TaaviaBrandsClient({ tenantId, initialBrands }: TaaviaBrandsClientProps) {
  const router = useRouter();
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<TaaviaBrand | null>(null);
  const [modelSettingsBrand, setModelSettingsBrand] = useState<TaaviaBrand | null>(null);

  const openCreateDialog = () => {
    setEditingBrand(null);
    setBrandDialogOpen(true);
  };

  const openEditDialog = (brand: TaaviaBrand) => {
    setEditingBrand(brand);
    setBrandDialogOpen(true);
  };

  const handleDelete = async (brand: TaaviaBrand) => {
    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید برند «${brand.name}» را حذف کنید؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brand.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      window.alert(payload?.message ?? 'حذف برند انجام نشد.');
      return;
    }

    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2" dir="ltr">
        <Link href={`/businesses/${tenantId}/products/taavia`}>
          <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاویا
          </TaavButton>
        </Link>
        <div className="flex items-center gap-2">
          <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
            برند جدید
          </TaavButton>
          <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.forms.brandName} label="راهنمای ایجاد برند" />
        </div>
      </div>

      {initialBrands.length === 0 ? (
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <TaavEmptyState
            variant="default"
            title="هنوز برندی برای تاویا ساخته نشده است."
            description="برای شروع، یک برند جدید ایجاد کنید."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
                ایجاد برند
              </TaavButton>
            }
          />
        </TaavCard>
      ) : (
        <div className="taavia-brand-stack">
          <div className="taavia-brand-grid">
            {initialBrands.map((brand) => (
              <article
                key={brand.id}
                className="taavia-brand-card"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/businesses/${tenantId}/products/taavia/brands/${brand.id}/entry`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/businesses/${tenantId}/products/taavia/brands/${brand.id}/entry`);
                  }
                }}
              >
                <div className="taavia-brand-card-cover">
                  <span>{brand.name.trim().slice(0, 2) || 'TA'}</span>
                </div>

                <div className="taavia-brand-card-body">
                  <div className="taavia-brand-card-top">
                    <div className="taavia-brand-card-title">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                          {brand.name}
                        </h2>
                        <TaavBadge tone="brand" variant="soft">
                          فعال
                        </TaavBadge>
                      </div>
                      <p>ایجاد: {new Date(brand.createdAt).toLocaleDateString('fa-IR')}</p>
                    </div>

                    <TaavDropdown>
                      <TaavDropdownTrigger asChild>
                        <button
                          type="button"
                          aria-label={`اکشن‌های برند ${brand.name}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-[var(--taav-surface-soft)] text-[var(--taav-text-muted)] transition hover:bg-[var(--taav-brand-soft)] hover:text-[var(--taav-brand-strong)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </TaavDropdownTrigger>
                      <TaavDropdownContent
                        align="end"
                        side="bottom"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TaavDropdownItem
                          iconStart={<Cpu className="h-4 w-4" />}
                          onClick={(event) => {
                            event.stopPropagation();
                            setModelSettingsBrand(brand);
                          }}
                        >
                          تنظیمات مدل
                        </TaavDropdownItem>
                        <TaavDropdownItem
                          iconStart={<PencilLine className="h-4 w-4" />}
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditDialog(brand);
                          }}
                        >
                          ویرایش
                        </TaavDropdownItem>
                        <TaavDropdownItem
                          tone="danger"
                          iconStart={<Trash2 className="h-4 w-4" />}
                          onSelect={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void handleDelete(brand);
                          }}
                        >
                          حذف برند
                        </TaavDropdownItem>
                      </TaavDropdownContent>
                    </TaavDropdown>
                  </div>

                  <div className="taavia-brand-card-pills">
                    <span className="taavia-brand-card-pill">برند تاویا</span>
                    <span className="taavia-brand-card-pill">ایجنت مدیریت</span>
                    <span className="taavia-brand-card-pill">فعال</span>
                    <span className="taavia-brand-card-pill">مدیریت‌پذیر</span>
                  </div>

                  <div className="taavia-brand-card-footer" />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <TaaviaBrandModelSettingsDialog
        tenantId={tenantId}
        brand={modelSettingsBrand}
        open={modelSettingsBrand !== null}
        onOpenChange={(open) => (!open ? setModelSettingsBrand(null) : undefined)}
        onSaved={() => router.refresh()}
      />

      <CreateBrandDialog
        open={brandDialogOpen}
        onOpenChange={(open) => {
          setBrandDialogOpen(open);
          if (!open) {
            setEditingBrand(null);
          }
        }}
        tenantId={tenantId}
        mode={editingBrand ? 'edit' : 'create'}
        initialBrand={editingBrand}
        onSaved={(brandId) => {
          const wasEditing = Boolean(editingBrand);
          setBrandDialogOpen(false);
          setEditingBrand(null);
          router.refresh();
          if (!wasEditing) {
            router.push(`/businesses/${tenantId}/products/taavia/brands/${brandId}/entry`);
          }
        }}
      />
    </>
  );
}
