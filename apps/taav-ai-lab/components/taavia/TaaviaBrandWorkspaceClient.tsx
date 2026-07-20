'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Cpu, PencilLine, Sparkles, Tags } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TAAVIA_USE_CASES } from '@/app/lib/taavia-use-cases';
import type { AdminAgentEffectiveModelSummary } from '@/app/lib/repositories/conversations';
import type { TaaviaBrand, TaaviaChatMessage, TaaviaUseCaseKey } from '@/app/lib/types/domain';
import { AdminAgentChatClient } from '@/components/taavia/AdminAgentChatClient';
import { CreateBrandDialog } from '@/components/taavia/CreateBrandDialog';

type TaaviaBrandWorkspaceClientProps = {
  tenantId: string;
  brand: TaaviaBrand;
  selectedUseCases: TaaviaUseCaseKey[];
  setupComplete: boolean;
  initialView?: 'auto' | 'chat' | 'setup';
  initialConversationId?: string | null;
  initialMessages: TaaviaChatMessage[];
  initialEffectiveChatModel?: AdminAgentEffectiveModelSummary | null;
};

export function TaaviaBrandWorkspaceClient({
  tenantId,
  brand,
  initialConversationId = null,
  initialMessages,
  initialEffectiveChatModel = null,
}: TaaviaBrandWorkspaceClientProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <div className="grid gap-5">
      <AdminAgentChatClient
        tenantId={tenantId}
        brandId={brand.id}
        brandName={brand.name}
        initialConversationId={initialConversationId}
        initialMessages={initialMessages}
        initialEffectiveModel={initialEffectiveChatModel}
      />

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <TaavBadge tone="brand" variant="soft">
                Ù†Ù…Ø§ÛŒ Ø¨Ø±Ù†Ø¯ ØªØ§ÙˆÛŒØ§
              </TaavBadge>
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                Ø®Ù„Ø§ØµÙ‡ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¨Ø±Ù†Ø¯ Ùˆ Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ù‚Ø§Ø¨Ù„ ØªÚ©Ù…ÛŒÙ„ Ø¨Ø±Ø§ÛŒ {brand.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/businesses/${tenantId}/products/taavia/brands`}>
                <TaavButton
                  variant="secondary"
                  iconStart={<span className="text-[length:var(--taav-text-lg)] leading-none">â†</span>}
                >
                  Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ Ø¨Ø±Ù†Ø¯Ù‡Ø§
                </TaavButton>
              </Link>
              <Link href={`/businesses/${tenantId}/products/taavia/brands/${brand.id}/model-settings`}>
                <TaavButton variant="secondary" iconStart={<Cpu className="h-4 w-4" />}>
                  تنظیمات مدل
                </TaavButton>
              </Link>
              <TaavButton
                variant="secondary"
                iconStart={<PencilLine className="h-4 w-4" />}
                onClick={() => setEditDialogOpen(true)}
              >
                ÙˆÛŒØ±Ø§ÛŒØ´ Ø¨Ø±Ù†Ø¯
              </TaavButton>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)] lg:items-start">
            <div className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-5">
              <div className="inline-flex items-center gap-2">
                <Tags className="h-4 w-4 text-[var(--taav-brand-strong)]" />
                <strong className="text-[length:var(--taav-text-xl)] text-[var(--taav-text-strong)]">
                  Ù†Ø§Ù… Ø¨Ø±Ù†Ø¯: {brand.name}
                </strong>
              </div>

              {brand.description?.trim() ? (
                <p className="m-0 text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                  {brand.description}
                </p>
              ) : (
                <p className="m-0 text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                  Ù‡Ù†ÙˆØ² ØªÙˆØ¶ÛŒØ­ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø¨Ø±Ù†Ø¯ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <div className="inline-flex items-center justify-self-end gap-2">
                <Sparkles className="h-4 w-4 text-[var(--taav-brand-strong)]" />
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                  Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ù‚Ø§Ø¨Ù„ ØªÚ©Ù…ÛŒÙ„
                </strong>
              </div>

              <div className="grid gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-4">
                <strong className="text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                  ØªØ§ÙˆÛŒØ§ Ø­Ø§Ù„Ø§ Ø¨Ø±Ø§ÛŒ Ù‡Ù…Ù‡ Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ø§ØµÙ„ÛŒ Ø¨Ø±Ù†Ø¯ Ø¢Ù…Ø§Ø¯Ù‡ ØªÙ†Ø¸ÛŒÙ… Ø§Ø³Øª
                </strong>
                <div className="grid gap-3">
                  {TAAVIA_USE_CASES.map((useCase) => (
                    <div key={useCase.key} className="grid gap-2 rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface)] p-3">
                      <span className="text-right text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                        {useCase.title}
                      </span>
                      <div className="flex flex-wrap justify-end gap-2">
                        {useCase.sections.map((section) => (
                          <TaavBadge key={`${useCase.key}-${section}`} tone="neutral" variant="soft">
                            {section}
                          </TaavBadge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TaavCard>

      <CreateBrandDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tenantId={tenantId}
        mode="edit"
        initialBrand={brand}
        onSaved={() => {
          setEditDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
