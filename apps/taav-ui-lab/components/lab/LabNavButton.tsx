'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import { TaavButton } from '@repo/ui/taav/primitives';

export function LabNavButton({
  href,
  ...props
}: ComponentProps<typeof TaavButton> & { href: string }) {
  const router = useRouter();
  return <TaavButton {...props} onClick={() => router.push(href)} />;
}
