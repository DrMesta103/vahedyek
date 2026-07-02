'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine, Settings2, Sparkles, Tags } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import type { TaaviaBrand, TaaviaChatMessage, TaaviaUseCaseKey } from '@/app/lib/types/domain';
import { AdminAgentChatClient } from '@/components/taavia/AdminAgentChatClient';
import { CreateBrandDialog } from '@/components/taavia/CreateBrandDialog';
import { TaaviaBrandSetupClient } from '@/components/taavia/TaaviaBrandSetupClient';

type TaaviaBrandWorkspaceClientProps = {
  tenantId: string;
  brand: TaaviaBrand;
  selectedUseCases: TaaviaUseCaseKey[];
  setupComplete: boolean;
  initialConversationId?: string | null;
  initialMessages: TaaviaChatMessage[];
};

const USE_CASE_LABELS: Record<TaaviaUseCaseKey, string> = {
  all: 'همه موارد',
  support: 'پشتیبانی',
  sales: 'بازرگانی و فروش',
  marketing: 'بازاریابی',
  operations: 'عملیات',
  finance: 'مالی',
  hr: 'منابع انسانی',
  product: 'محصول',
  management: 'مدیریت',
  it: 'فناوری اطلاعات',
};

export function TaaviaBrandWorkspaceClient({
  tenantId,
  brand,
  selectedUseCases,
  setupComplete,
  initialConversationId = null,
  initialMessages,
}: TaaviaBrandWorkspaceClientProps) {
  const router = useRouter();
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingUseCases, setEditingUseCases] = useState(!setupComplete);

  const visibleUseCases = useMemo(() => {
    if (selectedUseCases.includes('all')) {
      return ['all'] as TaaviaUseCaseKey[];
    }

    return selectedUseCases;
  }, [selectedUseCases]);

  return (
    <div className="grid gap-5">
      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="grid gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="grid gap-3">
              <div className="inline-flex items-center gap-2">
                <TaavBadge tone="brand" variant="soft">
                  پروفایل برند
                </TaavBadge>
                <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                  تاویای فعال برای {brand.name}
                </span>
              </div>

              <div className="grid gap-2">
                <div className="inline-flex items-center gap-2">
                  <Tags className="h-4 w-4 text-[var(--taav-brand-strong)]" />
                  <strong className="text-[length:var(--taav-text-xl)] text-[var(--taav-text-strong)]">
                    {brand.name}
                  </strong>
                </div>
                <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                  {brand.intake?.description?.trim() || 'برای این برند هنوز توضیحی ثبت نشده است.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <TaavButton
                variant="secondary"
                iconStart={<PencilLine className="h-4 w-4" />}
                onClick={() => setBrandDialogOpen(true)}
              >
                ویرایش برند
              </TaavButton>
              <TaavButton
                variant="secondary"
                iconStart={<Settings2 className="h-4 w-4" />}
                onClick={() => setEditingUseCases((current) => !current)}
              >
                {editingUseCases ? 'بستن تغییر بخش‌ها' : 'تغییر بخش‌ها'}
              </TaavButton>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--taav-brand-strong)]" />
              <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                ویژگی‌ها و بخش‌های انتخاب‌شده
              </strong>
            </div>

            {visibleUseCases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {visibleUseCases.map((useCase) => (
                  <TaavBadge key={useCase} tone="brand" variant="soft">
                    {USE_CASE_LABELS[useCase]}
                  </TaavBadge>
                ))}
              </div>
            ) : (
              <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                هنوز بخشی برای استفاده از تاویا انتخاب نشده است.
              </p>
            )}
          </div>
        </div>
      </TaavCard>

      {editingUseCases ? (
        <TaaviaBrandSetupClient
          tenantId={tenantId}
          brandId={brand.id}
          brandName={brand.name}
          initialSelectedUseCases={selectedUseCases}
          onSaved={() => setEditingUseCases(false)}
        />
      ) : (
        <AdminAgentChatClient
          tenantId={tenantId}
          brandId={brand.id}
          brandName={brand.name}
          initialConversationId={initialConversationId}
          initialMessages={initialMessages}
        />
      )}

      <CreateBrandDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        tenantId={tenantId}
        mode="edit"
        initialBrand={brand}
        onSaved={() => {
          setBrandDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
