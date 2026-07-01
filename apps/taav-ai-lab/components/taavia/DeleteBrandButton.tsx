'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';

type DeleteBrandButtonProps = {
  tenantId: string;
  brandId: string;
  brandName: string;
};

export function DeleteBrandButton({ tenantId, brandId, brandName }: DeleteBrandButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید برند «${brandName}» را حذف کنید؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      window.alert(payload?.message ?? 'حذف برند انجام نشد.');
      return;
    }

    router.push(`/businesses/${tenantId}/products/taavia/brands`);
    router.refresh();
  };

  return (
    <TaavButton
      variant="ghost"
      tone="danger"
      iconStart={<Trash2 className="h-4 w-4" />}
      onClick={(event) => {
        event.stopPropagation();
        void handleDelete();
      }}
    >
      حذف برند
    </TaavButton>
  );
}
