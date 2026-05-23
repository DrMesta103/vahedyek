'use client';

import { Copy, FileText, Pencil, Trash2 } from 'lucide-react';
import { CardMenu } from '../../components/CardMenu';

type DraftTemplateActionsProps = {
  templateId: string;
};

export function DraftTemplateActions({ templateId }: DraftTemplateActionsProps) {
  return (
    <CardMenu
      items={[
        {
          kind: 'link',
          label: 'ویرایش',
          icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
          href: `/draft-templates/new?id=${encodeURIComponent(templateId)}`,
        },
        {
          kind: 'action',
          label: 'آرشیو',
          icon: <FileText className="h-4 w-4" strokeWidth={2.2} />,
          onClick: () => undefined,
        },
        {
          kind: 'action',
          label: 'کپی',
          icon: <Copy className="h-4 w-4" strokeWidth={2.2} />,
          onClick: () => undefined,
        },
        {
          kind: 'action',
          label: 'حذف',
          tone: 'danger',
          icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
          onClick: () => undefined,
        },
      ]}
    />
  );
}
