'use client';

import { Bell, Building2, CircleCheck, MoreVertical, Shield, Smartphone, SquarePen, UserRound } from 'lucide-react';
import {
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownTrigger,
} from '@repo/ui/taav';
import type { AdminUserRow } from '@/app/lib/data';

function toPersianDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function AdminUserCard({
  user,
  onEdit,
  onToggleActive,
  onSendTestNotification,
}: {
  user: AdminUserRow;
  onEdit?: (user: AdminUserRow) => void;
  onToggleActive?: (user: AdminUserRow) => void;
  onSendTestNotification?: (user: AdminUserRow) => void;
}) {
  const tenantLabel = user.isSystemUser ? 'سیستم تاو' : user.tenantNames.join('، ');
  const statusLabel = user.isActive ? 'فعال' : 'غیرفعال';
  const avatarFallback = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim() || 'TA';

  return (
    <article className={user.isActive ? 'ai-lab-admin-user-card' : 'ai-lab-admin-user-card is-inactive'}>
      <div className="ai-lab-admin-user-card-top">
        <div className="ai-lab-admin-user-avatar-shell">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="ai-lab-admin-user-avatar-image" />
          ) : (
            <span className="ai-lab-admin-user-avatar-fallback">{avatarFallback}</span>
          )}
        </div>

        <div className="ai-lab-admin-user-identity">
          <div className="ai-lab-admin-user-badges">
            <span className={user.isSystemUser ? 'ai-lab-admin-user-badge is-system' : 'ai-lab-admin-user-badge'}>
              {user.isSystemUser ? <Shield className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
              {user.isSystemUser ? 'سیستم تاو' : 'عضو کسب‌وکار'}
            </span>
            <span className={user.isActive ? 'ai-lab-admin-user-status is-active' : 'ai-lab-admin-user-status is-inactive'}>
              <CircleCheck className="h-3.5 w-3.5" />
              {statusLabel}
            </span>
          </div>

          <h3>{user.fullName}</h3>
          <p>{user.email ?? `+98 ${user.mobile ?? '---'}`}</p>
          {!user.isActive ? <small className="ai-lab-admin-user-inactive-note">این کاربر اجازه ورود و انجام عملیات ندارد.</small> : null}
        </div>

        <TaavDropdown>
          <TaavDropdownTrigger asChild>
            <button type="button" className="ai-lab-admin-user-menu" aria-label="گزینه‌های بیشتر کاربر">
              <MoreVertical className="h-4 w-4" />
            </button>
          </TaavDropdownTrigger>
          <TaavDropdownContent align="end">
            <TaavDropdownItem iconStart={<SquarePen className="h-4 w-4" />} onSelect={() => onEdit?.(user)}>
              ویرایش کاربر
            </TaavDropdownItem>
            <TaavDropdownItem
              iconStart={<CircleCheck className="h-4 w-4" />}
              tone={user.isActive ? 'warning' : 'success'}
              onSelect={() => onToggleActive?.(user)}
            >
              {user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
            </TaavDropdownItem>
            <TaavDropdownItem iconStart={<Bell className="h-4 w-4" />} onSelect={() => onSendTestNotification?.(user)}>
              تست نوتیفیکیشن
            </TaavDropdownItem>
          </TaavDropdownContent>
        </TaavDropdown>
      </div>

      <dl className="ai-lab-admin-user-meta">
        <div>
          <dt>موبایل</dt>
          <dd>
            <Smartphone className="h-4 w-4" />
            {user.mobile ? `+98 ${user.mobile}` : 'ثبت نشده'}
          </dd>
        </div>
        <div>
          <dt>کسب‌وکار</dt>
          <dd>
            <Building2 className="h-4 w-4" />
            {tenantLabel}
          </dd>
        </div>
        <div>
          <dt>تاریخ ایجاد</dt>
          <dd>
            <UserRound className="h-4 w-4" />
            {toPersianDate(user.createdAt)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
