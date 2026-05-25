'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Pencil, User } from 'lucide-react';
import { EditEmployeeFlow, type EditEmployeeData } from './EditEmployeeFlow';


export function EmployeeDetailView({ employee }: { employee: EditEmployeeData & { createdAt: string } }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <article
        className="w-full rounded-2xl border border-white/[0.08] bg-slate-900/55 p-6 [html[data-theme=light]_&]:border-slate-200/80 [html[data-theme=light]_&]:bg-white"
        dir="rtl"
        lang="fa"
      >
        {/* Top: avatars + name + edit */}
        <div className="flex items-center gap-5">
          {/* Avatar group */}
          <div className="relative flex shrink-0 items-end">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-slate-950/60 text-slate-400 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-100">
              {employee.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8" strokeWidth={1.6} />
              )}
            </div>
            <div className="-me-3 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-slate-950/70 text-slate-500 [html[data-theme=light]_&]:border-white [html[data-theme=light]_&]:bg-slate-100">
              {employee.identityPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.identityPhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <CreditCard className="h-5 w-5" strokeWidth={1.6} />
              )}
            </div>
          </div>

          {/* Name & email */}
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[17px] font-extrabold leading-snug text-white [html[data-theme=light]_&]:text-slate-900">
              {employee.firstName} {employee.lastName}
            </h2>
            {employee.email && (
              <span className="mt-0.5 block text-[13px] font-medium text-slate-500" dir="ltr" style={{ textAlign: 'right' }}>
                {employee.email}
              </span>
            )}
          </div>

          {/* Edit button */}
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border border-indigo-500/30 bg-indigo-500/[0.08] px-4 py-2 font-inherit text-[13px] font-bold text-indigo-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/[0.18] [html[data-theme=light]_&]:border-indigo-300 [html[data-theme=light]_&]:bg-indigo-50 [html[data-theme=light]_&]:text-indigo-600 [html[data-theme=light]_&]:hover:bg-indigo-100"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            <span>ویرایش</span>
          </button>
        </div>

      </article>

      {/* Section links */}
      <div className="grid w-full gap-3" dir="rtl" lang="fa">
        <Link href={`/employees/${employee.id}/bank-accounts`} className="employee-detail-section-link">
          <span>حساب‌های بانکی</span>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <Link href={`/employees/${employee.id}/guarantee`} className="employee-detail-section-link">
          <span>ضمانت</span>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
      </div>

      {editing && (
        <EditEmployeeFlow employee={employee} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
