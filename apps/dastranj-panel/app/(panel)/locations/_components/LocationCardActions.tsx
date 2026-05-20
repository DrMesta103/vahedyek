'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteLocationAction } from '../../../lib/actions';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export function LocationCardActions({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="module-row-actions">
      <Link href={`/locations/${id}/edit`} className="module-icon-btn" aria-label={`ویرایش ${title}`}>
        <Pencil className="h-4 w-4" strokeWidth={2.2} />
      </Link>
      <button type="button" className="module-icon-btn is-danger" aria-label={`حذف ${title}`} onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <form ref={formRef} action={deleteLocationAction} hidden>
        <input type="hidden" name="id" value={id} />
      </form>
      <ConfirmDialog
        open={open}
        title="حذف محل کار"
        description={`آیا از حذف محل «${title}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        tone="danger"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          formRef.current?.requestSubmit();
          setOpen(false);
        }}
      />
    </div>
  );
}
