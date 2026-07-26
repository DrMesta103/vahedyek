'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TaavButton } from '@repo/ui/taav/primitives';
import { startInitialBuildAction } from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions';

type Props = {
  businessId: string;
  brandId: string;
  activeSources: number;
  activeBuild: boolean;
  activeBuildId?: string | null;
};

export function InitialKnowledgeBuildAction({
  businessId,
  brandId,
  activeSources,
  activeBuild,
  activeBuildId = null,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const buildsBase = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/builds`;
  const activeBuildHref = activeBuildId ? `${buildsBase}/${activeBuildId}` : `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base`;

  if (activeBuild) {
    return (
      <Link href={activeBuildHref}>
        <TaavButton size="sm">مشاهده روند ساخت</TaavButton>
      </Link>
    );
  }

  if (!activeSources) {
    return (
      <div className="text-right">
        <TaavButton size="sm" disabled>
          ساخت اولین <bdi dir="ltr">Knowledge Base</bdi>
        </TaavButton>
        <p className="mt-2 text-xs text-[var(--taav-text-muted)]">ابتدا حداقل یک منبع فعال در بخش منابع برند ثبت کنید.</p>
        <Link
          className="text-xs text-[var(--taav-brand-strong)]"
          href={`/businesses/${businessId}/products/taavia/brands/${brandId}/sources`}
        >
          مدیریت منابع برند
        </Link>
      </div>
    );
  }

  return (
    <TaavButton
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const buildId = await startInitialBuildAction({ businessId, brandId });
          router.push(`${buildsBase}/${buildId}`);
          router.refresh();
        })
      }
    >
      {pending ? 'در حال شروع…' : (
        <>
          ساخت اولین <bdi dir="ltr">Knowledge Base</bdi>
        </>
      )}
    </TaavButton>
  );
}
