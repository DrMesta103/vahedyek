'use client';

import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { TaavDialog, TaavDialogContent, TaavDialogDescription, TaavDialogTitle } from '@repo/ui/taav';
import { CreateBusinessForm } from './CreateBusinessForm';

type CreateBusinessDialogProps = {
  open: boolean;
  defaultFirstName?: string;
  defaultLastName?: string;
};

export function CreateBusinessDialog({ open, defaultFirstName = '', defaultLastName = '' }: CreateBusinessDialogProps) {
  const router = useRouter();

  const handleClose = () => {
    router.replace('/businesses');
    router.refresh();
  };

  return (
    <TaavDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-create-dialog">
        <header className="ai-lab-create-header">
          <div className="ai-lab-create-header-icon" aria-hidden="true">
            <Building2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="ai-lab-create-header-copy">
            <TaavDialogTitle className="ai-lab-create-title">ثبت کسب‌وکار جدید</TaavDialogTitle>
            <TaavDialogDescription className="ai-lab-create-subtitle">
              اطلاعات کسب‌وکار خود را وارد کنید تا فضای کاری آن در آزمایشگاه هوش مصنوعی تاو ایجاد شود.
            </TaavDialogDescription>
          </div>
        </header>

        <CreateBusinessForm
          mode="dialog"
          defaultFirstName={defaultFirstName}
          defaultLastName={defaultLastName}
          onCancel={handleClose}
          onCreated={(businessId) => {
            router.replace(`/businesses/${businessId}`);
            router.refresh();
          }}
        />
      </TaavDialogContent>
    </TaavDialog>
  );
}
