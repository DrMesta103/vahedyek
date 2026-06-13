'use client';

import { Check, Pencil, Power, Shield, Trash2 } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteLocationAction, setPrimaryLocationAction, toggleLocationActiveAction } from '../../../lib/actions';

type LocationCardActionsProps = {
  id: string;
  title: string;
  isActive: boolean;
  isPrimary: boolean;
  usageCount: number;
};

export function LocationCardActions({ id, title, isActive, isPrimary, usageCount }: LocationCardActionsProps) {
  const usedByOtherRecords = usageCount > 0;
  const disableMessage = 'این محل در گروه‌های کاری استفاده شده است و قابل حذف مستقیم نیست. برای حفظ داده‌ها، محل را غیرفعال کنید.';

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
          !isPrimary
            ? {
                kind: 'submit' as const,
                label: 'تعیین به عنوان محل اصلی',
                icon: <Shield className="h-4 w-4" strokeWidth={2.2} />,
                action: setPrimaryLocationAction,
                hiddenFields: { id },
              }
            : null,
          usedByOtherRecords
            ? {
                kind: 'submit' as const,
                label: isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی',
                tone: isActive ? ('default' as const) : ('default' as const),
                icon: isActive ? <Power className="h-4 w-4" strokeWidth={2.2} /> : <Check className="h-4 w-4" strokeWidth={2.2} />,
                action: toggleLocationActiveAction,
                hiddenFields: { id, isActive: String(!isActive) },
                confirm: isActive
                  ? {
                      title: 'غیرفعال‌سازی محل کار',
                      description: disableMessage,
                      confirmLabel: 'غیرفعال شود',
                      cancelLabel: 'انصراف',
                    }
                  : {
                      title: 'فعال‌سازی محل کار',
                      description: 'این محل دوباره در انتخاب‌های کاری و ثبت تردد قابل استفاده می‌شود.',
                      confirmLabel: 'فعال شود',
                      cancelLabel: 'انصراف',
                    },
              }
            : {
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
        ].filter(Boolean) as Parameters<typeof CardMenu>[0]['items']}
      />
    </div>
  );
}
