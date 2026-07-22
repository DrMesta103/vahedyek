'use client';

import { useState, useTransition } from 'react';
import { applyEmployeeChangeRequestAction, cancelEmployeeChangeRequestAction, reviewEmployeeChangeRequestAction } from '../../../../../lib/actions';

export function EmployeeChangeRequestActions({ requestId, status, canManage }: { requestId: string; status: string; canManage: boolean }) {
  const [pending, startTransition] = useTransition();
  const [reviewNote, setReviewNote] = useState('');
  const [message, setMessage] = useState('');
  const run = (action: 'APPROVED' | 'REJECTED' | 'APPLY' | 'CANCELLED') => {
    if (action === 'REJECTED' && !reviewNote.trim()) { setMessage('دلیل رد درخواست الزامی است.'); return; }
    const form = new FormData(); form.set('requestId', requestId); form.set('reviewNote', reviewNote);
    if (action === 'APPROVED' || action === 'REJECTED') form.set('decision', action);
    setMessage('');
    startTransition(() => {
      const task = action === 'APPLY' ? applyEmployeeChangeRequestAction(form) : action === 'CANCELLED' ? cancelEmployeeChangeRequestAction(form) : reviewEmployeeChangeRequestAction(form);
      void task.then(() => setMessage(action === 'APPLY' ? 'تغییر تأییدشده اعمال شد.' : action === 'CANCELLED' ? 'درخواست لغو شد.' : action === 'APPROVED' ? 'درخواست تأیید شد.' : 'درخواست رد شد.'))
        .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'انجام عملیات ناموفق بود.'));
    });
  };
  if (!canManage || !['PENDING_APPROVAL', 'APPROVED'].includes(status)) return null;
  return <div className="mt-4 space-y-3">
    {status === 'PENDING_APPROVAL' ? <><label className="employee-add-field"><span className="employee-add-field-label">نظر بررسی / دلیل رد</span><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={1000} /></label><div className="flex flex-wrap gap-2"><button type="button" className="module-page-add-btn" disabled={pending} onClick={() => run('APPROVED')}>تأیید</button><button type="button" className="employee-add-secondary-btn" disabled={pending} onClick={() => run('REJECTED')}>رد درخواست</button><button type="button" className="employee-add-secondary-btn" disabled={pending} onClick={() => run('CANCELLED')}>لغو درخواست</button></div></> : <button type="button" className="module-page-add-btn" disabled={pending} onClick={() => run('APPLY')}>اعمال تغییر</button>}
    {message ? <p className="text-sm text-slate-400" role="status">{message}</p> : null}
  </div>;
}
