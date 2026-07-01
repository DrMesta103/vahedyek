'use client';

import { useRouter } from 'next/navigation';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { CreateBusinessForm } from './CreateBusinessForm';

type CreateBusinessDialogProps = {
  open: boolean;
};

export function CreateBusinessDialog({ open }: CreateBusinessDialogProps) {
  const router = useRouter();

  return (
    <TaavDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          router.replace('/businesses');
          router.refresh();
        }
      }}
    >
      <TaavDialogContent size="md" contentClassName="ai-lab-dialog">
        <TaavDialogHeader>
          <TaavDialogTitle>ثبت کسب‌وکار جدید</TaavDialogTitle>
          <TaavDialogDescription>
            اطلاعات اولیه tenant جدید را وارد کنید. اگر برای لوگو فایل تصویر انتخاب کنید، پیش‌نمایش آن همین‌جا نمایش داده می‌شود.
          </TaavDialogDescription>
        </TaavDialogHeader>

        <CreateBusinessForm
          mode="dialog"
          onCancel={() => {
            router.replace('/businesses');
            router.refresh();
          }}
          onCreated={(businessId) => {
            router.replace(`/businesses/${businessId}`);
            router.refresh();
          }}
        />
      </TaavDialogContent>
    </TaavDialog>
  );
}
