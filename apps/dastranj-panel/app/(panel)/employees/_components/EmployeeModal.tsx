'use client';

import type { ReactNode } from 'react';

type EmployeeModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function EmployeeModal({ open, title, children, onClose }: EmployeeModalProps) {
  if (!open) return null;

  return (
    <div className="employee-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="employee-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2 className="employee-modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
