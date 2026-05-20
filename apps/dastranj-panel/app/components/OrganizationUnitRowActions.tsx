'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { deleteOrganizationUnitAction } from '../lib/actions';
import { ConfirmDialog } from './ConfirmDialog';

type OrganizationUnitRowActionsProps = {
  id: string;
  title: string;
};

export function OrganizationUnitRowActions({ id, title }: OrganizationUnitRowActionsProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="org-unit-row-actions">
      <Link href={`/organization-units/${id}/edit`} className="org-unit-icon-btn" aria-label={`ویرایش ${title}`}>
        <i className="fa-regular fa-pen-to-square" aria-hidden />
      </Link>

      <button type="button" className="org-unit-icon-btn" aria-label={`حذف ${title}`} onClick={() => setOpen(true)}>
        <i className="fa-regular fa-trash-can" aria-hidden />
      </button>

      <form ref={formRef} action={deleteOrganizationUnitAction} hidden>
        <input type="hidden" name="id" value={id} />
      </form>

      <ConfirmDialog
        open={open}
        title="حذف واحد سازمانی"
        description={`آیا از حذف واحد «${title}» مطمئن هستید؟`}
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
