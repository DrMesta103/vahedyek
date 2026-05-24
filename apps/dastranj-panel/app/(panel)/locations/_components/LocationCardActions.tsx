'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteLocationAction } from '../../../lib/actions';

export function LocationCardActions({ id, title }: { id: string; title: string }) {
  return (
    <div className="module-row-actions">
      <CardMenu
        items={[
          {
            kind: 'link' as const,
            href: `/locations/${id}/edit`,
            label: 'ویرایش',
            icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
          },
          {
            kind: 'submit' as const,
            label: 'حذف',
            tone: 'danger' as const,
            icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
            action: deleteLocationAction,
            hiddenFields: { id },
            confirm: {
              title: 'حذف محل کار',
              description: `آیا از حذف محل «${title}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
              confirmLabel: 'بله، حذف شود',
              cancelLabel: 'انصراف',
            },
          },
        ]}
      />
    </div>
  );
}
