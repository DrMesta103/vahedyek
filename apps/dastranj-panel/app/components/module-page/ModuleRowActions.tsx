'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { CardMenu } from '../CardMenu';

type ModuleRowActionsProps = {
  title: string;
  editHref?: string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteId?: string;
  deleteTitle?: string;
  deleteDescription?: string;
};

export function ModuleRowActions({
  title,
  editHref,
  deleteAction,
  deleteId,
  deleteTitle = 'حذف',
  deleteDescription = 'آیا از حذف این مورد مطمئن هستید؟',
}: ModuleRowActionsProps) {
  if (!editHref && !deleteAction) return null;

  return (
    <div className="module-row-actions">
      <CardMenu
        items={[
          ...(editHref
            ? [
                {
                  kind: 'link' as const,
                  href: editHref,
                  label: 'ویرایش',
                  icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
                },
              ]
            : []),
          ...(deleteAction && deleteId
            ? [
                {
                  kind: 'submit' as const,
                  label: 'حذف',
                  tone: 'danger' as const,
                  icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
                  action: deleteAction,
                  hiddenFields: { id: deleteId },
                  confirm: {
                    title: deleteTitle,
                    description: deleteDescription,
                    confirmLabel: 'بله، حذف شود',
                    cancelLabel: 'انصراف',
                  },
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
