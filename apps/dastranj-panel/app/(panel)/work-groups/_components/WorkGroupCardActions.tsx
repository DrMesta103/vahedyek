'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { History, Pencil, Users, UserRound, Power, RotateCcw, X } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { deleteWorkGroupAction, restoreWorkGroupAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';
import { workGroupAccessLabels } from '../../../lib/constants';

type WorkGroupMemberRecord = {
  id: string;
  joinedAt: string;
  leftAt: string | null;
  isCurrent: boolean;
  status: 'ACTIVE' | 'ENDED' | 'FUTURE';
  accessLevel: keyof typeof workGroupAccessLabels;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    mobile1: string | null;
    email: string | null;
    personnelCode: string | null;
  };
};

type WorkGroupCardActionsProps = {
  id: string;
  title: string;
  members: WorkGroupMemberRecord[];
  status: 'ACTIVE' | 'INACTIVE';
  canEdit: boolean;
  canDisable: boolean;
};

type MembersDialogState = 'current' | 'former' | null;

function fullName(employee: WorkGroupMemberRecord['employee']) {
  return `${employee.firstName} ${employee.lastName}`.trim() || employee.mobile1 || employee.email || 'کارمند';
}

function groupFormerMembers(members: WorkGroupMemberRecord[]) {
  const grouped = new Map<
    string,
    {
      employee: WorkGroupMemberRecord['employee'];
      cycles: WorkGroupMemberRecord[];
    }
  >();

  for (const member of members.filter((item) => !item.isCurrent)) {
    const current = grouped.get(member.employee.id);
    if (current) {
      current.cycles.push(member);
    } else {
      grouped.set(member.employee.id, {
        employee: member.employee,
        cycles: [member],
      });
    }
  }

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      cycles: [...item.cycles].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()),
    }))
    .sort((a, b) => new Date(b.cycles[0]?.joinedAt ?? 0).getTime() - new Date(a.cycles[0]?.joinedAt ?? 0).getTime());
}

function WorkGroupMembersDialog({
  open,
  title,
  description,
  members,
  onClose,
  variant,
}: {
  open: boolean;
  title: string;
  description: string;
  members: WorkGroupMemberRecord[];
  onClose: () => void;
  variant: Exclude<MembersDialogState, null>;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  const currentMembers = useMemo(() => members.filter((member) => member.isCurrent), [members]);
  const formerMembers = useMemo(() => groupFormerMembers(members), [members]);

  if (!open) return null;

  return (
    <div className="work-group-members-backdrop" role="presentation" onClick={onClose}>
      <div className="work-group-members-dialog" role="dialog" aria-modal="true" aria-labelledby="work-group-members-title" onClick={(event) => event.stopPropagation()}>
        <div className="work-group-members-header">
          <div>
            <h3 id="work-group-members-title">{title}</h3>
            <p>{description}</p>
          </div>
          <button type="button" className="work-group-members-close" aria-label="بستن" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {variant === 'current' ? (
          currentMembers.length ? (
            <MinimalScroll className="work-group-members-list">
              {currentMembers.map((member) => (
                <article key={member.id} className="work-group-members-item">
                  <div className="work-group-members-avatar" aria-hidden>
                    {member.employee.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.employee.avatarUrl} alt="" />
                    ) : (
                      <UserRound className="h-4 w-4" />
                    )}
                  </div>
                  <div className="work-group-members-copy">
                    <strong>{fullName(member.employee)}</strong>
                    <span>نقش: {workGroupAccessLabels[member.accessLevel]}</span>
                    <span>تاریخ عضویت: {formatPersianDate(member.joinedAt)}</span>
                  </div>
                </article>
              ))}
            </MinimalScroll>
          ) : (
            <div className="work-group-members-empty">عضو فعالی برای این گروه ثبت نشده است.</div>
          )
        ) : formerMembers.length ? (
          <MinimalScroll className="work-group-members-history">
            {formerMembers.map((item) => (
              <article key={item.employee.id} className="work-group-members-history-card">
                <div className="work-group-members-history-head">
                  <div>
                    <strong>{fullName(item.employee)}</strong>
                    <span>{item.cycles.length.toLocaleString('fa-IR')} بار رفت و برگشت ثبت شده</span>
                  </div>
                  {item.cycles.length >= 3 ? <span className="work-group-members-badge">۳+ بار</span> : null}
                </div>
                <div className="work-group-members-history-list">
                  {item.cycles.map((cycle, index) => (
                    <div key={cycle.id} className="work-group-members-history-cycle">
                      <span>دوره {index + 1}</span>
                      <span>ورود: {formatPersianDate(cycle.joinedAt)}</span>
                      <span>خروج: {cycle.leftAt ? formatPersianDate(cycle.leftAt) : 'ثبت نشده'}</span>
                      <span>نقش: {workGroupAccessLabels[cycle.accessLevel]}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </MinimalScroll>
        ) : (
          <div className="work-group-members-empty">عضو سابقی برای این گروه ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
}

export function WorkGroupCardActions({ id, title, members, status, canEdit, canDisable }: WorkGroupCardActionsProps) {
  const [dialog, setDialog] = useState<MembersDialogState>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <div className="work-group-card-actions">
        <CardMenu
          items={[
            ...(canEdit ? [{
              kind: 'link',
              href: `/work-groups/${id}/edit`,
              label: 'ویرایش',
              icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
            } as const] : []),
            {
              kind: 'action',
              label: 'اعضای سابق',
              icon: <History className="h-4 w-4" strokeWidth={2.2} />,
              onClick: () => setDialog('former'),
            },
            {
              kind: 'action',
              label: 'اعضا',
              icon: <Users className="h-4 w-4" strokeWidth={2.2} />,
              onClick: () => setDialog('current'),
            },
            ...(canDisable && status === 'ACTIVE' ? [{
              kind: 'action',
              label: 'غیرفعال‌سازی گروه کاری',
              tone: 'danger',
              icon: <Power className="h-4 w-4" strokeWidth={2.2} />,
              onClick: () => setDeleteOpen(true),
            } as const] : []),
            ...(canDisable && status === 'INACTIVE' ? [{
              kind: 'submit' as const,
              label: 'بازیابی گروه کاری',
              icon: <RotateCcw className="h-4 w-4" strokeWidth={2.2} />,
              action: restoreWorkGroupAction,
              hiddenFields: { id },
            }] : []),
          ]}
        />
      </div>

      <WorkGroupMembersDialog
        open={dialog === 'current'}
        variant="current"
        title={`اعضای گروه «${title}»`}
        description="فهرست اعضای فعال این گروه کاری."
        members={members}
        onClose={() => setDialog(null)}
      />

      <WorkGroupMembersDialog
        open={dialog === 'former'}
        variant="former"
        title={`اعضای سابق گروه «${title}»`}
        description="سابقه رفت و برگشت اعضا در این گروه نشان داده می‌شود."
        members={members}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="غیرفعال‌سازی گروه کاری"
        description={`«${title}» دارای ${members.filter((member) => member.isCurrent).length.toLocaleString('fa-IR')} عضو فعال و ${members.filter((member) => member.status === 'FUTURE').length.toLocaleString('fa-IR')} تخصیص آینده است. سوابق حفظ می‌شوند و تخصیص‌های جدید متوقف خواهند شد.`}
        confirmLabel="غیرفعال شود"
        cancelLabel="انصراف"
        tone="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteFormRef.current?.requestSubmit();
          setDeleteOpen(false);
        }}
      />
      <form ref={deleteFormRef} action={deleteWorkGroupAction} hidden>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="reason" value="غیرفعال‌سازی توسط مدیر گروه کاری" />
      </form>
    </>
  );
}
