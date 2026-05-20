'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';

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
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!editHref && !deleteAction) return null;

  return (
    <div className="module-row-actions">
      {editHref ? (
        <Link href={editHref} className="module-icon-btn" aria-label={`ویرایش ${title}`}>
          <Pencil className="h-4 w-4" strokeWidth={2.2} />
        </Link>
      ) : null}
      {deleteAction && deleteId ? (
        <>
          <button type="button" className="module-icon-btn is-danger" aria-label={`حذف ${title}`} onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <form ref={formRef} action={deleteAction} hidden>
            <input type="hidden" name="id" value={deleteId} />
          </form>
          <ConfirmDialog
            open={open}
            title={deleteTitle}
            description={deleteDescription}
            confirmLabel="بله، حذف شود"
            cancelLabel="انصراف"
            tone="danger"
            onCancel={() => setOpen(false)}
            onConfirm={() => {
              formRef.current?.requestSubmit();
              setOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
