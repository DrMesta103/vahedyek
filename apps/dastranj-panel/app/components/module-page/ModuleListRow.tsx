import Link from 'next/link';
import type { ReactNode } from 'react';
import { ModuleRowActions } from './ModuleRowActions';

type ModuleListRowProps = {
  title: string;
  titleHref?: string;
  description?: string;
  editHref?: string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteId?: string;
  deleteTitle?: string;
  deleteDescription?: string;
  children?: ReactNode;
};

export function ModuleListRow({
  title,
  titleHref,
  description,
  editHref,
  deleteAction,
  deleteId,
  deleteTitle,
  deleteDescription,
  children,
}: ModuleListRowProps) {
  return (
    <article className="module-list-row">
      <div className="module-list-row-copy">
        <h3>{titleHref ? <Link href={titleHref}>{title}</Link> : title}</h3>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
      <ModuleRowActions
        title={title}
        editHref={editHref}
        deleteAction={deleteAction}
        deleteId={deleteId}
        deleteTitle={deleteTitle}
        deleteDescription={deleteDescription}
      />
    </article>
  );
}
