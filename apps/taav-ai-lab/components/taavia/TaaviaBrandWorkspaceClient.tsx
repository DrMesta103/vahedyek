'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilLine, Sparkles, Tags } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import type { TaaviaBrand, TaaviaChatMessage, TaaviaUseCaseKey } from '@/app/lib/types/domain';
import { AdminAgentChatClient } from '@/components/taavia/AdminAgentChatClient';
import { TaaviaBrandSetupClient } from '@/components/taavia/TaaviaBrandSetupClient';

type TaaviaBrandWorkspaceClientProps = {
  tenantId: string;
  brand: TaaviaBrand;
  selectedUseCases: TaaviaUseCaseKey[];
  setupComplete: boolean;
  initialView?: 'auto' | 'chat' | 'setup';
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
  initialView = 'auto',
  initialConversationId = null,
  initialMessages,
}: TaaviaBrandWorkspaceClientProps) {
  const router = useRouter();
  const needsUseCaseSetup = !setupComplete || selectedUseCases.length === 0;
  const [editingUseCases, setEditingUseCases] = useState(
    initialView === 'setup' ? true : initialView === 'chat' ? false : needsUseCaseSetup,
  );

  const visibleUseCases = useMemo(() => {
    if (selectedUseCases.includes('all')) {
      return ['all'] as TaaviaUseCaseKey[];
    }

    return selectedUseCases;
  }, [selectedUseCases]);

  return (
    <div className="grid gap-5">
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

      {!editingUseCases ? (
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <TaavBadge tone="brand" variant="soft">
                  پیش‌نمایش فروش
                </TaavBadge>
                <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                  نمایش پیش‌نمایش فروش برای {brand.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/businesses/${tenantId}/products/taavia/brands`}>
                  <TaavButton
                    variant="secondary"
                    iconStart={<span className="text-[length:var(--taav-text-lg)] leading-none">←</span>}
                  >
                    بازگشت به برندها
                  </TaavButton>
                </Link>
                <TaavButton
                  variant="secondary"
                  iconStart={<PencilLine className="h-4 w-4" />}
                  onClick={() => router.push(`/businesses/${tenantId}/products/taavia/brands/new?edit=${brand.id}`)}
                >
                  ویرایش برند
                </TaavButton>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)] lg:items-start">
              <div className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-5">
                <div className="inline-flex items-center gap-2">
                  <Tags className="h-4 w-4 text-[var(--taav-brand-strong)]" />
                  <strong className="text-[length:var(--taav-text-xl)] text-[var(--taav-text-strong)]">
                    نام برند: فروش
                  </strong>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="inline-flex items-center gap-2 justify-self-end">
                  <Sparkles className="h-4 w-4 text-[var(--taav-brand-strong)]" />
                  <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                    ویژگی‌ها و بخش‌های انتخاب‌شده
                  </strong>
                </div>

                {visibleUseCases.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {visibleUseCases.map((useCase) => (
                      <TaavBadge key={useCase} tone="brand" variant="soft">
                        {USE_CASE_LABELS[useCase]}
                      </TaavBadge>
                    ))}
                  </div>
                ) : (
                  <p className="m-0 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    هنوز بخشی برای استفاده از تاویا انتخاب نشده است.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TaavCard>
      ) : null}

    </div>
  );
}
